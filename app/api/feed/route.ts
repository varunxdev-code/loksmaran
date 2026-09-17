import { NextRequest, NextResponse } from "next/server";
import type { FeedCategory } from "@/lib/content";
import { getFeed } from "@/lib/services/feed-service";

export const runtime = "nodejs";
export const revalidate = 300;
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = (sp.get("category") || "all") as FeedCategory;
  const lat = sp.get("lat");
  const lng = sp.get("lng");
  try {
    const data = await getFeed({
      category,
      state: sp.get("state") || undefined,
      district: sp.get("district") || undefined,
      place: sp.get("place") || undefined,
      q: sp.get("q") || undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      page: Number(sp.get("page") || "1"),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { items: [], page: 1, hasMore: false, error: error instanceof Error ? error.message : "feed failed" },
      { status: 200 },
    );
  }
}
