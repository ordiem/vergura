import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ThesisCard } from "@/components/blog/ThesisCard";
import { featuredReport, publishedReports } from "@/lib/content";

export function LatestTheses() {
  const featured = featuredReport();
  const latest = publishedReports()
    .filter((r) => r.slug !== featured.slug)
    .slice(0, 3);

  return (
    <section id="theses" className="border-t border-line py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            index="03"
            eyebrow="Latest Theses"
            title={
              <>
                Conviction, published
                <br className="hidden sm:block" /> with discipline.
              </>
            }
          />
          <Reveal delay={120}>
            <Link
              href="/theses"
              className="group inline-flex items-center gap-2 font-sans text-[0.78rem] uppercase tracking-[0.16em] text-champagne transition-colors hover:text-ivory"
            >
              View all theses
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={80} className="mt-14">
          <ThesisCard report={featured} featured />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {latest.map((r, i) => (
            <Reveal key={r.slug} delay={i * 90}>
              <ThesisCard report={r} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
