import type { JobState, ReviewStatus } from "@/lib/db/queries";

const STATE_STYLE: Record<JobState, { cls: string; label: string }> = {
  waiting: { cls: "border-[rgba(96,165,250,0.35)] text-info", label: "waiting" },
  queuing: { cls: "border-[rgba(96,165,250,0.35)] text-info", label: "queuing" },
  generating: { cls: "border-[rgba(251,191,36,0.4)] text-run", label: "generating" },
  success: { cls: "border-[rgba(74,222,128,0.35)] text-ok", label: "success" },
  fail: { cls: "border-[rgba(248,113,113,0.4)] text-bad", label: "failed" },
};

const REVIEW_STYLE: Record<ReviewStatus, { cls: string; label: string }> = {
  draft: { cls: "text-faint", label: "draft" },
  in_review: { cls: "border-[rgba(251,191,36,0.4)] text-run", label: "in review" },
  approved: { cls: "border-[rgba(74,222,128,0.35)] text-ok", label: "approved" },
  rejected: { cls: "border-[rgba(248,113,113,0.4)] text-bad", label: "rejected" },
};

export function StateBadge({ state }: { state: JobState }) {
  const s = STATE_STYLE[state] ?? STATE_STYLE.waiting;
  return <span className={`chip ${s.cls}`}>{s.label}</span>;
}

export function ReviewBadge({ review }: { review: ReviewStatus }) {
  const s = REVIEW_STYLE[review] ?? REVIEW_STYLE.draft;
  return <span className={`chip ${s.cls}`}>{s.label}</span>;
}

export function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "run" | "bad" | "accent";
}) {
  const color =
    tone === "ok"
      ? "text-ok"
      : tone === "run"
        ? "text-run"
        : tone === "bad"
          ? "text-bad"
          : tone === "accent"
            ? "text-accent"
            : "text-fg";
  return (
    <div className="panel px-4 py-3.5">
      <div className="label">{label}</div>
      <div className={`mt-1.5 font-mono text-2xl ${color}`}>{value}</div>
    </div>
  );
}
