"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Flame, Globe2, MapPinned, Plus, Search, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { Go, goTo } from "@/components/go-link";
import { LocaleToggle } from "@/components/locale-toggle";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { useLok } from "@/lib/store";

const APP = ["/feed", "/create", "/explore", "/community", "/profile", "/post", "/library", "/map", "/dashboard"];
const AUTH = ["/login", "/signup"];

function isApp(path: string) {
  return APP.some((p) => path === p || path.startsWith(`${p}/`));
}

export function RootChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const hydrate = useAuth((s) => s.hydrate);
  const toasts = useLok((s) => s.toasts);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (AUTH.includes(path)) {
    return (
      <>
        {children}
        <Toasts toasts={toasts} app={false} />
      </>
    );
  }

  if (isApp(path)) {
    return (
      <>
        <AppShell path={path}>{children}</AppShell>
        <Toasts toasts={toasts} app />
      </>
    );
  }

  return (
    <>
      <MarketingShell path={path}>{children}</MarketingShell>
      <Toasts toasts={toasts} app={false} />
    </>
  );
}

function Toasts({ toasts, app }: { toasts: { id: string; text: string }[]; app: boolean }) {
  return (
    <div className={`pointer-events-none fixed inset-x-3 z-50 space-y-2 sm:inset-x-auto sm:right-6 ${app ? "bottom-[5.75rem] lg:bottom-6" : "bottom-6"}`}>
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto rounded-2xl bg-ink px-4 py-3 text-sm text-[#f6f1e8] shadow-lg sm:ml-auto sm:max-w-sm">
          {t.text}
        </div>
      ))}
    </div>
  );
}

function MarketingShell({ path, children }: { path: string; children: React.ReactNode }) {
  const session = useAuth((s) => s.session);
  const t = useT();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: t("home") },
    { href: "/feed", label: t("liveFeed") },
    { href: "/library", label: t("library") },
    { href: "/map", label: t("map") },
    { href: "/community", label: t("villages") },
    { href: "/pricing", label: t("pricing") },
  ];
  return (
    <div className="min-h-svh bg-night text-[#f6f1e8]">
      <header className="sticky top-0 z-50 bg-night/95 px-3 pt-[max(8px,env(safe-area-inset-top))] backdrop-blur sm:px-4 md:px-6">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-[64px] md:h-[72px]">
          <Go href="/" className="min-w-0 shrink-0">
            <Logo size="sm" light />
          </Go>
          <nav className="nav-pill hidden lg:flex">
            {links.map((l) => (
              <Go key={l.href} href={l.href} className={path === l.href ? "is-on" : ""}>
                {l.label}
              </Go>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <LocaleToggle light />
            <Go href={session ? "/feed" : "/signup"} className="btn btn-ghost h-10 min-h-10 px-3 text-[11px] tracking-[0.12em] uppercase sm:h-11 sm:min-h-11 sm:px-5">
              {session ? t("feed") : t("start")}
            </Go>
            <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 text-lg lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? "×" : "☰"}
            </button>
          </div>
        </div>
        {open ? (
          <div className="grid gap-1 pb-4 lg:hidden">
            {links.map((l) => (
              <Go key={l.href} href={l.href} className={`rounded-full px-4 py-3 text-sm ${path === l.href ? "bg-white/10 text-[#f6f1e8]" : "text-white/80"}`}>
                {l.label}
              </Go>
            ))}
          </div>
        ) : null}
      </header>
      <div className="px-3 pt-3 sm:px-4 md:px-6 md:pt-4">{children}</div>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-12 border-t border-white/10 px-4 py-10 sm:px-6 md:mt-16 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
        <div>
          <Logo variant="lockup" size="sm" />
          <p className="mt-4 max-w-xs text-sm text-white/50">
            Real Indian villages. Voice in, story out. People, places, heritage — together.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">Product</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Go href="/feed">{t("liveFeed")}</Go>
            <Go href="/library">{t("library")}</Go>
            <Go href="/map">{t("map")}</Go>
            <Go href="/create">{t("share")}</Go>
            <Go href="/pricing">{t("pricing")}</Go>
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
  const t = useT();
  const side = [
    { href: "/feed", label: t("liveFeed"), icon: Flame },
    { href: "/library", label: t("library"), icon: BookOpen },
    { href: "/map", label: t("map"), icon: MapPinned },
    { href: "/community", label: t("villages"), icon: Globe2 },
    { href: "/create", label: t("newStory"), icon: Plus },
    { href: "/dashboard", label: t("dashboard"), icon: UserRound },
    { href: "/profile", label: t("profile"), icon: UserRound },
  ];
  const bottom = [
    { href: "/feed", label: t("feed"), icon: Flame },
    { href: "/library", label: t("library"), icon: BookOpen },
    { href: "/create", label: t("post"), icon: Plus },
    { href: "/map", label: t("map"), icon: MapPinned },
    { href: "/profile", label: t("you"), icon: UserRound },
  ];

  return (
    <div className="app-canvas min-h-svh text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-[#f4efe6]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:py-3 lg:px-4">
          <Go href="/" className="min-w-0 shrink-0">
            <Logo size="sm" />
          </Go>
          <form
            className="hidden min-w-0 flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              goTo(`/explore?q=${encodeURIComponent(String(q || ""))}`);
            }}
          >
            <input name="q" className="field h-11 rounded-full bg-white shadow-sm" placeholder={t("searchPh")} />
          </form>
          <LocaleToggle />
          <Go href="/explore" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink md:hidden" aria-label="Search">
            <Search size={16} />
          </Go>
          <Go href="/create" className="btn btn-ink h-10 min-h-10 shrink-0 px-3 text-sm sm:px-4 lg:h-11 lg:min-h-11 lg:px-6">
            {t("share")}
          </Go>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-4 lg:py-8">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 grid gap-1 text-sm">
            {side.map((item) => {
              const Icon = item.icon;
              const on = path === item.href || path.startsWith(`${item.href}/`);
              return (
                <Go
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 font-medium ${on ? "side-on" : "text-mute hover:bg-white"}`}
                >
                  <Icon size={16} />
                  {item.label}
                  {item.href === "/feed" && unseen > 0 ? ` · ${unseen}` : ""}
                </Go>
              );
            })}
            {session ? (
              <button
                type="button"
                className="mt-6 rounded-full px-4 py-2.5 text-left text-mute hover:text-ink"
                onClick={() => {
                  logout();
                  goTo("/");
                }}
              >
                {session ? t("logout") : t("login")}
              </button>
            ) : (
              <Go href="/login" className="mt-6 rounded-full px-4 py-2.5 text-mute hover:text-ink">
                {t("login")}
              </Go>
            )}
          </nav>
        </aside>
        <div className="min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-8">{children}</div>
      </div>

      <footer className="hidden border-t border-line px-6 py-8 text-sm text-mute lg:block">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-6">
          <Go href="/">Home</Go>
          <Go href="/community">Villages</Go>
          <Go href="/pricing">Pricing</Go>
          <Go href="/privacy">Privacy</Go>
          <Go href="/terms">Terms</Go>
        </div>
      </footer>

      <nav className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#f4efe6]/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 text-[10px] sm:text-[11px]">
          {bottom.map((item) => {
            const Icon = item.icon;
            const on = path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Go key={item.href} href={item.href} className={`grid place-items-center gap-0.5 py-2 ${on ? "text-ink" : "text-mute"}`}>
                <span className={`grid h-9 w-9 place-items-center rounded-full ${item.href === "/create" ? "bg-ink text-[#f6f1e8] shadow-lg" : on ? "bg-white" : ""}`}>
                  <Icon size={16} />
                </span>
                {item.label}
                {item.href === "/feed" && unseen > 0 ? <span className="sr-only">{unseen} new</span> : null}
              </Go>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
