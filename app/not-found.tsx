import Link from "next/link";
import { Emblem } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-40" />
      <div className="relative">
        <Emblem className="mx-auto h-10 w-10 text-ivory" />
        <div className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-gold">
          Error 404
        </div>
        <h1 className="mt-5 font-serif text-[2.6rem] leading-tight text-ivory sm:text-[3.4rem]">
          This page is unpublished.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-stone">
          The research you are looking for has moved, been archived, or never
          left the desk. Return to the library to continue.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/theses"
            className="bg-ivory px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-champagne"
          >
            Read Theses
          </Link>
          <Link
            href="/"
            className="border border-[rgba(191,164,106,0.5)] px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-champagne transition-all hover:border-gold hover:bg-[rgba(191,164,106,0.07)]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
