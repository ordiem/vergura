import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ResearchCard } from "@/components/ResearchCard";
import { ArchiveExplorer } from "@/components/research/ArchiveExplorer";
import { featuredReport, publishedReports } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research Library",
  description:
    "The Vergura research archive — quarterly outlooks, asset theses, sector intelligence, and strategic notes across six asset classes.",
};

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const published = publishedReports();
  const featured = featuredReport();
  const mostRead = [...published].sort((a, b) => b.views - a.views).slice(0, 3);

  return (
    <div className="pt-[4.5rem]">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 grid-texture opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-gold">
                ARCHIVE
              </span>
              <span className="h-px w-8 bg-[rgba(191,164,106,0.5)]" />
              <span className="label text-stone">Intelligence Library</span>
            </div>
            <h1 className="max-w-3xl font-serif text-[2.6rem] leading-[1.08] text-ivory sm:text-[3.4rem]">
              A serious library
              <br className="hidden sm:block" /> of investment research.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone">
              Filter by asset class, category, or thesis. Every release is
              published with discipline through the Vergura intelligence platform.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Featured + Most read */}
        <section className="grid grid-cols-1 gap-6 py-14 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <ResearchCard report={featured} featured />
          </Reveal>
          <Reveal delay={100}>
            <div className="flex h-full flex-col border border-line bg-charcoal/40 p-6">
              <span className="label mb-5 text-gold">Most Read</span>
              <ol className="flex flex-1 flex-col divide-y divide-[var(--color-line)]">
                {mostRead.map((r, i) => (
                  <li key={r.slug} className="flex-1 py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/research/${r.slug}`}
                      className="group flex items-start gap-4"
                    >
                      <span className="font-mono text-[0.8rem] text-silver tnum">
                        0{i + 1}
                      </span>
                      <span>
                        <span className="block font-serif text-[1.02rem] leading-snug text-ivory transition-colors group-hover:text-champagne">
                          {r.title}
                        </span>
                        <span className="mt-1 block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-silver tnum">
                          {r.assetClass} · {r.views.toLocaleString()} reads
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </section>

        {/* Filterable archive */}
        <section className="pb-24">
          <ArchiveExplorer
            reports={published}
            initialAsset={sp.asset}
            initialCategory={sp.category}
          />
        </section>
      </div>
    </div>
  );
}
