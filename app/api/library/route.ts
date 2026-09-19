import { NextResponse } from "next/server";
import { libraryCatalog } from "@/lib/services/libraries";
import { unescoBooks } from "@/lib/services/unesco";
import { listArchivePosts } from "@/lib/archive-db";
import type { ShelfBook } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 600;
export const maxDuration = 20;

const VOICE_COLORS = ["#4a2a18", "#2a3d2e", "#3a2a48", "#5a3a12"];

export async function GET() {
  try {
    const [unesco, rest] = await Promise.all([unescoBooks(), libraryCatalog()]);
    const voices: ShelfBook[] = listArchivePosts()
      .filter((p) => (p.consent || "public") !== "private" && p.status !== "rejected")
      .slice(0, 16)
      .map((p, i) => ({
        id: p.id,
        title: p.title,
        titleHi: p.titleHi,
        author: p.holderName || p.author.name,
        shelf: p.category === "tyohar" ? "festivals" : p.category === "hastashilp" || p.category === "lokkala" ? "crafts" : "voices",
        color: VOICE_COLORS[i % VOICE_COLORS.length],
        height: 146 + ((i * 11) % 40),
        image: p.imageUrl,
        description: p.body,
        descriptionHi: p.bodyHi,
        source: p.source || "LokSmaran",
        sourceUrl: `/post/${encodeURIComponent(p.id)}`,
        place: p.author.location,
      }));
    const books = [...unesco, ...rest, ...voices];
    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json(
      { books: [], error: error instanceof Error ? error.message : "library failed" },
      { status: 200 },
    );
  }
}
