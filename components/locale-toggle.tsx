"use client";

import { useLocale } from "@/lib/i18n";

export function LocaleToggle({ light = false }: { light?: boolean }) {
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const base = light
    ? "border-white/20 text-[#f6f1e8]"
    : "border-line bg-white text-ink";
  return (
    <div className={`inline-flex overflow-hidden rounded-full border text-[11px] font-semibold tracking-[0.12em] uppercase ${base}`}>
      <button type="button" className={`px-3 py-2 ${locale === "en" ? (light ? "bg-white/15" : "bg-ink text-[#f6f1e8]") : ""}`} onClick={() => setLocale("en")}>
        EN
      </button>
      <button type="button" className={`px-3 py-2 ${locale === "hi" ? (light ? "bg-white/15" : "bg-ink text-[#f6f1e8]") : ""}`} onClick={() => setLocale("hi")}>
        हिं
      </button>
    </div>
  );
}
