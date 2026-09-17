"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PostCard } from "@/components/post-card";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { FEED_FILTERS, type FeedCategory } from "@/lib/content";
import { INDIA_STATES } from "@/lib/india";
import { useLok } from "@/lib/store";
import { useLiveFeed } from "@/lib/use-live-feed";

const SORTS = [
  { id: "hot", label: "Hot" },
  { id: "new", label: "New" },
  { id: "voice", label: "Voice" },
] as const;

export default function FeedPage() {
  const localPosts = useLok((s) => s.posts.filter((p) => p.id.startsWith("p-")));
  const upsertPost = useLok((s) => s.upsertPost);
  const unseen = useLok((s) => s.unseen);
  const clearUnseen = useLok((s) => s.clearUnseen);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("hot");
  const [category, setCategory] = useState<FeedCategory>("all");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [place, setPlace] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [trending, setTrending] = useState<string[]>([]);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (category !== "nearby" || coords) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(undefined),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [category, coords]);

  useEffect(() => {
    setDistrict("");
    setPlace("");
    if (!state) {
      setDistricts([]);
      setPlaces([]);
      return;
    }
    void fetch(`/api/locations?level=district&state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((d) => setDistricts((d.items || []).map((x: { name: string }) => x.name)));
    void fetch(`/api/locations?level=place&state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((d) => setPlaces((d.items || []).map((x: { name: string }) => x.name)));
  }, [state]);

  useEffect(() => {
    if (!state || !district) return;
    void fetch(`/api/locations?level=place&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`)
      .then((r) => r.json())
      .then((d) => setPlaces((d.items || []).map((x: { name: string }) => x.name)));
  }, [state, district]);

  const live = useLiveFeed({
    category,
    state: state || undefined,
    district: district || undefined,
    place: place || undefined,
    lat: category === "nearby" ? coords?.lat : undefined,
    lng: category === "nearby" ? coords?.lng : undefined,
  });

  useEffect(() => {
    live.posts.forEach(upsertPost);
  }, [live.posts, upsertPost]);

  useEffect(() => {
    void fetch("/api/feed?category=festivals")
      .then((r) => r.json())
      .then((d) => setTrending((d.items || []).map((x: { title: string }) => x.title).slice(0, 8)));
  }, []);

  const list = useMemo(() => {
    const merged = category === "all" ? [...localPosts, ...live.posts] : live.posts;
    const copy = merged.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    if (sort === "new") copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "voice") return copy.filter((p) => Boolean(p.audioUrl || p.fromVoice));
    return copy;
  }, [localPosts, live.posts, sort, category]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) live.loadMore();
    }, { rootMargin: "600px" });
    io.observe(node);
    return () => io.disconnect();
  }, [live.loadMore]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <div className="chip-row">
          {SORTS.map((item) => (
            <button key={item.id} type="button" onClick={() => setSort(item.id)} className={`chip ${sort === item.id ? "chip-on" : ""}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="chip-row mt-2">
          {FEED_FILTERS.map((item) => (
            <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`chip ${category === item.id ? "chip-on" : ""}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-mute">
            State
            <select className="field mt-1" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">India</option>
              {INDIA_STATES.map((s) => (
                <option key={s.qid} value={s.name}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-mute">
            District
            <select className="field mt-1" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
              <option value="">All districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-mute">
            City / village
            <select className="field mt-1" value={place} onChange={(e) => setPlace(e.target.value)} disabled={!state}>
              <option value="">All places</option>
              {places.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        {category === "nearby" && !coords ? (
          <p className="mt-3 text-sm text-mute">Allow location to load places around you.</p>
        ) : null}
        {unseen > 0 ? (
          <button
            type="button"
            className="btn btn-ink mt-4 h-11 min-h-11 w-full"
            onClick={() => {
              clearUnseen();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {unseen} new {unseen === 1 ? "story" : "stories"} — show them
          </button>
        ) : null}
        <div className="mt-4 space-y-3">
          {live.loading ? <FeedSkeleton /> : list.map((post) => <PostCard key={post.id} post={post} />)}
          {live.loadingMore ? <FeedSkeleton count={2} /> : null}
          {!live.loading && live.empty && list.length === 0 ? (
            <p className="card p-8 text-mute">Nothing from the live archive for this filter. Try another state or category.</p>
          ) : null}
          <div ref={sentinel} />
        </div>
      </div>
      <aside className="hidden lg:block">
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Trending</p>
          <ul className="mt-3 space-y-3 text-sm">
            {(trending.length ? trending : ["Holi", "Onam", "Pattachitra"]).map((t) => (
              <li key={t}>
                <a href={`/explore?q=${encodeURIComponent(t)}`} className="hover:underline">{t}</a>
              </li>
            ))}
          </ul>
          <a href="/create" className="btn btn-ink mt-6 h-11 min-h-11 w-full">Share a story</a>
        </div>
      </aside>
    </div>
  );
}
