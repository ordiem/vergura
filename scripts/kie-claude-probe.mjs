#!/usr/bin/env node
/*
 * Tells you exactly where the KIE Claude route stands.
 *
 *   npm run kie:claude-probe            # text only
 *   npm run kie:claude-probe <image-url>  # also tests vision
 *
 * Distinguishes the three cases the API's error grammar exposes:
 *   not supported  -> slug does not exist
 *   model is empty -> slug exists, request shape wrong
 *   401            -> slug exists, key not entitled  <-- current state
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
for (const f of [".env.local", ".env"]) {
  try {
    for (const line of (await readFile(join(here, "..", f), "utf8")).split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const KEY = process.env.KIE_API_KEY;
if (!KEY) {
  console.error("✗ KIE_API_KEY is not set.");
  process.exit(1);
}
const BASE = process.env.KIE_BASE_URL ?? "https://api.kie.ai";
const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const imageUrl = process.argv[2];

const MODELS = [
  "claude-sonnet-5",
  "claude-opus-4-8",
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
];

function classify(code, msg) {
  if (code === 401) return ["NOT ENTITLED", "exists — enable Claude on this key at kie.ai/api-key"];
  if (/record is null/i.test(msg))
    return ["KIE-SIDE FAULT", "entitled, but KIE fails the job regardless of payload — report to KIE support"];
  if (/not supported/i.test(msg)) return ["NO SUCH SLUG", "this model id is not on KIE"];
  if (/model is empty/i.test(msg)) return ["SHAPE ERROR", "slug exists; input.model missing"];
  return ["OTHER", msg];
}

async function settle(taskId) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const r = await fetch(`${BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers });
    const d = (await r.json().catch(() => ({})))?.data;
    if (d?.state === "success" || d?.state === "fail") return d;
  }
  return { state: "fail", failMsg: "timed out" };
}

console.log(`\nProbing Claude on KIE  (${BASE})  — creates a task per model and waits for it to settle\n`);
let usable = null;

for (const model of MODELS) {
  const res = await fetch(`${BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input: { model, messages: [{ role: "user", content: "Reply with exactly: ok" }], max_tokens: 20 },
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (body?.data?.taskId) {
    // Creation succeeding is not enough — Claude on KIE has been observed
    // accepting a task and then failing it with 422 "record is null".
    const outcome = await settle(body.data.taskId);
    if (outcome.state === "success") {
      console.log(`  ✓ ${model.padEnd(20)} WORKING    taskId=${body.data.taskId}`);
      usable ??= model;
    } else {
      const [tag, note] = classify(Number(outcome.failCode), String(outcome.failMsg ?? ""));
      console.log(`  ✗ ${model.padEnd(20)} ${tag.padEnd(15)} ${note}`);
    }
    continue;
  }
  const [tag, note] = classify(body?.code, body?.msg ?? "");
  console.log(`  ✗ ${model.padEnd(20)} ${tag.padEnd(13)} ${note}`);
}

if (!usable) {
  console.log(
    "\nNo Claude model is usable on this key yet." +
      "\nEnable Claude models for the key at https://kie.ai/api-key, then re-run." +
      "\nUntil then set ANALYSIS_DRIVER=mock, or ANTHROPIC_API_KEY to route directly.\n"
  );
  process.exit(1);
}

console.log(`\n✓ Usable model: ${usable}`);
console.log("  Set:  ANALYSIS_DRIVER=kie");
console.log(`        KIE_ANALYSIS_MODEL=${usable}\n`);

if (!imageUrl) {
  console.log("Pass an image URL to also test vision:  npm run kie:claude-probe <url>\n");
  process.exit(0);
}

// Vision — the one part of the integration that could not be verified offline.
console.log(`Testing vision with ${imageUrl}`);
const res = await fetch(`${BASE}/api/v1/jobs/createTask`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    model: usable,
    input: {
      model: usable,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: "In one sentence, what is in this image?" },
          ],
        },
      ],
      max_tokens: 200,
    },
  }),
});
const created = await res.json().catch(() => ({}));
const taskId = created?.data?.taskId;
if (!taskId) {
  console.error(`✗ Vision request rejected: ${created?.msg ?? res.status}`);
  console.error("  The multimodal content shape in lib/analysis/kie-chat.ts needs adjusting.");
  process.exit(1);
}

const deadline = Date.now() + 180_000;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 4000));
  const r = await fetch(`${BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers });
  const d = (await r.json().catch(() => ({})))?.data;
  if (!d) continue;
  if (d.state === "fail") {
    console.error(`✗ Vision failed: ${d.failMsg ?? d.failCode}`);
    process.exit(1);
  }
  if (d.state === "success") {
    console.log("\n--- resultJson ---");
    console.log(d.resultJson);
    console.log(`\ncredits: ${d.creditsConsumed}`);
    console.log("\n✓ Vision works. Confirm extractText() parses the shape above.\n");
    process.exit(0);
  }
}
console.error("✗ Timed out.");
process.exit(1);
