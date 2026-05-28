import Link from "next/link";

function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid-texture opacity-[0.5]" />
      <svg
        className="absolute inset-x-0 bottom-0 h-[70%] w-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        {/* Topographic contour lines */}
        <g stroke="rgba(184,179,168,0.10)" strokeWidth="1" fill="none">
          <path d="M-50 220 C 300 180, 600 260, 900 200 S 1500 260, 1500 220" />
          <path d="M-50 280 C 320 230, 640 320, 940 250 S 1500 320, 1500 280" />
          <path d="M-50 340 C 280 300, 620 380, 980 300 S 1500 380, 1500 340" />
          <path d="M-50 400 C 360 360, 700 440, 1020 360 S 1500 440, 1500 400" />
        </g>
        <g stroke="rgba(191,164,106,0.12)" strokeWidth="1" fill="none">
          <path d="M-50 250 C 340 210, 660 290, 960 225 S 1500 290, 1500 250" />
        </g>
        {/* Alpine silhouette */}
        <path
          d="M-50 600 L-50 470 L160 360 L300 430 L470 300 L600 400 L760 250 L900 380 L1080 290 L1240 410 L1380 330 L1500 420 L1500 600 Z"
          fill="rgba(13,13,13,0.9)"
        />
        <path
          d="M-50 600 L-50 510 L220 420 L420 470 L640 360 L860 460 L1080 380 L1300 470 L1500 440 L1500 600 Z"
          fill="rgba(8,8,8,0.95)"
        />
      </svg>
      {/* Vignettes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgba(191,164,106,0.06),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.5)_0%,transparent_30%,transparent_60%,rgba(5,5,5,0.95)_100%)]" />
    </div>
  );
}

const stats = [
  { value: "128", label: "Reports Published" },
  { value: "06", label: "Asset Classes" },
  { value: "Zug", label: "Switzerland · Est. 2019" },
  { value: "24/7", label: "Research Desk" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      <HeroBackdrop />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-32 lg:px-10">
        <div className="animate-fade-up">
          <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="label text-gold">Vergura Research Desk</span>
            <span className="hidden h-3 w-px bg-line-strong sm:block" />
            <span className="label tnum text-silver">47.1717° N · 8.5160° E</span>
            <span className="hidden h-3 w-px bg-line-strong sm:block" />
            <span className="label text-silver">Institutional Intelligence</span>
          </div>

          <h1 className="max-w-5xl font-serif text-[2.7rem] leading-[1.04] tracking-[-0.015em] text-ivory sm:text-[3.6rem] lg:text-[4.75rem]">
            Research-led
            <br />
            capital intelligence
            <span className="text-bronze">.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-stone sm:text-lg">
            Vergura Investment releases institutional-grade market research,
            macro commentary, asset theses, and strategic intelligence through a
            private, CMS-driven research platform.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/research"
              className="group inline-flex items-center justify-center gap-2 bg-ivory px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-champagne"
            >
              Read Research
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/platform"
              className="inline-flex items-center justify-center gap-2 border border-[rgba(191,164,106,0.5)] px-7 py-3.5 font-sans text-[0.8rem] uppercase tracking-[0.16em] text-champagne transition-all duration-300 hover:border-gold hover:bg-[rgba(191,164,106,0.07)]"
            >
              Access Platform
            </Link>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-12 lg:px-10">
        <div className="grid grid-cols-2 gap-px border-t border-line bg-line md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink px-1 pt-6">
              <div className="font-serif text-3xl text-ivory tnum">{s.value}</div>
              <div className="label mt-2 text-[0.6rem] text-silver">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
