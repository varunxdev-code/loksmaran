import type { Comment, Post } from "./types";
import { SEED_POSTS } from "./seed-feed";

type Archive = {
  posts: Post[];
};

const g = globalThis as typeof globalThis & { __loksmaranArchive?: Archive };

function empty(): Archive {
  return { posts: SEED_POSTS.map((p) => ({ ...p, consent: p.consent || "public", status: p.status || "approved" })) };
}

function store(): Archive {
  if (!g.__loksmaranArchive) g.__loksmaranArchive = empty();
  return g.__loksmaranArchive;
}

export function listArchivePosts() {
  return store().posts;
}

export function getArchivePost(id: string) {
  return store().posts.find((p) => p.id === id) || null;
}

export function saveArchivePost(post: Post) {
  const db = store();
  const i = db.posts.findIndex((p) => p.id === post.id);
  if (i >= 0) db.posts[i] = post;
  else db.posts.unshift(post);
  return post;
}

export function likeArchivePost(id: string, on: boolean) {
  const post = getArchivePost(id);
  if (!post) return null;
  post.likes = Math.max(0, post.likes + (on ? 1 : -1));
  return post;
}

export function commentArchivePost(id: string, comment: Comment) {
  const post = getArchivePost(id);
  if (!post) return null;
  post.comments = [...(post.comments || []), comment];
  return post;
}

export function moderateArchivePost(id: string, status: Post["status"]) {
  const post = getArchivePost(id);
  if (!post) return null;
  post.status = status;
  return post;
}
