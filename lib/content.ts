export type FeedCategory =
  | "all"
  | "nearby"
  | "villages"
  | "cities"
  | "heritage"
  | "festivals"
  | "food"
  | "crafts"
  | "music"
  | "stories"
  | "history"
  | "traditions"
  | "places";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type PlaceRef = {
  name: string;
  state?: string;
  district?: string;
  kind?: "Village" | "Town" | "City" | "Site";
  coordinates?: Coordinates;
  wikidataId?: string;
  osmId?: string;
};

export type FeedItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
  audio?: string;
  location: string;
  state?: string;
  district?: string;
  category: FeedCategory;
  source: string;
  sourceUrl?: string;
  license?: string;
  author?: string;
  date?: string;
  coordinates?: Coordinates;
  place?: PlaceRef;
};

export const FEED_FILTERS: { id: FeedCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "nearby", label: "Nearby" },
  { id: "villages", label: "Villages" },
  { id: "cities", label: "Cities" },
  { id: "heritage", label: "Heritage" },
  { id: "festivals", label: "Festivals" },
  { id: "food", label: "Food" },
  { id: "crafts", label: "Art & Crafts" },
  { id: "music", label: "Folk Music" },
  { id: "stories", label: "Stories" },
  { id: "history", label: "History" },
  { id: "traditions", label: "Traditions" },
  { id: "places", label: "Places" },
];
