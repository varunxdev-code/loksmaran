"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/post-card";
import { useLok } from "@/lib/store";
import { communityBySlug } from "@/lib/taxonomy";

const TABS = ["Stories", "People", "Customs", "Place"] as const;

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const community = communityBySlug(slug);
  const posts = useLok((s) => s.posts.filter((p) => p.communitySlug === slug));
  const [tab, setTab] = useState<(typeof TABS)[number]>("Stories");
  const people = useMemo(() => {
    const map = new Map(posts.map((p) => [p.author.id, p.author]));
    return [...map.values()];
  }, [posts]);

  if (!community) {
    return (
      <div className="py-16">
        <h1 className="font-display text-4xl font-light">This place isn’t listed yet</h1>
        <a href="/community" className="btn btn-ink mt-6">Back to villages</a>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden rounded-[24px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={community.image} alt="" className="h-64 w-full object-cover md:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-[#f6f1e8] sm:p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/75">{community.kind} · {community.region} · {community.state}</p>
          <h1 className="mt-2 font-display text-3xl font-light sm:text-5xl">{community.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">{community.blurb}</p>
          <p className="mt-3 text-xs text-white/60">{posts.length} stories · {community.people} people</p>
        </div>
      </section>

      <div className="chip-row mt-6">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`chip ${tab === t ? "chip-on" : ""}`}>{t}</button>
        ))}
      </div>

      {tab === "Stories" ? (
        <div className="mt-6 space-y-3">
          {posts.length === 0 ? <p className="card p-8 text-mute">No stories yet. Be the first.</p> : posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      ) : null}

      {tab === "People" ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {people.map((p) => (
            <li key={p.id} className="card flex items-center gap-3 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-xs text-[#f6f1e8]">{p.initials}</span>
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-mute">{p.location}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "Customs" ? (
        <p className="card mt-6 p-8 leading-relaxed text-mute">{community.blurb} Festival, food and house-rules live in the stories here.</p>
      ) : null}

      {tab === "Place" ? (
        <p className="card mt-6 p-8 leading-relaxed text-mute">
          {community.name} is a {community.kind.toLowerCase()} in {community.state}. The map can wait. The voices are the point.
        </p>
      ) : null}
    </div>
  );
}
