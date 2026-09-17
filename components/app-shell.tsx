"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  Flame,
  Globe2,
  Home,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { useLok } from "@/lib/store";

const SIDE = [
  { href: "/", label: "होम", icon: Home },
  { href: "/feed", label: "लाइव फ़ीड", icon: Flame },
  { href: "/explore", label: "खोजें", icon: Search },
  { href: "/community", label: "समुदाय", icon: Globe2 },
];

const BOTTOM = [
  { href: "/", label: "होम", icon: Home },
  { href: "/explore", label: "खोजें", icon: Search },
  { href: "/create", label: "पोस्ट", icon: Plus, plus: true },
  { href: "/feed", label: "फ़ीड", icon: Flame },
  { href: "/profile", label: "प्रोफ़ाइल", icon: UserRound },
];

function onPath(path: string, href: string) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const unseen = useLok((s) => s.unseen);
  const toasts = useLok((s) => s.toasts);
  const offline = useLok((s) => s.offline);
  const setOffline = useLok((s) => s.setOffline);
  const setHydrated = useLok((s) => s.setHydrated);
  const [notes, setNotes] = useState(false);

  useEffect(() => {
    setHydrated();
    const go = () => setOffline(!navigator.onLine);
    go();
    window.addEventListener("online", go);
    window.addEventListener("offline", go);
    return () => {
      window.removeEventListener("online", go);
      window.removeEventListener("offline", go);
    };
  }, [setHydrated, setOffline]);

  return (
    <div className="min-h-svh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <a href="/">
            <Logo size="sm" />
          </a>
          <div className="flex items-center gap-2">
            <a href="/create" className="neu neu-primary px-4 py-2 text-sm">
              पोस्ट करें
            </a>
            <button type="button" className="neu p-2" onClick={() => setNotes((v) => !v)} aria-label="सूचनाएँ">
              <Bell size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r border-line px-4 py-8 md:flex">
          <a href="/" className="px-2">
            <Logo size="lg" />
          </a>
          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {SIDE.map((item) => {
              const Icon = item.icon;
              const on = onPath(path, item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] ${
                    on ? "bg-sheet text-ink" : "text-mute hover:bg-sheet/70 hover:text-ink"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                  {item.href === "/feed" && unseen > 0 ? (
                    <span className="ml-auto rounded-full bg-clay px-2 py-0.5 text-[10px] text-white">
                      नया
                    </span>
                  ) : null}
                </a>
              );
            })}
            <a href="/create" className="neu neu-primary mt-4 px-4 py-3 text-center text-sm">
              ＋ कहानी साझा करें
            </a>
          </nav>
          <div className="space-y-1 pb-4">
            <a href="/profile" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-mute hover:text-ink">
              <UserRound size={18} />
              प्रोफ़ाइल
            </a>
            <p className="px-3 text-xs text-mute">सेटिंग्स जल्द</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 md:pb-0">
          <div className="hidden items-center justify-end gap-3 border-b border-line px-8 py-4 md:flex">
            <a href="/create" className="neu neu-primary px-5 py-2.5 text-sm">
              पोस्ट करें
            </a>
            <a href="/profile" className="neu px-5 py-2.5 text-sm">
              प्रोफ़ाइल
            </a>
            <button type="button" className="neu p-2.5" onClick={() => setNotes((v) => !v)} aria-label="सूचनाएँ">
              <Bell size={18} />
            </button>
          </div>
          {offline ? (
            <div className="mx-4 mt-4 rounded-2xl bg-navy px-4 py-3 text-sm text-sheet md:mx-8">
              नेट नहीं है। लिख सकते हो — भेजना बाद में होगा।
            </div>
          ) : null}
          {notes ? (
            <div className="mx-4 mt-4 swiss p-4 text-sm md:mx-8">
              <p className="font-medium">सूचनाएँ</p>
              <p className="mt-2 text-mute">हरीश ने आपकी कहानी पसंद की।</p>
              <p className="mt-1 text-mute">रघुराजपुर में ३ नई कहानियाँ।</p>
            </div>
          ) : null}
          {children}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 px-2 py-2">
          {BOTTOM.map((item) => {
            const Icon = item.icon;
            const on = onPath(path, item.href);
            if (item.plus) {
              return (
                <a key={item.href} href={item.href} className="grid place-items-center">
                  <span className="neu neu-primary grid h-12 w-12 place-items-center">
                    <Plus size={20} />
                  </span>
                </a>
              );
            }
            return (
              <a
                key={item.href}
                href={item.href}
                className={`grid place-items-center gap-1 py-1 text-[10px] ${on ? "text-clay" : "text-mute"}`}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      <div className="pointer-events-none fixed bottom-24 right-4 z-50 space-y-2 md:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto swiss px-4 py-3 text-sm shadow-lg">
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
