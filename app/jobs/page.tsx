import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-actions";
import Link from "next/link";
import { isDbConfigured } from "@/lib/db/client";
import { listGenerations, type JobState, type ReviewStatus } from "@/lib/db/queries";
import { SetupNotice } from "@/components/SetupNotice";
import { JobQueue } from "@/components/JobQueue";

export const metadata: Metadata = { title: "Queue" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "All" },
  { key: "in_review", label: "Awaiting review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
] as const;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ review?: string; state?: string }>;
}) {
  await requireSession();
  if (!isDbConfigured()) return <SetupNotice />;
  const sp = await searchParams;

  const rows = await listGenerations({
    review: (sp.review as ReviewStatus) || undefined,
    state: (sp.state as JobState) || undefined,
    limit: 60,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label">Queue</div>
          <h1 className="mt-1 text-2xl">Generation jobs</h1>
        </div>
        <Link href="/generate" className="btn btn-primary">
          New generation
        </Link>
      </header>

      <nav className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const activeFilter = (sp.review ?? "") === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={f.key ? `/jobs?review=${f.key}` : "/jobs"}
              className={`chip ${
                activeFilter ? "border-accent text-accent" : "text-muted hover:text-fg"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <JobQueue initial={rows} />
    </div>
  );
}
