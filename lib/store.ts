"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ME, SEED_POSTS } from "./seed-feed";
import { communityBySlug } from "./taxonomy";
import type { Author, CategoryId, Comment, Consent, Locale, Post } from "./types";

type Toast = { id: string; text: string };

type NewPost = {
  title: string;
  titleHi?: string;
  body: string;
  bodyHi?: string;
  imageUrl: string;
  audioUrl?: string;
  category: CategoryId;
  communitySlug: string;
  fromVoice: boolean;
  language?: Locale;
  consent?: Consent;
  holderName?: string;
};

type LokState = {
  posts: Post[];
  me: Author;
  liked: string[];
  saved: string[];
  unseen: number;
  toasts: Toast[];
  offline: boolean;
  hydrated: boolean;
  setHydrated: () => void;
  setOffline: (value: boolean) => void;
  setMe: (me: Author) => void;
  upsertPost: (post: Post) => void;
  addPost: (input: NewPost) => string;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  addComment: (postId: string, body: string) => void;
  addReply: (postId: string, commentId: string, body: string) => void;
  moderate: (id: string, status: Post["status"]) => void;
  clearUnseen: () => void;
  toast: (text: string) => void;
  dismissToast: (id: string) => void;
};

function stamp(post: Post): Post {
  const place = communityBySlug(post.communitySlug);
  return {
    ...post,
    comments: post.comments || [],
    consent: post.consent || "public",
    status: post.status || "approved",
    language: post.language || "en",
    coordinates: post.coordinates || place?.coordinates,
  };
}

function mergePosts(primary: Post[], extra: Post[]) {
  const map = new Map<string, Post>();
  for (const p of extra) map.set(p.id, stamp(p));
  for (const p of primary) map.set(p.id, stamp(p));
  return [...map.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export const useLok = create<LokState>()(
  persist(
    (set, get) => ({
      posts: SEED_POSTS.map(stamp),
      me: ME,
      liked: [],
      saved: [],
      unseen: 0,
      toasts: [],
      offline: false,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setOffline: (value) => set({ offline: value }),
      setMe: (me) => set({ me }),
      upsertPost: (post) =>
        set((s) => {
          if (s.posts.some((p) => p.id === post.id)) return s;
          return { posts: [stamp(post), ...s.posts] };
        }),
      addPost: (input) => {
        const id = `p-${Date.now()}`;
        const place = communityBySlug(input.communitySlug);
        const post = stamp({
          id,
          ...input,
          author: get().me,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: [],
          source: "LokSmaran",
          coordinates: place?.coordinates,
          status: input.consent === "public" ? "pending" : "approved",
        });
        set((s) => ({ posts: [post, ...s.posts], unseen: s.unseen + 1 }));
        void fetch("/api/archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(post),
        }).catch(() => undefined);
        return id;
      },
      toggleLike: (id) =>
        set((s) => {
          const on = s.liked.includes(id);
          const nextOn = !on;
          void fetch("/api/archive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "like", id, on: nextOn }),
          }).catch(() => undefined);
          return {
            liked: nextOn ? [...s.liked, id] : s.liked.filter((x) => x !== id),
            posts: s.posts.map((p) => (p.id === id ? { ...p, likes: p.likes + (nextOn ? 1 : -1) } : p)),
          };
        }),
      toggleSave: (id) =>
        set((s) => ({
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
        })),
      addComment: (postId, body) =>
        set((s) => {
          const comment: Comment = {
            id: `c-${Date.now()}`,
            author: s.me,
            body,
            createdAt: new Date().toISOString(),
            replies: [],
          };
          void fetch("/api/archive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "comment", id: postId, comment: body, author: s.me }),
          }).catch(() => undefined);
          return {
            posts: s.posts.map((p) => (p.id !== postId ? p : { ...p, comments: [...(p.comments || []), comment] })),
          };
        }),
      addReply: (postId, commentId, body) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      replies: [
                        ...c.replies,
                        { id: `r-${Date.now()}`, author: s.me, body, createdAt: new Date().toISOString() },
                      ],
                    }
                  : c,
              ),
            };
          }),
        })),
      moderate: (id, status) =>
        set((s) => {
          void fetch("/api/archive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "moderate", id, status }),
          }).catch(() => undefined);
          return { posts: s.posts.map((p) => (p.id === id ? { ...p, status } : p)) };
        }),
      clearUnseen: () => set({ unseen: 0 }),
      toast: (text) => {
        const id = `t-${Date.now()}`;
        set((s) => ({ toasts: [...s.toasts, { id, text }] }));
        setTimeout(() => get().dismissToast(id), 3200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "loksmaran-archive",
      partialize: (s) => ({ posts: s.posts, liked: s.liked, saved: s.saved, me: s.me }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<LokState>;
        return {
          ...current,
          ...p,
          posts: mergePosts(p.posts || [], SEED_POSTS),
          liked: p.liked || [],
          saved: p.saved || [],
          me: p.me || current.me,
        };
      },
    },
  ),
);

export function postById(id: string) {
  return useLok.getState().posts.find((p) => p.id === id);
}
