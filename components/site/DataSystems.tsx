import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Chart } from "@/components/Charts";
import type { ChartKind } from "@/lib/content";

const panels: { kind: ChartKind; label: string; caption: string }[] = [
  { kind: "line", label: "Liquidity Index", caption: "Public vs. private supply" },
  { kind: "yield", label: "Yield Decomposition", caption: "Expectations vs. term premium" },
  { kind: "distribution", label: "Return Dispersion", caption: "Tail-conditional outcomes" },
  { kind: "allocation", label: "Allocation Ring", caption: "Strategic asset weights" },
  { kind: "bands", label: "Volatility Bands", caption: "Regime-conditional range" },
  { kind: "risk", label: "Risk Matrix", caption: "Return vs. realised risk" },
];

export function DataSystems() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 grid-texture-fine opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          index="03"
          eyebrow="Data & Visual Systems"
          title={
            <>
              Restrained visualisation,
              <br className="hidden sm:block" /> built for conviction.
            </>
          }
          intro="Every figure is editorial: thin strokes, muted palettes, minimal labels. No dashboard noise — only the signal a thesis requires."
        />

        <div className="mt-16 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {panels.map((p, i) => (
            <Reveal key={p.label} delay={(i % 3) * 80} className="bg-ink">
              <div className="group flex h-full flex-col p-6 transition-colors duration-500 hover:bg-charcoal/50">
                <div className="mb-4 flex items-center justify-between">
                  <span className="label text-stone">{p.label}</span>
                  <span className="font-mono text-[0.6rem] tracking-wider text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="h-36 w-full opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                  <Chart kind={p.kind} animate />
                </div>
                <p className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-silver">
                  {p.caption}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
