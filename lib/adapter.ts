import type { FeedCategory, FeedItem } from "./content";
import type { CategoryId, Post } from "./types";
import { initials, slugify } from "./services/ids";

const CAT: Record<FeedCategory, CategoryId> = {
  all: "sthaan",
  nearby: "sthaan",
  villages: "sthaan",
  cities: "sthaan",
  heritage: "sthaan",
  festivals: "tyohar",
  food: "khanpan",
  crafts: "hastashilp",
  music: "lokkala",
  stories: "kahani",
  history: "lokkatha",
  traditions: "parampara",
  places: "sthaan",
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function feedItemToPost(item: FeedItem): Post | null {
  try {
    const title = text(item?.title);
    if (!title) return null;
    const location = text(item.location) || text(item.state) || "India";
    const source = text(item.source, "Archive");
    const name = text(item.author, source);
    const placeName = text(item.place?.name) || location.split(",")[0] || "india";
    const created =
      item.date && !Number.isNaN(Date.parse(item.date))
        ? new Date(item.date).toISOString()
        : new Date().toISOString();
    return {
      id: text(item.id, `item-${title.slice(0, 24)}`),
      title,
      body: text(item.description, title),
      imageUrl: text(item.image),
      audioUrl: text(item.audio) || undefined,
      category: CAT[item.category] || "sthaan",
      communitySlug: slugify(placeName),
      author: {
        id: `src-${source}`,
        name,
        location,
        bio: source,
        initials: initials(name),
      },
      createdAt: created,
      likes: 0,
      fromVoice: Boolean(item.audio),
      comments: [],
      source,
      sourceUrl: text(item.sourceUrl) || undefined,
      license: text(item.license) || undefined,
      coordinates: item.coordinates,
    };
  } catch {
    return null;
  }
}
