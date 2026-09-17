import type { CategoryId, Community, Region } from "./types";

export const CATEGORIES: { id: CategoryId; label: string; hint: string }[] = [
  { id: "lokkatha", label: "Folklore", hint: "Stories people still tell" },
  { id: "tyohar", label: "Festivals", hint: "How a day is actually kept" },
  { id: "khanpan", label: "Food", hint: "Kitchens, not restaurants" },
  { id: "hastashilp", label: "Craft", hint: "Hands, tools, time" },
  { id: "lokkala", label: "Folk art", hint: "Song, paint, performance" },
  { id: "parampara", label: "Custom", hint: "House rules, not brochures" },
  { id: "sthaan", label: "Places", hint: "Lanes and landmarks" },
  { id: "kahani", label: "Local stories", hint: "Neighbourhood memory" },
];

export const REGIONS: Region[] = ["North", "South", "East", "West", "Central", "Northeast"];

export const COMMUNITIES: Community[] = [
  { slug: "raghurajpur", name: "Raghurajpur", nameHi: "रघुराजपुर", state: "Odisha", kind: "Village", region: "East", image: "/places/raghurajpur.jpg", blurb: "Heritage crafts village. Pattachitra lanes. Eyes painted last.", people: 22 },
  { slug: "pipili", name: "Pipili", nameHi: "पिपिली", state: "Odisha", kind: "Village", region: "East", image: "/places/raghurajpur.jpg", blurb: "Appliqué umbrellas and Chandua work still made in the house.", people: 17 },
  { slug: "hodka", name: "Hodka", nameHi: "होड़का", state: "Gujarat", kind: "Village", region: "West", image: "/places/kutch.jpg", blurb: "Bhungas on the edge of the Rann. Mirror-work counted at night.", people: 24 },
  { slug: "tilonia", name: "Tilonia", nameHi: "टिलोनिया", state: "Rajasthan", kind: "Village", region: "North", image: "/places/holi.jpg", blurb: "Barefoot College village. Solar, radio, and courtyard Holi.", people: 28 },
  { slug: "chandelao", name: "Chandelao", nameHi: "चंदेलाव", state: "Rajasthan", kind: "Village", region: "North", image: "/places/udaipur.jpg", blurb: "A Jodhpur-side village. The fort is a neighbour, not the story.", people: 15 },
  { slug: "pragpur", name: "Pragpur", nameHi: "प्रागपुर", state: "Himachal Pradesh", kind: "Village", region: "North", image: "/places/jaipur.jpg", blurb: "India’s first heritage village. Slate roofs, Kangra talk.", people: 19 },
  { slug: "pochampally", name: "Pochampally", nameHi: "पोचमपल्ली", state: "Telangana", kind: "Village", region: "South", image: "/places/pochampally.jpg", blurb: "Ikat counted on the loom, not in a shop window.", people: 21 },
  { slug: "kumbalangi", name: "Kumbalangi", nameHi: "कुम्बलंगी", state: "Kerala", kind: "Village", region: "South", image: "/places/kochi.jpg", blurb: "Backwater model village. Chinese nets, banana leaf Mondays.", people: 26 },
  { slug: "khonoma", name: "Khonoma", nameHi: "खोनोमा", state: "Nagaland", kind: "Village", region: "Northeast", image: "/places/khonoma.jpg", blurb: "India’s first green village. Terraces off the highway.", people: 16 },
  { slug: "mawlynnong", name: "Mawlynnong", nameHi: "मवलिन्नोंग", state: "Meghalaya", kind: "Village", region: "Northeast", image: "/places/khonoma.jpg", blurb: "Khasi village known for keeping the lane cleaner than the town.", people: 14 },
  { slug: "hong", name: "Hong", nameHi: "होंग", state: "Arunachal Pradesh", kind: "Village", region: "Northeast", image: "/places/bhopal.jpg", blurb: "Apatani village in Ziro. Paddy-fish fields, bamboo houses.", people: 18 },
  { slug: "kamalabari", name: "Kamalabari", nameHi: "कमलाबाड़ी", state: "Assam", kind: "Village", region: "Northeast", image: "/places/varanasi.jpg", blurb: "Majuli satra village. Masks, namghar, the river moving the bank.", people: 20 },
];

export const STATES = [...new Set(COMMUNITIES.map((c) => c.state))].sort();

export function communityBySlug(slug: string) {
  return COMMUNITIES.find((item) => item.slug === slug);
}

export function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((item) => item.id === id)?.label ?? id;
}
