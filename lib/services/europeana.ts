import type { FeedCategory, FeedItem } from "../content";
import { cached, getJson } from "./http";
import { packId } from "./ids";

type Europeana = {
  items?: {
    id?: string;
    title?: string[];
    dcDescription?: string[];
    edmPreview?: string[];
    edmIsShownAt?: string[];
    dcCreator?: string[];
    rights?: string[];
    year?: string[];
    dataProvider?: string[];
  }[];
};

export async function searchEuropeana(query: string, category: FeedCategory, state?: string): Promise<FeedItem[]> {
  const key = process.env.EUROPEANA_API_KEY;
  if (!key) return [];
  const url = `https://api.europeana.eu/record/v2/search.json?${new URLSearchParams({
    wskey: key,
    query,
    qf: "TYPE:IMAGE",
    rows: "8",
    media: "true",
  })}`;
  try {
    const data = await cached(`eu:${query}`, 30 * 60_000, () => getJson<Europeana>(url, undefined, 1800));
    return (data.items ?? [])
      .filter((it) => it.edmPreview?.[0])
      .map((it) => ({
        id: packId("europeana", it.id || it.title?.[0] || query),
        title: it.title?.[0] || query,
        description: it.dcDescription?.[0] || `${it.title?.[0] || query} from Europeana.`,
        image: it.edmPreview?.[0],
        location: state || "India",
        state,
        category,
        source: it.dataProvider?.[0] || "Europeana",
        sourceUrl: it.edmIsShownAt?.[0],
        license: it.rights?.[0],
        author: it.dcCreator?.[0],
        date: it.year?.[0],
      }));
  } catch {
    return [];
  }
}
