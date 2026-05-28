"use client";

import { useMemo, useState } from "react";
import type { AssetClass, Report } from "@/lib/content";
import { assetClasses } from "@/lib/content";
import { ResearchCard } from "@/components/ResearchCard";

type Sort = "latest" | "read";

export function ArchiveExplorer({
  reports,
  initialAsset,
  initialCategory,
}: {
  reports: Report[];
  initialAsset?: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [asset, setAsset] = useState<AssetClass | "All">(
    (assetClasses.includes(initialAsset as AssetClass)
      ? (initialAsset as AssetClass)
      : "All") as AssetClass | "All"
  );
  const [category, setCategory] = useState<string>(initialCategory ?? "All");
  const [sort, setSort] = useState<Sort>("latest");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(reports.map((r) => r.category)))],
    [reports]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => (asset === "All" ? true : r.assetClass === asset))
      .filter((r) => (category === "All" ? true : r.category === category))
      .filter((r) =>
        q === ""
          ? true
          : [r.title, r.summary, ...r.tags].join(" ").toLowerCase().includes(q)
      )
      .sort((a, b) =>
        sort === "latest"
          ? +new Date(b.date) - +new Date(a.date)
          : b.views - a.views
      );
  }, [reports, query, asset, category, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="border-y border-line py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 font-mono text-[0.7rem] text-silver">
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search research, theses, tags…"
                className="w-full border-b border-line bg-transparent py-2 pl-5 font-sans text-sm text-ivory outline-none transition-colors placeholder:text-silver focus:border-[rgba(191,164,106,0.6)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="label mr-1 text-silver">Sort</span>
              {(
                [
                  ["latest", "Latest"],
                  ["read", "Most read"],
                ] as [Sort, string][]
              ).map(([key, lbl]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={`border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors ${
                    sort === key
                      ? "border-[rgba(191,164,106,0.5)] text-champagne"
                      : "border-line text-silver hover:text-stone"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Asset class chips */}
          <div className="flex flex-wrap items-center gap-2">
            {(["All", ...assetClasses] as (AssetClass | "All")[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAsset(a)}
                className={`border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] transition-colors ${
                  asset === a
                    ? "border-[rgba(191,164,106,0.5)] bg-[rgba(191,164,106,0.08)] text-champagne"
                    : "border-line text-silver hover:border-line-strong hover:text-stone"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`border px-3 py-1.5 font-sans text-[0.7rem] tracking-wide transition-colors ${
                  category === c
                    ? "border-line-strong text-ivory"
                    : "border-transparent text-silver hover:text-stone"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result meta */}
      <div className="flex items-center justify-between py-5">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-silver tnum">
          {filtered.length} {filtered.length === 1 ? "report" : "reports"}
        </span>
        {(asset !== "All" || category !== "All" || query !== "") && (
          <button
            type="button"
            onClick={() => {
              setAsset("All");
              setCategory("All");
              setQuery("");
            }}
            className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-champagne hover:text-ivory"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ResearchCard key={r.slug} report={r} />
          ))}
        </div>
      ) : (
        <div className="border border-line bg-charcoal/30 px-6 py-20 text-center">
          <p className="font-serif text-xl text-ivory">No research matches.</p>
          <p className="mt-2 text-sm text-silver">
            Adjust your filters or clear the search to view the full library.
          </p>
        </div>
      )}
    </div>
  );
}
