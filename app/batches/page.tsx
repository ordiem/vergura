import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-actions";
import { isDbConfigured } from "@/lib/db/client";
import { listGenerations } from "@/lib/db/queries";
import { listBatches } from "@/lib/db/rip-queries";
import { SetupNotice } from "@/components/SetupNotice";
import { BatchBuilder, type Selectable } from "@/components/rip/BatchBuilder";

export const metadata: Metadata = { title: "Batches" };
export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  await requireSession();
  if (!isDbConfigured()) return <SetupNotice />;

  const [approved, batches] = await Promise.all([
    listGenerations({ review: "approved", limit: 200 }),
    listBatches(),
  ]);

  const selectable: Selectable[] = approved.flatMap((g) =>
    g.assets.map((a) => ({
      id: a.id,
      url: a.mirror_url ?? a.url,
      prompt: g.resolved_prompt,
      campaign: g.campaign_name,
    }))
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="label">Batches</div>
        <h1 className="mt-1 text-2xl">Select and ship</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Group approved assets into a named batch and export a manifest. Only approved work is
          selectable — the review gate is enforced when the batch is written, not just in the UI.
        </p>
      </header>

      <BatchBuilder assets={selectable} />

      {batches.length > 0 ? (
        <section className="space-y-3 border-t border-line pt-6">
          <div className="label">Existing · {batches.length}</div>
          {batches.map((b) => (
            <div key={b.id} className="panel p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm">{b.name}</span>
                <a
                  href={`/api/batches/${b.id}/export`}
                  className="font-mono text-xs text-accent hover:underline"
                >
                  manifest.csv ↓
                </a>
              </div>
              <p className="mt-1 font-mono text-xs text-faint">
                {b.items.length} asset{b.items.length === 1 ? "" : "s"}
                {b.exported_at ? " · exported" : ""}
                {b.items.some((i) => !i.mirror_url)
                  ? " · some not mirrored — those URLs will expire"
                  : ""}
              </p>
              {b.note ? <p className="mt-1 text-xs text-muted">{b.note}</p> : null}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {b.items.slice(0, 12).map((i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i.id}
                    src={i.mirror_url ?? i.url}
                    alt=""
                    className="h-12 w-12 rounded border border-line object-cover"
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
