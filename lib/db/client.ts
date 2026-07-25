import "server-only";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";

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
  // Neon over HTTP: works where outbound TCP 5432 is blocked (sandboxes, some
  // CI) and is the better fit for serverless, where a per-request connection
  // is wasted anyway. postgres.js elsewhere.
  if (/\.neon\.tech/.test(url) && process.env.DB_DRIVER !== "tcp") {
    globalThis.__vergura_sql ??= neon(url) as unknown as ReturnType<typeof postgres>;
    return globalThis.__vergura_sql;
  }
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
