import "server-only";
import { num } from "@/lib/kie/parse";

/**
 * Claude via KIE's Market job API.
 *
 * Verified request shape (probed against a live key):
 *   POST /api/v1/jobs/createTask
 *   { "model": "<slug>", "input": { "model": "<slug>", "messages": [...] } }
 *
 * The nested `input.model` is required — omitting it returns 422
 * "The model is empty" rather than a useful message.
 *
 * Error grammar observed, which lets us tell three cases apart:
 *   "The model name you specified is not supported" -> slug does not exist
 *   "The model is empty"                            -> input.model missing
 *   401 "not authorized to use this model"          -> exists, key not entitled
 *
 * UNVERIFIED: image input. The key used for development is not entitled to
 * Claude on KIE, so the multimodal content shape below could not be exercised.
 * OpenAI-style `image_url` parts are the most likely accepted form for an
 * OpenAI-compatible aggregator; verify with `npm run kie:claude-probe` before
 * trusting it. If it is wrong, only buildContent() below needs to change.
 */

const BASE = process.env.KIE_BASE_URL ?? "https://api.kie.ai";
const POLL_MS = 3000;
const TIMEOUT_MS = 180_000;

export const KIE_ANALYSIS_MODEL = process.env.KIE_ANALYSIS_MODEL ?? "claude-sonnet-5";

export class KieAuthError extends Error {}
export class KieAnalysisError extends Error {}

function headers() {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new KieAnalysisError("KIE_API_KEY is not set.");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

/** OpenAI-compatible multimodal content. See the UNVERIFIED note above. */
function buildContent(text: string, imageUrls: string[]) {
  if (imageUrls.length === 0) return text;
  return [
    ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
    { type: "text", text },
  ];
}

/** Pulls assistant text out of whatever envelope KIE returns. */
function extractText(resultJson: unknown): string {
  let parsed: unknown = resultJson;
  if (typeof parsed === "string") {
    const s = parsed.trim();
    if (!s) return "";
    try {
      parsed = JSON.parse(s);
    } catch {
      return s; // plain text result
    }
  }

  const out: string[] = [];
  const visit = (node: unknown, depth = 0): void => {
    if (depth > 6 || node == null) return;
    if (typeof node === "string") return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }
    if (typeof node === "object") {
      const o = node as Record<string, unknown>;
      // OpenAI shape: choices[].message.content
      if (typeof o.content === "string" && o.content.trim()) out.push(o.content);
      // Anthropic shape: content[].text
      if (typeof o.text === "string" && o.text.trim()) out.push(o.text);
      for (const v of Object.values(o)) visit(v, depth + 1);
    }
  };
  visit(parsed);
  return out.join("\n").trim();
}

/**
 * Runs one Claude turn through KIE and returns the assistant text.
 * Async by nature: KIE returns a taskId, so this polls to completion.
 */
export async function kieChat(args: {
  prompt: string;
  imageUrls?: string[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const model = args.model ?? KIE_ANALYSIS_MODEL;

  const createRes = await fetch(`${BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({
      model,
      input: {
        model, // required — see module note
        messages: [
          { role: "user", content: buildContent(args.prompt, args.imageUrls ?? []) },
        ],
        max_tokens: args.maxTokens ?? 8000,
      },
    }),
  });

  const created = (await createRes.json().catch(() => null)) as
    | { code?: number; msg?: string; data?: { taskId?: string } }
    | null;

  if (created?.code === 401) {
    throw new KieAuthError(
      `KIE key is not authorized for "${model}". Enable Claude models on the key at ` +
        `https://kie.ai/api-key (same restriction that blocks seedream-v4), or set ` +
        `ANTHROPIC_API_KEY to route analysis directly instead.`
    );
  }
  const taskId = created?.data?.taskId;
  if (!createRes.ok || !taskId) {
    throw new KieAnalysisError(
      `KIE createTask failed (HTTP ${createRes.status}): ${created?.msg ?? "no taskId"}`
    );
  }

  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_MS));

    const res = await fetch(
      `${BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: headers(), cache: "no-store" }
    );
    const body = (await res.json().catch(() => null)) as
      | { data?: Record<string, unknown> }
      | null;
    const d = body?.data;
    if (!d) continue;

    if (d.state === "fail") {
      throw new KieAnalysisError(
        `KIE analysis failed: ${d.failMsg ?? d.failCode ?? "no message"}`
      );
    }
    if (d.state === "success") {
      const text = extractText(d.resultJson);
      if (!text) {
        throw new KieAnalysisError(
          `KIE returned no assistant text. Raw resultJson: ${String(d.resultJson).slice(0, 300)}`
        );
      }
      return text;
    }
  }
  throw new KieAnalysisError(`KIE analysis timed out after ${TIMEOUT_MS / 1000}s.`);
}

/** Credits consumed, for the same budget accounting the image path uses. */
export const kieCredits = (d: Record<string, unknown>) => num(d.creditsConsumed, 0);
