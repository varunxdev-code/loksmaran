"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Go, goTo } from "@/components/go-link";
import { useAuth } from "@/lib/auth";
import { useLok } from "@/lib/store";

const APP = ["/feed", "/create", "/explore", "/community", "/profile", "/post"];
const AUTH = ["/login", "/signup"];

function isApp(path: string) {
  return APP.some((p) => path === p || path.startsWith(`${p}/`));
}

export function RootChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const session = useAuth((s) => s.session);
  const hydrate = useAuth((s) => s.hydrate);
  const toasts = useLok((s) => s.toasts);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (AUTH.includes(path)) {
    return (
      <>
        {children}
        <Toasts toasts={toasts} />
      </>
    );
  }

  if (isApp(path)) {
    return (
      <>
        <AppShell path={path}>{children}</AppShell>
        <Toasts toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <MarketingShell path={path}>{children}</MarketingShell>
      <Toasts toasts={toasts} />
    </>
  );
}

function Toasts({ toasts }: { toasts: { id: string; text: string }[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto rounded-2xl bg-ink px-4 py-3 text-sm text-[#f6f1e8] shadow-lg">
          {t.text}
        </div>
      ))}
    </div>
  );
}

const MARKET_LINKS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/community", label: "Villages" },
  { href: "/explore", label: "Search" },
  { href: "/pricing", label: "Pricing" },
];

function MarketingShell({ path, children }: { path: string; children: React.ReactNode }) {
  const session = useAuth((s) => s.session);
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-svh bg-night text-[#f6f1e8]">
      <header className="sticky top-0 z-50 bg-night/95 px-4 pt-3 backdrop-blur md:px-6">
        <div className="flex h-[64px] items-center justify-between gap-3 md:h-[72px]">
          <Go href="/" className="shrink-0">
            <Logo size="md" light />
          </Go>
          <nav className="nav-pill hidden md:flex">
            {MARKET_LINKS.map((l) => (
              <Go key={l.href} href={l.href} className={path === l.href ? "is-on" : ""}>
                {l.label}
              </Go>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Go href={session ? "/feed" : "/signup"} className="btn btn-ghost h-11 min-h-11 px-5 text-[11px] tracking-[0.14em] uppercase">
              {session ? "Open feed" : "Start free"}
            </Go>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              ☰
            </button>
          </div>
        </div>
        {open ? (
          <div className="grid gap-1 pb-4 md:hidden">
            {MARKET_LINKS.map((l) => (
              <Go key={l.href} href={l.href} className="rounded-full px-4 py-3 text-sm text-white/80">
                {l.label}
              </Go>
            ))}
          </div>
        ) : null}
      </header>
      <div className="px-3 pt-3 md:px-6 md:pt-4">{children}</div>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div>
          <Logo variant="lockup" size="sm" />
          <p className="mt-4 max-w-xs text-sm text-white/50">
            Real Indian villages. Voice in, story out. People, places, heritage — together.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Product</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Go href="/feed">Live feed</Go>
            <Go href="/create">Share a story</Go>
            <Go href="/pricing">Pricing</Go>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Explore</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Go href="/community">Villages</Go>
            <Go href="/explore">Search</Go>
            <Go href="/login">Sign in</Go>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Legal</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Go href="/privacy">Privacy</Go>
            <Go href="/terms">Terms</Go>
            <span className="text-white/50">Consent &amp; takedown</span>
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-white/30">© {new Date().getFullYear()} Loksmaran · Built in India</p>
    </footer>
  );
}

function AppShell({ path, children }: { path: string; children: React.ReactNode }) {
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  const unseen = useLok((s) => s.unseen);

  return (
    <div className="min-h-svh bg-ivory text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 md:px-4">
          <Go href="/" className="shrink-0">
            <Logo size="sm" />
          </Go>
          <form
            className="hidden flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              goTo(`/explore?q=${encodeURIComponent(String(q || ""))}`);
            }}
          >
            <input name="q" className="field h-11 rounded-full bg-white/80" placeholder="Search a village, craft, festival…" />
          </form>
          <Go href="/create" className="btn btn-ink h-11 min-h-11 px-4 text-sm md:px-6">
            Share a story
          </Go>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-3 py-6 md:grid-cols-[200px_minmax(0,1fr)] md:px-4 md:py-8">
        <aside className="hidden md:block">
          <nav className="sticky top-24 grid gap-1 text-sm">
            {[
              ["/feed", "Live feed"],
              ["/explore", "Explore"],
              ["/community", "Villages"],
              ["/create", "New story"],
              ["/profile", "Profile"],
            ].map(([href, label]) => (
              <Go
                key={href}
                href={href}
                className={`rounded-full px-4 py-2.5 font-medium ${path === href || path.startsWith(`${href}/`) ? "side-on" : "text-mute hover:bg-white"}`}
              >
                {label}
                {href === "/feed" && unseen > 0 ? ` · ${unseen}` : ""}
              </Go>
            ))}
            {session ? (
              <button
                type="button"
                className="mt-6 rounded-full px-4 py-2.5 text-left text-mute hover:text-ink"
                onClick={() => {
                  logout();
                  goTo("/");
                }}
              >
                Log out
              </button>
            ) : (
              <Go href="/login" className="mt-6 rounded-full px-4 py-2.5 text-mute hover:text-ink">
                Log in
              </Go>
            )}
          </nav>
        </aside>
        <div className="min-w-0 pb-24 md:pb-8">{children}</div>
      </div>

      <footer className="hidden border-t border-line px-6 py-8 text-sm text-mute md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-6">
          <Go href="/">Home</Go>
          <Go href="/community">Villages</Go>
          <Go href="/pricing">Pricing</Go>
          <Go href="/privacy">Privacy</Go>
          <Go href="/terms">Terms</Go>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory md:hidden">
        <div className="grid grid-cols-5 py-2 text-[11px]">
          {[
            ["/feed", "Feed"],
            ["/explore", "Search"],
            ["/create", "Post"],
            ["/community", "Villages"],
            ["/profile", "You"],
          ].map(([href, label]) => (
            <Go key={href} href={href} className={`grid place-items-center py-2 ${path.startsWith(href) ? "text-ink" : "text-mute"}`}>
              {label}
            </Go>
          ))}
        </div>
      </nav>
    </div>
  );
}
