import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-actions";
import { isDbConfigured } from "@/lib/db/client";
import { isAnalysisMock } from "@/lib/analysis/provider";
import { listProducts, listRefs, listRips } from "@/lib/db/rip-queries";
import { SetupNotice } from "@/components/SetupNotice";
import { AddReference, RefCard, RunRip, RipResult } from "@/components/rip/RipPanels";

export const metadata: Metadata = { title: "Rip" };
export const dynamic = "force-dynamic";

export default async function RipPage() {
  await requireSession();
  if (!isDbConfigured()) return <SetupNotice />;

  const [refs, products, rips] = await Promise.all([listRefs(), listProducts(), listRips()]);

  return (
    <div className="space-y-6">
      <header>
        <div className="label">Rip</div>
        <h1 className="mt-1 text-2xl">Reference → product</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Upload an ad that works, read why it works, then translate that idea onto one of your
          products. Concepts are proposals — nothing generates until you approve one.
          {isAnalysisMock() ? " Currently using the mock analysis driver." : ""}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-4">
          <AddReference />
          <RunRip refs={refs} products={products} />
        </div>

        <div className="space-y-4">
          <div className="label">2 · References · {refs.length}</div>
          {refs.length === 0 ? (
            <p className="panel p-4 text-sm text-muted">
              Nothing yet. Upload the ad you want to rip.
            </p>
          ) : (
            <div className="space-y-3">
              {refs.map((r) => (
                <RefCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      </div>

      {rips.length > 0 ? (
        <div className="space-y-6 border-t border-line pt-6">
          <div className="label">4 · Concepts awaiting review</div>
          {rips.map((rip) => (
            <RipResult key={rip.id} rip={rip} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
