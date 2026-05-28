import { Reveal } from "@/components/Reveal";

const sectors = [
  "Macro",
  "Digital Assets",
  "Equities",
  "Fixed Income",
  "Private Markets",
  "Private Credit",
  "Commodities",
  "Real Assets",
  "Venture",
  "Infrastructure",
  "Structured Credit",
  "Volatility",
];

const strategies = [
  "Macro Intelligence",
  "Value Investing",
  "Event-Driven",
  "Relative Value",
  "Yield Engineering",
  "Risk Parity",
  "Thematic Growth",
  "Capital Structure Arbitrage",
  "Liquidity Provision",
  "Tail Hedging",
];

function Mark() {
  return (
    <span className="font-mono text-[0.6rem] leading-none text-bronze/70">+</span>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="group inline-flex items-center gap-2 border border-line px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-stone transition-colors duration-300 hover:border-[rgba(191,164,106,0.5)] hover:text-ivory"
        >
          <span className="h-1.5 w-1.5 bg-bronze/80 transition-colors duration-300 group-hover:bg-gold" />
          {t}
        </span>
      ))}
    </div>
  );
}

export function Sectors() {
  return (
    <section className="relative border-t border-line py-24 lg:py-28">
      {/* Registration marks */}
      <div className="pointer-events-none absolute left-6 top-6 lg:left-10">
        <Mark />
      </div>
      <div className="pointer-events-none absolute right-6 top-6 lg:right-10">
        <Mark />
      </div>
      <div className="pointer-events-none absolute bottom-6 left-6 lg:left-10">
        <Mark />
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 lg:right-10">
        <Mark />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
          <Reveal>
            <div className="mb-7 flex items-center gap-3">
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-gold">
                01
              </span>
              <span className="h-px w-8 bg-[rgba(191,164,106,0.5)]" />
              <span className="label text-stone">Sectors we cover</span>
            </div>
            <Tags items={sectors} />
          </Reveal>

          <Reveal delay={120}>
            <div className="mb-7 flex items-center gap-3">
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-gold">
                02
              </span>
              <span className="h-px w-8 bg-[rgba(191,164,106,0.5)]" />
              <span className="label text-stone">Strategies we deploy</span>
            </div>
            <Tags items={strategies} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
