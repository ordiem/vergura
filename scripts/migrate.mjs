#!/usr/bin/env node
/* Applies lib/db/schema.sql. Idempotent — safe to re-run. */
import { readFile } from "node:fs/promises";
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

const schema = await readFile(join(here, "..", "lib", "db", "schema.sql"), "utf8");
const sql = postgres(url, { max: 1, onnotice: () => {} });

try {
  await sql.unsafe(schema);
  const [{ count }] = await sql`
    select count(*)::int as count
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('brand_presets','campaigns','generations','generation_assets')
  `;
  if (count !== 4) throw new Error(`expected 4 tables, found ${count}`);
  console.log("✓ Schema applied — brand_presets, campaigns, generations, generation_assets.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
