import { NextRequest, NextResponse } from "next/server";
import { COMMUNITIES } from "@/lib/taxonomy";
import { commonsImageFor } from "@/lib/services/wikimedia";
import { osmCommunities } from "@/lib/services/osm";
import { wikipediaSummary } from "@/lib/services/wikipedia";

export const runtime = "nodejs";
export const revalidate = 600;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const slug = sp.get("slug");
  const state = sp.get("state") || undefined;
  const kind = sp.get("kind") || undefined;
  const q = sp.get("q") || undefined;

  if (slug) {
    const local = COMMUNITIES.find((c) => c.slug === slug);
    if (local) return NextResponse.json({ item: local });
    const live = await osmCommunities({ q: slug.replace(/-/g, " "), state, kind });
    const hit = live.find((c) => c.slug === slug) || live[0];
    if (!hit) return NextResponse.json({ item: null }, { status: 404 });
    const wiki = await wikipediaSummary(hit.name);
    const image = hit.image || wiki?.originalimage?.source || wiki?.thumbnail?.source || (await commonsImageFor(`${hit.name} ${hit.state}`));
    return NextResponse.json({
      item: {
        ...hit,
        image: image || "",
        blurb: wiki?.extract || hit.blurb,
      },
    });
  }

  const live = await osmCommunities({ state, kind: kind === "All" ? undefined : kind, q });
  const seeded = COMMUNITIES.filter((c) => {
    if (state && state !== "All" && c.state !== state) return false;
    if (kind && kind !== "All" && c.kind !== kind) return false;
    if (q && !`${c.name} ${c.state} ${c.blurb}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const merged = [...seeded];
  for (const place of live) {
    if (!merged.some((c) => c.slug === place.slug || c.name.toLowerCase() === place.name.toLowerCase())) {
      merged.push(place);
    }
  }
  const withImages = await Promise.all(
    merged.slice(0, 24).map(async (c) => {
      if (c.image) return c;
      const wiki = await wikipediaSummary(c.name);
      const image = wiki?.originalimage?.source || wiki?.thumbnail?.source || (await commonsImageFor(`${c.name} ${c.state}`));
      return { ...c, image: image || "", blurb: wiki?.extract?.slice(0, 180) || c.blurb };
    }),
  );
  return NextResponse.json({ items: withImages });
}
