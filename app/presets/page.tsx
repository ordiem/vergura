import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-actions";
import { isDbConfigured } from "@/lib/db/client";
import { listPresets } from "@/lib/db/queries";
import { SetupNotice } from "@/components/SetupNotice";
import { PresetForm } from "@/components/PresetForm";

export const metadata: Metadata = { title: "Presets" };
export const dynamic = "force-dynamic";

export default async function PresetsPage() {
  await requireSession();
  if (!isDbConfigured()) return <SetupNotice />;

  const presets = await listPresets();

  return (
    <div className="space-y-6">
      <header>
        <div className="label">Presets</div>
        <h1 className="mt-1 text-2xl">Brand control</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          A preset fixes the model, the bracketing prompt language, and any parameters you do not
          want operators changing. Everything else stays editable per generation.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <PresetForm />

        <aside className="space-y-3">
          <div className="label">Existing · {presets.length}</div>
          {presets.length === 0 ? (
            <p className="panel p-4 text-sm text-muted">None yet.</p>
          ) : (
            presets.map((p) => (
              <div key={p.id} className="panel p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm">{p.name}</span>
                  <span className="chip text-accent">▪ locked</span>
                </div>
                <p className="mt-1 font-mono text-xs text-faint">{p.model}</p>
                {p.description ? (
                  <p className="mt-1.5 text-xs text-muted">{p.description}</p>
                ) : null}

                {p.locked_prefix ? (
                  <p className="mt-2 line-clamp-2 font-mono text-[0.7rem] text-muted">
                    ▪ {p.locked_prefix}
                  </p>
                ) : null}
                {p.locked_suffix ? (
                  <p className="mt-1 line-clamp-2 font-mono text-[0.7rem] text-muted">
                    ▪ …{p.locked_suffix}
                  </p>
                ) : null}
                {p.negative_prompt ? (
                  <p className="mt-1 line-clamp-1 font-mono text-[0.7rem] text-faint">
                    avoid: {p.negative_prompt}
                  </p>
                ) : null}

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {Object.entries(p.locked_params ?? {}).map(([k, v]) => (
                    <span key={k} className="chip text-faint">
                      {k}={String(v)}
                    </span>
                  ))}
                  {(p.editable_params ?? []).map((k) => (
                    <span key={k} className="chip border-dashed text-muted">
                      {k} free
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
