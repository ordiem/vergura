#!/usr/bin/env node
/*
 * Live end-to-end check against the real KIE API.
 * Submits one cheap 1K image, polls to completion, prints the result shape.
 *
 *   npm run kie:smoke
 *
 * This SPENDS a small amount of credits. It also prints the raw resultJson,
 * which is the one part of the contract the docs do not specify — use the
 * output to confirm lib/kie/client.ts#extractUrls parses it correctly.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
for (const file of [".env.local", ".env"]) {
  try {
    const text = await readFile(join(here, "..", file), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* optional */
  }
}

const KEY = process.env.KIE_API_KEY;
if (!KEY) {
  console.error("✗ KIE_API_KEY is not set. Add it to .env.local first.");
  process.exit(1);
}
const BASE = process.env.KIE_BASE_URL ?? "https://api.kie.ai";
const headers = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const model = process.argv[2] ?? "bytedance/seedream-v4-text-to-image";
const input = {
  prompt: "a single matte black ceramic cup on a light grey seamless studio backdrop, soft key light, product photography",
  image_size: "square",
  image_resolution: "1K",
  max_images: 1,
};

console.log(`→ createTask  model=${model}`);
const createRes = await fetch(`${BASE}/api/v1/jobs/createTask`, {
  method: "POST",
  headers,
  body: JSON.stringify({ model, input }),
});
const created = await createRes.json().catch(() => null);
console.log(`  HTTP ${createRes.status}`, JSON.stringify(created));

const taskId = created?.data?.taskId;
if (!createRes.ok || !taskId) {
  console.error("✗ No taskId returned — check the key, the model slug, and your credit balance.");
  process.exit(1);
}
console.log(`✓ taskId = ${taskId}`);

const deadline = Date.now() + 5 * 60_000;
let last = "";
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 5000));
  const res = await fetch(`${BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
    headers,
  });
  const body = await res.json().catch(() => null);
  const d = body?.data;
  if (!d) {
    console.log(`  HTTP ${res.status} — no data`);
    continue;
  }
  if (d.state !== last) {
    console.log(`  state=${d.state} progress=${d.progress ?? "-"} credits=${d.creditsConsumed ?? "-"}`);
    last = d.state;
  }
  if (d.state === "success" || d.state === "fail") {
    console.log("\n--- raw data ---");
    console.log(JSON.stringify(d, null, 2));
    console.log("\n--- resultJson (raw string) ---");
    console.log(d.resultJson);
    try {
      console.log("\n--- resultJson (parsed) ---");
      console.log(JSON.stringify(JSON.parse(d.resultJson), null, 2));
    } catch {
      console.log("(not valid JSON)");
    }
    process.exit(d.state === "success" ? 0 : 1);
  }
}
console.error("✗ Timed out after 5 minutes.");
process.exit(1);
