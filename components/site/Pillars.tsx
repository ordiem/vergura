import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/site/SectionHeader";

const pillars = [
  {
    n: "01",
    title: "Macro Intelligence",
    body: "Monetary regime, liquidity, and the term structure of risk — translated into cross-asset positioning before consensus forms.",
  },
  {
    n: "02",
    title: "Digital Assets",
    body: "Market structure, volatility regimes, and the liquidity drivers of digital markets, covered with the same rigour as any asset class.",
  },
  {
    n: "03",
    title: "Public Markets",
    body: "Platform economics, capital intensity, and the equity implications of compute, power, and infrastructure.",
  },
  {
    n: "04",
    title: "Private Markets",
    body: "Private credit, secondaries, and the slow transmission of public-market stress into private valuations.",
  },
  {
    n: "05",
    title: "Risk & Portfolio Strategy",
    body: "Convexity, dispersion, and the construction of books that improve as volatility widens — not merely survive it.",
  },
  {
    n: "06",
    title: "Research Infrastructure",
    body: "A private CMS engine carrying every thesis from formation to published insight, with disciplined release controls.",
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="border-t border-line py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          index="02"
          eyebrow="Investment Pillars"
          title={
            <>
              Structured capital thinking,
              <br className="hidden sm:block" /> across every asset class.
            </>
          }
          intro="Six disciplines define the Vergura research mandate. Each is covered by a dedicated desk and published through a single, governed intelligence platform."
        />

        <div className="mt-16 grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal
              key={p.n}
              delay={(i % 3) * 90}
              className="group relative border-b border-line p-8 transition-colors duration-500 hover:bg-charcoal/40 sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(3n+1)]:border-r lg:[&:nth-child(3n+2)]:border-r lg:[&:nth-child(odd)]:border-r-0 lg:[&:nth-child(3n)]:border-r-0"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[0.72rem] tracking-[0.2em] text-gold">
                  {p.n}
                </span>
                <span className="h-px w-8 bg-line-strong transition-all duration-500 group-hover:w-12 group-hover:bg-[rgba(191,164,106,0.6)]" />
              </div>
              <h3 className="mt-8 font-serif text-[1.5rem] leading-tight text-ivory">
                {p.title}
              </h3>
              <p className="mt-4 max-w-sm text-[0.92rem] leading-relaxed text-stone">
                {p.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
