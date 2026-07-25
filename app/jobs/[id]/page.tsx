import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/db/client";
import { getLineage } from "@/lib/db/queries";
import { refreshGeneration } from "@/lib/domain/submit";
import { SetupNotice } from "@/components/SetupNotice";
import { ReviewBadge, StateBadge } from "@/components/Badges";
import { ReviewPanel, RerunPanel } from "@/components/JobActions";

export const metadata: Metadata = { title: "Job" };
export const dynamic = "force-dynamic";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isDbConfigured()) return <SetupNotice />;
  const { id } = await params;

  // Pull the latest state from KIE on open, so the page is never stale.
  const gen = await refreshGeneration(id);
  if (!gen) notFound();

  const lineage = await getLineage(id);
  const input = (gen.input ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="label">
            <Link href="/jobs" className="hover:text-muted">
              Queue
            </Link>{" "}
            / {gen.id.slice(0, 8)}
          </div>
          <h1 className="mt-1 truncate text-xl">{gen.resolved_prompt}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StateBadge state={gen.state} />
            <ReviewBadge review={gen.review} />
            <span className="chip text-muted">v{gen.version}</span>
            {gen.campaign_name ? (
              <span className="chip text-muted">{gen.campaign_name}</span>
            ) : null}
            {gen.preset_name ? (
              <span className="chip text-accent">▪ {gen.preset_name}</span>
            ) : null}
          </div>
        </div>
      </header>

      {gen.state === "fail" ? (
        <div className="panel border-[rgba(248,113,113,0.3)] p-4">
          <div className="label text-bad">Failed</div>
          <p className="mt-1.5 font-mono text-sm text-bad">
            {gen.fail_msg ?? "No message returned."}
            {gen.fail_code ? ` (${gen.fail_code})` : ""}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* Assets */}
          <section className="panel p-5">
            <div className="label mb-3">
              Assets {gen.assets.length ? `· ${gen.assets.length}` : ""}
            </div>
            {gen.assets.length === 0 ? (
              <p className="text-sm text-muted">
                {gen.state === "success"
                  ? "Completed but no asset URLs were parsed — check the raw result below."
                  : "Nothing yet. This page refreshes from KIE each time you open it."}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {gen.assets.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-lg border border-line"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.url}
                      alt={`Generated asset ${a.idx + 1}`}
                      className="aspect-square w-full bg-base object-cover"
                    />
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="font-mono text-xs text-faint">#{a.idx + 1}</span>
                      <span className="text-xs text-muted group-hover:text-fg">open ↗</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Version lineage */}
          {lineage.length > 1 ? (
            <section className="panel p-5">
              <div className="label mb-3">Versions · {lineage.length}</div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {lineage.map((v) => (
                  <Link
                    key={v.id}
                    href={`/jobs/${v.id}`}
                    className={`w-40 shrink-0 rounded-lg border p-2 transition-colors ${
                      v.id === gen.id
                        ? "border-accent bg-panel-2"
                        : "border-line hover:bg-panel-2"
                    }`}
                  >
                    <div className="aspect-square overflow-hidden rounded border border-line bg-base">
                      {v.assets[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.assets[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-xs">v{v.version}</span>
                      <ReviewBadge review={v.review} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[0.7rem] text-faint">
                      {v.operator_prompt || v.resolved_prompt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Exact request */}
          <section className="panel p-5">
            <div className="label mb-3">Request sent to KIE</div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <Row k="Model" v={gen.model} mono />
              <Row k="Task ID" v={gen.task_id ?? "—"} mono />
              <Row k="Credits" v={Number(gen.credits_consumed).toFixed(4)} mono />
              <Row
                k="Duration"
                v={gen.cost_time_ms ? `${(gen.cost_time_ms / 1000).toFixed(1)}s` : "—"}
                mono
              />
            </dl>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-base p-3 font-mono text-xs text-muted">
              {JSON.stringify(input, null, 2)}
            </pre>
          </section>

          {gen.raw_result ? (
            <details className="panel p-5">
              <summary className="label cursor-pointer">Raw KIE response</summary>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-base p-3 font-mono text-xs text-muted">
                {JSON.stringify(gen.raw_result, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>

        <aside className="space-y-4">
          <ReviewPanel
            id={gen.id}
            review={gen.review}
            canApprove={gen.state === "success"}
            note={gen.review_note}
          />
          <RerunPanel id={gen.id} prompt={gen.operator_prompt} />
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line pb-1.5">
      <dt className="label">{k}</dt>
      <dd className={`truncate text-xs ${mono ? "font-mono" : ""} text-muted`}>{v}</dd>
    </div>
  );
}
