import { cached, getJson } from "./http";

type Search = {
  response?: {
    docs?: { identifier: string; title?: string; description?: string; creator?: string; licenseurl?: string }[];
  };
};

type Meta = {
  files?: { name: string; format?: string; source?: string }[];
  metadata?: { title?: string | string[]; licenseurl?: string; creator?: string };
};

function firstAudio(files: Meta["files"]) {
  const playable = (files ?? []).filter((f) => /\.(mp3|ogg|oga|wav|flac|m4a)$/i.test(f.name) && f.source !== "original");
  const file = playable[0] || (files ?? []).find((f) => /\.(mp3|ogg|oga|wav)$/i.test(f.name));
  return file?.name;
}

export async function archiveAudio(query: string): Promise<{ url: string; title: string; author?: string; license?: string; sourceUrl: string } | undefined> {
  const url = `https://archive.org/advancedsearch.php?${new URLSearchParams({
    q: `(${query}) AND mediatype:audio`,
    "fl[]": "identifier",
    output: "json",
    rows: "4",
  })}`;
  try {
    const data = await cached(`ia:${query}`, 40 * 60_000, () => getJson<Search>(url, undefined, 2400));
    const id = data.response?.docs?.[0]?.identifier;
    if (!id) return undefined;
    const meta = await getJson<Meta>(`https://archive.org/metadata/${id}`, undefined, 2400);
    const name = firstAudio(meta.files);
    if (!name) return undefined;
    const title = Array.isArray(meta.metadata?.title) ? meta.metadata.title[0] : meta.metadata?.title;
    return {
      url: `https://archive.org/download/${id}/${encodeURIComponent(name)}`,
      title: title || query,
      author: meta.metadata?.creator,
      license: meta.metadata?.licenseurl || "Internet Archive item license",
      sourceUrl: `https://archive.org/details/${id}`,
    };
  } catch {
    return undefined;
  }
}
