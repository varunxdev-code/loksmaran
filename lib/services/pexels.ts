import type { FeedCategory, FeedItem } from "../content";
import { cached, getJson } from "./http";
import { packId } from "./ids";

type Pexels = {
  photos?: {
    id: number;
    alt?: string;
    url?: string;
    photographer?: string;
    src?: { large2x?: string; large?: string };
  }[];
};

export async function searchPexels(query: string, category: FeedCategory, state?: string): Promise<FeedItem[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];
  const url = `https://api.pexels.com/v1/search?${new URLSearchParams({ query, per_page: "8" })}`;
  try {
    const data = await cached(`px:${query}`, 20 * 60_000, () =>
      getJson<Pexels>(url, { headers: { Authorization: key } }, 1200),
    );
    return (data.photos ?? [])
      .filter((p) => p.src?.large2x || p.src?.large)
      .map((p) => ({
        id: packId("pexels", String(p.id)),
        title: p.alt || query,
        description: p.alt || `Photograph related to ${query}.`,
        image: p.src?.large2x || p.src?.large,
        location: state || "India",
        state,
        category,
        source: "Pexels",
        sourceUrl: p.url,
        license: "Pexels License",
        author: p.photographer,
      }));
  } catch {
    return [];
  }
}
