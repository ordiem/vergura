#!/usr/bin/env node
/*
 * Applies the schema over Neon's HTTP SQL endpoint.
 *
 * Same files and order as db:migrate. Use this where outbound TCP 5432 is
 * blocked (sandboxes, some CI runners) but HTTPS is allowed. Postgres-wire
 * `npm run db:migrate` remains the normal path.
 */
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";

const here = dirname(fileURLToPath(import.meta.url));
for (const f of [".env.local", ".env"]) {
  try {
    for (const line of (await readFile(join(here, "..", f), "utf8")).split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const url = process.env.DATABASE_URL;
if (!url) { console.error("✗ DATABASE_URL is not set."); process.exit(1); }

/** Splits on semicolons at top level, leaving $$-quoted bodies intact. */
function statements(sql) {
  const out = [];
  let buf = "", i = 0, dollar = null;
  while (i < sql.length) {
    if (!dollar) {
      const m = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
      if (m) { dollar = m[0]; buf += m[0]; i += m[0].length; continue; }
      if (sql[i] === "-" && sql[i + 1] === "-") {
        const nl = sql.indexOf("\n", i);
        i = nl === -1 ? sql.length : nl; continue;
      }
      if (sql[i] === ";") { if (buf.trim()) out.push(buf.trim()); buf = ""; i++; continue; }
    } else if (sql.startsWith(dollar, i)) {
      buf += dollar; i += dollar.length; dollar = null; continue;
    }
    buf += sql[i++];
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

const sql = neon(url);
const dbDir = join(here, "..", "lib", "db");
const files = (await readdir(dbDir)).filter((f) => f.endsWith(".sql"))
  .sort((a, b) => (a === "schema.sql" ? -1 : b === "schema.sql" ? 1 : a.localeCompare(b)));

const EXPECTED = ["brand_presets","campaigns","generations","generation_assets",
  "refs","products","product_images","rips","concepts","batches","batch_items"];

try {
  for (const f of files) {
    const stmts = statements(await readFile(join(dbDir, f), "utf8"));
    for (const s of stmts) await sql.query(s);
    console.log(`  applied ${f} (${stmts.length} statements)`);
  }
  const rows = await sql.query(
    `select table_name from information_schema.tables
     where table_schema='public' and table_name = any($1)`, [EXPECTED]);
  const have = rows.map((r) => r.table_name);
  const missing = EXPECTED.filter((t) => !have.includes(t));
  if (missing.length) throw new Error(`missing tables: ${missing.join(", ")}`);
  console.log(`✓ Schema applied over HTTP — ${EXPECTED.length} tables ready.`);
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exitCode = 1;
}
