"use client";

import { useMemo, useState } from "react";
import { PostCard } from "@/components/post-card";
import { TRENDING } from "@/lib/seed-feed";
import { useLok } from "@/lib/store";

const SORTS = [
  { id: "hot", label: "Hot" },
  { id: "new", label: "New" },
  { id: "voice", label: "Voice" },
] as const;

export default function FeedPage() {
  const posts = useLok((s) => s.posts);
  const unseen = useLok((s) => s.unseen);
  const clearUnseen = useLok((s) => s.clearUnseen);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("hot");

  const list = useMemo(() => {
    const copy = [...posts];
    if (sort === "new") copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    else copy.sort((a, b) => b.likes - a.likes);
    if (sort === "voice") return copy.filter((p) => Boolean(p.audioUrl || p.fromVoice));
    return copy;
  }, [posts, sort]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {SORTS.map((item) => (
            <button key={item.id} type="button" onClick={() => setSort(item.id)} className={`chip ${sort === item.id ? "chip-on" : ""}`}>
              {item.label}
            </button>
          ))}
        </div>
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
          {list.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <aside className="hidden lg:block">
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Trending</p>
          <ul className="mt-3 space-y-3 text-sm">
            {TRENDING.map((t) => (
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
