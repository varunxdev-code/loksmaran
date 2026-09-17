"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Go } from "@/components/go-link";
import { categoryLabel, communityBySlug } from "@/lib/taxonomy";
import { formatCount, timeAgo } from "@/lib/format";
import { useLok } from "@/lib/store";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const post = useLok((s) => s.posts.find((p) => p.id === id));
  const liked = useLok((s) => s.liked.includes(id));
  const saved = useLok((s) => s.saved.includes(id));
  const toggleLike = useLok((s) => s.toggleLike);
  const toggleSave = useLok((s) => s.toggleSave);
  const addComment = useLok((s) => s.addComment);
  const addReply = useLok((s) => s.addReply);
  const toast = useLok((s) => s.toast);
  const [text, setText] = useState("");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  if (!post) {
    return (
      <div className="py-16">
        <h1 className="font-display text-4xl font-light">Story not found</h1>
        <a href="/feed" className="btn btn-ink mt-6">Back to the feed</a>
      </div>
    );
  }

  const place = communityBySlug(post.communitySlug);

  return (
    <article>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.imageUrl} alt="" className="aspect-[16/9] w-full rounded-[24px] object-cover" />
      <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-mute">
        {categoryLabel(post.category)}
        {post.fromVoice ? " · from voice" : ""} · {timeAgo(post.createdAt)}
      </p>
      <h1 className="mt-3 font-display text-4xl font-light leading-tight md:text-5xl">{post.title}</h1>
      <p className="mt-3 text-sm text-mute">
        {post.author.name} · {place ? `${place.name}, ${place.state}` : post.author.location}
      </p>
      {post.audioUrl ? <AudioPlayer src={post.audioUrl} label="Village voice note" /> : null}
      <p className="mt-8 text-lg leading-relaxed">{post.body}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ink h-11 min-h-11" onClick={() => toggleLike(post.id)}>
          <Heart size={16} className={liked ? "fill-current" : ""} /> Like · {formatCount(post.likes)}
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            void navigator.clipboard.writeText(window.location.href);
            toast("Link copied");
          }}
        >
          <Share2 size={14} /> Share
        </button>
        <button type="button" className="chip" onClick={() => toggleSave(post.id)}>
          <Bookmark size={14} className={saved ? "fill-ink" : ""} /> Save
        </button>
        {place ? <Go href={`/community/${place.slug}`} className="chip">Open r/{place.name}</Go> : null}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-light">Comments</h2>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            addComment(post.id, text.trim());
            setText("");
          }}
        >
          <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" />
          <button className="btn btn-ink h-12 min-h-12 px-6" type="submit">Post</button>
        </form>
        <ul className="mt-6 space-y-3">
          {post.comments.length === 0 ? <li className="text-sm text-mute">No comments yet.</li> : null}
          {post.comments.map((c) => (
            <li key={c.id} className="card p-4">
              <p className="text-sm font-medium">{c.author.name}</p>
              <p className="mt-1 leading-relaxed">{c.body}</p>
              <button type="button" className="mt-2 text-xs text-mute" onClick={() => setReplyFor(c.id)}>Reply</button>
              {replyFor === c.id ? (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reply.trim()) return;
                    addReply(post.id, c.id, reply.trim());
                    setReply("");
                    setReplyFor(null);
                  }}
                >
                  <input className="field" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply…" />
                  <button className="btn btn-ink h-12 min-h-12 px-5" type="submit">Send</button>
                </form>
              ) : null}
              {c.replies.map((r) => (
                <div key={r.id} className="mt-3 ml-4 border-l border-line pl-4 text-sm">
                  <p className="font-medium">{r.author.name}</p>
                  <p className="mt-1">{r.body}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
