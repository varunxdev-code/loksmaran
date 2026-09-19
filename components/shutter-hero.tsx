"use client";

import { useEffect, useRef, useState } from "react";
import { Go } from "@/components/go-link";

const SLIDES = [
  { src: "/places/raghurajpur.jpg", n: "01", title: "Pattachitra lanes", place: "Raghurajpur, Odisha" },
  { src: "/places/khonoma.jpg", n: "02", title: "Green village terraces", place: "Khonoma, Nagaland" },
  { src: "/places/kutch.jpg", n: "03", title: "Bhungas at the Rann", place: "Hodka, Kutch" },
  { src: "/places/kochi.jpg", n: "04", title: "Backwater Mondays", place: "Kumbalangi, Kerala" },
  { src: "/places/holi.jpg", n: "05", title: "Courtyard after colour", place: "Tilonia, Rajasthan" },
  { src: "/places/varanasi.jpg", n: "06", title: "Satra on the river", place: "Kamalabari, Majuli" },
];

export function ShutterHero() {
  const [index, setIndex] = useState(0);
  const [shut, setShut] = useState(false);
  const indexRef = useRef(0);
  const busy = useRef(false);

  function go(next: number) {
    if (busy.current) return;
    busy.current = true;
    setShut(true);
    window.setTimeout(() => {
      const i = (next + SLIDES.length) % SLIDES.length;
      indexRef.current = i;
      setIndex(i);
      setShut(false);
      window.setTimeout(() => {
        busy.current = false;
      }, 520);
    }, 640);
  }

  useEffect(() => {
    const id = window.setInterval(() => go(indexRef.current + 1), 6200);
    return () => window.clearInterval(id);
  }, []);

  const slide = SLIDES[index];
  const peek = SLIDES[(index + 1) % SLIDES.length];

  return (
    <section className="hero-stage">
      <div className="hero-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={slide.src} alt={slide.title} className="hero-photo" />
        <div className="hero-scrim" />
        <div className={`shutter ${shut ? "is-shut" : ""}`} aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <i key={i} style={{ transitionDelay: `${i * 38}ms` }} />
          ))}
        </div>
        <h1 className="hero-word">
          <span>LOK</span>
          <span>SMA</span>
          <span>RAN</span>
        </h1>
      </div>

      <div className="hero-cta">
        <Go href="/feed" className="btn btn-solid min-w-0 lg:min-w-[180px]">
          Open the live feed
        </Go>
        <Go href="/map" className="btn btn-ghost min-w-0 lg:min-w-[180px]">
          Village map
        </Go>
        <Go href="/library" className="btn btn-ghost min-w-0 lg:min-w-[180px]">
          Reading room
        </Go>
      </div>

      <div className="hero-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={peek.src} alt="" />
        <div className="flex items-end justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.18em] text-white/55">{slide.n}/</p>
            <p className="mt-1 text-[14px] font-medium leading-tight tracking-wide sm:text-[15px]">{slide.title.toUpperCase()}</p>
            <p className="mt-1 text-xs text-white/55">{slide.place}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white/80" onClick={() => go(index - 1)} aria-label="Previous village">
              ←
            </button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white/80" onClick={() => go(index + 1)} aria-label="Next village">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
