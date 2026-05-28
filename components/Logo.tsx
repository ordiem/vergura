import Link from "next/link";

export function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Rising valley / capital flow path, read also as a V monogram */}
      <path
        d="M5 8 C 9 21, 12.5 24.5, 16 24.5 C 19.5 24.5, 23 21, 27 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Quiet research-signal node */}
      <circle cx="27" cy="8" r="1.7" fill="#bfa46a" />
      <path
        d="M27 8 L27 8"
        stroke="#bfa46a"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="Vergura Investment — home"
    >
      <Emblem className="h-7 w-7 text-ivory transition-colors duration-500 group-hover:text-champagne" />
      <span className="flex flex-col leading-none">
        <span
          className="font-serif text-[1.35rem] tracking-[0.04em] text-ivory"
          style={{ fontOpticalSizing: "auto" }}
        >
          Vergura
        </span>
        {sub && (
          <span className="label mt-1 text-[0.58rem] tracking-[0.34em] text-silver">
            Investment
          </span>
        )}
      </span>
    </Link>
  );
}
