import { NextRequest, NextResponse } from "next/server";
import { getFeedItem } from "@/lib/services/feed-service";

export const runtime = "nodejs";
export const revalidate = 600;
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ item: null }, { status: 400 });
  try {
    const item = await getFeedItem(id);
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ item: null }, { status: 404 });
  }
}
