import Link from "next/link";
import { Emblem } from "@/components/Logo";

const columns = [
  {
    title: "Research",
    links: [
      { label: "Latest Releases", href: "/research" },
      { label: "Quarterly Outlooks", href: "/research?category=Quarterly+Outlook" },
      { label: "Asset Theses", href: "/research?category=Asset+Thesis" },
      { label: "Strategic Notes", href: "/research?category=Strategic+Note" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Research Library", href: "/platform/library" },
      { label: "New Report", href: "/platform/new" },
      { label: "Analytics", href: "/platform/analytics" },
      { label: "Access Platform", href: "/platform" },
    ],
  },
  {
    title: "Firm",
    links: [
      { label: "Pillars", href: "/#pillars" },
      { label: "Approach", href: "/#approach" },
      { label: "Disclosures", href: "/platform/disclosures" },
      { label: "Contact", href: "mailto:research@vergura.investment" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      <div className="mx-auto max-w-7xl px-6 pb-14 pt-20 lg:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Emblem className="h-7 w-7 text-ivory" />
              <span className="font-serif text-[1.35rem] tracking-[0.04em] text-ivory">
                Vergura
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-silver">
              Research-led capital intelligence. Institutional-grade market
              research, macro commentary, and strategic theses — published with
              discipline.
            </p>
            <div className="mt-7 flex items-center gap-2 text-[0.7rem]">
              <span className="label text-silver">Zug</span>
              <span className="h-1 w-1 rounded-full bg-bronze" />
              <span className="label text-silver">Switzerland</span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="label mb-5 text-stone">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-silver transition-colors duration-300 hover:text-ivory"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-7 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-silver">
            © {new Date().getFullYear()} Vergura Investment · All rights reserved
          </p>
          <p className="max-w-xl font-mono text-[0.62rem] leading-relaxed tracking-wide text-[#5a5a5a]">
            Research and intelligence only. Nothing herein constitutes
            investment advice or an offer to transact. Capital is at risk.
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none select-none px-6 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <span className="block translate-y-6 font-serif text-[18vw] leading-none tracking-tight text-[#0f0f0f]">
            Vergura
          </span>
        </div>
      </div>
    </footer>
  );
}
