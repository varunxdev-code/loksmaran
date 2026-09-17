export function Logo({
  variant = "mark",
  size = "md",
  light = false,
}: {
  variant?: "mark" | "lockup";
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  if (variant === "lockup") {
    const width = size === "lg" ? "w-[220px]" : size === "sm" ? "w-[140px]" : "w-[180px]";
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/logo.png" alt="Loksmaran" className={`${width} h-auto object-contain`} />
    );
  }

  const box = size === "sm" ? "h-11 w-11" : size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const word = size === "sm" ? "text-[15px]" : size === "lg" ? "text-[20px]" : "text-[17px]";

  return (
    <span className="inline-flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark.png" alt="" className={`${box} object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]`} />
      <span className={`${word} font-semibold tracking-[-0.03em] ${light ? "text-[#f6f1e8]" : "text-ink"}`}>
        Loksmaran
      </span>
    </span>
  );
}
