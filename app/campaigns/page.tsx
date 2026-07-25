import type { Metadata } from "next";
import Link from "next/link";
import { isDbConfigured } from "@/lib/db/client";
import { listCampaigns } from "@/lib/db/queries";
import { SetupNotice } from "@/components/SetupNotice";
import { CampaignForm } from "@/components/CampaignForm";

export const metadata: Metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  if (!isDbConfigured()) return <SetupNotice />;

  const campaigns = await listCampaigns();

  return (
    <div className="space-y-6">
      <header>
        <div className="label">Campaigns</div>
        <h1 className="mt-1 text-2xl">Briefs and budgets</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          A campaign groups generations and caps what they may spend.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <CampaignForm />

        <div className="space-y-3">
          <div className="label">Active · {campaigns.length}</div>
          {campaigns.length === 0 ? (
            <p className="panel p-4 text-sm text-muted">None yet.</p>
          ) : (
            campaigns.map((c) => {
              const budget = c.budget_credits == null ? null : Number(c.budget_credits);
              const spent = Number(c.spent);
              const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
              const over = budget !== null && spent >= budget;
              return (
                <div key={c.id} className="panel p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm">{c.name}</span>
                    <Link
                      href={`/jobs?campaign=${c.id}`}
                      className="font-mono text-xs text-muted hover:text-fg"
                    >
                      {c.generation_count} generations →
                    </Link>
                  </div>
                  {c.objective ? (
                    <p className="mt-1.5 text-xs text-muted">{c.objective}</p>
                  ) : null}
                  <div className="mt-3 flex items-baseline justify-between font-mono text-xs">
                    <span className={over ? "text-bad" : "text-muted"}>
                      {spent.toFixed(2)} / {budget === null ? "∞" : budget.toFixed(2)} credits
                    </span>
                    {over ? <span className="text-bad">over budget</span> : null}
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className={`h-full rounded-full ${over ? "bg-bad" : "bg-accent"}`}
                      style={{ width: budget ? `${pct}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
