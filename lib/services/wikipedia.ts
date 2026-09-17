import type { FeedCategory, FeedItem } from "../content";
import { cached, getJson } from "./http";
import { packId } from "./ids";

type Summary = {
  title?: string;
  extract?: string;
  description?: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
  timestamp?: string;
};

type SearchRes = {
  query?: { search?: { title: string; snippet: string }[] };
};

export async function wikipediaSummary(title: string): Promise<Summary | null> {
  const slug = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`;
  try {
    return await cached(`wp:${title}`, 30 * 60_000, () => getJson<Summary>(url, undefined, 8000));
  } catch {
    return null;
  }
}

export async function searchWikipedia(query: string, limit = 10): Promise<string[]> {
  const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(limit),
    format: "json",
    origin: "*",
  })}`;
  try {
    const data = await cached(`wps:${query}:${limit}`, 15 * 60_000, () => getJson<SearchRes>(url, undefined, 8000));
    return (data.query?.search ?? []).map((s) => s.title);
  } catch {
    return [];
  }
}

export async function wikipediaByTitles(titles: string[], category: FeedCategory, state?: string): Promise<FeedItem[]> {
  const pages = await Promise.all(titles.map((t) => wikipediaSummary(t)));
  return pages
    .filter((p): p is Summary => Boolean(p?.title && (p.extract || p.thumbnail)))
    .map((p) => toWikiItem(p, category, state));
}

function toWikiItem(p: Summary, category: FeedCategory, state?: string): FeedItem {
  const title = p.title!;
  return {
    id: packId("wiki", title),
    title,
    description: p.extract || p.description || title,
    image: p.originalimage?.source || p.thumbnail?.source,
    location: state ? `${title}, ${state}` : `${title}, India`,
    state,
    category,
    source: "Wikipedia",
    sourceUrl: p.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
    license: "CC BY-SA 4.0",
    author: "Wikipedia contributors",
    date: p.timestamp,
  };
}

export async function wikipediaItems(query: string, category: FeedCategory, state?: string): Promise<FeedItem[]> {
  const titles = await searchWikipedia(query, 6);
  return wikipediaByTitles(titles, category, state);
}

export async function enrichWithWikipedia(item: FeedItem): Promise<FeedItem> {
  if (item.description && item.description.length > 80 && item.image) return item;
  const page = await wikipediaSummary(item.title);
  if (!page) return item;
  return {
    ...item,
    description: item.description?.length > 80 ? item.description : page.extract || item.description,
    image: item.image || page.originalimage?.source || page.thumbnail?.source,
    sourceUrl: item.sourceUrl || page.content_urls?.desktop?.page,
  };
}
