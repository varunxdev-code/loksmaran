"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-4 py-16 sm:px-8 sm:py-24">
      <p className="kicker text-blood">Error</p>
      <h1 className="mt-3 font-display text-4xl font-light text-ink sm:text-5xl">Something snagged</h1>
      <p className="mt-3 max-w-xl text-sm text-mute">{error?.message || "This screen failed to render."}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-ink" onClick={reset}>Try again</button>
        <a href="/" className="btn btn-ghost !text-ink !border-line">Home</a>
      </div>
    </div>
  );
}
