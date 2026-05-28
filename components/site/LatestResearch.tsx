import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ResearchCard } from "@/components/ResearchCard";
import { featuredReport, publishedReports } from "@/lib/content";

export function LatestResearch() {
  const featured = featuredReport();
  const latest = publishedReports()
    .filter((r) => r.slug !== featured.slug)
    .slice(0, 3);

  return (
    <section id="research" className="border-t border-line py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            index="01"
            eyebrow="Latest Intelligence"
            title={
              <>
                Conviction, published
                <br className="hidden sm:block" /> with discipline.
              </>
            }
          />
          <Reveal delay={120}>
            <Link
              href="/research"
              className="group inline-flex items-center gap-2 font-sans text-[0.78rem] uppercase tracking-[0.16em] text-champagne transition-colors hover:text-ivory"
            >
              View the archive
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={80} className="mt-14">
          <ResearchCard report={featured} featured />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {latest.map((r, i) => (
            <Reveal key={r.slug} delay={i * 90}>
              <ResearchCard report={r} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
