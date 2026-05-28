"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  authorById,
  formatDate,
  type Report,
  type Status,
} from "@/lib/content";
import { StatusBadge } from "@/components/cms/StatusBadge";
import { AssetTag } from "@/components/ResearchCard";

const tabs: (Status | "All")[] = [
  "All",
  "Released",
  "Scheduled",
  "Draft",
  "Archived",
];

export function ReportTable({
  reports,
  initialStatus = "All",
}: {
  reports: Report[];
  initialStatus?: Status | "All";
}) {
  const [status, setStatus] = useState<Status | "All">(initialStatus);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => (status === "All" ? true : r.status === status))
      .filter((r) =>
        q === "" ? true : r.title.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
      )
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [reports, status, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => {
            const n =
              t === "All"
                ? reports.length
                : reports.filter((r) => r.status === t).length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setStatus(t)}
                className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors ${
                  status === t
                    ? "border-[rgba(191,164,106,0.5)] bg-[rgba(191,164,106,0.08)] text-champagne"
                    : "border-line text-silver hover:border-line-strong hover:text-stone"
                }`}
              >
                {t}
                <span className="text-[#5a5a5a] tnum">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center border-b border-line">
          <span className="px-2 font-mono text-[0.7rem] text-silver">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title or code…"
            className="w-full bg-transparent py-1.5 font-sans text-[0.78rem] text-ivory outline-none placeholder:text-silver md:w-56"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[44rem] border-collapse">
          <thead>
            <tr className="border-b border-line bg-charcoal/40 text-left">
              {["Report", "Asset Class", "Desk", "Date", "Visibility", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-silver"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const author = authorById(r.authorId);
              const href =
                r.status === "Released"
                  ? `/research/${r.slug}`
                  : "/platform/new";
              return (
                <tr
                  key={r.slug}
                  className="group border-b border-line transition-colors last:border-0 hover:bg-charcoal/40"
                >
                  <td className="px-4 py-3.5">
                    <Link href={href} className="block">
                      <span className="font-sans text-[0.84rem] text-ivory transition-colors group-hover:text-champagne">
                        {r.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[0.58rem] uppercase tracking-[0.14em] text-silver">
                        {r.code} · {r.category}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <AssetTag value={r.assetClass} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-silver">
                    {author.initials}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[0.66rem] text-silver tnum">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-mono text-[0.6rem] uppercase tracking-[0.14em] ${
                        r.visibility === "Public" ? "text-stone" : "text-bronze"
                      }`}
                    >
                      {r.visibility}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-4 py-16 text-center text-sm text-silver">
            No reports in this view.
          </div>
        )}
      </div>
    </div>
  );
}
