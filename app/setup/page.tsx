import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-actions";
import { isDbConfigured } from "@/lib/db/client";
import { isKieConfigured, isMockDriver } from "@/lib/kie/client";
import { isAnalysisConfigured, isAnalysisMock, analysisModelName } from "@/lib/analysis/provider";
import { isStorageConfigured } from "@/lib/storage/blob";

export const metadata: Metadata = { title: "Setup" };
export const dynamic = "force-dynamic";

type Check = {
  key: string;
  label: string;
  ok: boolean;
  degraded?: string;
  blocks: string;
  how: string;
};

export default async function SetupPage() {
  await requireSession();
  const checks: Check[] = [
    {
      key: "DATABASE_URL",
      label: "Postgres",
      ok: isDbConfigured(),
      blocks: "Everything. Nothing persists without it.",
      how: "Create a Neon or Supabase database, paste the connection string, then run `npm run db:migrate`. On Supabase use the transaction-pooler URL.",
    },
    {
      key: "KIE_API_KEY",
      label: "KIE — image generation",
      ok: isKieConfigured(),
      degraded: isMockDriver() ? "running the mock generation driver" : undefined,
      blocks: "Real image generation. The mock driver simulates the full lifecycle.",
      how: "Get a key at kie.ai/api-key. Note model access is per-plan — this project's key reaches nano-banana-2 but not seedream-v4.",
    },
    {
      key: "ANTHROPIC_API_KEY",
      label: "Claude Opus 5 — reference analysis",
      ok: isAnalysisConfigured(),
      degraded: isAnalysisMock() ? "running the mock analysis driver" : undefined,
      blocks:
        "Reading a reference ad and drafting concepts. KIE cannot cover this: its chat API only exposes DeepSeek, which is text-only and cannot see an image.",
      how: "Create a key at console.anthropic.com/settings/keys.",
    },
    {
      key: "BLOB_READ_WRITE_TOKEN",
      label: "Vercel Blob — uploads and asset mirroring",
      ok: isStorageConfigured(),
      blocks:
        "Uploading references and products, and mirroring generated assets. KIE serves results from tempfile.aiquickdraw.com, which expires — unmirrored assets become dead links.",
      how: "Vercel dashboard → Storage → create a Blob store → copy the read-write token.",
    },
  ];

  const ready = checks.filter((c) => c.ok).length;

  return (
    <div className="space-y-6">
      <header>
        <div className="label">Setup</div>
        <h1 className="mt-1 text-2xl">
          {ready} of {checks.length} connected
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Put each value in <code className="font-mono text-fg">.env.local</code> and restart the
          dev server. Values are read at request time, so this page reflects the running process.
        </p>
      </header>

      <div className="space-y-3">
        {checks.map((c) => (
          <div
            key={c.key}
            className={`panel p-4 ${c.ok ? "" : "border-[rgba(251,191,36,0.28)]"}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${c.ok ? "border-[rgba(74,222,128,0.35)] text-ok" : "border-[rgba(251,191,36,0.4)] text-run"}`}>
                {c.ok ? "connected" : "missing"}
              </span>
              <span className="text-sm">{c.label}</span>
              <code className="font-mono text-[0.7rem] text-faint">{c.key}</code>
              {c.degraded ? (
                <span className="chip text-faint">{c.degraded}</span>
              ) : null}
            </div>

            {!c.ok ? (
              <>
                <p className="mt-2.5 text-xs text-muted">
                  <span className="text-faint">Blocks: </span>
                  {c.blocks}
                </p>
                <p className="mt-1.5 text-xs text-muted">
                  <span className="text-faint">How: </span>
                  {c.how}
                </p>
              </>
            ) : null}
          </div>
        ))}
      </div>

      <section className="panel p-5">
        <div className="label mb-2">Order to do it in</div>
        <ol className="space-y-1.5 text-sm text-muted">
          <li>
            <span className="font-mono text-faint">1.</span> Postgres, then{" "}
            <code className="font-mono text-fg">npm run db:migrate</code> — nothing persists until
            this is done.
          </li>
          <li>
            <span className="font-mono text-faint">2.</span> Blob token — needed before you can
            upload the first reference ad.
          </li>
          <li>
            <span className="font-mono text-faint">3.</span> Anthropic key — needed to analyse that
            reference and draft concepts.
          </li>
          <li>
            <span className="font-mono text-faint">4.</span> KIE key — already connected; verify
            with <code className="font-mono text-fg">npm run kie:smoke</code>.
          </li>
        </ol>
      </section>

      {isAnalysisConfigured() ? (
        <p className="text-xs text-faint">
          Analysis model: <code className="font-mono">{analysisModelName()}</code>
        </p>
      ) : null}
    </div>
  );
}
