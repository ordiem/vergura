import type { Metadata } from "next";
import Link from "next/link";
import { CapitalLockup, CapitalMark } from "@/components/landing/Mark";

export const metadata: Metadata = {
  title: { absolute: "Vergura Capital — Private investment house" },
  description:
    "Vergura Capital is a private investment house allocating long-horizon capital with research-led conviction across energy, financial systems, industrial technology, and real assets.",
};

const NAV_LINKS = [
  { href: "#approach", label: "Approach" },
  { href: "#focus", label: "Focus" },
  { href: "#principles", label: "Principles" },
  { href: "#contact", label: "Contact" },
];

const STATS = [
  { value: "2019", label: "Established · Zug, Switzerland" },
  { value: "Multi-asset", label: "Mandate" },
  { value: "7–10 yrs", label: "Investment horizon" },
  { value: "Research-led", label: "Every position underwritten" },
];

const PILLARS = [
  {
    index: "01",
    title: "Research first",
    body: "No position is taken that we cannot explain in writing. Primary research, direct operator conversations, and our own models precede every allocation — our published theses are the paper trail.",
  },
  {
    index: "02",
    title: "Concentration over breadth",
    body: "A short book of positions we understand deeply, sized to conviction. Diversification is a substitute for knowledge; we prefer the knowledge.",
  },
  {
    index: "03",
    title: "Patience as an edge",
    body: "Permanent capital and a seven-to-ten-year horizon let us hold through cycles that force others out. Time arbitrage is the most durable advantage left in public and private markets.",
  },
];

const SECTORS = [
  {
    index: "I",
    title: "Energy & Infrastructure",
    body: "Generation, transmission, and the industrial build-out behind electrification.",
  },
  {
    index: "II",
    title: "Financial Systems",
    body: "Exchanges, settlement rails, and the plumbing of capital markets.",
  },
  {
    index: "III",
    title: "Industrial Technology",
    body: "Automation, precision manufacturing, and compute supply chains.",
  },
  {
    index: "IV",
    title: "Real Assets",
    body: "Hard-asset cash flows — land, logistics, and long-dated concessions.",
  },
];

const PRINCIPLES = [
  "Capital is a responsibility before it is an instrument.",
  "Independence of thought is worth more than access.",
  "What cannot be held for a decade should not be held at all.",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-inkred selection:bg-venetian/20">
      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-50 border-b border-inkred/12 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between px-6 lg:px-8">
          <CapitalLockup />
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-sans text-[0.8rem] tracking-[0.04em] text-maroon transition-colors duration-300 hover:text-venetian"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="mailto:contact@vergura.investment"
            className="inline-flex items-center bg-venetian px-5 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-paper transition-colors duration-300 hover:bg-maroon"
          >
            Speak with us
          </a>
        </div>
      </header>

      <main>
        {/* ─── Hero ─── */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 sm:pt-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-venetian">
                Private investment house
              </p>
              <h1 className="mt-6 max-w-3xl font-serif text-[2.9rem] leading-[1.03] tracking-[-0.015em] text-inkred sm:text-[4rem] lg:text-[4.6rem]">
                Capital, allocated with{" "}
                <span className="italic text-maroon">conviction</span>
                <span className="text-venetian">.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-maroon sm:text-lg">
                Vergura Capital is a private investment house in Zug,
                Switzerland. We underwrite a concentrated book of long-horizon
                positions with our own research — and publish the reasoning
                behind them.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  href="mailto:contact@vergura.investment"
                  className="inline-flex items-center justify-center gap-2 bg-venetian px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-maroon"
                >
                  Speak with us
                </a>
                <a
                  href="#approach"
                  className="inline-flex items-center justify-center gap-2 border border-inkred/25 px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-inkred transition-colors duration-300 hover:border-venetian hover:text-venetian"
                >
                  Our approach ↓
                </a>
              </div>
            </div>
            <CapitalMark
              className="mx-auto hidden h-64 w-64 text-venetian lg:block xl:h-72 xl:w-72"
              title="Vergura Capital seal"
            />
          </div>
        </section>

        {/* ─── Stats hairline row ─── */}
        <section className="border-y border-inkred/12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-inkred/12 px-6 max-md:gap-y-8 max-md:py-8 md:grid-cols-4 md:divide-x lg:px-8">
            {STATS.map((s) => (
              <div key={s.label} className="md:px-6 md:py-8 md:first:pl-0">
                <div className="font-serif text-2xl text-inkred tnum">
                  {s.value}
                </div>
                <div className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-maroon">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Approach ─── */}
        <section
          id="approach"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24 lg:px-8"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-venetian">
            Approach
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-inkred sm:text-4xl">
            Three disciplines, held without exception.
          </h2>
          <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            {PILLARS.map((p) => (
              <div key={p.index} className="border-t-2 border-venetian pt-6">
                <span className="font-mono text-[0.7rem] tracking-[0.2em] text-venetian">
                  {p.index}
                </span>
                <h3 className="mt-3 font-serif text-xl text-inkred">
                  {p.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-maroon">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Focus ─── */}
        <section id="focus" className="scroll-mt-20 border-t border-inkred/12">
          <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:px-8">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-venetian">
              Focus
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-inkred sm:text-4xl">
              Four fields, studied for a decade at a time.
            </h2>
            <div className="mt-14 divide-y divide-inkred/12 border-y border-inkred/12">
              {SECTORS.map((s) => (
                <div
                  key={s.index}
                  className="group grid gap-2 py-7 sm:grid-cols-[4rem_16rem_1fr] sm:items-baseline sm:gap-6"
                >
                  <span className="font-mono text-[0.75rem] tracking-[0.2em] text-venetian">
                    {s.index}
                  </span>
                  <h3 className="font-serif text-xl text-inkred transition-colors duration-300 group-hover:text-venetian">
                    {s.title}
                  </h3>
                  <p className="text-[0.95rem] leading-relaxed text-maroon">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-maroon">
              The written record of our positions is public —{" "}
              <Link
                href="/theses"
                className="text-venetian underline decoration-venetian/40 underline-offset-4 transition-colors hover:decoration-venetian"
              >
                read the theses
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ─── Principles band ─── */}
        <section
          id="principles"
          className="scroll-mt-20 bg-inkred text-cream"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:px-8">
            <div className="flex items-start justify-between gap-10">
              <div>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-venetian">
                  Principles
                </p>
                <div className="mt-10 space-y-10">
                  {PRINCIPLES.map((p, i) => (
                    <p
                      key={i}
                      className="max-w-3xl font-serif text-2xl leading-snug text-cream sm:text-3xl"
                    >
                      <span className="mr-4 font-mono text-[0.75rem] tracking-[0.2em] text-venetian align-middle">
                        0{i + 1}
                      </span>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
              <CapitalMark
                className="mt-2 hidden h-28 w-28 shrink-0 text-cream/30 md:block"
                title="Vergura Capital seal"
              />
            </div>
          </div>
        </section>

        {/* ─── Contact ─── */}
        <section
          id="contact"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-28 text-center lg:px-8"
        >
          <CapitalMark
            className="mx-auto h-16 w-16 text-venetian"
            title="Vergura Capital seal"
          />
          <h2 className="mx-auto mt-8 max-w-2xl font-serif text-3xl leading-tight text-inkred sm:text-4xl">
            Conversations begin in writing.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-maroon">
            We work with a small number of families, founders, and institutions.
            Introduce yourself and the mandate you have in mind.
          </p>
          <a
            href="mailto:contact@vergura.investment"
            className="mt-10 inline-flex items-center justify-center gap-2 bg-venetian px-8 py-4 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-maroon"
          >
            contact@vergura.investment
          </a>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-inkred/12">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-maroon">
            © 2026 Vergura Capital · Zug, Switzerland
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/theses"
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-maroon transition-colors hover:text-venetian"
            >
              Theses
            </Link>
            <Link
              href="/disclosures"
              className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-maroon transition-colors hover:text-venetian"
            >
              Disclosures
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
