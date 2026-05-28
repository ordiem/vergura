import Link from "next/link";
import { CmsPageHeader } from "@/components/cms/CmsPageHeader";
import { StatusBadge } from "@/components/cms/StatusBadge";
import { AssetTag } from "@/components/ResearchCard";
import { Chart } from "@/components/Charts";
import {
  authorById,
  formatDate,
  reports,
  type Status,
} from "@/lib/content";

function count(status: Status) {
  return reports.filter((r) => r.status === status).length;
}

const stats = [
  { label: "Total Reports", value: reports.length, sub: "all statuses" },
  { label: "Published", value: count("Released"), sub: "public + private" },
  { label: "Scheduled", value: count("Scheduled"), sub: "awaiting release" },
  {
    label: "Total Reads",
    value: reports.reduce((s, r) => s + r.views, 0).toLocaleString(),
    sub: "trailing 90d",
  },
];

const pipeline = [...reports].sort(
  (a, b) => +new Date(b.date) - +new Date(a.date)
);

const calendar = reports
  .filter((r) => r.status === "Scheduled" || r.status === "Draft")
  .sort((a, b) => +new Date(a.date) - +new Date(b.date));

export default function DashboardPage() {
  return (
    <div>
      <CmsPageHeader
        eyebrow="Overview"
        title="Research Dashboard"
        description="Pipeline status, publishing calendar, and platform intelligence at a glance."
        action={
          <Link
            href="/platform/new"
            className="inline-flex items-center gap-2 bg-ivory px-5 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-champagne"
          >
            + New Report
          </Link>
        }
      />

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-ink p-5">
            <div className="label text-silver">{s.label}</div>
            <div className="mt-3 font-serif text-[2.1rem] leading-none text-ivory tnum">
              {s.value}
            </div>
            <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#5a5a5a]">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Pipeline */}
        <section className="border border-line bg-charcoal/30">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="label text-stone">Research Pipeline</span>
            <Link
              href="/platform/library"
              className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-champagne hover:text-ivory"
            >
              View library →
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-line)]">
            {pipeline.slice(0, 6).map((r) => {
              const author = authorById(r.authorId);
              return (
                <div
                  key={r.slug}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-ink/40"
                >
                  <div className="min-w-0">
                    <div className="truncate font-sans text-[0.85rem] text-ivory">
                      {r.title}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <AssetTag value={r.assetClass} />
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.13em] text-silver">
                        {author.initials} · {r.code}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="hidden font-mono text-[0.62rem] text-silver tnum sm:block">
                      {formatDate(r.date)}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* Reads trend */}
          <section className="border border-line bg-charcoal/30 p-5">
            <div className="mb-1 flex items-center justify-between">
              <span className="label text-stone">Readership</span>
              <span className="font-mono text-[0.62rem] text-gold">+12.4%</span>
            </div>
            <div className="h-28 w-full">
              <Chart kind="line" animate />
            </div>
          </section>

          {/* Publishing calendar */}
          <section className="border border-line bg-charcoal/30">
            <div className="border-b border-line px-5 py-4">
              <span className="label text-stone">Publishing Calendar</span>
            </div>
            <ul className="divide-y divide-[var(--color-line)]">
              {calendar.map((r) => (
                <li key={r.slug} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex flex-col items-center">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-silver">
                      {new Date(r.date).toLocaleDateString("en-GB", {
                        month: "short",
                      })}
                    </span>
                    <span className="font-serif text-lg text-ivory tnum">
                      {new Date(r.date).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-sans text-[0.78rem] text-ivory">
                      {r.title}
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                </li>
              ))}
              {calendar.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-silver">
                  Nothing scheduled.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
