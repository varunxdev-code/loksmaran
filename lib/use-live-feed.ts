"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { feedItemToPost } from "@/lib/adapter";
import type { FeedCategory, FeedItem } from "@/lib/content";
import type { Post } from "@/lib/types";

type FeedResponse = { items?: unknown[]; page?: number; hasMore?: boolean };

export function useLiveFeed(opts: {
  category: FeedCategory;
  state?: string;
  district?: string;
  place?: string;
  q?: string;
  lat?: number;
  lng?: number;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState("");
  const seq = useRef(0);
  const abort = useRef<AbortController | null>(null);

  const qs = (pageNum: number) => {
    const sp = new URLSearchParams();
    sp.set("category", opts.category);
    sp.set("page", String(pageNum));
    if (opts.state) sp.set("state", opts.state);
    if (opts.district) sp.set("district", opts.district);
    if (opts.place) sp.set("place", opts.place);
    if (opts.q) sp.set("q", opts.q);
    if (opts.lat != null) sp.set("lat", String(opts.lat));
    if (opts.lng != null) sp.set("lng", String(opts.lng));
    return sp.toString();
  };

  const load = useCallback(
    async (pageNum: number, append: boolean) => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      const ticket = ++seq.current;
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError("");
      }
      try {
        const res = await fetch(`/api/feed?${qs(pageNum)}`, { signal: ctrl.signal });
        const data = (await res.json()) as FeedResponse;
        if (ticket !== seq.current) return;
        const next = (Array.isArray(data.items) ? data.items : [])
          .map((item) => feedItemToPost(item as FeedItem))
          .filter((p): p is Post => Boolean(p));
        setPosts((prev) => {
          if (!append) return next;
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...next.filter((p) => !seen.has(p.id))];
        });
        setPage(pageNum);
        setHasMore(Boolean(data.hasMore));
        setEmpty(!append && next.length === 0);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        if (ticket !== seq.current) return;
        if (!append) {
          setPosts([]);
          setEmpty(true);
          setError("The live archive didn’t respond. Retry in a moment.");
        }
        setHasMore(false);
      } finally {
        if (ticket === seq.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [opts.category, opts.state, opts.district, opts.place, opts.q, opts.lat, opts.lng],
  );

  useEffect(() => {
    void load(1, false);
    return () => abort.current?.abort();
  }, [load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return;
    void load(page + 1, true);
  }, [hasMore, loading, loadingMore, load, page]);

  return { posts, loading, loadingMore, hasMore, empty, error, loadMore };
}
