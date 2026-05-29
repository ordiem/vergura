import Link from "next/link";

/**
 * Text-only wordmark. Serif "Vergura" with a gold accent period; optional
 * tracked "Investment" sub-label. No emblem.
 */
export function Logo({
  className = "",
  sub = false,
  href = "/",
}: {
  className?: string;
  sub?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex flex-col leading-none ${className}`}
      aria-label="Vergura Investment — home"
    >
      <span
        className="font-serif text-[1.45rem] tracking-[0.02em] text-ivory transition-colors duration-500 group-hover:text-champagne"
        style={{ fontOpticalSizing: "auto" }}
      >
        Vergura<span className="text-gold">.</span>
      </span>
      {sub && (
        <span className="label mt-1.5 text-[0.56rem] tracking-[0.36em] text-silver">
          Investment
        </span>
      )}
    </Link>
  );
}

/**
 * Larger, non-linked centered wordmark for footer / error states.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-serif tracking-[0.03em] text-ivory ${className}`}
      style={{ fontOpticalSizing: "auto" }}
    >
      Vergura<span className="text-gold">.</span>
    </span>
  );
}
