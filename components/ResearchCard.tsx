import Link from "next/link";
import type { AssetClass, Report } from "@/lib/content";
import { authorById, formatDate } from "@/lib/content";
import { Chart } from "@/components/Charts";

export const assetAccent: Record<AssetClass, string> = {
  Macro: "#bfa46a",
  "Digital Assets": "#d8c9a3",
  Equities: "#b8b3a8",
  "Private Markets": "#8c6f3f",
  "Fixed Income": "#9fb3a6",
  Commodities: "#c9a98f",
};

export function AssetTag({ value }: { value: AssetClass }) {
  return (
    <span className="label inline-flex items-center gap-1.5 text-[0.62rem] text-stone">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: assetAccent[value] }}
      />
      {value}
    </span>
  );
}

export function ConfidenceTag({ value }: { value: string }) {
  return (
    <span className="label text-[0.62rem] text-silver">{value}</span>
  );
}

export function ResearchCard({
  report,
  featured = false,
}: {
  report: Report;
  featured?: boolean;
}) {
  const author = authorById(report.authorId);

  if (featured) {
    return (
      <Link
        href={`/research/${report.slug}`}
        className="group relative grid grid-cols-1 overflow-hidden border border-line bg-charcoal/60 transition-colors duration-500 hover:border-line-strong md:grid-cols-2"
      >
        <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden border-b border-line bg-ink/60 p-8 grid-texture-fine md:border-b-0 md:border-r">
          <div className="absolute left-4 top-4">
            <span className="label text-gold">Featured Report</span>
          </div>
          <div className="h-44 w-full max-w-sm opacity-90 transition-opacity duration-500 group-hover:opacity-100">
            <Chart kind={report.chart} />
          </div>
        </div>
        <div className="flex flex-col justify-between p-8 md:p-10">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <AssetTag value={report.assetClass} />
              <span className="label text-[0.6rem] text-silver">{report.code}</span>
            </div>
            <h3 className="font-serif text-[1.7rem] leading-[1.15] text-ivory transition-colors duration-500 group-hover:text-champagne">
              {report.title}
            </h3>
            <p className="mt-4 line-clamp-3 text-[0.95rem] leading-relaxed text-stone">
              {report.summary}
            </p>
          </div>
          <div className="mt-8">
            <div className="rule-gold mb-5 w-full opacity-50" />
            <div className="flex items-center justify-between text-[0.72rem]">
              <span className="font-mono uppercase tracking-wider text-silver">
                {author.name} · {report.category}
              </span>
              <span className="font-mono tracking-wider text-silver tnum">
                {formatDate(report.date)} · {report.readingMinutes}m
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/research/${report.slug}`}
      className="group flex h-full flex-col justify-between border border-line bg-charcoal/40 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-line-strong hover:bg-charcoal/70"
    >
      <div>
        <div className="mb-5 flex items-center justify-between">
          <AssetTag value={report.assetClass} />
          <ConfidenceTag value={report.confidence} />
        </div>
        <h3 className="font-serif text-[1.22rem] leading-snug text-ivory transition-colors duration-500 group-hover:text-champagne">
          {report.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-stone">
          {report.summary}
        </p>
      </div>
      <div className="mt-7">
        <div className="h-px w-full bg-line transition-colors duration-500 group-hover:bg-[rgba(191,164,106,0.4)]" />
        <div className="mt-4 flex items-center justify-between text-[0.68rem]">
          <span className="font-mono uppercase tracking-wider text-silver">
            {author.initials} · {report.category}
          </span>
          <span className="font-mono tracking-wider text-silver tnum">
            {formatDate(report.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
