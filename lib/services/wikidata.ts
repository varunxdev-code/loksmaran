import type { FeedCategory, FeedItem } from "../content";
import { stateByName } from "../india";
import { cached, getJson } from "./http";
import { commonsFileUrl, packId, parseWkt } from "./ids";

type Binding = Record<string, { value: string }>;
type Sparql = { results?: { bindings?: Binding[] } };
type SearchHit = { search?: { id: string; label: string; description?: string }[] };
type Entity = {
  labels?: { en?: { value: string } };
  descriptions?: { en?: { value: string } };
  sitelinks?: { enwiki?: { title: string } };
  claims?: Record<string, { mainsnak?: { datavalue?: { value?: unknown } } }[]>;
};
type Entities = { entities?: Record<string, Entity> };

const TYPES: Record<Exclude<FeedCategory, "nearby">, string[]> = {
  all: ["Q4989906", "Q570116", "Q839954", "Q56436498", "Q132241", "Q2977"],
  villages: ["Q532", "Q56436498", "Q3558970"],
  cities: ["Q1549591", "Q515", "Q1093829"],
  heritage: ["Q4989906", "Q570116", "Q839954", "Q2977", "Q160725"],
  festivals: ["Q132241", "Q375122", "Q18608583"],
  food: ["Q746549", "Q2095", "Q19861951"],
  crafts: ["Q738071", "Q38829", "Q220898"],
  music: ["Q105543609", "Q43343", "Q108075280"],
  stories: ["Q131539", "Q108037752", "Q721"],
  history: ["Q1081138", "Q839954", "Q23413"],
  traditions: ["Q82821", "Q11024", "Q477406"],
  places: ["Q486972", "Q618123", "Q532", "Q1549591"],
};

function qidFromUri(uri: string) {
  return uri.split("/").pop() ?? uri;
}

async function sparql(query: string) {
  const url = `https://query.wikidata.org/sparql?${new URLSearchParams({ query, format: "json" })}`;
  return cached(`wd:${query}`, 10 * 60_000, () =>
    getJson<Sparql>(url, { headers: { Accept: "application/sparql-results+json" } }, 8000),
  );
}

function toItem(row: Binding, category: FeedCategory, state?: string, district?: string): FeedItem | null {
  const title = row.itemLabel?.value?.trim();
  if (!title || /^Q\d+$/i.test(title)) return null;
  const qid = qidFromUri(row.item.value);
  const coord = parseWkt(row.coord?.value);
  const wiki = row.wiki?.value;
  const image = row.image?.value ? commonsFileUrl(row.image.value) : undefined;
  const location = [row.adminLabel?.value, state].filter(Boolean).join(", ") || state || "India";
  return {
    id: packId("wd", qid),
    title,
    description: row.desc?.value || `${title} is a documented cultural place in India.`,
    image,
    location,
    state,
    district,
    category,
    source: "Wikidata",
    sourceUrl: wiki ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.replace(/ /g, "_"))}` : `https://www.wikidata.org/wiki/${qid}`,
    license: "CC0 / CC BY-SA (Wikidata)",
    author: "Wikidata contributors",
    coordinates: coord,
    place: { name: title, state, district, coordinates: coord, wikidataId: qid },
  };
}

function claimValue(entity: Entity, pid: string) {
  return entity.claims?.[pid]?.[0]?.mainsnak?.datavalue?.value;
}

function entityToItem(id: string, entity: Entity, category: FeedCategory, state?: string, district?: string): FeedItem | null {
  const title = entity.labels?.en?.value?.trim();
  if (!title) return null;
  const imageName = claimValue(entity, "P18");
  const coordRaw = claimValue(entity, "P625") as { latitude?: number; longitude?: number } | undefined;
  const wiki = entity.sitelinks?.enwiki?.title;
  const coordinates =
    coordRaw?.latitude != null && coordRaw?.longitude != null
      ? { lat: coordRaw.latitude, lng: coordRaw.longitude }
      : undefined;
  return {
    id: packId("wd", id),
    title,
    description: entity.descriptions?.en?.value || `${title} is a documented cultural place in India.`,
    image: typeof imageName === "string" ? commonsFileUrl(imageName) : undefined,
    location: [district, state, "India"].filter(Boolean).join(", "),
    state,
    district,
    category,
    source: "Wikidata",
    sourceUrl: wiki
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wiki.replace(/ /g, "_"))}`
      : `https://www.wikidata.org/wiki/${id}`,
    license: "CC0 / CC BY-SA (Wikidata)",
    author: "Wikidata contributors",
    coordinates,
    place: { name: title, state, district, coordinates, wikidataId: id },
  };
}

async function entitiesByIds(ids: string[], category: FeedCategory, state?: string, district?: string) {
  if (!ids.length) return [];
  const url = `https://www.wikidata.org/w/api.php?${new URLSearchParams({
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "labels|descriptions|claims|sitelinks",
    languages: "en",
    format: "json",
  })}`;
  try {
    const data = await cached(`wde:${ids.join(",")}`, 20 * 60_000, () => getJson<Entities>(url, undefined, 8000));
    return Object.entries(data.entities ?? {})
      .map(([qid, entity]) => entityToItem(qid, entity, category, state, district))
      .filter((x): x is FeedItem => Boolean(x));
  } catch {
    return [];
  }
}

export async function searchWikidata(opts: {
  category: FeedCategory;
  state?: string;
  district?: string;
  place?: string;
  q?: string;
  lat?: number;
  lng?: number;
  limit?: number;
  offset?: number;
}): Promise<FeedItem[]> {
  const category = opts.category === "nearby" ? "places" : opts.category;
  const topic: Record<string, string> = {
    all: "heritage",
    villages: "village",
    cities: "city",
    heritage: "monument temple",
    festivals: "festival",
    food: "cuisine",
    crafts: "handicraft",
    music: "folk music",
    stories: "folklore",
    history: "fort history",
    traditions: "tradition",
    places: "place",
  };
  const search = [opts.place || opts.q, opts.district, opts.state, "India", topic[category] || "heritage"]
    .filter(Boolean)
    .join(" ");
  try {
    const found = await cached(`wds:${search}`, 15 * 60_000, () =>
      getJson<SearchHit>(
        `https://www.wikidata.org/w/api.php?${new URLSearchParams({
          action: "wbsearchentities",
          search,
          language: "en",
          uselang: "en",
          type: "item",
          limit: String(opts.limit ?? 12),
          format: "json",
        })}`,
        undefined,
        8000,
      ),
    );
    const ids = (found.search ?? []).map((s) => s.id).filter(Boolean);
    const items = await entitiesByIds(ids, opts.category, opts.state, opts.district);
    if (items.length) return items;
  } catch {
    /* SPARQL fallback */
  }

  const types = TYPES[category] ?? TYPES.all;
  const st = stateByName(opts.state);
  const limit = Math.min(opts.limit ?? 12, 12);
  const typeLine = `VALUES ?type { ${types.map((t) => `wd:${t}`).join(" ")} }`;
  const admin = st ? `?item wdt:P131 wd:${st.qid}.` : `?item wdt:P17 wd:Q668.`;
  const query = `
    SELECT DISTINCT ?item ?itemLabel ?image ?coord ?wiki ?adminLabel ?desc WHERE {
      ${typeLine}
      ?item wdt:P31 ?type.
      ${admin}
      ?item wdt:P18 ?image.
      OPTIONAL { ?item wdt:P625 ?coord. }
      OPTIONAL { ?item wdt:P131 ?admin. }
      OPTIONAL { ?item schema:description ?desc. FILTER(LANG(?desc) = "en") }
      OPTIONAL {
        ?sitelink schema:about ?item;
                  schema:isPartOf <https://en.wikipedia.org/>;
                  schema:name ?wiki.
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT ${limit}
  `;
  try {
    const data = await sparql(query);
    return (data.results?.bindings ?? [])
      .map((row) => toItem(row, opts.category, opts.state, opts.district))
      .filter((x): x is FeedItem => Boolean(x));
  } catch {
    return [];
  }
}

export async function getWikidataEntity(qid: string): Promise<FeedItem | null> {
  const clean = qid.replace(/[^Q0-9]/g, "");
  const [item] = await entitiesByIds([clean], "places");
  return item ?? null;
}

export async function listDistricts(stateName: string) {
  const st = stateByName(stateName);
  if (!st) return [];
  const query = `
    SELECT DISTINCT ?item ?itemLabel WHERE {
      ?item wdt:P31 wd:Q1149652.
      ?item wdt:P131 wd:${st.qid}.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY ?itemLabel
    LIMIT 60
  `;
  try {
    const data = await sparql(query);
    return (data.results?.bindings ?? [])
      .map((r) => ({ qid: qidFromUri(r.item.value), name: r.itemLabel.value }))
      .filter((r) => r.name && !/^Q\d+$/i.test(r.name));
  } catch {
    return [];
  }
}

export async function listPlaces(stateName: string, district?: string) {
  const st = stateByName(stateName);
  if (!st) return [];
  const extra = district?.replace(/["\\\n]/g, "")
    ? `FILTER(CONTAINS(LCASE(?adminLabel), "${district.toLowerCase()}"))`
    : "";
  const query = `
    SELECT DISTINCT ?item ?itemLabel ?coord ?adminLabel WHERE {
      VALUES ?type { wd:Q532 wd:Q56436498 wd:Q1549591 wd:Q1093829 }
      ?item wdt:P31 ?type.
      ?item wdt:P131* wd:${st.qid}.
      OPTIONAL { ?item wdt:P625 ?coord. }
      OPTIONAL { ?item wdt:P131 ?admin. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      ${extra}
    }
    LIMIT 30
  `;
  try {
    const data = await sparql(query);
    return (data.results?.bindings ?? [])
      .map((r) => ({
        qid: qidFromUri(r.item.value),
        name: r.itemLabel.value,
        district: r.adminLabel?.value,
        coordinates: parseWkt(r.coord?.value),
      }))
      .filter((r) => r.name && !/^Q\d+$/i.test(r.name));
  } catch {
    return [];
  }
}
