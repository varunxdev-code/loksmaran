import type { FeedCategory, FeedItem } from "../content";
import type { ShelfBook } from "../types";
import { cached, getJson } from "./http";
import { commonsFileUrl, packId, parseWkt } from "./ids";

type Binding = Record<string, { value: string }>;
type Sparql = { results?: { bindings?: Binding[] } };

const QUERY = `
SELECT DISTINCT ?item ?itemLabel ?itemLabelHi ?coord ?image ?desc ?wiki WHERE {
  {
    ?item wdt:P1435 wd:Q9259 .
    ?item wdt:P17 wd:Q668 .
  } UNION {
    ?item wdt:P3259 ?ich .
    ?item wdt:P17 wd:Q668 .
  } UNION {
    ?item wdt:P1435 wd:Q17047513 .
  }
  OPTIONAL { ?item wdt:P625 ?coord . }
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?item schema:description ?desc . FILTER(LANG(?desc) = "en") }
  OPTIONAL { ?wiki schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }
  OPTIONAL { ?item rdfs:label ?itemLabelHi . FILTER(LANG(?itemLabelHi) = "hi") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,hi". }
}
LIMIT 36
`;

async function sparql(query: string) {
  const url = `https://query.wikidata.org/sparql?${new URLSearchParams({ query, format: "json" })}`;
  return cached(`unesco:${query.slice(0, 80)}`, 40 * 60_000, () =>
    getJson<Sparql>(url, { headers: { Accept: "application/sparql-results+json" } }, 12000),
  );
}

function qid(uri: string) {
  return uri.split("/").pop() || uri;
}

export async function unescoIndiaItems(): Promise<FeedItem[]> {
  try {
    const data = await sparql(QUERY);
    return (data.results?.bindings || [])
      .map((row): FeedItem | null => {
        const title = row.itemLabel?.value?.trim();
        if (!title || /^Q\d+$/i.test(title)) return null;
        const id = qid(row.item.value);
        const coord = parseWkt(row.coord?.value);
        const image = row.image?.value ? commonsFileUrl(row.image.value) : undefined;
        return {
          id: packId("unesco", id),
          title,
          description: row.desc?.value || `${title} is recognised on a UNESCO or national heritage list in India.`,
          image,
          location: "India",
          category: "heritage" as FeedCategory,
          source: "UNESCO / Wikidata",
          sourceUrl: row.wiki?.value || `https://www.wikidata.org/wiki/${id}`,
          license: "CC0 / CC BY-SA",
          author: "UNESCO / Wikidata",
          coordinates: coord,
          place: { name: title, coordinates: coord, wikidataId: id, kind: "Site" },
        };
      })
      .filter((x): x is FeedItem => Boolean(x));
  } catch {
    return [];
  }
}

export async function unescoBooks(): Promise<ShelfBook[]> {
  const items = await unescoIndiaItems();
  const colors = ["#6b2b1f", "#1f3d2b", "#2b3348", "#7a4b16", "#3e2a1f", "#25445a"];
  return items.slice(0, 18).map((item, i) => ({
    id: item.id,
    title: item.title,
    author: item.author || "UNESCO",
    shelf: "unesco" as const,
    color: colors[i % colors.length],
    height: 148 + ((i * 17) % 44),
    image: item.image,
    description: item.description,
    source: item.source,
    sourceUrl: item.sourceUrl,
    place: item.location,
  }));
}
