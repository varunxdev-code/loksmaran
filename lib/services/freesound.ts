import { cached, getJson } from "./http";

type Freesound = {
  results?: {
    id: number;
    name?: string;
    username?: string;
    license?: string;
    url?: string;
    previews?: { "preview-hq-mp3"?: string; "preview-lq-mp3"?: string };
  }[];
};

export async function freesoundClip(query: string) {
  const key = process.env.FREESOUND_API_KEY;
  if (!key) return undefined;
  const url = `https://freesound.org/apiv2/search/text/?${new URLSearchParams({
    query,
    page_size: "4",
    fields: "id,name,username,license,url,previews",
    filter: "duration:[1 TO 90]",
  })}`;
  try {
    const data = await cached(`fs:${query}`, 40 * 60_000, () =>
      getJson<Freesound>(url, { headers: { Authorization: `Token ${key}` } }, 2400),
    );
    const hit = data.results?.find((r) => r.previews?.["preview-hq-mp3"] || r.previews?.["preview-lq-mp3"]);
    if (!hit) return undefined;
    return {
      url: hit.previews?.["preview-hq-mp3"] || hit.previews?.["preview-lq-mp3"] || "",
      title: hit.name || query,
      author: hit.username,
      license: hit.license || "Freesound license",
      sourceUrl: hit.url,
    };
  } catch {
    return undefined;
  }
}
