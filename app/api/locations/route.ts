import { NextRequest, NextResponse } from "next/server";
import { getLocations } from "@/lib/services/feed-service";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const level = (sp.get("level") || "state") as "state" | "district" | "place";
  const rows = await getLocations(level, sp.get("state") || undefined, sp.get("district") || undefined);
  return NextResponse.json({ items: rows });
}
