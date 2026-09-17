import type { FeedCategory, FeedItem } from "../content";
import { cached, getJson } from "./http";
import { packId } from "./ids";

type Commons = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        imageinfo?: {
          url?: string;
          thumburl?: string;
          descriptionurl?: string;
          extmetadata?: Record<string, { value?: string }>;
        }[];
      }
    >;
  };
};

function stripHtml(value?: string) {
  return (value || "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();
}

export async function searchCommons(query: string, category: FeedCategory, state?: string): Promise<FeedItem[]> {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: "1400",
  })}`;
  try {
    const data = await cached(`cm:${query}`, 20 * 60_000, () => getJson<Commons>(url, undefined, 8000));
    return Object.values(data.query?.pages ?? [])
      .map((page) => {
        const info = page.imageinfo?.[0];
        const image = info?.thumburl || info?.url;
        if (!image) return null;
        const meta = info.extmetadata || {};
        const title = stripHtml(meta.ObjectName?.value) || (page.title || "").replace(/^File:/i, "").replace(/\.[a-z0-9]+$/i, "");
        const artist = stripHtml(meta.Artist?.value) || "Wikimedia Commons";
        const license = stripHtml(meta.LicenseShortName?.value) || "CC BY-SA";
        return {
          id: packId("commons", page.title || image),
          title,
          description: stripHtml(meta.ImageDescription?.value) || `${title} — cultural photograph from Wikimedia Commons.`,
          image,
          location: state || "India",
          state,
          category,
          source: "Wikimedia Commons",
          sourceUrl: info.descriptionurl,
          license,
          author: artist,
          date: stripHtml(meta.DateTimeOriginal?.value || meta.DateTime?.value),
        } satisfies FeedItem;
      })
      .filter((x): x is FeedItem => Boolean(x));
  } catch {
    return [];
  }
}

export async function commonsImageFor(title: string): Promise<string | undefined> {
  const hits = await searchCommons(title, "places");
  return hits[0]?.image;
}
