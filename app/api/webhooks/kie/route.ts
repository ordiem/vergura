import { NextResponse } from "next/server";
import { extractUrls, isKieState, num, type KieState } from "@/lib/kie/parse";
import { applyTaskResult, findByTaskId } from "@/lib/db/queries";
import { isDbConfigured } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * KIE completion callback (the `callBackUrl` passed to createTask).
 *
 * The exact payload shape is not published, so this reads defensively and
 * falls back to whatever taskId it can find. Guarded by a shared secret in
 * the path query (?token=) since KIE does not sign callbacks.
 */
export async function POST(request: Request) {
  const secret = process.env.KIE_WEBHOOK_SECRET;
  if (secret) {
    const token = new URL(request.url).searchParams.get("token");
    if (token !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "database not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "invalid json" }, { status: 400 });

  const data = (body.data ?? body) as Record<string, unknown>;
  const taskId = String(data.taskId ?? data.task_id ?? "");
  if (!taskId) return NextResponse.json({ error: "missing taskId" }, { status: 400 });

  const gen = await findByTaskId(taskId);
  if (!gen) return NextResponse.json({ error: "unknown task" }, { status: 404 });

  const state: KieState = isKieState(data.state)
    ? data.state
    : data.failMsg || data.failCode
      ? "fail"
      : "success";

  await applyTaskResult(gen.id, {
    state,
    progress: state === "success" ? 100 : num(data.progress, 0),
    urls: extractUrls(data.resultJson ?? data.resultUrls ?? data),
    creditsConsumed: num(data.creditsConsumed, 0),
    costTimeMs: data.costTime == null ? null : num(data.costTime),
    failCode: data.failCode ? String(data.failCode) : null,
    failMsg: data.failMsg ? String(data.failMsg) : null,
    raw: data,
  });

  return NextResponse.json({ ok: true });
}
