import type { FeedCategory, FeedItem } from "../content";
import { INDIA_STATES } from "../india";
import { archiveAudio } from "./archive";
import { cached } from "./http";
import { unpackId } from "./ids";
import { getOsmPlace, nominatimSearch, searchOsm } from "./osm";
import { getWikidataEntity, listDistricts, listPlaces, searchWikidata } from "./wikidata";
import { commonsImageFor, searchCommons } from "./wikimedia";
import { enrichWithWikipedia, wikipediaItems, wikipediaSummary } from "./wikipedia";

export type FeedQuery = {
  category?: FeedCategory;
  state?: string;
  district?: string;
  place?: string;
  q?: string;
  lat?: number;
  lng?: number;
  page?: number;
};

const PAGE = 12;

const TOPIC: Record<FeedCategory, string> = {
  all: "heritage culture",
  nearby: "temple village heritage",
  villages: "village",
  cities: "city",
  heritage: "heritage monument temple fort",
  festivals: "festival",
  food: "cuisine food",
  crafts: "handicraft textile",
  music: "folk music",
  stories: "folklore legend",
  history: "history fort",
  traditions: "tradition ritual",
  places: "place landmark",
};

function phrase(opts: FeedQuery) {
  const loc = [opts.q, opts.place, opts.district, opts.state, "India"].filter(Boolean).join(" ");
  return `${loc} ${TOPIC[opts.category || "all"]}`.replace(/\s+/g, " ").trim();
}

function keyOf(item: FeedItem) {
  return `${item.title}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function dedupe(items: FeedItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (!key || seen.has(key) || seen.has(item.id)) return false;
    seen.add(key);
    seen.add(item.id);
    return true;
  });
}

async function fillImages(items: FeedItem[]) {
  const missing = items.filter((i) => !i.image).slice(0, 4);
  await Promise.all(
    missing.map(async (item) => {
      item.image = await commonsImageFor(`${item.title} India`);
    }),
  );
  return items.sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
}

async function maybeAudio(items: FeedItem[], category: FeedCategory, q: string) {
  if (!["music", "festivals", "traditions", "stories"].includes(category)) return items;
  try {
    const clip = await archiveAudio(q);
    if (!clip?.url) return items;
    let attached = 0;
    return items.map((item) => {
      if (item.audio || attached >= 2) return item;
      attached += 1;
      return { ...item, audio: clip.url };
    });
  } catch {
    return items;
  }
}

async function assemble(opts: FeedQuery): Promise<FeedItem[]> {
  const category = opts.category || "all";
  const q = phrase(opts);
  const wikiQ = [opts.place || opts.district || opts.state || "India", TOPIC[category]].join(" ");
  const geo = category === "nearby" || category === "villages" || category === "cities" || category === "places";

  const settled = await Promise.allSettled([
    searchCommons(q, category, opts.state),
    wikipediaItems(wikiQ, category, opts.state),
    searchWikidata({
      category,
      state: opts.state,
      district: opts.district,
      place: opts.place || opts.q,
      lat: opts.lat,
      lng: opts.lng,
      limit: 10,
    }),
    geo
      ? searchOsm({
          category,
          state: opts.state,
          place: opts.place || opts.q,
          lat: opts.lat,
          lng: opts.lng,
        })
      : Promise.resolve([] as FeedItem[]),
  ]);

  const raw: FeedItem[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") raw.push(...result.value);
  }

  let items = dedupe(raw);
  const head = await Promise.all(items.slice(0, 8).map((item) => enrichWithWikipedia(item)));
  items = dedupe([...head, ...items.slice(8)]);
  items = await fillImages(items);
  items = await maybeAudio(items, category, q);
  return items.filter((item) => item.title && (item.image || item.description));
}

export async function getFeed(opts: FeedQuery) {
  const page = Math.max(1, opts.page || 1);
  const cacheKey = `feed:${JSON.stringify({ ...opts, page })}`;
  const items = await cached(cacheKey, 8 * 60_000, () => assemble(opts));
  const start = (page - 1) * PAGE;
  const slice = items.slice(start, start + PAGE);
  return {
    items: slice,
    page,
    pageSize: PAGE,
    hasMore: start + PAGE < items.length,
  };
}

export async function getFeedItem(id: string): Promise<FeedItem | null> {
  return cached(`item:${id}`, 30 * 60_000, async () => {
    const { source, raw } = unpackId(id);
    let item: FeedItem | null = null;
    if (source === "wd") item = await getWikidataEntity(raw);
    else if (source === "osm") {
      const [type, osmId] = raw.split(":");
      item = type && osmId ? await getOsmPlace(type, osmId) : null;
    } else if (source === "wiki") {
      const page = await wikipediaSummary(raw);
      if (page?.title) {
        item = {
          id,
          title: page.title,
          description: page.extract || page.description || page.title,
          image: page.originalimage?.source || page.thumbnail?.source,
          location: "India",
          category: "stories",
          source: "Wikipedia",
          sourceUrl: page.content_urls?.desktop?.page,
          license: "CC BY-SA 4.0",
          author: "Wikipedia contributors",
        };
      }
    } else if (source === "commons") {
      const hits = await searchCommons(raw.replace(/^File:/i, ""), "heritage");
      item = hits[0] || null;
    }
    if (!item) {
      const feed = await assemble({ q: raw.replace(/_/g, " "), category: "all" });
      item = feed.find((x) => x.id === id) || feed[0] || null;
    }
    if (!item) return null;
    if (!item.image) item.image = await commonsImageFor(item.title);
    return enrichWithWikipedia(item);
  });
}

export async function getLocations(level: "state" | "district" | "place", state?: string, district?: string) {
  if (level === "state") {
    return INDIA_STATES.map((s) => ({ name: s.name, qid: s.qid, region: s.region }));
  }
  if (level === "district" && state) {
    const rows = await listDistricts(state);
    if (rows.length) return rows.map((r) => ({ name: r.name, qid: r.qid }));
    const nom = await nominatimSearch(`${state} district India`, 20);
    return nom
      .map((n) => ({ name: n.address?.county || n.name || n.display_name?.split(",")[0] || "" }))
      .filter((r) => r.name);
  }
  if (level === "place" && state) {
    const rows = await listPlaces(state, district);
    if (rows.length) return rows.map((r) => ({ name: r.name, qid: r.qid, district: r.district, coordinates: r.coordinates }));
    const nom = await nominatimSearch(`${district || ""} ${state} India`, 20);
    return nom.map((n) => ({
      name: n.address?.city || n.address?.town || n.address?.village || n.name || "",
      coordinates: n.lat && n.lon ? { lat: Number(n.lat), lng: Number(n.lon) } : undefined,
    })).filter((r) => r.name);
  }
  return [];
}
