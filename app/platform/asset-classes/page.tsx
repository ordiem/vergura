import Link from "next/link";
import { CmsPageHeader } from "@/components/cms/CmsPageHeader";
import { assetAccent } from "@/components/ResearchCard";
import { assetClasses, reports } from "@/lib/content";

const descriptions: Record<string, string> = {
  Macro: "Monetary regime, liquidity, and cross-asset risk premia.",
  "Digital Assets": "Market structure, volatility regimes, and liquidity drivers.",
  Equities: "Platform economics, capital intensity, and infrastructure.",
  "Private Markets": "Private credit, secondaries, and valuation latency.",
  "Fixed Income": "Curve, term premium, and the cost of fiscal expansion.",
  Commodities: "Monetary hedging, supply discipline, and transition demand.",
};

export default function AssetClassesPage() {
  return (
    <div>
      <CmsPageHeader
        eyebrow="Configuration"
        title="Asset Classes"
        description="The taxonomy applied across the research library. Every report is tagged to exactly one primary asset class."
      />

      <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {assetClasses.map((a) => {
          const own = reports.filter((r) => r.assetClass === a);
          const reads = own.reduce((s, r) => s + r.views, 0);
          return (
            <Link
              key={a}
              href={`/research?asset=${encodeURIComponent(a)}`}
              className="group bg-ink p-6 transition-colors hover:bg-charcoal/40"
            >
              <div className="flex items-center justify-between">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: assetAccent[a] }}
                />
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-silver tnum">
                  {own.length} reports
                </span>
              </div>
              <h2 className="mt-5 font-serif text-[1.35rem] text-ivory transition-colors group-hover:text-champagne">
                {a}
              </h2>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-stone">
                {descriptions[a]}
              </p>
              <div className="mt-5 border-t border-line pt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-silver tnum">
                {reads.toLocaleString()} total reads
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
