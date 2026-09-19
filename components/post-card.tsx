"use client";

import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Go } from "@/components/go-link";
import { displayBody, displayTitle, useLocale } from "@/lib/i18n";
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
  const locale = useLocale((s) => s.locale);
  const place = communityBySlug(post.communitySlug);
  const comments = post.comments ?? [];
  const author = post.author?.name || post.source || "Archive";
  const href = `/post/${encodeURIComponent(post.id)}`;

  async function share() {
    const url = `${location.origin}${href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.body?.slice(0, 120), url });
        return;
      }
    } catch {
      /* fall through */
    }
    await navigator.clipboard.writeText(url);
    toast("Link copied");
  }

  return (
    <article className="feed-card">
      {post.imageUrl ? (
        <Go href={href} className="relative block overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="" className="aspect-[16/10] w-full object-cover sm:aspect-[16/9]" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/80">
            {place ? (locale === "hi" ? place.nameHi : place.name) : post.communitySlug.replace(/-/g, " ")}
              {place?.state || post.author?.location ? ` · ${place?.state || post.author.location}` : ""}
            </p>
          </div>
        </Go>
      ) : null}

      <div className="p-4 sm:p-5">
        <p className="truncate text-[12px] text-mute">
          <Go href={`/community/${post.communitySlug}`} className="font-medium text-ink">
            r/{place ? (locale === "hi" ? place.nameHi : place.name) : post.communitySlug}
          </Go>
          <span> · {author} · {timeAgo(post.createdAt)}</span>
          {post.fromVoice ? " · voice" : ""}
        </p>

        <Go href={href} className="mt-2 block">
          <h2 className="font-display text-[22px] font-normal leading-snug tracking-[-0.03em] sm:text-[26px]">
            {displayTitle(post, locale)}
          </h2>
        </Go>
        {post.body ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-mute">{displayBody(post, locale)}</p> : null}
        {post.audioUrl ? <AudioPlayer src={post.audioUrl} label="Village voice note" /> : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleLike(post.id)}
            className={`action-pill ${liked ? "action-pill-on" : ""}`}
          >
            <span className="text-base leading-none">{liked ? "▲" : "△"}</span>
            {formatCount(post.likes || 0)}
          </button>
          <Go href={href} className="action-pill">
            <MessageCircle size={14} /> {comments.length}
            <span className="hidden sm:inline">{comments.length === 1 ? "comment" : "comments"}</span>
          </Go>
          <button type="button" className="action-pill" onClick={() => void share()}>
            <Share2 size={14} /> Share
          </button>
          <button type="button" className="action-pill ml-auto" onClick={() => toggleSave(post.id)}>
            <Bookmark size={14} className={saved ? "fill-ink text-ink" : ""} />
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>
          <span className="chip py-1">{categoryLabel(post.category, locale)}</span>
          {post.consent ? <span className="chip py-1">{post.consent}</span> : null}
        </div>

        {post.source ? (
          <p className="mt-3 truncate text-[11px] text-mute">
            {post.sourceUrl ? (
              <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {post.source}
              </a>
            ) : (
              post.source
            )}
            {post.license ? ` · ${post.license}` : ""}
          </p>
        ) : null}
      </div>
    </article>
  );
}
