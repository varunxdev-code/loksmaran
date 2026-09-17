"use client";

import { create } from "zustand";
import { ME } from "./seed-feed";
import type { Author, CategoryId, Comment, Post } from "./types";

type Toast = { id: string; text: string };

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
  upsertPost: (post: Post) => void;
  addPost: (input: {
    title: string;
    body: string;
    imageUrl: string;
    audioUrl?: string;
    category: CategoryId;
    communitySlug: string;
    fromVoice: boolean;
  }) => string;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  addComment: (postId: string, body: string) => void;
  addReply: (postId: string, commentId: string, body: string) => void;
  clearUnseen: () => void;
  toast: (text: string) => void;
  dismissToast: (id: string) => void;
};

export const useLok = create<LokState>()((set, get) => ({
  posts: [],
  me: ME,
  liked: [],
  saved: [],
  unseen: 0,
  toasts: [],
  offline: false,
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
  setOffline: (value) => set({ offline: value }),
  upsertPost: (post) =>
    set((s) => {
      if (s.posts.some((p) => p.id === post.id)) return s;
      return { posts: [...s.posts, post] };
    }),
  addPost: (input) => {
    const id = `p-${Date.now()}`;
    const post: Post = {
      id,
      ...input,
      author: get().me,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    };
    set((s) => ({
      posts: [post, ...s.posts],
      unseen: s.unseen + 1,
    }));
    return id;
  },
  toggleLike: (id) =>
    set((s) => {
      const on = s.liked.includes(id);
      return {
        liked: on ? s.liked.filter((x) => x !== id) : [...s.liked, id],
        posts: s.posts.map((p) =>
          p.id === id ? { ...p, likes: p.likes + (on ? -1 : 1) } : p,
        ),
      };
    }),
  toggleSave: (id) =>
    set((s) => ({
      saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
    })),
  addComment: (postId, body) =>
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p;
        const comment: Comment = {
          id: `c-${Date.now()}`,
          author: s.me,
          body,
          createdAt: new Date().toISOString(),
          replies: [],
        };
        return { ...p, comments: [...p.comments, comment] };
      }),
    })),
  addReply: (postId, commentId, body) =>
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: [
                    ...c.replies,
                    {
                      id: `r-${Date.now()}`,
                      author: s.me,
                      body,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : c,
          ),
        };
      }),
    })),
  clearUnseen: () => set({ unseen: 0 }),
  toast: (text) => {
    const id = `t-${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { id, text }] }));
    setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function postById(id: string) {
  return useLok.getState().posts.find((p) => p.id === id);
}
