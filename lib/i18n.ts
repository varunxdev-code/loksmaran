"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "./types";

const DICT = {
  liveFeed: { en: "Live feed", hi: "लाइव फ़ीड" },
  library: { en: "Library", hi: "पुस्तकालय" },
  map: { en: "Map", hi: "नक्शा" },
  explore: { en: "Explore", hi: "खोज" },
  villages: { en: "Villages", hi: "गाँव" },
  newStory: { en: "New story", hi: "नई कहानी" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल" },
  dashboard: { en: "Archive desk", hi: "अभिलेखागार" },
  share: { en: "Share a story", hi: "कहानी लिखें" },
  searchPh: { en: "Search a village, craft, festival…", hi: "गाँव, शिल्प, त्योहार खोजें…" },
  login: { en: "Log in", hi: "लॉग इन" },
  logout: { en: "Log out", hi: "लॉग आउट" },
  feed: { en: "Feed", hi: "फ़ीड" },
  search: { en: "Search", hi: "खोज" },
  post: { en: "Post", hi: "पोस्ट" },
  you: { en: "You", hi: "आप" },
  home: { en: "Home", hi: "होम" },
  pricing: { en: "Pricing", hi: "कीमत" },
  start: { en: "Start", hi: "शुरू करें" },
  storiesFromMap: { en: "Stories from the map", hi: "नक्शे की कहानियाँ" },
  liveArchive: { en: "Live archive", hi: "जीवंत अभिलेख" },
  feedLead: {
    en: "Real places, festivals, crafts and kitchens — public archives, then yours when you share.",
    hi: "असली जगहें, त्योहार, शिल्प और रसोई — सार्वजनिक अभिलेख, फिर आपकी आवाज़।",
  },
  tellStory: { en: "Tell a village story", hi: "गाँव की कहानी कहें" },
  tellLead: {
    en: "Record your voice. Pin it to a real place. Choose who may hear it.",
    hi: "आवाज़ रिकॉर्ड करें। जगह से जोड़ें। तय करें कौन सुने।",
  },
  title: { en: "Title", hi: "शीर्षक" },
  story: { en: "Story", hi: "कहानी" },
  village: { en: "Village", hi: "गाँव" },
  category: { en: "Category", hi: "श्रेणी" },
  consent: { en: "Who may hear this", hi: "यह कौन सुन सकता है" },
  public: { en: "Public", hi: "सार्वजनिक" },
  villageOnly: { en: "Village", hi: "गाँव" },
  family: { en: "Family", hi: "परिवार" },
  private: { en: "Private", hi: "निजी" },
  speakHi: { en: "Speak Hindi", hi: "हिंदी बोलें" },
  speakEn: { en: "Speak English", hi: "अंग्रेज़ी बोलें" },
  publish: { en: "Publish to the archive", hi: "अभिलेख में प्रकाशित करें" },
  bookshelf: { en: "The reading room", hi: "वाचनालय" },
  bookshelfLead: {
    en: "UNESCO, government cultural missions, and folk libraries — one shelf at a time.",
    hi: "यूनेस्को, सरकारी सांस्कृतिक मिशन और लोक पुस्तकालय — एक शेल्फ़ पर।",
  },
  mapTitle: { en: "Village map", hi: "गाँव का नक्शा" },
  mapLead: {
    en: "OpenStreetMap lanes, village pins, and stories rendered place by place.",
    hi: "OpenStreetMap की गलियाँ, गाँव के पिन, और जगह-जगह कहानियाँ।",
  },
  unesco: { en: "UNESCO", hi: "यूनेस्को" },
  govt: { en: "Govt. archives", hi: "सरकारी अभिलेख" },
  books: { en: "Folk library", hi: "लोक पुस्तकालय" },
  voices: { en: "Living voices", hi: "जीवित आवाज़ें" },
  festivals: { en: "Festivals", hi: "त्योहार" },
  crafts: { en: "Crafts", hi: "शिल्प" },
  holder: { en: "Knowledge holder", hi: "ज्ञान धारक" },
  approved: { en: "On the shelf", hi: "शेल्फ़ पर" },
  pending: { en: "Waiting for a moderator", hi: "संयोजक की प्रतीक्षा" },
} as const;

type Key = keyof typeof DICT;

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "loksmaran-locale" },
  ),
);

export function t(key: Key, locale?: Locale) {
  const lang = locale ?? useLocale.getState().locale;
  return DICT[key][lang] || DICT[key].en;
}

export function useT() {
  const locale = useLocale((s) => s.locale);
  return (key: Key) => DICT[key][locale];
}

export function displayTitle(post: { title: string; titleHi?: string }, locale: Locale) {
  return locale === "hi" && post.titleHi ? post.titleHi : post.title;
}

export function displayBody(post: { body: string; bodyHi?: string }, locale: Locale) {
  return locale === "hi" && post.bodyHi ? post.bodyHi : post.body;
}
