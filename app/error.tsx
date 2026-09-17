"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-8 py-24 text-[#f6f1e8]">
      <p className="kicker">Error</p>
      <h1 className="mt-3 font-display text-5xl font-light">Something snagged</h1>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-solid" onClick={reset}>Try again</button>
        <a href="/" className="btn btn-ghost">Home</a>
      </div>
    </div>
  );
}
