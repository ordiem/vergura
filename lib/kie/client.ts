import "server-only";
import { extractUrls, isKieState, num, type KieState } from "./parse";

export { extractUrls, type KieState };

/**
 * KIE adapter.
 *
 * Contract (docs.kie.ai):
 *   POST /api/v1/jobs/createTask  { model, input, callBackUrl? }
 *        -> { code, msg, data: { taskId } }        200 == task CREATED, not done
 *   GET  /api/v1/jobs/recordInfo?taskId=...
 *        -> { code, msg, data: { state, resultJson, failCode, failMsg,
 *                                costTime, creditsConsumed, progress, ... } }
 *   state ∈ waiting | queuing | generating | success | fail
 *
 * `resultJson` is a JSON *string* and its inner shape is not documented on any
 * model page, so extractUrls() below accepts every shape KIE is known to emit.
 * Verify against a live task before trusting it in production.
 */

export type KieTask = {
  taskId: string;
  state: KieState;
  progress: number;
  urls: string[];
  creditsConsumed: number;
  costTimeMs: number | null;
  failCode: string | null;
  failMsg: string | null;
  raw: unknown;
};

const BASE = process.env.KIE_BASE_URL ?? "https://api.kie.ai";

export const isKieConfigured = () => Boolean(process.env.KIE_API_KEY);
export const isMockDriver = () =>
  process.env.KIE_DRIVER === "mock" || !process.env.KIE_API_KEY;

function authHeaders() {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY is not set.");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function createTask(args: {
  model: string;
  input: Record<string, unknown>;
  callBackUrl?: string;
}): Promise<{ taskId: string }> {
  if (isMockDriver()) return mockCreate(args.model, args.input);

  const res = await fetch(`${BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      model: args.model,
      input: args.input,
      ...(args.callBackUrl ? { callBackUrl: args.callBackUrl } : {}),
    }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as
    | { code?: number; msg?: string; data?: { taskId?: string } }
    | null;

  if (!res.ok || !body || (body.code && body.code !== 200) || !body.data?.taskId) {
    throw new Error(
      `KIE createTask failed (HTTP ${res.status}): ${body?.msg ?? "no taskId returned"}`
    );
  }
  return { taskId: body.data.taskId };
}

export async function getTask(taskId: string): Promise<KieTask> {
  if (isMockDriver()) return mockGet(taskId);

  const res = await fetch(
    `${BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    { headers: authHeaders(), cache: "no-store" }
  );
  const body = (await res.json().catch(() => null)) as
    | { code?: number; msg?: string; data?: Record<string, unknown> }
    | null;

  if (!res.ok || !body?.data) {
    throw new Error(`KIE recordInfo failed (HTTP ${res.status}): ${body?.msg ?? "no data"}`);
  }
  const d = body.data;
  const state: KieState = isKieState(d.state) ? d.state : "waiting";
  const urls = extractUrls(d.resultJson);

  return {
    taskId: String(d.taskId ?? taskId),
    state,
    progress: Math.max(0, Math.min(100, num(d.progress, state === "success" ? 100 : 0))),
    urls,
    creditsConsumed: num(d.creditsConsumed, 0),
    costTimeMs: d.costTime == null ? null : num(d.costTime, 0),
    failCode: d.failCode ? String(d.failCode) : null,
    failMsg: d.failMsg ? String(d.failMsg) : null,
    raw: d,
  };
}

/* ------------------------------------------------------------------ *
 * Mock driver — lets the whole platform run before a key exists.
 * Deterministic from taskId: waiting -> generating -> success over ~12s.
 * ------------------------------------------------------------------ */

const MOCK_MS = 12_000;

function mockCreate(model: string, input: Record<string, unknown>) {
  const n = Math.max(1, Math.min(6, num(input.max_images, 1)));
  const seed = Math.abs(hash(`${model}:${JSON.stringify(input)}:${Date.now()}`));
  return Promise.resolve({ taskId: `mock_${seed.toString(36)}_${n}_${Date.now()}` });
}

function mockGet(taskId: string): Promise<KieTask> {
  const parts = taskId.split("_");
  const count = Number(parts[2]) || 1;
  const startedAt = Number(parts[3]) || Date.now();
  const elapsed = Date.now() - startedAt;
  const pct = Math.max(0, Math.min(100, Math.round((elapsed / MOCK_MS) * 100)));

  let state: KieState = "generating";
  if (elapsed < MOCK_MS * 0.15) state = "queuing";
  if (elapsed >= MOCK_MS) state = "success";

  const urls =
    state === "success"
      ? Array.from(
          { length: count },
          (_, i) =>
            `https://picsum.photos/seed/${encodeURIComponent(taskId)}${i}/1024/1024`
        )
      : [];

  return Promise.resolve({
    taskId,
    state,
    progress: state === "success" ? 100 : pct,
    urls,
    creditsConsumed: state === "success" ? count : 0,
    costTimeMs: state === "success" ? elapsed : null,
    failCode: null,
    failMsg: null,
    raw: { mock: true, state, elapsed },
  });
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
