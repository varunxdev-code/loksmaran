"use client";

import { useEffect, useMemo, useState } from "react";
import { Go } from "@/components/go-link";
import { REGIONS } from "@/lib/taxonomy";
import { INDIA_STATES } from "@/lib/india";
import { useLok } from "@/lib/store";
import type { Community, Region } from "@/lib/types";

const KINDS = ["All", "Village", "Town", "City"] as const;
const SORTS = [
  { id: "name", label: "A–Z" },
  { id: "stories", label: "Most stories" },
  { id: "people", label: "Most people" },
] as const;

export default function CommunityIndex() {
  const posts = useLok((s) => s.posts);
  const [places, setPlaces] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("All");
  const [region, setRegion] = useState<Region | "All">("All");
  const [state, setState] = useState("All");
  const [voice, setVoice] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("stories");

  useEffect(() => {
    const sp = new URLSearchParams();
    if (state !== "All") sp.set("state", state);
    if (kind !== "All") sp.set("kind", kind);
    if (q.trim()) sp.set("q", q.trim());
    const t = setTimeout(() => {
      setLoading(true);
      void fetch(`/api/places?${sp}`)
        .then((r) => r.json())
        .then((d) => setPlaces(d.items || []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [state, kind, q]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = places.filter((c) => {
      if (kind !== "All" && c.kind !== kind) return false;
      if (region !== "All" && c.region !== region) return false;
      if (state !== "All" && c.state !== state) return false;
      if (voice && !posts.some((p) => p.communitySlug === c.slug && p.fromVoice)) return false;
      if (!query) return true;
      return [c.name, c.state, c.region, c.blurb, c.kind].join(" ").toLowerCase().includes(query);
    });
    const scored = filtered.map((c) => ({
      c,
      stories: posts.filter((p) => p.communitySlug === c.slug).length,
    }));
    scored.sort((a, b) => {
      if (sort === "people") return b.c.people - a.c.people;
      if (sort === "stories") return b.stories - a.stories;
      return a.c.name.localeCompare(b.c.name);
    });
    return scored;
  }, [q, kind, region, state, voice, sort, posts, places]);

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight sm:text-4xl">Real villages</h1>
      <p className="mt-2 max-w-xl text-mute">Filter by region, state, and whether the place has a voice note. Open a village like a subreddit.</p>

      <input className="field mt-6 max-w-2xl rounded-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Raghurajpur, Hodka, Khonoma…" />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-mute">
          Region
          <select className="field mt-1" value={region} onChange={(e) => setRegion(e.target.value as Region | "All")}>
            <option value="All">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-mute">
          State
          <select className="field mt-1" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="All">All states</option>
            {INDIA_STATES.map((s) => (
              <option key={s.qid} value={s.name}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-mute">
          Sort
          <select className="field mt-1" value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number]["id"])}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:pt-6">
          <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
          Has a voice note
        </label>
      </div>

      <div className="chip-row mt-4">
        {KINDS.map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`chip ${kind === k ? "chip-on" : ""}`}>{k}</button>
        ))}
      </div>

      <p className="mt-5 text-sm text-mute">{loading ? "Loading places…" : `${list.length} ${list.length === 1 ? "village" : "villages"}`}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {list.map(({ c, stories }) => (
          <Go key={c.slug} href={`/community/${c.slug}`} className="group relative min-h-[240px] overflow-hidden rounded-[22px]">
            {c.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 bg-[#1c1915]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="relative flex h-full min-h-[240px] flex-col justify-end p-5 text-[#f6f1e8]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">{c.region} · {c.state}</p>
              <h2 className="mt-1 font-display text-3xl font-light">{c.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-white/80">{c.blurb}</p>
              <p className="mt-3 text-xs text-white/60">{stories} {stories === 1 ? "story" : "stories"} · {c.people} people</p>
            </div>
          </Go>
        ))}
      </div>
      {!loading && list.length === 0 ? <p className="mt-8 text-mute">No village matched those filters.</p> : null}
    </div>
  );
}
