"use client";

import { useMemo } from "react";
import { Go } from "@/components/go-link";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { useLok } from "@/lib/store";

export default function DashboardPage() {
  const t = useT();
  const session = useAuth((s) => s.session);
  const posts = useLok((s) => s.posts);
  const moderate = useLok((s) => s.moderate);
  const mine = useMemo(() => posts.filter((p) => p.id.startsWith("p") && !p.sourceUrl), [posts]);
  const pending = mine.filter((p) => p.status === "pending");

  return (
    <div>
      <p className="kicker">{t("dashboard")}</p>
      <h1 className="mt-2 font-display text-3xl font-light sm:text-4xl">{session?.workspace || "Village archive desk"}</h1>
      <p className="mt-2 text-mute">
        {session ? `${session.plan} plan · ${session.role}` : "Sign in to moderate public items. Recording still works."}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="feed-card p-5"><p className="text-xs text-mute">Items</p><p className="font-display text-4xl font-light">{mine.length}</p></div>
        <div className="feed-card p-5"><p className="text-xs text-mute">Pending public</p><p className="font-display text-4xl font-light">{pending.length}</p></div>
        <div className="feed-card p-5"><p className="text-xs text-mute">Voice notes</p><p className="font-display text-4xl font-light">{mine.filter((p) => p.fromVoice).length}</p></div>
      </div>
      <div className="mt-8 space-y-3">
        {mine.slice(0, 20).map((p) => (
          <article key={p.id} className="feed-card flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <Go href={`/post/${encodeURIComponent(p.id)}`} className="font-medium">{p.title}</Go>
              <p className="text-xs text-mute">{p.consent || "public"} · {p.status || "approved"} · {p.communitySlug}</p>
            </div>
            {p.status === "pending" ? (
              <button type="button" className="chip chip-on" onClick={() => moderate(p.id, "approved")}>{t("approved")}</button>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
