import type { FeedCategory, FeedItem } from "../content";
import { cached, getJson } from "./http";
import { packId } from "./ids";

type Unsplash = {
  results?: {
    id: string;
    description?: string | null;
    alt_description?: string | null;
    created_at?: string;
    urls?: { regular?: string; small?: string };
    user?: { name?: string; links?: { html?: string } };
    links?: { html?: string };
    license?: string;
  }[];
};

export async function searchUnsplash(query: string, category: FeedCategory, state?: string): Promise<FeedItem[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];
  const url = `https://api.unsplash.com/search/photos?${new URLSearchParams({ query, per_page: "8" })}`;
  try {
    const data = await cached(`us:${query}`, 20 * 60_000, () =>
      getJson<Unsplash>(url, { headers: { Authorization: `Client-ID ${key}` } }, 1200),
    );
    return (data.results ?? [])
      .filter((p) => p.urls?.regular || p.urls?.small)
      .map((p) => ({
        id: packId("unsplash", p.id),
        title: p.alt_description || p.description || query,
        description: p.description || p.alt_description || `Photograph related to ${query}.`,
        image: p.urls?.regular || p.urls?.small,
        location: state || "India",
        state,
        category,
        source: "Unsplash",
        sourceUrl: p.links?.html || p.user?.links?.html,
        license: "Unsplash License",
        author: p.user?.name,
        date: p.created_at,
      }));
  } catch {
    return [];
  }
}
