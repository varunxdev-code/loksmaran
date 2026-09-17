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

export function feedItemToPost(item: FeedItem): Post {
  const name = item.author || item.source;
  return {
    id: item.id,
    title: item.title,
    body: item.description,
    imageUrl: item.image || "",
    audioUrl: item.audio,
    category: CAT[item.category] || "sthaan",
    communitySlug: slugify(item.place?.name || item.location.split(",")[0] || "india"),
    author: {
      id: `src-${item.source}`,
      name,
      location: item.location,
      bio: item.source,
      initials: initials(name),
    },
    createdAt: item.date && !Number.isNaN(Date.parse(item.date)) ? new Date(item.date).toISOString() : new Date().toISOString(),
    likes: 0,
    fromVoice: Boolean(item.audio),
    comments: [],
    source: item.source,
    sourceUrl: item.sourceUrl,
    license: item.license,
    coordinates: item.coordinates,
  };
}
