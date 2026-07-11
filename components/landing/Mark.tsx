import Link from "next/link";

/**
 * Vergura Capital emblem — a flat, single-colour 2D seal in the spirit of
 * venetian coinage: double ring, compass ticks, a bold V glyph and a diamond
 * set in its notch. Renders in `currentColor` so it can sit red-on-paper or
 * paper-on-maroon.
 */
export function CapitalMark({
  className = "",
  title = "Vergura Capital emblem",
}: {
  className?: string;
  title?: string;
}) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6 - Math.PI / 2;
    const r1 = 54.5;
    const r2 = 58.5;
    return {
      x1: +(64 + r1 * Math.cos(a)).toFixed(2),
      y1: +(64 + r1 * Math.sin(a)).toFixed(2),
      x2: +(64 + r2 * Math.cos(a)).toFixed(2),
      y2: +(64 + r2 * Math.sin(a)).toFixed(2),
    };
  });

  return (
    <svg
      viewBox="0 0 128 128"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
    >
      <title>{title}</title>
      {/* Outer + inner rings */}
      <circle cx="64" cy="64" r="61" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="64" cy="64" r="52" stroke="currentColor" strokeWidth="1" />
      {/* Compass ticks between the rings */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
      {/* Bold V glyph */}
      <path
        d="M36 42 H50 L64 78 L78 42 H92 L71 94 H57 Z"
        fill="currentColor"
      />
      {/* Diamond set in the notch of the V */}
      <path d="M64 45 L70 52 L64 59 L58 52 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Horizontal lockup for the landing nav: emblem beside a serif wordmark with
 * a tracked "CAPITAL" sub-label.
 */
export function CapitalLockup({
  className = "",
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="Vergura Capital — home"
    >
      <CapitalMark className="h-9 w-9 text-venetian transition-colors duration-300 group-hover:text-maroon" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.3rem] tracking-[0.02em] text-inkred">
          Vergura<span className="text-venetian">.</span>
        </span>
        <span className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.38em] text-maroon">
          Capital
        </span>
      </span>
    </Link>
  );
}
