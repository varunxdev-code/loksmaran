"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { TRENDING } from "@/lib/seed-feed";
import { CATEGORIES } from "@/lib/taxonomy";
import { useLok } from "@/lib/store";
import type { CategoryId } from "@/lib/types";

function ExploreInner() {
  const params = useSearchParams();
  const posts = useLok((s) => s.posts);
  const [q, setQ] = useState(params.get("q") || "");
  const [cat, setCat] = useState<CategoryId | "all">((params.get("cat") as CategoryId) || "all");

  const found = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!query) return true;
      return [p.title, p.body, p.author.name, p.author.location].join(" ").toLowerCase().includes(query);
    });
  }, [posts, q, cat]);

  return (
    <div>
      <h1 className="font-display text-4xl font-light tracking-tight">Search the archive</h1>
      <p className="mt-2 text-mute">Places, crafts, festivals, kitchens.</p>
      <input className="field mt-6 max-w-2xl rounded-full" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try Holi, Varanasi, embroidery…" />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCat("all")} className={`chip ${cat === "all" ? "chip-on" : ""}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCat(c.id)} className={`chip ${cat === c.id ? "chip-on" : ""}`}>
            {c.label}
          </button>
        ))}
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.16em] text-mute">Trending · {TRENDING.join(" · ")}</p>
      <div className="mt-6 space-y-3">
        {found.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {found.length === 0 ? <p className="card p-8 text-mute">Nothing matched. Try another place or category.</p> : null}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<p className="text-mute">Loading search…</p>}>
      <ExploreInner />
    </Suspense>
  );
}
