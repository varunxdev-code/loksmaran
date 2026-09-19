import type { CategoryId, Community, Region } from "./types";

export const CATEGORIES: { id: CategoryId; label: string; labelHi: string; hint: string }[] = [
  { id: "lokkatha", label: "Folklore", labelHi: "लोककथा", hint: "Stories people still tell" },
  { id: "tyohar", label: "Festivals", labelHi: "त्योहार", hint: "How a day is actually kept" },
  { id: "khanpan", label: "Food", labelHi: "खानपान", hint: "Kitchens, not restaurants" },
  { id: "hastashilp", label: "Craft", labelHi: "हस्तशिल्प", hint: "Hands, tools, time" },
  { id: "lokkala", label: "Folk art", labelHi: "लोककला", hint: "Song, paint, performance" },
  { id: "parampara", label: "Custom", labelHi: "परंपरा", hint: "House rules, not brochures" },
  { id: "sthaan", label: "Places", labelHi: "स्थान", hint: "Lanes and landmarks" },
  { id: "kahani", label: "Local stories", labelHi: "कहानी", hint: "Neighbourhood memory" },
];

export const REGIONS: Region[] = ["North", "South", "East", "West", "Central", "Northeast"];

export const COMMUNITIES: Community[] = [
  { slug: "raghurajpur", name: "Raghurajpur", nameHi: "रघुराजपुर", state: "Odisha", kind: "Village", region: "East", image: "/places/raghurajpur.jpg", blurb: "Heritage crafts village. Pattachitra lanes. Eyes painted last.", blurbHi: "पट्टचित्र की गलियाँ। आँखें सबसे अंत में लगती हैं।", people: 22, coordinates: { lat: 19.883, lng: 85.832 } },
  { slug: "pipili", name: "Pipili", nameHi: "पिपिली", state: "Odisha", kind: "Village", region: "East", image: "/places/raghurajpur.jpg", blurb: "Appliqué umbrellas and Chandua work still made in the house.", blurbHi: "घर में बनते चंदुआ और छतरियाँ।", people: 17, coordinates: { lat: 20.124, lng: 85.831 } },
  { slug: "hodka", name: "Hodka", nameHi: "होड़का", state: "Gujarat", kind: "Village", region: "West", image: "/places/kutch.jpg", blurb: "Bhungas on the edge of the Rann. Mirror-work counted at night.", blurbHi: "रण के किनारे भुंगा। रात में शीशे गिने जाते हैं।", people: 24, coordinates: { lat: 23.713, lng: 69.752 } },
  { slug: "tilonia", name: "Tilonia", nameHi: "टिलोनिया", state: "Rajasthan", kind: "Village", region: "North", image: "/places/holi.jpg", blurb: "Barefoot College village. Solar, radio, and courtyard Holi.", blurbHi: "बेरफुट कॉलेज का गाँव। आँगन की होली।", people: 28, coordinates: { lat: 26.904, lng: 75.081 } },
  { slug: "chandelao", name: "Chandelao", nameHi: "चंदेलाव", state: "Rajasthan", kind: "Village", region: "North", image: "/places/udaipur.jpg", blurb: "A Jodhpur-side village. The fort is a neighbour, not the story.", blurbHi: "जोधपुर के पास। किला पड़ोसी है, कहानी नहीं।", people: 15, coordinates: { lat: 26.292, lng: 73.134 } },
  { slug: "pragpur", name: "Pragpur", nameHi: "प्रागपुर", state: "Himachal Pradesh", kind: "Village", region: "North", image: "/places/jaipur.jpg", blurb: "India’s first heritage village. Slate roofs, Kangra talk.", blurbHi: "भारत का पहला हेरिटेज गाँव। स्लेट की छतें।", people: 19, coordinates: { lat: 31.703, lng: 76.221 } },
  { slug: "pochampally", name: "Pochampally", nameHi: "पोचमपल्ली", state: "Telangana", kind: "Village", region: "South", image: "/places/pochampally.jpg", blurb: "Ikat counted on the loom, not in a shop window.", blurbHi: "इकत करघे पर गिनी जाती है, दुकान पर नहीं।", people: 21, coordinates: { lat: 17.381, lng: 78.647 } },
  { slug: "kumbalangi", name: "Kumbalangi", nameHi: "कुम्बलंगी", state: "Kerala", kind: "Village", region: "South", image: "/places/kochi.jpg", blurb: "Backwater model village. Chinese nets, banana leaf Mondays.", blurbHi: "बैकवाटर मॉडल गाँव। केले के पत्ते पर सोमवार।", people: 26, coordinates: { lat: 9.873, lng: 76.287 } },
  { slug: "khonoma", name: "Khonoma", nameHi: "खोनोमा", state: "Nagaland", kind: "Village", region: "Northeast", image: "/places/khonoma.jpg", blurb: "India’s first green village. Terraces off the highway.", blurbHi: "भारत का पहला ग्रीन गाँव। राजमार्ग से दूर सीढ़ियाँ।", people: 16, coordinates: { lat: 25.645, lng: 94.021 } },
  { slug: "mawlynnong", name: "Mawlynnong", nameHi: "मवलिन्नोंग", state: "Meghalaya", kind: "Village", region: "Northeast", image: "/places/khonoma.jpg", blurb: "Khasi village known for keeping the lane cleaner than the town.", blurbHi: "खासी गाँव। गली शहर से साफ़।", people: 14, coordinates: { lat: 25.202, lng: 91.917 } },
  { slug: "hong", name: "Hong", nameHi: "होंग", state: "Arunachal Pradesh", kind: "Village", region: "Northeast", image: "/places/bhopal.jpg", blurb: "Apatani village in Ziro. Paddy-fish fields, bamboo houses.", blurbHi: "ज़ीरो का अपतानी गाँव। धान-मछली के खेत।", people: 18, coordinates: { lat: 27.634, lng: 93.831 } },
  { slug: "kamalabari", name: "Kamalabari", nameHi: "कमलाबाड़ी", state: "Assam", kind: "Village", region: "Northeast", image: "/places/varanasi.jpg", blurb: "Majuli satra village. Masks, namghar, the river moving the bank.", blurbHi: "माजुली का सत्रा गाँव। मुखौटे, नामघर, नदी का किनारा।", people: 20, coordinates: { lat: 26.954, lng: 94.174 } },
];

export const STATES = [...new Set(COMMUNITIES.map((c) => c.state))].sort();

export function communityBySlug(slug: string) {
  return COMMUNITIES.find((item) => item.slug === slug);
}

export function categoryLabel(id: CategoryId, locale: "en" | "hi" = "en") {
  const row = CATEGORIES.find((item) => item.id === id);
  if (!row) return id;
  return locale === "hi" ? row.labelHi : row.label;
}
