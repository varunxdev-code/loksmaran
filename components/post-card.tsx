"use client";

import { ArrowBigDown, ArrowBigUp, Bookmark, MessageCircle, Share2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Go } from "@/components/go-link";
import { categoryLabel, communityBySlug } from "@/lib/taxonomy";
import { formatCount, timeAgo } from "@/lib/format";
import { useLok } from "@/lib/store";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const liked = useLok((s) => s.liked.includes(post.id));
  const saved = useLok((s) => s.saved.includes(post.id));
  const toggleLike = useLok((s) => s.toggleLike);
  const toggleSave = useLok((s) => s.toggleSave);
  const toast = useLok((s) => s.toast);
  const place = communityBySlug(post.communitySlug);

  return (
    <article className="card flex overflow-hidden">
      <div className="flex w-12 shrink-0 flex-col items-center gap-1 bg-[#f3eee6] py-3 text-[12px]">
        <button type="button" onClick={() => toggleLike(post.id)} aria-label="Upvote" className={liked ? "text-blood" : "text-mute"}>
          <ArrowBigUp size={22} fill={liked ? "currentColor" : "none"} />
        </button>
        <span className="font-semibold">{formatCount(post.likes)}</span>
        <ArrowBigDown size={22} className="text-mute/50" />
      </div>
      <div className="min-w-0 flex-1 p-4">
        <p className="text-[12px] text-mute">
          <Go href={`/community/${post.communitySlug}`} className="font-medium text-ink">
            r/{place?.name ?? post.communitySlug}
          </Go>
          <span> · {post.author.name} · {timeAgo(post.createdAt)}</span>
          {post.fromVoice ? " · voice" : ""}
        </p>
        <Go href={`/post/${post.id}`} className="mt-1 block">
          <h2 className="text-[18px] font-semibold leading-snug tracking-[-0.02em]">{post.title}</h2>
        </Go>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mute">{post.body}</p>
        {post.audioUrl ? <AudioPlayer src={post.audioUrl} label="Village voice note" /> : null}
        <Go href={`/post/${post.id}`} className="mt-3 block overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
        </Go>
        <div className="mt-3 flex flex-wrap items-center gap-1 text-[13px] text-mute">
          <span className="chip py-1">{categoryLabel(post.category)}</span>
          <Go href={`/post/${post.id}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-ivory">
            <MessageCircle size={14} /> {post.comments.length} comments
          </Go>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-ivory"
            onClick={() => {
              void navigator.clipboard.writeText(`${location.origin}/post/${post.id}`);
              toast("Link copied");
            }}
          >
            <Share2 size={14} /> Share
          </button>
          <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-ivory" onClick={() => toggleSave(post.id)}>
            <Bookmark size={14} className={saved ? "fill-ink text-ink" : ""} /> Save
          </button>
        </div>
      </div>
    </article>
  );
}
