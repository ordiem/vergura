"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

const links = [
  { label: "Research", href: "/research" },
  { label: "Pillars", href: "/#pillars" },
  { label: "Platform", href: "/#platform" },
  { label: "Approach", href: "/#approach" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-line bg-ink/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo sub />
        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-[0.8rem] uppercase tracking-[0.14em] text-stone transition-colors duration-300 hover:text-ivory"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/platform"
            className="border border-[rgba(191,164,106,0.5)] px-5 py-2.5 font-sans text-[0.75rem] uppercase tracking-[0.16em] text-champagne transition-all duration-300 hover:border-gold hover:bg-[rgba(191,164,106,0.08)]"
          >
            Access Platform
          </Link>
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-5 bg-ivory transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-ivory transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>
      {open && (
        <div className="border-t border-line bg-ink/95 px-6 py-6 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-sans text-sm uppercase tracking-[0.14em] text-stone"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/platform"
              onClick={() => setOpen(false)}
              className="mt-2 border border-[rgba(191,164,106,0.5)] px-5 py-3 text-center font-sans text-[0.75rem] uppercase tracking-[0.16em] text-champagne"
            >
              Access Platform
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
