import { ShutterHero } from "@/components/shutter-hero";
import { Go } from "@/components/go-link";
import { COMMUNITIES } from "@/lib/taxonomy";

export default function HomePage() {
  return (
    <div>
      <ShutterHero />

      <section id="product" className="mx-auto max-w-6xl px-1 py-12 sm:px-2 sm:py-16 md:px-4 md:py-24">
        <p className="kicker">The archive</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-light leading-[0.95] tracking-tight text-[#f6f1e8] sm:text-5xl md:text-7xl">
          Real villages,<br />kept in public.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
          Loksmaran is a live feed of actual Indian villages — Raghurajpur, Hodka, Khonoma, Tilonia — told by the people who still live them. Voice in. Story out.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
          <Go href="/signup" className="btn btn-solid w-full sm:w-auto sm:min-w-[220px]">Create a free workspace</Go>
          <Go href="/community" className="btn btn-ghost w-full sm:w-auto sm:min-w-[220px]">Browse villages</Go>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-1 pb-12 sm:px-2 sm:pb-16 md:px-4 md:pb-24">
        <div className="grid gap-px overflow-hidden rounded-[22px] bg-white/10 sm:rounded-[28px] md:grid-cols-3">
          {[
            ["01", "Speak, don’t type", "Hold the mic. We keep the audio and turn it into a draft you can edit."],
            ["02", "Pin it to a village", "Every story sits in a real village — so the feed is geography, not noise."],
            ["03", "It hits the live feed", "Play the voice note. Like, comment, save. Neighbours hear it."],
          ].map(([n, t, d]) => (
            <div key={n} className="bg-night px-5 py-8 sm:px-8 sm:py-10">
              <p className="text-sm tracking-[0.2em] text-gold">{n}</p>
              <h3 className="mt-4 font-display text-2xl font-light text-[#f6f1e8] sm:text-3xl">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="communities" className="mx-auto max-w-6xl px-1 pb-8 sm:px-2 md:px-4">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <p className="kicker">Villages</p>
            <h2 className="mt-3 font-display text-3xl font-light text-[#f6f1e8] sm:text-4xl md:text-5xl">From lane to satra</h2>
          </div>
          <Go href="/community" className="hidden text-sm text-white/60 md:inline">See all villages</Go>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {COMMUNITIES.slice(0, 6).map((c) => (
            <Go key={c.slug} href={`/community/${c.slug}`} className="group relative min-h-[220px] overflow-hidden rounded-[20px] sm:min-h-[260px] sm:rounded-[24px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative flex h-full min-h-[220px] flex-col justify-end p-5 text-[#f6f1e8] sm:min-h-[260px] sm:p-6">
                <p className="text-[11px] tracking-[0.16em] uppercase text-white/70">{c.region} · {c.state}</p>
                <h3 className="mt-1 font-display text-3xl font-light sm:text-4xl">{c.name}</h3>
                <p className="mt-2 text-sm text-white/75">{c.blurb}</p>
              </div>
            </Go>
          ))}
        </div>
      </section>
    </div>
  );
}
