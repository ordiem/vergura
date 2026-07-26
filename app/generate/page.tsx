import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-actions";
import { isDbConfigured } from "@/lib/db/client";
import { listCampaigns, listPresets } from "@/lib/db/queries";
import { SetupNotice } from "@/components/SetupNotice";
import { GenerateForm } from "@/components/GenerateForm";

export const metadata: Metadata = { title: "Generate" };
export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  await requireSession();
  if (!isDbConfigured()) return <SetupNotice />;

  const [presets, campaigns] = await Promise.all([listPresets(), listCampaigns()]);
  return (
    <div className="space-y-6">
      <header>
        <div className="label">Generate</div>
        <h1 className="mt-1 text-2xl">New static creative</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted">
          Locked preset fields are shown but not editable. The resolved prompt below is exactly
          what gets sent to the model.
        </p>
      </header>
      <GenerateForm presets={presets} campaigns={campaigns} />
    </div>
  );
}
