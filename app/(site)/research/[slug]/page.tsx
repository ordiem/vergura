import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { Chart } from "@/components/Charts";
import { ResearchCard, AssetTag } from "@/components/ResearchCard";
import { ReportActions } from "@/components/research/ReportActions";
import {
  authorById,
  formatDateLong,
  relatedReports,
  reportBySlug,
  reports,
} from "@/lib/content";

export function generateStaticParams() {
  return reports.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = reportBySlug(slug);
  if (!report) return { title: "Report not found" };
  return {
    title: report.title,
    description: report.summary,
    openGraph: { title: report.title, description: report.summary },
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = reportBySlug(slug);
  if (!report) notFound();

  const author = authorById(report.authorId);
  const related = relatedReports(report);

  return (
    <article className="pt-[4.5rem]">
      {/* Report cover / header */}
      <header className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_70%_30%,rgba(191,164,106,0.06),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 lg:py-24">
          <Reveal>
            <Link
              href="/research"
              className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-silver transition-colors hover:text-champagne"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Research Library
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <AssetTag value={report.assetClass} />
              <span className="h-3 w-px bg-line-strong" />
              <span className="label text-stone">{report.category}</span>
              <span className="h-3 w-px bg-line-strong" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-gold">
                {report.confidence}
              </span>
              <span className="h-3 w-px bg-line-strong" />
              <span className="font-mono text-[0.62rem] tracking-[0.14em] text-silver">
                {report.code}
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-7 font-serif text-[2.3rem] leading-[1.1] text-ivory sm:text-[3rem]">
              {report.title}
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 font-serif text-[1.2rem] leading-relaxed text-stone">
              {report.summary}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(191,164,106,0.4)] font-mono text-[0.7rem] text-champagne">
                  {author.initials}
                </span>
                <span className="leading-tight">
                  <span className="block font-sans text-[0.85rem] text-ivory">
                    {author.name}
                  </span>
                  <span className="block font-mono text-[0.62rem] uppercase tracking-[0.14em] text-silver">
                    {author.desk}
                  </span>
                </span>
              </div>
              <div className="text-right font-mono text-[0.66rem] uppercase tracking-[0.14em] text-silver tnum">
                {formatDateLong(report.date)}
                <span className="mx-2 text-line-strong">·</span>
                {report.readingMinutes} min read
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Executive summary */}
        <Reveal as="section">
          <div className="border-l border-[rgba(191,164,106,0.45)] pl-6">
            <h2 className="label mb-4 text-gold">Executive Summary</h2>
            <div className="prose-editorial">
              {report.executiveSummary.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Key takeaways */}
        <Reveal as="section" className="mt-14">
          <h2 className="label mb-6 text-stone">Key Takeaways</h2>
          <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
            {report.keyTakeaways.map((t, i) => (
              <li key={i} className="flex gap-4 bg-ink p-5">
                <span className="font-mono text-[0.72rem] text-gold tnum">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.9rem] leading-relaxed text-stone">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Body */}
        <section className="mt-16">
          {report.body.map((section, i) => (
            <Reveal as="div" key={i} className="mt-12 first:mt-0">
              <h2 className="font-serif text-[1.7rem] leading-tight text-ivory">
                <span className="mr-3 font-mono text-[0.85rem] align-middle text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="prose-editorial mt-5">
                {section.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              {section.pullQuote && (
                <blockquote className="my-10 border-y border-line py-8">
                  <p className="font-serif text-[1.5rem] leading-snug text-champagne">
                    “{section.pullQuote}”
                  </p>
                </blockquote>
              )}

              {/* Insert a figure after the first body section */}
              {report.figures[i] && (
                <figure className="my-10 border border-line bg-charcoal/40 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="label text-gold">
                      {report.figures[i].label}
                    </span>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-silver">
                      Vergura Research
                    </span>
                  </div>
                  <div className="h-52 w-full">
                    <Chart kind={report.figures[i].kind} animate />
                  </div>
                  <figcaption className="mt-4 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-silver">
                    {report.figures[i].caption}
                  </figcaption>
                </figure>
              )}
            </Reveal>
          ))}
        </section>

        {/* Footnote / methodology */}
        <Reveal as="section" className="mt-16 border-t border-line pt-8">
          <h2 className="label mb-3 text-stone">Notes</h2>
          <p className="font-mono text-[0.72rem] leading-relaxed text-silver">
            <sup>1</sup> Figures are illustrative of the Vergura analytical
            framework and constructed from desk models. Series are indexed and
            stylised for editorial clarity.
          </p>
        </Reveal>

        {/* Risk disclosure */}
        <Reveal as="section" className="mt-10">
          <div className="border border-[rgba(140,111,63,0.4)] bg-[rgba(140,111,63,0.06)] p-6">
            <h2 className="label mb-3 text-bronze">Risk Disclosure</h2>
            <p className="text-[0.82rem] leading-relaxed text-stone">
              {report.riskDisclosure}
            </p>
          </div>
        </Reveal>

        {/* Actions */}
        <Reveal as="section" className="mt-10">
          <ReportActions title={report.title} />
        </Reveal>
      </div>

      {/* Related research */}
      <section className="border-t border-line py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex items-center gap-3">
            <span className="font-mono text-[0.7rem] tracking-[0.2em] text-gold">
              ▦
            </span>
            <h2 className="label text-stone">Related Research</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ResearchCard key={r.slug} report={r} />
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
