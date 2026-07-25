#!/usr/bin/env node
/*
 * Session-token and password checks. No server, no network.
 *   npm run test:auth
 */
import assert from "node:assert/strict";

process.env.AUTH_SECRET = "test-secret-0123456789";
process.env.APP_PASSWORD = "correct horse battery staple";

const { issueToken, verifyToken, passwordMatches, isPublicPath } =
  await import("../lib/auth.ts");

let passed = 0;
const test = async (name, fn) => {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1; }
};

console.log("\nsession tokens");

await test("a freshly issued token verifies", async () => {
  assert.equal(await verifyToken(await issueToken()), true);
});

await test("a forged signature is rejected", async () => {
  const [exp] = (await issueToken()).split(".");
  assert.equal(await verifyToken(`${exp}.forgedsignature`), false);
});

await test("a tampered expiry invalidates the signature", async () => {
  const [, sig] = (await issueToken()).split(".");
  assert.equal(await verifyToken(`${Date.now() + 9e9}.${sig}`), false);
});

await test("an expired but correctly signed token is rejected", async () => {
  // Sign a past expiry with the real secret — signature valid, time is not.
  const exp = String(Date.now() - 1000);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(process.env.AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(exp));
  const sig = btoa(String.fromCharCode(...new Uint8Array(s)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  assert.equal(await verifyToken(`${exp}.${sig}`), false);
});

await test("a token signed with a different secret is rejected", async () => {
  const token = await issueToken();
  process.env.AUTH_SECRET = "a-completely-different-secret";
  assert.equal(await verifyToken(token), false);
  process.env.AUTH_SECRET = "test-secret-0123456789";
});

await test("missing and malformed tokens are rejected", async () => {
  for (const t of [undefined, "", "nodot", ".", "abc.def"]) {
    assert.equal(await verifyToken(t), false, `accepted ${JSON.stringify(t)}`);
  }
});

console.log("\npassword");

await test("the correct password matches", () => {
  assert.equal(passwordMatches("correct horse battery staple"), true);
});

await test("wrong passwords, prefixes and case variants do not", () => {
  for (const p of ["wrong", "correct horse battery stapl", "correct horse battery staple ",
                   "CORRECT HORSE BATTERY STAPLE", ""]) {
    assert.equal(passwordMatches(p), false, `accepted ${JSON.stringify(p)}`);
  }
});

await test("no password configured rejects everything, including empty", () => {
  const keep = process.env.APP_PASSWORD;
  delete process.env.APP_PASSWORD;
  assert.equal(passwordMatches(""), false);
  assert.equal(passwordMatches("anything"), false);
  process.env.APP_PASSWORD = keep;
});

console.log("\npublic paths");

await test("only login, webhooks and static assets are public", () => {
  for (const p of ["/login", "/api/webhooks/kie", "/_next/static/x.js", "/favicon.ico"]) {
    assert.equal(isPublicPath(p), true, `${p} should be public`);
  }
  for (const p of ["/", "/rip", "/batches", "/api/upload", "/setup", "/api/generations/poll"]) {
    assert.equal(isPublicPath(p), false, `${p} must NOT be public`);
  }
});

console.log(`\n${passed} passed${process.exitCode ? " — WITH FAILURES" : ""}\n`);
