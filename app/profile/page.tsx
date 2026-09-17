"use client";

import { useState } from "react";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/lib/auth";
import { useLok } from "@/lib/store";

const TABS = ["Stories", "Saved", "Comments"] as const;

export default function ProfilePage() {
  const me = useLok((s) => s.me);
  const posts = useLok((s) => s.posts);
  const saved = useLok((s) => s.saved);
  const session = useAuth((s) => s.session);
  const mine = posts.filter((p) => p.author.id === me.id);
  const kept = posts.filter((p) => saved.includes(p.id));
  const comments = posts.flatMap((p) =>
    p.comments.filter((c) => c.author.id === me.id).map((c) => ({ post: p, comment: c })),
  );
  const [tab, setTab] = useState<(typeof TABS)[number]>("Stories");

  return (
    <div>
      <div className="flex items-start gap-5">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-ink text-lg text-[#f6f1e8]">
          {me.initials}
        </div>
        <div>
          <h1 className="font-display text-4xl font-light">{session?.name ?? me.name}</h1>
          <p className="mt-1 text-mute">{session?.email ?? me.location}</p>
          <p className="mt-3 max-w-md text-sm">{me.bio}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          ["Stories", mine.length],
          ["Comments", comments.length],
          ["Saved", kept.length],
        ].map(([label, n]) => (
          <div key={String(label)} className="card p-4 text-center">
            <p className="font-display text-3xl font-light">{n}</p>
            <p className="mt-1 text-xs text-mute">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`chip ${tab === t ? "chip-on" : ""}`}>{t}</button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tab === "Stories" ? mine.map((p) => <PostCard key={p.id} post={p} />) : null}
        {tab === "Saved" ? kept.map((p) => <PostCard key={p.id} post={p} />) : null}
        {tab === "Comments"
          ? comments.map(({ post, comment }) => (
              <a key={comment.id} href={`/post/${post.id}`} className="card block p-4">
                <p className="text-xs text-mute">on {post.title}</p>
                <p className="mt-1">{comment.body}</p>
              </a>
            ))
          : null}
      </div>
    </div>
  );
}
