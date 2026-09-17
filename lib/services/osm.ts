import type { Community } from "../types";
import type { Coordinates, FeedCategory, FeedItem, PlaceRef } from "../content";
import { INDIA_STATES, stateByName } from "../india";
import { cached, getJson, postText } from "./http";
import { packId, slugify } from "./ids";

type Overpass = {
  elements?: {
    id: number;
    type: string;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  }[];
};

type Nominatim = {
  display_name?: string;
  lat?: string;
  lon?: string;
  name?: string;
  type?: string;
  class?: string;
  osm_id?: number;
  osm_type?: string;
  address?: { state?: string; county?: string; city?: string; town?: string; village?: string };
}[];

const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

async function overpass(query: string): Promise<Overpass> {
  return cached(`osm:${query}`, 12 * 60_000, async () => {
    let last = "";
    for (const endpoint of OVERPASS) {
      try {
        const text = await postText(endpoint, `data=${encodeURIComponent(query)}`);
        return JSON.parse(text) as Overpass;
      } catch (err) {
        last = err instanceof Error ? err.message : "overpass failed";
      }
    }
    throw new Error(last);
  });
}

function kindFromTags(tags: Record<string, string> = {}): PlaceRef["kind"] {
  const place = tags.place;
  if (place === "city") return "City";
  if (place === "town") return "Town";
  if (place === "village" || place === "hamlet") return "Village";
  return "Site";
}

function toItem(el: NonNullable<Overpass["elements"]>[number], category: FeedCategory, state?: string): FeedItem | null {
  const tags = el.tags || {};
  const title = tags.name || tags["name:en"];
  if (!title) return null;
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const coordinates = lat != null && lng != null ? { lat, lng } : undefined;
  const wiki = tags.wikipedia?.replace(/^en:/, "");
  return {
    id: packId("osm", `${el.type}:${el.id}`),
    title,
    description: tags.description || tags.note || `${title} is a mapped ${tags.historic || tags.tourism || tags.place || "place"} in India.`,
    location: [tags["addr:district"], tags["addr:state"] || state, "India"].filter(Boolean).join(", "),
    state: tags["addr:state"] || state,
    district: tags["addr:district"],
    category,
    source: "OpenStreetMap",
    sourceUrl: wiki ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.replace(/ /g, "_"))}` : `https://www.openstreetmap.org/${el.type}/${el.id}`,
    license: "ODbL 1.0",
    author: "OpenStreetMap contributors",
    coordinates,
    place: {
      name: title,
      state: tags["addr:state"] || state,
      district: tags["addr:district"],
      kind: kindFromTags(tags),
      coordinates,
      osmId: `${el.type}/${el.id}`,
    },
  };
}

export async function searchOsm(opts: {
  category: FeedCategory;
  state?: string;
  place?: string;
  lat?: number;
  lng?: number;
}): Promise<FeedItem[]> {
  const st = stateByName(opts.state);
  const area = st ? `area["ISO3166-2"="${st.iso}"]->.a;` : `area["ISO3166-1"="IN"]->.a;`;
  const around = opts.lat != null && opts.lng != null;
  const box = around ? `(around:28000,${opts.lat},${opts.lng})` : `(area.a)`;
  const name = opts.place?.replace(/["\\\n]/g, "");
  const nameFilter = name ? `["name"~"${name}",i]` : `["name"]`;
  const filters =
    opts.category === "villages"
      ? `node["place"~"village|hamlet"]${nameFilter}${box};`
      : opts.category === "cities"
        ? `node["place"~"city|town"]${nameFilter}${box};`
        : opts.category === "heritage" || opts.category === "history" || opts.category === "places"
          ? `nwr["historic"]${nameFilter}${box}; nwr["heritage"]${nameFilter}${box}; nwr["tourism"="attraction"]${nameFilter}${box};`
          : `nwr["historic"]${nameFilter}${box}; nwr["place"~"village|town|city"]${nameFilter}${box};`;

  const query = `[out:json][timeout:20]; ${around ? "" : area} (${filters}); out center 28;`;
  try {
    const data = await overpass(query);
    return (data.elements ?? [])
      .map((el) => toItem(el, opts.category, opts.state))
      .filter((x): x is FeedItem => Boolean(x));
  } catch {
    return [];
  }
}

export async function getOsmPlace(type: string, id: string): Promise<FeedItem | null> {
  const query = `[out:json][timeout:12]; ${type}(${id}); out center 1;`;
  try {
    const data = await overpass(query);
    const el = data.elements?.[0];
    return el ? toItem(el, "places") : null;
  } catch {
    return null;
  }
}

export async function nominatimSearch(q: string, limit = 12) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q,
    format: "json",
    addressdetails: "1",
    limit: String(limit),
    countrycodes: "in",
  })}`;
  try {
    return await cached(`nom:${q}`, 30 * 60_000, () => getJson<Nominatim>(url, undefined, 1800));
  } catch {
    return [];
  }
}

export async function osmCommunities(opts: { state?: string; kind?: string; q?: string }): Promise<(Community & { coordinates?: Coordinates })[]> {
  const st = stateByName(opts.state);
  const area = st ? `area["ISO3166-2"="${st.iso}"]->.a;` : `area["ISO3166-1"="IN"]->.a;`;
  const place =
    opts.kind === "City" ? "city" : opts.kind === "Town" ? "town" : opts.kind === "Village" ? "village|hamlet" : "village|town|city|hamlet";
  const name = opts.q?.replace(/["\\\n]/g, "");
  const nameFilter = name ? `["name"~"${name}",i]` : `["name"]`;
  const query = `[out:json][timeout:20]; ${area} (node["place"~"${place}"]${nameFilter}(area.a);); out center 36;`;
  try {
    const data = await overpass(query);
    return (data.elements ?? [])
      .map((el) => {
        const tags = el.tags || {};
        const title = tags.name || tags["name:en"];
        if (!title) return null;
        const k = kindFromTags(tags);
        const stateName = tags["addr:state"] || st?.name || "India";
        const region = INDIA_STATES.find((s) => s.name === stateName)?.region ?? "North";
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        return {
          slug: slugify(title),
          name: title,
          nameHi: tags["name:hi"] || title,
          state: stateName,
          kind: k === "Site" ? "Village" : k,
          region,
          image: "",
          blurb: tags.description || `${title} is a ${String(k).toLowerCase()} in ${stateName}.`,
          people: 0,
          coordinates: lat != null && lng != null ? { lat, lng } : undefined,
        };
      })
      .filter((x): x is Community & { coordinates?: Coordinates } => Boolean(x));
  } catch {
    return [];
  }
}
