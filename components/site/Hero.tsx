import Link from "next/link";

const stats = [
  { value: "Zug", label: "Switzerland · Est. 2019" },
  { value: "06", label: "Asset Classes" },
  { value: "Multi", label: "Asset Strategy" },
  { value: "24/7", label: "Research Desk" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/* Glow + vignette seat the content over the halftone field */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_38%,rgba(191,164,106,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_38%_50%,rgba(5,5,5,0.42),transparent_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.5)_0%,transparent_24%,transparent_70%,rgba(5,5,5,0.8)_100%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-32 lg:px-10">
        <div className="animate-fade-up">
          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="label text-gold">Vergura Investment</span>
            <span className="hidden h-3 w-px bg-line-strong sm:block" />
            <span className="label tnum text-silver">47.1717° N · 8.5160° E</span>
            <span className="hidden h-3 w-px bg-line-strong sm:block" />
            <span className="label text-silver">Sovereign Capital · Zug</span>
          </div>

          <h1 className="max-w-5xl font-serif text-[2.7rem] leading-[1.04] tracking-[-0.015em] text-ivory sm:text-[3.6rem] lg:text-[4.75rem]">
            Research-led
            <br />
            capital <span className="italic text-champagne">intelligence</span>
            <span className="text-bronze">.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-stone sm:text-lg">
            A sovereign investment firm optimising capital through deep-market
            intelligence. We publish our conviction openly — macro analysis,
            asset theses, and strategic insight, released with discipline.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/theses"
              className="group inline-flex items-center justify-center gap-2 bg-ivory px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-champagne"
            >
              Read Theses
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="mailto:contact@vergura.investment"
              className="inline-flex items-center justify-center gap-2 border border-[rgba(191,164,106,0.5)] px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-champagne transition-all duration-300 hover:border-gold hover:bg-[rgba(191,164,106,0.07)]"
            >
              Get in Contact ↗
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10">
        <div className="grid grid-cols-2 gap-px border-t border-line bg-line md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink/60 px-1 pt-6 backdrop-blur-sm">
              <div className="font-serif text-3xl text-ivory tnum">{s.value}</div>
              <div className="label mt-2 text-[0.6rem] text-silver">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
