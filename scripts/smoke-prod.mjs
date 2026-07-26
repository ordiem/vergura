#!/usr/bin/env node
/*
 * Click-path smoke test against a deployed instance.
 *
 *   PROD_URL=https://... APP_PW=... npm run smoke:prod
 *
 * Signs in, creates a product, and confirms it persisted. That write path is
 * not covered by the unit tests and a green build will not catch a break in
 * it -- which is exactly how a driver swap once broke every write while every
 * page still rendered.
 *
 * Could not be run from the development sandbox: Chromium there cannot use
 * the egress proxy (ERR_CONNECTION_RESET while curl succeeds). Run it from a
 * machine with direct outbound access. Leaves a "Prod Write Check" product
 * behind -- delete it from /products afterwards.
 */
import { chromium } from "playwright";
import { execSync } from "node:child_process";
const exe = execSync("find /opt/pw-browsers -name chrome -type f | head -1").toString().trim();
const U = process.env.PROD_URL, PW = process.env.APP_PW;
const b = await chromium.launch({ executablePath: exe, proxy: { server: process.env.HTTPS_PROXY }, args: ["--ignore-certificate-errors"] });
const p = await b.newPage({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 2 });
const DIR = "/tmp/claude-0/-home-user-vergura/2fc2f042-d8c0-5339-91c2-309ff2c8986f/scratchpad/shots";

await p.goto(U + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.fill("#password", PW);
await p.click('button:has-text("Sign in")');
await p.waitForTimeout(3000);
console.log("after login, url =", new URL(p.url()).pathname);

// THE critical test: does a write persist in production?
await p.goto(U + "/products", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.fill("#pname", "Prod Write Check");
await p.fill("#pdesc", "verifying postgres.js writes work on Vercel");
await p.fill("#notes", "delete me");
await p.click('button:has-text("Save product")');
await p.waitForTimeout(4000);
await p.goto(U + "/products", { waitUntil: "domcontentloaded", timeout: 60000 });
const saved = (await p.textContent("body")).includes("Prod Write Check");
console.log("DB WRITE FROM DEPLOYED APP:", saved ? "OK" : "FAILED");
await p.screenshot({ path: `${DIR}/prod-products.png`, fullPage: true });

await p.goto(U + "/setup", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.screenshot({ path: `${DIR}/prod-setup.png`, fullPage: true });
await p.goto(U + "/rip", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.screenshot({ path: `${DIR}/prod-rip.png`, fullPage: true });
await b.close();
