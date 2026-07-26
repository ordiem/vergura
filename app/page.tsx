import Link from "next/link";
import { requireSession } from "@/lib/auth-actions";
import { isDbConfigured } from "@/lib/db/client";
import { dashboardStats, listCampaigns, listGenerations } from "@/lib/db/queries";
import { SetupNotice } from "@/components/SetupNotice";
import { ReviewBadge, Stat, StateBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  await requireSession();
  if (!isDbConfigured()) return <SetupNotice />;

  const [stats, campaigns, recent] = await Promise.all([
    dashboardStats(),
    listCampaigns(),
    listGenerations({ limit: 8 }),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label">Overview</div>
          <h1 className="mt-1 text-2xl">Production status</h1>
        </div>
        <Link href="/generate" className="btn btn-primary">
          New generation
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="In flight" value={stats.in_flight} tone="run" />
        <Stat label="Awaiting review" value={stats.awaiting_review} tone="accent" />
        <Stat label="Approved" value={stats.approved} tone="ok" />
        <Stat label="Failed" value={stats.failed} tone="bad" />
        <Stat label="Credits spent" value={Number(stats.total_credits).toFixed(2)} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="label">Campaign budgets</h2>
          <Link href="/campaigns" className="text-xs text-muted hover:text-fg">
            Manage →
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <p className="panel p-5 text-sm text-muted">
            No campaigns yet. <Link href="/campaigns" className="text-accent">Create one</Link> to
            set a budget envelope.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => {
              const budget = c.budget_credits == null ? null : Number(c.budget_credits);
              const spent = Number(c.spent);
              const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
              const over = budget !== null && spent >= budget;
              return (
                <div key={c.id} className="panel p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm">{c.name}</span>
                    <span className="font-mono text-xs text-muted">
                      {c.generation_count} runs
                    </span>
                  </div>
                  <div className="mt-3 font-mono text-xs text-muted">
                    {spent.toFixed(2)} / {budget === null ? "∞" : budget.toFixed(2)} credits
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className={`h-full rounded-full ${over ? "bg-bad" : "bg-accent"}`}
                      style={{ width: budget ? `${pct}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="label">Recent generations</h2>
          <Link href="/jobs" className="text-xs text-muted hover:text-fg">
            Full queue →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="panel p-5 text-sm text-muted">Nothing generated yet.</p>
        ) : (
          <div className="panel divide-y divide-[rgba(255,255,255,0.06)]">
            {recent.map((g) => (
              <Link
                key={g.id}
                href={`/jobs/${g.id}`}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-panel-2"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-line bg-base">
                  {g.assets[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.assets[0].mirror_url ?? g.assets[0].url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <span className="flex-1 truncate text-sm text-muted">{g.resolved_prompt}</span>
                <StateBadge state={g.state} />
                <ReviewBadge review={g.review} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
