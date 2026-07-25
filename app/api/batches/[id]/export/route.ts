import { NextResponse } from "next/server";
import { getBatch, markExported } from "@/lib/db/rip-queries";
import { isDbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * Exports a batch as a manifest plus direct asset URLs.
 *
 * Prefers each asset's mirrored URL: KIE serves originals from
 * tempfile.aiquickdraw.com, which expires, so a manifest built on those would
 * decay. Google Drive delivery lands here later — the manifest is the same
 * payload an uploader would consume.
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "database not configured" }, { status: 503 });
  }

  const { id } = await ctx.params;
  const batch = await getBatch(id);
  if (!batch) return NextResponse.json({ error: "not found" }, { status: 404 });

  const rows = batch.items.map((it, i) => ({
    index: i + 1,
    filename: `${String(i + 1).padStart(2, "0")}_${batch.name.replace(/[^a-zA-Z0-9-]/g, "-")}.jpg`,
    url: it.mirror_url ?? it.url,
    durable: Boolean(it.mirror_url),
  }));

  const csv = [
    "index,filename,url,durable",
    ...rows.map((r) => `${r.index},"${r.filename}","${r.url}",${r.durable}`),
  ].join("\n");

  await markExported(id, "manifest", `${batch.name} (${rows.length} assets)`);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${batch.name.replace(/[^a-zA-Z0-9-]/g, "-")}-manifest.csv"`,
    },
  });
}
