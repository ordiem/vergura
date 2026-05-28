import { CmsPageHeader } from "@/components/cms/CmsPageHeader";
import { Chart, AllocationRing } from "@/components/Charts";
import { assetAccent, AssetTag } from "@/components/ResearchCard";
import { assetClasses, publishedReports, reports } from "@/lib/content";

export default function AnalyticsPage() {
  const published = publishedReports();
  const totalReads = reports.reduce((s, r) => s + r.views, 0);
  const mostRead = [...published]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const byAsset = assetClasses
    .map((a) => ({
      label: a,
      value: reports
        .filter((r) => r.assetClass === a)
        .reduce((s, r) => s + r.views, 0),
      color: assetAccent[a],
    }))
    .filter((d) => d.value > 0);

  const maxReads = Math.max(...mostRead.map((r) => r.views), 1);

  const kpis = [
    { label: "Total Reads", value: totalReads.toLocaleString(), delta: "+12.4%" },
    { label: "Published", value: published.length, delta: "+2" },
    {
      label: "Avg. Read Time",
      value: `${Math.round(
        published.reduce((s, r) => s + r.readingMinutes, 0) / published.length
      )}m`,
      delta: "+0.6m",
    },
    { label: "Asset Classes", value: byAsset.length, delta: "—" },
  ];

  return (
    <div>
      <CmsPageHeader
        eyebrow="Configuration"
        title="Analytics"
        description="Readership, distribution, and the most-read research across the platform."
      />

      <div className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-ink p-5">
            <div className="label text-silver">{k.label}</div>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-serif text-[2rem] leading-none text-ivory tnum">
                {k.value}
              </span>
              <span className="font-mono text-[0.62rem] text-gold">
                {k.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="border border-line bg-charcoal/30 p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="label text-stone">Readership Trend</span>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-silver">
              Trailing 10 weeks
            </span>
          </div>
          <div className="h-48 w-full">
            <Chart kind="line" animate />
          </div>
        </section>

        <section className="border border-line bg-charcoal/30 p-6">
          <span className="label mb-4 block text-stone">Reads by Asset Class</span>
          <div className="mx-auto h-40 w-40">
            <AllocationRing segments={byAsset} />
          </div>
          <ul className="mt-5 space-y-2">
            {byAsset.map((d) => (
              <li
                key={d.label}
                className="flex items-center justify-between text-[0.74rem]"
              >
                <span className="flex items-center gap-2 text-stone">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.label}
                </span>
                <span className="font-mono text-silver tnum">
                  {d.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 border border-line bg-charcoal/30">
        <div className="border-b border-line px-5 py-4">
          <span className="label text-stone">Most Read</span>
        </div>
        <div className="divide-y divide-[var(--color-line)]">
          {mostRead.map((r, i) => (
            <div key={r.slug} className="flex items-center gap-4 px-5 py-3.5">
              <span className="font-mono text-[0.72rem] text-silver tnum">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-sans text-[0.84rem] text-ivory">
                  {r.title}
                </div>
                <div className="mt-1">
                  <AssetTag value={r.assetClass} />
                </div>
              </div>
              <div className="hidden w-40 sm:block">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${(r.views / maxReads) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-16 text-right font-mono text-[0.66rem] text-silver tnum">
                {r.views.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
