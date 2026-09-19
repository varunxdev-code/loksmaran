import { NextRequest, NextResponse } from "next/server";
import { commentArchivePost, getArchivePost, likeArchivePost, listArchivePosts, moderateArchivePost, saveArchivePost } from "@/lib/archive-db";
import type { Comment, Consent, Locale, Post, PostStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const post = getArchivePost(id);
    if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ post });
  }
  return NextResponse.json({ posts: listArchivePosts() });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Post> & { action?: string; on?: boolean; comment?: string; status?: PostStatus };
    if (body.action === "like" && body.id) {
      const post = likeArchivePost(body.id, Boolean(body.on));
      return NextResponse.json({ post });
    }
    if (body.action === "comment" && body.id && body.comment) {
      const comment: Comment = {
        id: `c-${Date.now()}`,
        author: body.author || { id: "u-me", name: "You", location: "India", bio: "", initials: "Y" },
        body: body.comment,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      const post = commentArchivePost(body.id, comment);
      return NextResponse.json({ post });
    }
    if (body.action === "moderate" && body.id) {
      const post = moderateArchivePost(body.id, body.status || "approved");
      return NextResponse.json({ post });
    }
    if (!body.title || !body.body) {
      return NextResponse.json({ error: "title and story required" }, { status: 400 });
    }
    const post: Post = {
      id: body.id || `p-${Date.now()}`,
      title: String(body.title),
      titleHi: body.titleHi,
      body: String(body.body),
      bodyHi: body.bodyHi,
      imageUrl: body.imageUrl || "",
      audioUrl: body.audioUrl,
      category: body.category || "kahani",
      communitySlug: body.communitySlug || "tilonia",
      author: body.author || { id: "u-me", name: "You", location: "India", bio: "", initials: "Y" },
      createdAt: body.createdAt || new Date().toISOString(),
      likes: body.likes || 0,
      fromVoice: Boolean(body.fromVoice),
      comments: body.comments || [],
      source: body.source || "LokSmaran",
      language: (body.language as Locale) || "en",
      consent: (body.consent as Consent) || "village",
      status: body.consent === "public" ? "pending" : "approved",
      holderName: body.holderName,
      coordinates: body.coordinates,
    };
    return NextResponse.json({ post: saveArchivePost(post) });
  } catch {
    return NextResponse.json({ error: "archive write failed" }, { status: 400 });
  }
}
