"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorCatch } from "@/components/error-catch";
import { FeedSkeleton } from "@/components/feed-skeleton";
import { Go } from "@/components/go-link";
import { PostCard } from "@/components/post-card";
import { FEED_FILTERS, type FeedCategory } from "@/lib/content";
import { useLocale, useT } from "@/lib/i18n";
import { INDIA_STATES } from "@/lib/india";
import { useLok } from "@/lib/store";
import { useLiveFeed } from "@/lib/use-live-feed";

const SORTS = [
  { id: "hot", label: "Hot" },
  { id: "new", label: "New" },
  { id: "voice", label: "Voice" },
] as const;

export default function FeedPage() {
  return (
    <ErrorCatch>
      <FeedInner />
    </ErrorCatch>
  );
}

function FeedInner() {
  const allPosts = useLok((s) => s.posts);
  const upsertPost = useLok((s) => s.upsertPost);
  const unseen = useLok((s) => s.unseen);
  const clearUnseen = useLok((s) => s.clearUnseen);
  const locale = useLocale((s) => s.locale);
  const t = useT();
  const localPosts = useMemo(() => allPosts.filter((p) => p.id.startsWith("p-")), [allPosts]);
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
      .then((d) => setDistricts((d.items || []).map((x: { name?: string }) => x.name).filter(Boolean)));
    void fetch(`/api/locations?level=place&state=${encodeURIComponent(state)}`)
      .then((r) => r.json())
      .then((d) => setPlaces((d.items || []).map((x: { name?: string }) => x.name).filter(Boolean)));
  }, [state]);

  useEffect(() => {
    if (!state || !district) return;
    void fetch(`/api/locations?level=place&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`)
      .then((r) => r.json())
      .then((d) => setPlaces((d.items || []).map((x: { name?: string }) => x.name).filter(Boolean)));
  }, [state, district]);

  const live = useLiveFeed({
    category,
    state: state || undefined,
    district: district || undefined,
    place: place || undefined,
    lat: category === "nearby" ? coords?.lat : undefined,
    lng: category === "nearby" ? coords?.lng : undefined,
    lang: locale,
  });
  const loadMore = live.loadMore;

  useEffect(() => {
    if (!live.posts.length) return;
    live.posts.forEach(upsertPost);
  }, [live.posts, upsertPost]);

  useEffect(() => {
    void fetch("/api/feed?category=festivals")
      .then((r) => r.json())
      .then((d) => setTrending((d.items || []).map((x: { title?: string }) => x.title).filter(Boolean).slice(0, 8)));
  }, []);

  const list = useMemo(() => {
    const merged = category === "all" ? [...localPosts, ...live.posts] : live.posts;
    const copy = merged.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    if (sort === "new") copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "voice") return copy.filter((p) => Boolean(p.audioUrl || p.fromVoice));
    return copy;
  }, [localPosts, live.posts, sort, category]);

  useEffect(() => {
    if (live.loading || !live.hasMore) return;
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    }, { rootMargin: "400px" });
    io.observe(node);
    return () => io.disconnect();
  }, [loadMore, live.loading, live.hasMore]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <div className="feed-hero">
          <div>
            <p className="kicker">{t("liveArchive")}</p>
            <h1 className="mt-2 font-display text-3xl font-light tracking-tight sm:text-4xl">{t("storiesFromMap")}</h1>
            <p className="mt-2 max-w-xl text-sm text-mute">{t("feedLead")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Go href="/map" className="btn btn-ghost !text-[#f6f1e8] !border-white/20 mt-4 h-11 min-h-11 w-full sm:mt-0 sm:w-auto">{t("map")}</Go>
            <Go href="/create" className="btn btn-solid mt-4 h-11 min-h-11 w-full sm:mt-0 sm:w-auto">{t("share")}</Go>
          </div>
        </div>

        <div className="mt-5 chip-row">
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
        <div className="mt-5 space-y-4">
          {live.loading ? <FeedSkeleton /> : list.map((post) => <PostCard key={post.id} post={post} />)}
          {live.loadingMore ? <FeedSkeleton count={2} /> : null}
          {!live.loading && live.empty && list.length === 0 ? (
            <div className="feed-card p-8">
              <p className="font-display text-2xl font-light">Nothing for this filter yet</p>
              <p className="mt-2 text-sm text-mute">{live.error || "Try another state or category. The live archive is still filling in."}</p>
            </div>
          ) : null}
          <div ref={sentinel} />
        </div>
      </div>
      <aside className="hidden lg:block">
        <div className="feed-card p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Trending now</p>
          <ul className="mt-4 space-y-3 text-sm">
            {(trending.length ? trending : ["Holi", "Onam", "Pattachitra", "Hampi"]).map((t) => (
              <li key={t}>
                <a href={`/explore?q=${encodeURIComponent(t)}`} className="block rounded-xl px-2 py-1.5 hover:bg-ivory">{t}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="feed-card mt-4 overflow-hidden">
          <div className="bg-ink px-5 py-6 text-[#f6f1e8]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Your turn</p>
            <p className="mt-2 font-display text-3xl font-light">A village is missing until someone speaks it.</p>
            <a href="/create" className="btn btn-solid mt-5 h-11 min-h-11 w-full">Share a story</a>
          </div>
        </div>
      </aside>
    </div>
  );
}
