"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorCatch } from "@/components/error-catch";
import { PostCard } from "@/components/post-card";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { FEED_FILTERS, type FeedCategory } from "@/lib/content";
import { useLok } from "@/lib/store";
import { useLiveFeed } from "@/lib/use-live-feed";
import type { CategoryId } from "@/lib/types";

const OLD: Record<CategoryId, FeedCategory> = {
  lokkatha: "stories",
  tyohar: "festivals",
  khanpan: "food",
  hastashilp: "crafts",
  lokkala: "music",
  parampara: "traditions",
  sthaan: "places",
  kahani: "stories",
};

function ExploreInner() {
  const params = useSearchParams();
  const allPosts = useLok((s) => s.posts);
  const upsertPost = useLok((s) => s.upsertPost);
  const localPosts = useMemo(() => allPosts.filter((p) => p.id.startsWith("p-")), [allPosts]);
  const [q, setQ] = useState(params.get("q") || "");
  const [debounced, setDebounced] = useState(q);
  const initialCat = params.get("cat") as CategoryId | null;
  const [cat, setCat] = useState<FeedCategory>(initialCat ? OLD[initialCat] || "all" : ((params.get("filter") as FeedCategory) || "all"));

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 450);
    return () => clearTimeout(t);
  }, [q]);

  const live = useLiveFeed({ category: cat, q: debounced.trim() || undefined });

  useEffect(() => {
    live.posts.forEach(upsertPost);
  }, [live.posts, upsertPost]);

  const found = useMemo(() => {
    const query = q.trim().toLowerCase();
    const local = localPosts.filter((p) => {
      if (!query) return cat === "all";
      return [p.title, p.body, p.author.name, p.author.location].join(" ").toLowerCase().includes(query);
    });
    const merged = [...local, ...live.posts];
    return merged.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
  }, [localPosts, live.posts, q, cat]);

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight sm:text-4xl">Search the archive</h1>
      <p className="mt-2 text-mute">Places, crafts, festivals, kitchens.</p>
      <input className="field mt-6 max-w-2xl rounded-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try Holi, Varanasi, embroidery…" />
      <div className="chip-row mt-4">
        {FEED_FILTERS.filter((c) => c.id !== "nearby").map((c) => (
          <button key={c.id} type="button" onClick={() => setCat(c.id)} className={`chip ${cat === c.id ? "chip-on" : ""}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {live.loading ? <FeedSkeleton /> : found.map((post) => <PostCard key={post.id} post={post} />)}
        {live.loadingMore ? <FeedSkeleton count={2} /> : null}
        {!live.loading && found.length === 0 ? <p className="feed-card p-8 text-mute">Nothing matched. Try another place or category.</p> : null}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<p className="text-mute">Loading search…</p>}>
      <ErrorCatch>
        <ExploreInner />
      </ErrorCatch>
    </Suspense>
  );
}
