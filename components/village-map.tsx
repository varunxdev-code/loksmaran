"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Go } from "@/components/go-link";
import { displayTitle, useLocale as useLang } from "@/lib/i18n";
import { useLok } from "@/lib/store";
import { communityBySlug } from "@/lib/taxonomy";
import "leaflet/dist/leaflet.css";

type VillagePin = {
  kind: "village";
  id: string;
  title: string;
  titleHi?: string;
  blurb?: string;
  blurbHi?: string;
  image?: string;
  state: string;
  region?: string;
  lat: number;
  lng: number;
  osmUrl?: string;
  count: number;
};

type HeritagePin = {
  kind: "heritage";
  id: string;
  title: string;
  blurb?: string;
  image?: string;
  state: string;
  lat: number;
  lng: number;
  osmUrl?: string;
};

type StoryPin = {
  id: string;
  title: string;
  titleHi?: string;
  image?: string;
  communitySlug: string;
  category?: string;
  lat: number;
  lng: number;
};

type OsmNear = { id: string; title: string; titleHi?: string; kind: string; lat: number; lng: number; osmUrl: string };

type MapData = { villages?: VillagePin[]; heritage?: HeritagePin[]; stories?: StoryPin[] };
type NearData = { geojson?: { type: string; coordinates?: unknown } | null; nearby?: OsmNear[]; osmUrl?: string };

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function VillageMap() {
  const locale = useLang((s) => s.locale);
  const localPosts = useLok((s) => s.posts);
  const params = useSearchParams();
  const wanted = params.get("v");
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    map: import("leaflet").Map;
    villages: import("leaflet").LayerGroup;
    stories: import("leaflet").LayerGroup;
    heritage: import("leaflet").LayerGroup;
    nearby: import("leaflet").LayerGroup;
    poly: import("leaflet").LayerGroup;
  } | null>(null);
  const [data, setData] = useState<MapData>({});
  const [near, setNear] = useState<NearData>({});
  const [activeId, setActiveId] = useState<string | null>(wanted);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [layers, setLayers] = useState({ stories: true, heritage: true, osm: true });

  const villages = data.villages || [];
  const active = villages.find((v) => v.id === activeId) || null;
  const place = active ? communityBySlug(active.id) : null;

  const stories = useMemo(() => {
    const fromApi = data.stories || [];
    const extra = localPosts
      .filter((p) => p.consent !== "private")
      .filter((p) => !fromApi.some((s) => s.id === p.id))
      .map((p) => ({
        id: p.id,
        title: p.title,
        titleHi: p.titleHi,
        image: p.imageUrl,
        communitySlug: p.communitySlug,
        category: p.category,
        lat: p.coordinates?.lat || 0,
        lng: p.coordinates?.lng || 0,
      }))
      .filter((s) => s.lat && s.lng);
    return [...fromApi, ...extra];
  }, [data.stories, localPosts]);

  const villageStories = useMemo(
    () => (active ? stories.filter((s) => s.communitySlug === active.id).slice(0, 8) : []),
    [active, stories],
  );

  const openStory = storyId ? stories.find((s) => s.id === storyId) : villageStories[0];

  useEffect(() => {
    void fetch("/api/map")
      .then((r) => r.json())
      .then((d: MapData) => {
        setData(d);
        setActiveId(d.villages?.find((v) => v.id === wanted)?.id || null);
      })
      .catch(() => setData({ villages: [] }));
  }, [wanted]);

  useEffect(() => {
    if (!activeId) return;
    let dead = false;
    void fetch(`/api/map?near=${encodeURIComponent(activeId)}`)
      .then((r) => r.json())
      .then((d: NearData) => {
        if (!dead) setNear(d);
      })
      .catch(() => {
        if (!dead) setNear({});
      });
    return () => {
      dead = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (!host.current) return;
    let dead = false;
    void (async () => {
      const L = await import("leaflet");
      if (dead || !host.current) return;
      mapRef.current?.map.remove();
      const map = L.map(host.current, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 4,
        maxZoom: 18,
        worldCopyJump: true,
      }).setView([22.8, 79.2], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const paint = () => host.current?.classList.toggle("is-street", map.getZoom() >= 11);
      map.on("zoomend", paint);
      paint();
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = {
        map,
        villages: L.layerGroup().addTo(map),
        stories: L.layerGroup().addTo(map),
        heritage: L.layerGroup().addTo(map),
        nearby: L.layerGroup().addTo(map),
        poly: L.layerGroup().addTo(map),
      };
      setReady(true);
    })();
    return () => {
      dead = true;
      mapRef.current?.map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ctx = mapRef.current;
    if (!ctx || !villages.length) return;
    void import("leaflet").then((L) => {
      ctx.villages.clearLayers();
      villages.forEach((pin) => {
        const on = pin.id === activeId;
        const icon = L.divIcon({
          className: "ls-pin",
          html: `<span class="ls-pin-dot ${on ? "is-on" : ""}"><i></i><b>${stories.filter((s) => s.communitySlug === pin.id).length || pin.count || ""}</b></span>`,
          iconSize: [32, 40],
          iconAnchor: [16, 36],
        });
        L.marker([pin.lat, pin.lng], { icon, zIndexOffset: on ? 800 : 400 })
          .on("click", () => setActiveId(pin.id))
          .addTo(ctx.villages);
      });
    });
  }, [villages, activeId, ready, stories]);

  useEffect(() => {
    const ctx = mapRef.current;
    if (!ctx) return;
    void import("leaflet").then((L) => {
      ctx.stories.clearLayers();
      if (!layers.stories) return;
      const list = activeId ? stories.filter((s) => s.communitySlug === activeId) : stories;
      list.forEach((story) => {
        if (!story.lat || !story.lng) return;
        const on = story.id === storyId;
        const img = story.image ? `<img src="${esc(story.image)}" alt="">` : "";
        const icon = L.divIcon({
          className: "ls-pin",
          html: `<span class="ls-story ${on ? "is-on" : ""}">${img}</span>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
        L.marker([story.lat, story.lng], { icon, zIndexOffset: 600 })
          .on("click", () => {
            setActiveId(story.communitySlug);
            setStoryId(story.id);
          })
          .addTo(ctx.stories);
      });
    });
  }, [stories, activeId, storyId, layers.stories, ready]);

  useEffect(() => {
    const ctx = mapRef.current;
    if (!ctx) return;
    void import("leaflet").then((L) => {
      ctx.heritage.clearLayers();
      if (!layers.heritage) return;
      (data.heritage || []).forEach((pin) => {
        const icon = L.divIcon({
          className: "ls-pin",
          html: `<span class="ls-pin-site"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([pin.lat, pin.lng], { icon, zIndexOffset: 120 })
          .bindTooltip(pin.title, { direction: "top", className: "ls-tip" })
          .addTo(ctx.heritage);
      });
    });
  }, [data.heritage, layers.heritage, ready]);

  useEffect(() => {
    const ctx = mapRef.current;
    if (!ctx) return;
    if (active) ctx.map.flyTo([active.lat, active.lng], 13, { duration: 0.9 });
    else ctx.map.flyTo([22.8, 79.2], 5, { duration: 0.7 });
  }, [activeId, ready, active]);

  useEffect(() => {
    const ctx = mapRef.current;
    if (!ctx) return;
    void import("leaflet").then((L) => {
      ctx.poly.clearLayers();
      ctx.nearby.clearLayers();
      if (!active) return;
      L.circle([active.lat, active.lng], {
        radius: 1400,
        color: "#d7b27a",
        weight: 1.2,
        dashArray: "6 8",
        fillColor: "#d7b27a",
        fillOpacity: 0.08,
      }).addTo(ctx.poly);
      if (near.geojson) {
        L.geoJSON(near.geojson as never, {
          style: {
            color: "#d7b27a",
            weight: 2,
            fillColor: "#d7b27a",
            fillOpacity: 0.16,
          },
        }).addTo(ctx.poly);
      }
      if (!layers.osm) return;
      (near.nearby || []).forEach((pin) => {
        const icon = L.divIcon({
          className: "ls-pin",
          html: `<span class="ls-osm" title="${esc(pin.title)}"></span>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        L.marker([pin.lat, pin.lng], { icon, zIndexOffset: 200 })
          .bindTooltip(`${pin.title} · OSM`, { direction: "top", className: "ls-tip" })
          .addTo(ctx.nearby);
      });
    });
  }, [active, near, layers.osm, ready]);

  const nameOf = (pin: VillagePin) => (locale === "hi" && pin.titleHi ? pin.titleHi : pin.title);

  return (
    <div className="map-stage">
      <div ref={host} className="map-canvas" />
      <div className="map-vignette" />
      {!ready ? <div className="map-wait">{locale === "hi" ? "गाँव OpenStreetMap पर खींचे जा रहे हैं…" : "Drawing villages on OpenStreetMap…"}</div> : null}

      <div className="map-rail">
        {villages.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`map-chip ${v.id === activeId ? "is-on" : ""}`}
            onClick={() => setActiveId(v.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {v.image ? <img src={v.image} alt="" /> : null}
            <span>
              <b>{nameOf(v)}</b>
              <i>{v.state}</i>
            </span>
          </button>
        ))}
      </div>

      <div className="map-layers">
        {(
          [
            ["stories", locale === "hi" ? "कहानियाँ" : "Stories"],
            ["heritage", "UNESCO"],
            ["osm", "OpenStreetMap"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`map-layer ${layers[key] ? "is-on" : ""}`}
            onClick={() => setLayers((s) => ({ ...s, [key]: !s[key] }))}
          >
            {label}
          </button>
        ))}
      </div>

      {!active ? (
        <aside className="map-panel">
          <div className="map-panel-body">
            <p className="kicker">OpenStreetMap</p>
            <h2>{locale === "hi" ? "एक गाँव चुनें" : "Pick a village"}</h2>
            <p className="map-blurb">
              {locale === "hi"
                ? "पिन दबाएँ। गलियाँ OSM से खुलेंगी, कहानियाँ उसी जगह बैठेंगी।"
                : "Tap a gold pin. Streets come from OSM. Stories sit on the same ground."}
            </p>
          </div>
        </aside>
      ) : (
        <aside className="map-panel">
          {active.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.image} alt="" />
          ) : null}
          <div className="map-panel-body">
            <p className="kicker">{locale === "hi" ? "गाँव · OpenStreetMap" : "Village · OpenStreetMap"}</p>
            <h2>{nameOf(active)}</h2>
            <p className="map-meta">{place ? `${place.kind} · ${place.state}` : active.state}</p>
            <p className="map-blurb">{locale === "hi" && (active.blurbHi || place?.blurbHi) ? active.blurbHi || place?.blurbHi : active.blurb}</p>
            <p className="map-count">
              {villageStories.length} {locale === "hi" ? "कहानियाँ" : "stories"}
              {near.nearby?.length ? ` · ${near.nearby.length} OSM` : ""}
            </p>
            {villageStories.length ? (
              <ul className="map-stories">
                {villageStories.map((p) => (
                  <li key={p.id}>
                    <button type="button" className={p.id === storyId ? "is-on" : ""} onClick={() => setStoryId(p.id)}>
                      {displayTitle(p, locale)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="map-blurb">{locale === "hi" ? "इस गाँव पर अभी आवाज़ जोड़ें।" : "No village voices on this pin yet."}</p>
            )}
            {openStory ? (
              <div className="map-story-card">
                {openStory.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={openStory.image} alt="" />
                ) : null}
                <Go href={`/post/${encodeURIComponent(openStory.id)}`}>{displayTitle(openStory, locale)}</Go>
              </div>
            ) : null}
            <div className="map-actions">
              <Go href={`/community/${active.id}`} className="btn btn-solid h-10 min-h-10 px-4 text-sm">
                {locale === "hi" ? "गाँव खोलें" : "Open village"}
              </Go>
              <a href={near.osmUrl || active.osmUrl} target="_blank" rel="noreferrer" className="btn btn-ghost h-10 min-h-10 px-4 text-sm">
                OpenStreetMap
              </a>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
