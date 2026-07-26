#!/usr/bin/env node
/*
 * Seeds a product template from JSON.
 *
 *   npm run seed:product -- ./product.json
 *   cat product.json | npm run seed:product
 *
 * Plain parameterised SQL over Neon's HTTP endpoint, so it works where
 * outbound TCP 5432 is blocked. Deliberately does not use postgres.js
 * helpers — that mismatch is what broke writes once already.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";

const here = dirname(fileURLToPath(import.meta.url));
for (const f of [".env.local", ".env"]) {
  try {
    for (const l of (await readFile(join(here, "..", f), "utf8")).split("\n")) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
if (!process.env.DATABASE_URL) { console.error("✗ DATABASE_URL not set."); process.exit(1); }

const arg = process.argv[2];
const raw = arg ? await readFile(arg, "utf8") : await new Promise((res) => {
  let b = ""; process.stdin.on("data", (c) => (b += c)); process.stdin.on("end", () => res(b));
});

let input;
try { input = JSON.parse(raw); } catch (e) { console.error("✗ Invalid JSON:", e.message); process.exit(1); }
const products = Array.isArray(input) ? input : [input];

const sql = neon(process.env.DATABASE_URL);

for (const p of products) {
  if (!p.name?.trim()) { console.error("✗ Skipping entry with no name."); continue; }

  const images = (p.images ?? p.image_urls ?? []).filter((u) => /^https?:\/\//.test(u));

  const [row] = await sql.query(
    `insert into products (name, description, brand_notes, preset_id)
     values ($1, $2, $3, $4) returning id, name`,
    [p.name.trim(), p.description ?? "", p.brand_notes ?? p.brandNotes ?? "", p.preset_id ?? null]
  );

  for (const [i, url] of images.entries()) {
    await sql.query(
      `insert into product_images (product_id, url, caption, idx)
       values ($1, $2, $3, $4) on conflict (product_id, url) do nothing`,
      [row.id, url, "", i]
    );
  }
  console.log(`✓ ${row.name}  (${images.length} image${images.length === 1 ? "" : "s"})  ${row.id}`);
}

const [{ n }] = await sql.query(`select count(*)::int as n from products`);
console.log(`\n${n} product${n === 1 ? "" : "s"} now in the database.`);
