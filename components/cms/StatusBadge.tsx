import type { Status } from "@/lib/content";

const styles: Record<Status, string> = {
  Released:
    "text-gold border-[rgba(191,164,106,0.35)] bg-[rgba(191,164,106,0.08)]",
  Scheduled:
    "text-champagne border-[rgba(216,201,163,0.3)] bg-[rgba(216,201,163,0.06)]",
  Draft: "text-stone border-line-strong bg-[rgba(244,241,234,0.03)]",
  Archived: "text-silver border-line bg-transparent",
};

const dot: Record<Status, string> = {
  Released: "bg-gold",
  Scheduled: "bg-champagne",
  Draft: "bg-stone",
  Archived: "bg-silver",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] ${styles[status]}`}
    >
      <span className={`h-1 w-1 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}
