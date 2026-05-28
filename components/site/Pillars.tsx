import { Reveal } from "@/components/Reveal";
import { Halftone, type HalftoneShape } from "@/components/Halftone";

const pillars: {
  n: string;
  shape: HalftoneShape;
  title: string;
  body: string;
}[] = [
  {
    n: "01",
    shape: "dome",
    title: "Global Investment Reach",
    body: "Markets are fluid, but value is not evenly distributed. We map capital flows, macro distortions, and frontier opportunity to deploy ahead of consensus.",
  },
  {
    n: "02",
    shape: "mountain",
    title: "Multi-Asset Strategy",
    body: "Exposure engineered across digital assets, public and private markets — capturing mispriced risk and compounding structural advantage.",
  },
  {
    n: "03",
    shape: "pyramid",
    title: "Macro Intelligence",
    body: "A research-led framework that translates monetary regime and liquidity into disciplined, high-conviction positioning.",
  },
  {
    n: "04",
    shape: "bars",
    title: "Institutional-Grade Operations",
    body: "Compliance, risk modeling, and executional rigor integrated into a market-agnostic foundation built to endure.",
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="border-t border-line py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="text-center">
          <h2 className="font-serif text-[2rem] leading-tight text-ivory sm:text-[2.7rem]">
            Our pillars <span className="italic text-champagne">of</span>{" "}
            conviction
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal
              key={p.n}
              delay={(i % 4) * 90}
              className="group flex h-full flex-col bg-ink p-7 transition-colors duration-500 hover:bg-charcoal/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.68rem] tracking-[0.2em] text-gold">
                  {p.n}
                </span>
                <span className="h-px w-7 bg-line-strong transition-all duration-500 group-hover:w-10 group-hover:bg-[rgba(191,164,106,0.6)]" />
              </div>

              <h3 className="mt-6 font-serif text-[1.3rem] leading-tight text-ivory">
                {p.title}
              </h3>

              <div className="my-7 flex h-28 items-end justify-center">
                <Halftone
                  shape={p.shape}
                  className="h-full w-full text-stone transition-colors duration-500 group-hover:text-champagne"
                />
              </div>

              <p className="mt-auto text-[0.86rem] leading-relaxed text-stone">
                {p.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
