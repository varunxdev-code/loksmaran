import { NextResponse } from "next/server";
import { listArchivePosts } from "@/lib/archive-db";
import { nearbyVillageOsm, villageOsmShape } from "@/lib/services/osm";
import { unescoIndiaItems } from "@/lib/services/unesco";
import { villageGeos } from "@/lib/services/village-geo";
import { communityBySlug } from "@/lib/taxonomy";

export const runtime = "nodejs";
export const revalidate = 180;
export const maxDuration = 25;

function scatter(lat: number, lng: number, seed: string, i: number) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = ((h % 360) + i * 51) * (Math.PI / 180);
  const r = 0.006 + (h % 6) * 0.0022;
  return { lat: lat + Math.sin(a) * r, lng: lng + Math.cos(a) * r * 1.12 };
}

export async function GET(req: Request) {
  const near = new URL(req.url).searchParams.get("near");
  try {
    if (near) {
      const place = communityBySlug(near);
      const fallback = place?.coordinates || { lat: 22.97, lng: 78.66 };
      const [shape, nearby] = await Promise.all([
        villageOsmShape(place?.name || near, place?.state || "India", fallback),
        nearbyVillageOsm(fallback.lat, fallback.lng),
      ]);
      return NextResponse.json({
        slug: near,
        ...shape,
        nearby,
      });
    }

    const [villages, unesco] = await Promise.all([villageGeos(), unescoIndiaItems()]);
    const posts = listArchivePosts().filter((p) => p.consent !== "private" && p.status !== "rejected");
    const villagePins = villages.map((v) => ({
      kind: "village" as const,
      id: v.slug,
      title: v.name,
      titleHi: v.nameHi,
      blurb: v.blurb,
      blurbHi: v.blurbHi,
      image: v.image,
      state: v.state,
      region: v.region,
      lat: v.coordinates.lat,
      lng: v.coordinates.lng,
      osmUrl: v.osmUrl,
      count: posts.filter((p) => p.communitySlug === v.slug).length,
    }));

    const stories = posts.map((p, i) => {
      const home = villages.find((v) => v.slug === p.communitySlug);
      const base = p.coordinates || home?.coordinates || { lat: 22.97, lng: 78.66 };
      const same = Math.abs(base.lat - (home?.coordinates.lat || 0)) < 0.0008 && Math.abs(base.lng - (home?.coordinates.lng || 0)) < 0.0008;
      const coord = same || !p.coordinates ? scatter(base.lat, base.lng, p.id, i) : base;
      return {
        id: p.id,
        title: p.title,
        titleHi: p.titleHi,
        image: p.imageUrl,
        communitySlug: p.communitySlug,
        category: p.category,
        lat: coord.lat,
        lng: coord.lng,
      };
    });

    const heritage = unesco
      .filter((item) => item.coordinates)
      .slice(0, 28)
      .map((item) => ({
        kind: "heritage" as const,
        id: item.id,
        title: item.title,
        blurb: item.description,
        image: item.image,
        state: item.state || "India",
        lat: item.coordinates!.lat,
        lng: item.coordinates!.lng,
        osmUrl: item.sourceUrl,
        count: 0,
      }));

    return NextResponse.json({ villages: villagePins, heritage, stories });
  } catch (error) {
    return NextResponse.json(
      { villages: [], heritage: [], stories: [], error: error instanceof Error ? error.message : "map failed" },
      { status: 200 },
    );
  }
}
