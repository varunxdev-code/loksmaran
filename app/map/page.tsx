"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useT } from "@/lib/i18n";

const VillageMap = dynamic(() => import("@/components/village-map").then((m) => m.VillageMap), {
  ssr: false,
  loading: () => <div className="map-stage grid place-items-center text-sm text-white/50">Loading OpenStreetMap…</div>,
});

export default function MapPage() {
  const t = useT();
  return (
    <div className="map-page">
      <p className="kicker">{t("map")}</p>
      <h1 className="mt-2 font-display text-3xl font-light tracking-tight sm:text-4xl">{t("mapTitle")}</h1>
      <p className="mt-2 max-w-2xl text-mute">{t("mapLead")}</p>
      <div className="mt-5">
        <Suspense fallback={<div className="map-stage grid place-items-center text-sm text-white/50">Loading OpenStreetMap…</div>}>
          <VillageMap />
        </Suspense>
      </div>
    </div>
  );
}
