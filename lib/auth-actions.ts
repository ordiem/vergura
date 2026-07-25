"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authCookieName,
  authMaxAge,
  isAuthConfigured,
  issueToken,
  passwordMatches,
  verifyToken,
} from "./auth";
import type { ActionState } from "./actions";

export async function loginAction(_p: ActionState, form: FormData): Promise<ActionState> {
  if (!isAuthConfigured()) {
    return { ok: false, message: "Auth is not configured on this deployment." };
  }

  const submitted = String(form.get("password") ?? "");
  if (!passwordMatches(submitted)) {
    // Deliberately vague, and no timing signal beyond the constant-time compare.
    return { ok: false, message: "Incorrect password." };
  }

  const jar = await cookies();
  jar.set(authCookieName(), await issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authMaxAge(),
  });

  // Only ever redirect to a same-site path, so ?next= cannot be used as an
  // open redirect to an attacker-controlled host.
  const raw = String(form.get("next") ?? "/");
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  redirect(next);
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(authCookieName());
  redirect("/login");
}

/**
 * Real enforcement. The proxy check is optimistic per the Next 16 docs, so
 * server components call this before rendering anything sensitive.
 */
export async function requireSession() {
  if (!isAuthConfigured()) return; // gate open until configured
  const jar = await cookies();
  const ok = await verifyToken(jar.get(authCookieName())?.value);
  if (!ok) redirect("/login");
}
