"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";
import { useLok } from "@/lib/store";
import type { Post } from "@/lib/types";

export function ArchiveHydrate() {
  const upsertPost = useLok((s) => s.upsertPost);
  const setHydrated = useLok((s) => s.setHydrated);
  const setOffline = useLok((s) => s.setOffline);
  const setMe = useLok((s) => s.setMe);
  const session = useAuth((s) => s.session);
  const locale = useLocale((s) => s.locale);

  useEffect(() => {
    setHydrated();
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, [setHydrated, setOffline]);

  useEffect(() => {
    if (!session) return;
    const parts = session.name.split(" ");
    setMe({
      id: `u-${session.email}`,
      name: session.name,
      location: session.workspace,
      bio: session.plan,
      initials: `${parts[0]?.[0] || "L"}${parts[1]?.[0] || ""}`.toUpperCase(),
    });
  }, [session, setMe]);

  useEffect(() => {
    document.documentElement.lang = locale === "hi" ? "hi" : "en";
  }, [locale]);

  useEffect(() => {
    void fetch("/api/archive")
      .then((r) => r.json())
      .then((d: { posts?: Post[] }) => {
        (d.posts || []).forEach(upsertPost);
      })
      .catch(() => undefined);
  }, [upsertPost]);

  return null;
}
