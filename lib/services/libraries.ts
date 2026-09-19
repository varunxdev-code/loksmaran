import type { FeedCategory, FeedItem } from "../content";
import type { ShelfBook, ShelfId } from "../types";
import { cached, getJson } from "./http";
import { packId } from "./ids";

type OLDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
};

type OLSearch = { docs?: OLDoc[] };

type IADoc = {
  identifier?: string;
  title?: string;
  description?: string | string[];
  creator?: string | string[];
  year?: string;
};

type IASearch = { response?: { docs?: IADoc[] } };

const GOVT_SHELF: ShelfBook[] = [
  {
    id: "govt-mgmd",
    title: "Mera Gaon Meri Dharohar",
    titleHi: "मेरा गाँव मेरी धरोहर",
    author: "Ministry of Culture",
    shelf: "govt",
    color: "#5c2a1d",
    height: 176,
    description: "National mission to document cultural heritage of Indian villages — mapping, folk forms, and local history.",
    descriptionHi: "भारतीय गाँवों की सांस्कृतिक धरोहर दर्ज करने का राष्ट्रीय मिशन।",
    source: "Ministry of Culture",
    sourceUrl: "https://mgmd.gov.in/",
    place: "India",
  },
  {
    id: "govt-ndli",
    title: "National Digital Library of India",
    titleHi: "राष्ट्रीय डिजिटल पुस्तकालय",
    author: "MoE / IIT Kharagpur",
    shelf: "govt",
    color: "#1e3a5f",
    height: 168,
    description: "National digital library of books, theses and learning resources. LokSmaran sits beside it — for what was never printed.",
    source: "NDLI",
    sourceUrl: "https://ndl.iitkgp.ac.in/",
  },
  {
    id: "govt-asi",
    title: "Archaeological Survey of India",
    titleHi: "भारतीय पुरातत्व सर्वेक्षण",
    author: "ASI",
    shelf: "govt",
    color: "#3d4a28",
    height: 160,
    description: "Protected monuments, excavations and site records. We point at the living village around the monument.",
    source: "ASI",
    sourceUrl: "https://asi.nic.in/",
  },
  {
    id: "govt-ich",
    title: "National List of Intangible Cultural Heritage",
    titleHi: "अमूर्त सांस्कृतिक धरोहर की राष्ट्रीय सूची",
    author: "Sangeet Natak Akademi / MoC",
    shelf: "govt",
    color: "#6a3a16",
    height: 172,
    description: "India’s ICH inventory — oral traditions, performing arts, social practices and traditional craftsmanship.",
    source: "Ministry of Culture",
    sourceUrl: "https://www.indiaculture.gov.in/",
  },
  {
    id: "govt-ignca",
    title: "Indira Gandhi National Centre for the Arts",
    titleHi: "इंदिरा गांधी राष्ट्रीय कला केंद्र",
    author: "IGNCA",
    shelf: "govt",
    color: "#2c2a4a",
    height: 154,
    description: "Research archives for Indian arts, manuscripts and cultural mapping.",
    source: "IGNCA",
    sourceUrl: "https://ignca.gov.in/",
  },
  {
    id: "govt-bhashini",
    title: "Bhashini — Indic language stack",
    titleHi: "भाषिणी",
    author: "MeitY / Digital India",
    shelf: "govt",
    color: "#1f4d3a",
    height: 150,
    description: "Speech, text and translation for Indian languages. The path we use so the original voice stays searchable.",
    source: "Bhashini",
    sourceUrl: "https://bhashini.gov.in/",
  },
];

function cover(id?: number) {
  return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : undefined;
}

function asText(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function openLibraryHeritage(): Promise<FeedItem[]> {
  const q = "subject:(\"india folklore\" OR \"indian heritage\" OR \"unesco india\" OR \"folk tales india\")";
  const url = `https://openlibrary.org/search.json?${new URLSearchParams({
    q,
    limit: "16",
    fields: "key,title,author_name,first_publish_year,cover_i,subject",
  })}`;
  try {
    const data = await cached(`ol:${q}`, 40 * 60_000, () => getJson<OLSearch>(url, undefined, 8000));
    return (data.docs || [])
      .filter((d) => d.title)
      .map((d) => {
        const key = (d.key || d.title || "").replace("/works/", "");
        return {
          id: packId("ol", key),
          title: d.title!,
          description: `${(d.author_name || ["Unknown"]).slice(0, 2).join(", ")} — folk and heritage literature held in Open Library.`,
          image: cover(d.cover_i),
          location: "India",
          category: "stories" as FeedCategory,
          source: "Open Library",
          sourceUrl: d.key ? `https://openlibrary.org${d.key}` : "https://openlibrary.org",
          license: "Open Library catalog",
          author: (d.author_name || ["Open Library"])[0],
          date: d.first_publish_year ? String(d.first_publish_year) : undefined,
        };
      });
  } catch {
    return [];
  }
}

export async function archiveTexts(): Promise<FeedItem[]> {
  const sp = new URLSearchParams();
  sp.set("q", `(indian folklore OR unesco india OR village heritage india) AND mediatype:texts`);
  ["identifier", "title", "description", "creator", "year"].forEach((f) => sp.append("fl[]", f));
  sp.set("output", "json");
  sp.set("rows", "12");
  const url = `https://archive.org/advancedsearch.php?${sp.toString()}`;
  try {
    const data = await cached("ia-texts", 40 * 60_000, () => getJson<IASearch>(url, undefined, 8000));
    return (data.response?.docs || [])
      .filter((d) => d.identifier && d.title)
      .map((d) => ({
        id: packId("ia", d.identifier!),
        title: String(d.title),
        description: asText(d.description) || "A public-domain or openly archived text on Indian culture.",
        location: "India",
        category: "history" as FeedCategory,
        source: "Internet Archive",
        sourceUrl: `https://archive.org/details/${d.identifier}`,
        license: "Internet Archive item license",
        author: asText(d.creator) || "Internet Archive",
        date: d.year,
        image: `https://archive.org/services/img/${d.identifier}`,
      }));
  } catch {
    return [];
  }
}

const COLORS = ["#6b2b1f", "#243c2e", "#2b3348", "#7a4b16", "#3e2a1f", "#25445a", "#4a1f2c", "#1f3f4d"];

function toBooks(items: FeedItem[], shelf: ShelfId, offset = 0): ShelfBook[] {
  return items.map((item, i) => ({
    id: item.id,
    title: item.title,
    author: item.author || item.source,
    shelf,
    color: COLORS[(i + offset) % COLORS.length],
    height: 142 + ((i * 13 + offset * 7) % 48),
    image: item.image,
    description: item.description,
    source: item.source,
    sourceUrl: item.sourceUrl,
    place: item.location,
    year: item.date,
  }));
}

export async function libraryCatalog(): Promise<ShelfBook[]> {
  const [ol, ia] = await Promise.all([openLibraryHeritage(), archiveTexts()]);
  return [...GOVT_SHELF, ...toBooks(ol, "library", 2), ...toBooks(ia, "library", 5)];
}

export { GOVT_SHELF };
