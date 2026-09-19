import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "**.wikipedia.org" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "archive.org" },
      { protocol: "https", hostname: "**.archive.org" },
      { protocol: "https", hostname: "**.basemaps.cartocdn.com" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
    ],
  },
  async redirects() {
    return [
      { source: "/village", destination: "/feed", permanent: false },
      { source: "/record", destination: "/create", permanent: false },
      { source: "/visit", destination: "/community", permanent: false },
      { source: "/visit/:slug", destination: "/community/:slug", permanent: false },
      { source: "/item/:id", destination: "/post/:id", permanent: false },
      { source: "/moderate", destination: "/dashboard", permanent: false },
      { source: "/community/varanasi", destination: "/community/kamalabari", permanent: false },
      { source: "/community/jaipur", destination: "/community/chandelao", permanent: false },
      { source: "/community/kochi", destination: "/community/kumbalangi", permanent: false },
      { source: "/community/kutch", destination: "/community/hodka", permanent: false },
      { source: "/community/dholpur", destination: "/community/tilonia", permanent: false },
      { source: "/community/bharatpur", destination: "/community/tilonia", permanent: false },
      { source: "/community/bhopal", destination: "/community/hong", permanent: false },
      { source: "/community/madurai", destination: "/community/pochampally", permanent: false },
      { source: "/community/udaipur", destination: "/community/chandelao", permanent: false },
    ];
  },
};

export default nextConfig;
