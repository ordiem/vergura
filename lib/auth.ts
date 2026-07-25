/**
 * Shared-password gate.
 *
 * The control layer (locked presets, approval gates, budgets) is enforced
 * against whoever is using the app — so with no auth it is enforced against
 * nobody. This closes that: one password, an HMAC-signed cookie, no user
 * table.
 *
 * Web Crypto only, so the same code runs in the proxy (edge) and on the
 * server. Per the Next 16 proxy docs, the proxy check is optimistic — real
 * enforcement is requireSession() in server components.
 */

const COOKIE = "vergura_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const authCookieName = () => COOKIE;
export const authMaxAge = () => MAX_AGE;

export const isAuthConfigured = () =>
  Boolean(process.env.APP_PASSWORD && process.env.AUTH_SECRET);

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(s);
}

async function hmac(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    secret(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Token is `<expiry>.<hmac>` — no identity, just proof of the password. */
export async function issueToken() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${await hmac(exp)}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;

  const expiry = Number(exp);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const expected = await hmac(exp);
  // Constant-time compare — a length check first, then bitwise accumulate.
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

/** Compares the submitted password without leaking length via early exit. */
export function passwordMatches(submitted: string) {
  const actual = process.env.APP_PASSWORD ?? "";
  if (!actual) return false;
  if (submitted.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= submitted.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return diff === 0;
}

/** Paths reachable without a session. */
export function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/webhooks/") || // KIE callbacks carry their own secret
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}
