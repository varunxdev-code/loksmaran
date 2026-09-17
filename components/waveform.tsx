"use client";

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-12 items-end gap-1">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-gold"
          style={{
            height: active ? `${8 + ((i * 17) % 28)}px` : "8px",
            animation: active ? `wave 0.9s ${i * 0.05}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`@keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1.4); } }`}</style>
    </div>
  );
}
