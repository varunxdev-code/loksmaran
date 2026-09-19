export type CategoryId =
  | "lokkatha"
  | "tyohar"
  | "khanpan"
  | "hastashilp"
  | "lokkala"
  | "parampara"
  | "sthaan"
  | "kahani";

export type Region = "North" | "South" | "East" | "West" | "Central" | "Northeast";
export type Locale = "en" | "hi";
export type Consent = "public" | "village" | "family" | "private";
export type PlanId = "village" | "visitor" | "institution";
export type PostStatus = "approved" | "pending" | "rejected";
export type ShelfId = "unesco" | "govt" | "library" | "voices" | "festivals" | "crafts";

export type Author = {
  id: string;
  name: string;
  location: string;
  bio: string;
  initials: string;
};

export type Reply = {
  id: string;
  author: Author;
  body: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  author: Author;
  body: string;
  createdAt: string;
  replies: Reply[];
};

export type Post = {
  id: string;
  title: string;
  titleHi?: string;
  body: string;
  bodyHi?: string;
  imageUrl: string;
  audioUrl?: string;
  category: CategoryId;
  communitySlug: string;
  author: Author;
  createdAt: string;
  likes: number;
  fromVoice: boolean;
  comments: Comment[];
  source?: string;
  sourceUrl?: string;
  license?: string;
  coordinates?: { lat: number; lng: number };
  language?: Locale;
  consent?: Consent;
  status?: PostStatus;
  holderName?: string;
  shelf?: ShelfId;
};

export type Community = {
  slug: string;
  name: string;
  nameHi: string;
  state: string;
  kind: "Village" | "Town" | "City";
  region: Region;
  image: string;
  blurb: string;
  blurbHi?: string;
  people: number;
  coordinates?: { lat: number; lng: number };
};

export type ShelfBook = {
  id: string;
  title: string;
  titleHi?: string;
  author: string;
  shelf: ShelfId;
  color: string;
  height: number;
  image?: string;
  description: string;
  descriptionHi?: string;
  source: string;
  sourceUrl?: string;
  place?: string;
  year?: string;
};
