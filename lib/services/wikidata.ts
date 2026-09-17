import type { FeedCategory, FeedItem } from "../content";
import { stateByName } from "../india";
import { cached, getJson } from "./http";
import { commonsFileUrl, packId, parseWkt } from "./ids";

type Binding = Record<string, { value: string }>;
type Sparql = { results?: { bindings?: Binding[] } };

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
    getJson<Sparql>(url, { headers: { Accept: "application/sparql-results+json" } }, 600),
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
    place: {
      name: title,
      state,
      district,
      coordinates: coord,
      wikidataId: qid,
    },
  };
}

export async function searchWikidata(opts: {
  category: FeedCategory;
  state?: string;
  district?: string;
  place?: string;
  lat?: number;
  lng?: number;
  limit?: number;
  offset?: number;
}): Promise<FeedItem[]> {
  const category = opts.category === "nearby" ? "places" : opts.category;
  const types = TYPES[category] ?? TYPES.all;
  const st = stateByName(opts.state);
  const limit = opts.limit ?? 18;
  const offset = opts.offset ?? 0;
  const typeLine = `VALUES ?type { ${types.map((t) => `wd:${t}`).join(" ")} }`;
  const geo =
    opts.lat != null && opts.lng != null
      ? `
      SERVICE wikibase:around {
        ?item wdt:P625 ?coord.
        bd:serviceParam wikibase:center "Point(${opts.lng} ${opts.lat})"^^geo:wktLiteral.
        bd:serviceParam wikibase:radius "40".
      }`
      : `OPTIONAL { ?item wdt:P625 ?coord. }`;
  const admin = st ? `?item wdt:P131* wd:${st.qid}.` : `?item wdt:P17 wd:Q668.`;
  const place = opts.place?.replace(/["\\\n]/g, "") || "";
  const placeFilter = place ? `FILTER(CONTAINS(LCASE(?itemLabel), "${place.toLowerCase()}"))` : "";
  const districtFilter = opts.district?.replace(/["\\\n]/g, "")
    ? `FILTER(CONTAINS(LCASE(?adminLabel), "${opts.district.toLowerCase()}"))`
    : "";

  const query = `
    SELECT DISTINCT ?item ?itemLabel ?image ?coord ?wiki ?adminLabel ?desc WHERE {
      ${typeLine}
      ?item wdt:P31 ?type.
      ${admin}
      ${geo}
      OPTIONAL { ?item wdt:P18 ?image. }
      OPTIONAL { ?item wdt:P131 ?admin. }
      OPTIONAL { ?item schema:description ?desc. FILTER(LANG(?desc) = "en") }
      OPTIONAL {
        ?sitelink schema:about ?item;
                  schema:isPartOf <https://en.wikipedia.org/>;
                  schema:name ?wiki.
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,hi". }
      ${placeFilter}
      ${districtFilter}
    }
    LIMIT ${limit}
    OFFSET ${offset}
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
  const query = `
    SELECT ?item ?itemLabel ?image ?coord ?wiki ?adminLabel ?desc WHERE {
      BIND(wd:${qid.replace(/[^Q0-9]/g, "")} AS ?item)
      OPTIONAL { ?item wdt:P18 ?image. }
      OPTIONAL { ?item wdt:P625 ?coord. }
      OPTIONAL { ?item wdt:P131 ?admin. }
      OPTIONAL { ?item schema:description ?desc. FILTER(LANG(?desc) = "en") }
      OPTIONAL {
        ?sitelink schema:about ?item;
                  schema:isPartOf <https://en.wikipedia.org/>;
                  schema:name ?wiki.
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,hi". }
    } LIMIT 1
  `;
  const data = await sparql(query);
  const row = data.results?.bindings?.[0];
  return row ? toItem(row, "places") : null;
}

export async function listDistricts(stateName: string) {
  const st = stateByName(stateName);
  if (!st) return [];
  const query = `
    SELECT DISTINCT ?item ?itemLabel WHERE {
      ?item wdt:P31/wdt:P279* wd:Q1149652.
      ?item wdt:P131* wd:${st.qid}.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY ?itemLabel
    LIMIT 80
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
      VALUES ?type { wd:Q532 wd:Q56436498 wd:Q1549591 wd:Q1093829 wd:Q515 }
      ?item wdt:P31 ?type.
      ?item wdt:P131* wd:${st.qid}.
      OPTIONAL { ?item wdt:P625 ?coord. }
      OPTIONAL { ?item wdt:P131 ?admin. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      ${extra}
    }
    LIMIT 40
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
