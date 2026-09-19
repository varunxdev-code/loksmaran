import type { Metadata, Viewport } from "next";
import { DM_Sans, Noto_Sans_Devanagari, Oswald } from "next/font/google";
import { ArchiveHydrate } from "@/components/archive-hydrate";
import { RootChrome } from "@/components/root-chrome";
import "./globals.css";

const ui = DM_Sans({ subsets: ["latin"], variable: "--font-ui" });
const display = Oswald({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-display" });
const hindi = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-hi", weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Loksmaran — people, places, heritage",
  description: "A live archive of Indian towns, villages and cities. Record a story. Keep the place.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e0d0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${ui.variable} ${display.variable} ${hindi.variable} antialiased`}>
        <ArchiveHydrate />
        <RootChrome>{children}</RootChrome>
      </body>
    </html>
  );
}
