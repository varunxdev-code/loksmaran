"use client";

import { useMemo, useState } from "react";
import { Go } from "@/components/go-link";
import { useLocale } from "@/lib/i18n";
import type { ShelfBook, ShelfId } from "@/lib/types";

const SHELVES: { id: ShelfId; en: string; hi: string }[] = [
  { id: "unesco", en: "UNESCO", hi: "यूनेस्को" },
  { id: "govt", en: "Government archives", hi: "सरकारी अभिलेख" },
  { id: "library", en: "Folk & open library", hi: "लोक पुस्तकालय" },
  { id: "voices", en: "Living voices", hi: "जीवित आवाज़ें" },
  { id: "festivals", en: "Festivals", hi: "त्योहार" },
  { id: "crafts", en: "Crafts", hi: "शिल्प" },
];

export function BookShelf({ books }: { books: ShelfBook[] }) {
  const locale = useLocale((s) => s.locale);
  const [open, setOpen] = useState<ShelfBook | null>(null);
  const grouped = useMemo(() => {
    const map = new Map<ShelfId, ShelfBook[]>();
    for (const shelf of SHELVES) map.set(shelf.id, []);
    for (const book of books) {
      const list = map.get(book.shelf) || map.get("library")!;
      list.push(book);
    }
    return SHELVES.map((s) => ({ ...s, books: map.get(s.id) || [] })).filter((s) => s.books.length);
  }, [books]);

  return (
    <div className="library-room">
      {grouped.map((shelf) => (
        <section key={shelf.id} className="shelf-bay">
          <header className="shelf-label">
            <span>{locale === "hi" ? shelf.hi : shelf.en}</span>
            <em>{shelf.books.length}</em>
          </header>
          <div className="shelf-wood">
            <div className="shelf-row">
              {shelf.books.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  className="spine"
                  style={{ background: book.color, height: book.height }}
                  onClick={() => setOpen(book)}
                  title={book.title}
                >
                  <span className="spine-title">{locale === "hi" && book.titleHi ? book.titleHi : book.title}</span>
                  <span className="spine-author">{book.author}</span>
                </button>
              ))}
            </div>
            <div className="shelf-plank" />
          </div>
        </section>
      ))}

      {open ? (
        <div className="book-reader" onClick={() => setOpen(null)} role="presentation">
          <article className="book-open" onClick={(e) => e.stopPropagation()}>
            {open.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.image} alt="" />
            ) : (
              <div className="book-open-cover" style={{ background: open.color }} />
            )}
            <div>
              <p className="kicker">{open.source}</p>
              <h2>{locale === "hi" && open.titleHi ? open.titleHi : open.title}</h2>
              <p className="text-sm text-mute mt-1">{open.author}{open.year ? ` · ${open.year}` : ""}{open.place ? ` · ${open.place}` : ""}</p>
              <p className="mt-4 leading-relaxed text-[15px]">
                {locale === "hi" && open.descriptionHi ? open.descriptionHi : open.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {open.sourceUrl ? (
                  open.sourceUrl.startsWith("/") ? (
                    <Go href={open.sourceUrl} className="btn btn-ink h-11 min-h-11 px-5 text-sm">Open in archive</Go>
                  ) : (
                    <a href={open.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-ink h-11 min-h-11 px-5 text-sm">Open source</a>
                  )
                ) : null}
                <button type="button" className="btn btn-ghost !text-ink !border-line h-11 min-h-11 px-5 text-sm" onClick={() => setOpen(null)}>
                  Close
                </button>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
