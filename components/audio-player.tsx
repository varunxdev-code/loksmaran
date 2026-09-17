"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AudioPlayer({ src, label = "Voice note" }: { src: string; label?: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);

  useEffect(() => {
    const el = new Audio(src);
    audio.current = el;
    const time = () => setT(el.currentTime);
    const meta = () => setD(el.duration || 0);
    const ended = () => setOn(false);
    el.addEventListener("timeupdate", time);
    el.addEventListener("loadedmetadata", meta);
    el.addEventListener("ended", ended);
    return () => {
      el.pause();
      el.removeEventListener("timeupdate", time);
      el.removeEventListener("loadedmetadata", meta);
      el.removeEventListener("ended", ended);
    };
  }, [src]);

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (on) {
      el.pause();
      setOn(false);
    } else {
      void el.play();
      setOn(true);
    }
  }

  const pct = d ? Math.min(100, (t / d) * 100) : 0;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-[#f7f3ec] px-3 py-2.5">
      <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-[#f6f1e8]" onClick={toggle} aria-label={on ? "Pause voice" : "Play voice"}>
        {on ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium">{label}</p>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[11px] text-mute">{fmt(t)} / {fmt(d)}</span>
    </div>
  );
}

function fmt(n: number) {
  if (!n || Number.isNaN(n)) return "0:00";
  const m = Math.floor(n / 60);
  const s = Math.floor(n % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
