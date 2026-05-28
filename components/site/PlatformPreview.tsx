import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/site/SectionHeader";
import { StatusBadge } from "@/components/cms/StatusBadge";
import { AssetTag } from "@/components/ResearchCard";
import { reports, formatDate } from "@/lib/content";

const pipeline = reports.slice(0, 5);

const navItems = [
  "Dashboard",
  "Research Library",
  "New Report",
  "Drafts",
  "Scheduled Releases",
  "Published",
  "Authors",
  "Asset Classes",
  "Disclosures",
  "Analytics",
];

export function PlatformPreview() {
  return (
    <section id="platform" className="border-t border-line py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <SectionHeader
              index="04"
              eyebrow="The Research CMS"
              title={
                <>
                  An institutional CMS
                  <br className="hidden sm:block" /> for investment research.
                </>
              }
              intro="From thesis formation to published insight. A private publishing cockpit with research pipeline, draft editor, release scheduling, asset-class tagging, and compliance-grade disclosure controls."
            />
            <Reveal delay={120} className="mt-9">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  "Research pipeline & status",
                  "Draft editor & preview",
                  "Publishing calendar",
                  "Asset-class tagging",
                  "Private / public visibility",
                  "Risk disclosure fields",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[0.85rem] text-stone"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/platform"
                className="group mt-9 inline-flex items-center gap-2 bg-ivory px-6 py-3 font-sans text-[0.78rem] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-champagne"
              >
                Access Platform
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="overflow-hidden border border-line bg-charcoal/50">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-line bg-ink/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
                  <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
                  <span className="h-2.5 w-2.5 rounded-full border border-line-strong" />
                </div>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-silver">
                  vergura · research pipeline
                </span>
                <span className="font-mono text-[0.62rem] text-gold">LIVE</span>
              </div>

              <div className="grid grid-cols-[7.5rem_1fr]">
                {/* Mini sidebar */}
                <div className="hidden border-r border-line py-4 sm:block">
                  {navItems.map((item, i) => (
                    <div
                      key={item}
                      className={`px-3 py-1.5 font-mono text-[0.62rem] tracking-wide ${
                        i === 1 ? "text-ivory" : "text-silver"
                      }`}
                    >
                      {i === 1 && (
                        <span className="mr-1.5 text-gold">▎</span>
                      )}
                      {item}
                    </div>
                  ))}
                </div>

                {/* Pipeline table */}
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="label text-stone">Research Library</span>
                    <span className="font-mono text-[0.62rem] text-silver tnum">
                      {reports.length} items
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pipeline.map((r) => (
                      <div
                        key={r.slug}
                        className="flex items-center justify-between gap-3 border border-line bg-ink/40 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-sans text-[0.78rem] text-ivory">
                            {r.title}
                          </div>
                          <div className="mt-1 flex items-center gap-3">
                            <AssetTag value={r.assetClass} />
                            <span className="font-mono text-[0.6rem] text-silver tnum">
                              {formatDate(r.date)}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
