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
  body: string;
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
  people: number;
};
