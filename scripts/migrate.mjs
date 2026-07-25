#!/usr/bin/env node
/* Applies lib/db/schema.sql. Idempotent — safe to re-run. */
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

const here = dirname(fileURLToPath(import.meta.url));

// Minimal .env.local loader so `npm run db:migrate` works without extra deps.
for (const file of [".env.local", ".env"]) {
  try {
    const text = await readFile(join(here, "..", file), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const [, k, v] = m;
      if (!process.env[k]) process.env[k] = v.replace(/^["']|["']$/g, "");
    }
  } catch {
    /* optional */
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

// Applied in filename order: schema.sql first, then schema-0NN-*.sql.
const dbDir = join(here, "..", "lib", "db");
const files = (await readdir(dbDir))
  .filter((f) => f.endsWith(".sql"))
  .sort((a, b) => (a === "schema.sql" ? -1 : b === "schema.sql" ? 1 : a.localeCompare(b)));

const sql = postgres(url, { max: 1, onnotice: () => {} });

const EXPECTED = [
  "brand_presets", "campaigns", "generations", "generation_assets",
  "refs", "products", "product_images", "rips", "concepts", "batches", "batch_items",
];

try {
  for (const f of files) {
    await sql.unsafe(await readFile(join(dbDir, f), "utf8"));
    console.log(`  applied ${f}`);
  }
  const found = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_name in ${sql(EXPECTED)}
  `;
  const missing = EXPECTED.filter((t) => !found.some((r) => r.table_name === t));
  if (missing.length) throw new Error(`missing tables: ${missing.join(", ")}`);
  console.log(`✓ Schema applied — ${EXPECTED.length} tables ready.`);
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
