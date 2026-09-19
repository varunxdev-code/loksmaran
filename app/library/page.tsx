"use client";

import { useEffect, useState } from "react";
import { BookShelf } from "@/components/book-shelf";
import { useT } from "@/lib/i18n";
import type { ShelfBook } from "@/lib/types";

export default function LibraryPage() {
  const t = useT();
  const [books, setBooks] = useState<ShelfBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/library")
      .then((r) => r.json())
      .then((d: { books?: ShelfBook[] }) => setBooks(d.books || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="kicker">{t("library")}</p>
      <h1 className="mt-2 font-display text-3xl font-light tracking-tight sm:text-5xl">{t("bookshelf")}</h1>
      <p className="mt-3 max-w-2xl text-mute">{t("bookshelfLead")}</p>
      {loading ? <p className="mt-10 text-sm text-mute">Shelving UNESCO, government and folk catalogues…</p> : <BookShelf books={books} />}
    </div>
  );
}
