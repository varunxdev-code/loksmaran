export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="feed-card overflow-hidden">
          <div className="aspect-[16/10] animate-pulse bg-[#ece4d6] sm:aspect-[16/9]" />
          <div className="animate-pulse p-5">
            <div className="h-3 w-40 rounded-full bg-[#ece4d6]" />
            <div className="mt-3 h-6 w-3/4 rounded-full bg-[#ece4d6]" />
            <div className="mt-3 h-3 w-full rounded-full bg-[#ece4d6]" />
            <div className="mt-2 h-3 w-2/3 rounded-full bg-[#ece4d6]" />
          </div>
        </article>
      ))}
    </div>
  );
}
