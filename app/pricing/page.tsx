export default function PricingPage() {
  const plans = [
    {
      name: "Village",
      price: "Free",
      note: "Residents & students",
      points: ["Record with consent", "Village + family privacy", "Search the archive", "School missions"],
      cta: "Start free",
      href: "/signup",
    },
    {
      name: "Visitor",
      price: "₹199",
      note: "Once, per village",
      points: ["Public audio and clips", "Craft & festival trails", "Offline pack", "Supports holders"],
      cta: "Get a visitor pass",
      href: "/signup",
      featured: true,
    },
    {
      name: "Institution",
      price: "₹12,000",
      note: "School / board / year",
      points: ["Moderator seats", "Branded place page", "Export", "Board dashboard"],
      cta: "Talk to us",
      href: "/signup",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-1 py-10 sm:px-2 sm:py-16 md:px-4">
      <p className="kicker">Pricing</p>
      <h1 className="mt-4 font-display text-4xl font-light tracking-tight text-[#f6f1e8] sm:text-5xl md:text-6xl">Paid where it should be.</h1>
      <p className="mt-4 max-w-xl text-white/55">
        Recording is free. Visitors and institutions pay. Revenue is meant for holders — not ads on a feed.
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <article key={p.name} className={`rounded-[24px] border p-8 ${p.featured ? "border-gold bg-white/5" : "border-white/10"}`}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">{p.note}</p>
            <h2 className="mt-3 font-display text-3xl font-light text-[#f6f1e8]">{p.name}</h2>
            <p className="mt-2 text-3xl text-gold">{p.price}</p>
            <ul className="mt-6 space-y-2 text-sm text-white/55">
              {p.points.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <a href={p.href} className={`mt-8 w-full ${p.featured ? "btn btn-solid" : "btn btn-ghost"}`}>
              {p.cta}
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}
