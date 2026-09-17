export function packId(source: string, raw: string) {
  return `${source}--${encodeURIComponent(raw)}`;
}

export function unpackId(id: string): { source: string; raw: string } {
  const i = id.indexOf("--");
  if (i < 0) return { source: "wd", raw: decodeURIComponent(id) };
  return { source: id.slice(0, i), raw: decodeURIComponent(id.slice(i + 2)) };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48) || "place";
}

export function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "L") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function parseWkt(value?: string) {
  if (!value) return undefined;
  const m = /Point\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i.exec(value);
  if (!m) return undefined;
  return { lng: Number(m[1]), lat: Number(m[2]) };
}

export function commonsFileUrl(file: string, width = 1400) {
  const name = file.replace(/^https?:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//i, "");
  const clean = decodeURIComponent(name).replace(/^File:/i, "");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}?width=${width}`;
}
