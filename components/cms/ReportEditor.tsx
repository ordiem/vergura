"use client";

import { useState } from "react";
import { assetClasses, type AssetClass, type Status } from "@/lib/content";

const categories = [
  "Quarterly Outlook",
  "Asset Thesis",
  "Sector Intelligence",
  "Strategic Note",
  "Internal Commentary",
];

const confidences = ["High Conviction", "Constructive", "Balanced", "Cautious"];

const authors = ["Adrian Vergura", "Helena Roth", "Marcus Feld", "Sofia Lindqvist", "Jonas Brandt"];

const statuses: Status[] = ["Draft", "Scheduled", "Released", "Archived"];

const versions = [
  { v: "v4", note: "Revised executive summary", at: "10:42 · today" },
  { v: "v3", note: "Added Fig. 2 dispersion band", at: "Yesterday" },
  { v: "v2", note: "Desk review — H. Roth", at: "2 days ago" },
  { v: "v1", note: "Draft created", at: "3 days ago" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-2 block text-silver">{label}</span>
      {children}
    </label>
  );
}

const selectCls =
  "w-full appearance-none border border-line bg-ink px-3 py-2 font-sans text-[0.8rem] text-ivory outline-none transition-colors focus:border-[rgba(191,164,106,0.5)]";

export function ReportEditor() {
  const [title, setTitle] = useState("");
  const [thesis, setThesis] = useState("");
  const [body, setBody] = useState("");
  const [asset, setAsset] = useState<AssetClass>(assetClasses[0]);
  const [status, setStatus] = useState<Status>("Draft");
  const [isPublic, setIsPublic] = useState(false);
  const words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
  const readMin = Math.max(1, Math.round(words / 230));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_19rem]">
      {/* Editor */}
      <div className="border border-line bg-charcoal/30">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-silver">
              Draft Editor · autosaved
            </span>
          </div>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-silver tnum">
            {words} words · {readMin}m
          </span>
        </div>

        <div className="space-y-6 p-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Report title"
            className="w-full bg-transparent font-serif text-[1.9rem] leading-tight text-ivory outline-none placeholder:text-[#3f3f3f]"
          />
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Short thesis summary — the one-line conviction…"
            rows={2}
            className="w-full resize-none border-l border-[rgba(191,164,106,0.4)] bg-transparent pl-4 font-serif text-[1.05rem] leading-relaxed text-stone outline-none placeholder:text-[#3f3f3f]"
          />
          <div className="rule-gold opacity-40" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Begin the report body. Markdown supported — headings, figures, footnotes, and risk blocks render on publish."
            rows={16}
            className="w-full resize-none bg-transparent font-sans text-[0.95rem] leading-[1.8] text-stone outline-none placeholder:text-[#3f3f3f]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            className="border border-line px-4 py-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-silver transition-colors hover:text-ivory"
          >
            Preview Mode
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="border border-line px-4 py-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-stone transition-colors hover:border-line-strong"
            >
              Save Draft
            </button>
            <button
              type="button"
              className="bg-ivory px-5 py-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-champagne"
            >
              Publish Research
            </button>
          </div>
        </div>
      </div>

      {/* Metadata panel */}
      <aside className="space-y-5">
        <div className="border border-line bg-charcoal/30 p-5">
          <span className="label mb-4 block text-stone">Report Metadata</span>
          <div className="space-y-4">
            <Field label="Asset Class">
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value as AssetClass)}
                className={selectCls}
              >
                {assetClasses.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select className={selectCls} defaultValue={categories[0]}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Author / Desk">
              <select className={selectCls} defaultValue={authors[0]}>
                {authors.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Confidence / Risk">
              <select className={selectCls} defaultValue={confidences[0]}>
                {confidences.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="border border-line bg-charcoal/30 p-5">
          <span className="label mb-4 block text-stone">Release Control</span>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className={selectCls}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>

          {status === "Scheduled" && (
            <div className="mt-4">
              <Field label="Release Date">
                <input type="date" className={selectCls} />
              </Field>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span className="label text-silver">Visibility</span>
            <button
              type="button"
              onClick={() => setIsPublic((v) => !v)}
              className="flex items-center gap-2"
              aria-pressed={isPublic}
            >
              <span
                className={`relative h-5 w-9 rounded-full border transition-colors ${
                  isPublic
                    ? "border-[rgba(191,164,106,0.6)] bg-[rgba(191,164,106,0.25)]"
                    : "border-line-strong bg-ink"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
                    isPublic
                      ? "left-[1.15rem] bg-gold"
                      : "left-0.5 bg-silver"
                  }`}
                />
              </span>
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-stone">
                {isPublic ? "Public" : "Private"}
              </span>
            </button>
          </div>
        </div>

        <div className="border border-line bg-charcoal/30 p-5">
          <span className="label mb-3 block text-bronze">
            Compliance / Risk Disclosure
          </span>
          <textarea
            rows={4}
            defaultValue="Research and intelligence only. Nothing herein constitutes investment advice or an offer to transact. Capital is at risk."
            className="w-full resize-none border border-line bg-ink p-3 font-mono text-[0.66rem] leading-relaxed text-stone outline-none focus:border-[rgba(140,111,63,0.5)]"
          />
        </div>

        <div className="border border-line bg-charcoal/30 p-5">
          <span className="label mb-4 block text-stone">Version History</span>
          <ol className="space-y-3">
            {versions.map((v) => (
              <li key={v.v} className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[0.62rem] text-gold tnum">
                  {v.v}
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.74rem] text-stone">
                    {v.note}
                  </span>
                  <span className="block font-mono text-[0.56rem] uppercase tracking-[0.12em] text-silver">
                    {v.at}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
