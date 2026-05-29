import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      {/* Contact block — centered, terminal-style, à la Gauss */}
      <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_50%_45%,rgba(191,164,106,0.06),transparent_70%)]" />

        <div className="relative flex flex-col items-center">
          <Wordmark className="text-[2.4rem]" />

          <address className="mt-8 font-mono text-[0.72rem] not-italic uppercase leading-relaxed tracking-[0.16em] text-silver">
            Vergura Investment AG
            <br />
            Bahnhofstrasse 12
            <br />
            6300 Zug,
            <br />
            Switzerland
          </address>

          <p className="mt-7 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-silver tnum">
            47.1717° N, 8.5160° E
          </p>

          <Link
            href="mailto:contact@vergura.investment"
            className="group mt-10 inline-flex items-center gap-2 border-b border-[rgba(191,164,106,0.5)] pb-1 font-mono text-[0.74rem] uppercase tracking-[0.18em] text-champagne transition-colors hover:text-ivory"
          >
            Get in Contact
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row lg:px-10">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-silver">
            © {new Date().getFullYear()} Vergura Investment
          </p>
          <nav className="flex items-center gap-6">
            <Link
              href="/theses"
              className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-silver transition-colors hover:text-ivory"
            >
              Theses
            </Link>
            <Link
              href="/#approach"
              className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-silver transition-colors hover:text-ivory"
            >
              Approach
            </Link>
            <Link
              href="/disclosures"
              className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-silver transition-colors hover:text-ivory"
            >
              Disclosures
            </Link>
          </nav>
        </div>
      </div>

      {/* Oversized wordmark wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative select-none px-6 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <span className="block translate-y-6 font-serif text-[18vw] leading-none tracking-tight text-[#0d0d0d]">
            Vergura
          </span>
        </div>
      </div>
    </footer>
  );
}
