import "server-only";
import postgres from "postgres";

declare global {
  var __vergura_sql: ReturnType<typeof postgres> | undefined;
}

/**
 * Returns null when DATABASE_URL is unset, so the UI can render a setup
 * screen instead of crashing. Every caller must handle null.
 */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // Reuse across hot reloads in dev to avoid exhausting connections.
  // postgres.js only. Neon's HTTP driver was tried here and reverted: it does
  // not implement postgres.js's dynamic helpers -- sql({...}) inserts,
  // conditional sql`` fragments, sql.begin() transactions -- all of which the
  // query layer depends on. Reads still worked, so every page rendered while
  // every write silently failed. Do not reintroduce it without rewriting
  // lib/db/queries.ts and lib/db/rip-queries.ts to plain parameterised SQL.
  globalThis.__vergura_sql ??= postgres(url, {
    max: 10,
    idle_timeout: 20,
    prepare: false, // pgbouncer/Supabase transaction-pooling safe
  });
  return globalThis.__vergura_sql;
}

export function requireDb() {
  const sql = db();
  if (!sql) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local, then run `npm run db:migrate`."
    );
  }
  return sql;
}

export const isDbConfigured = () => Boolean(process.env.DATABASE_URL);
