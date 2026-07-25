import { NextResponse } from "next/server";
import { refreshPending } from "@/lib/domain/submit";
import { listGenerations } from "@/lib/db/queries";
import { isDbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * Drives the live job queue: sweeps in-flight tasks against KIE, then returns
 * a compact status list the client diffs against what it is showing.
 */
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "database not configured" }, { status: 503 });
  }
  try {
    const swept = await refreshPending();
    const rows = await listGenerations({ limit: 60 });
    return NextResponse.json({
      swept,
      generations: rows.map((g) => ({
        id: g.id,
        state: g.state,
        progress: g.progress,
        review: g.review,
        credits: Number(g.credits_consumed),
        failMsg: g.fail_msg,
        assets: g.assets.map((a) => a.url),
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "poll failed" },
      { status: 500 }
    );
  }
}
