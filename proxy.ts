import { NextResponse, type NextRequest } from "next/server";
import { authCookieName, isAuthConfigured, isPublicPath, verifyToken } from "@/lib/auth";

/**
 * Next 16 renamed Middleware to Proxy. Runs before every matched request.
 *
 * Optimistic check only, per the Next 16 proxy docs — pages still call
 * requireSession() so a forged or skipped proxy pass cannot expose data.
 *
 * When APP_PASSWORD/AUTH_SECRET are unset the gate is open, so local
 * development is not blocked by a half-configured auth setup. /setup reports
 * that state rather than letting it pass silently.
 */
export async function proxy(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const token = request.cookies.get(authCookieName())?.value;
  if (await verifyToken(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
