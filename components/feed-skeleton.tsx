export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="card flex overflow-hidden">
          <div className="w-12 shrink-0 bg-[#f3eee6]" />
          <div className="flex-1 animate-pulse p-4">
            <div className="h-3 w-40 rounded-full bg-[#ece4d6]" />
            <div className="mt-3 h-5 w-3/4 rounded-full bg-[#ece4d6]" />
            <div className="mt-3 h-3 w-full rounded-full bg-[#ece4d6]" />
            <div className="mt-2 h-3 w-2/3 rounded-full bg-[#ece4d6]" />
            <div className="mt-4 aspect-[16/9] w-full rounded-2xl bg-[#ece4d6]" />
          </div>
        </article>
      ))}
    </div>
  );
}
