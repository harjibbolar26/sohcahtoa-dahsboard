import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/**
 * Proxy runs on the Edge runtime.
 *
 * Limitations of Proxy (Edge Runtime):
 * - Cannot use Node.js APIs (fs, crypto.createHash, etc.)
 * - Cannot access databases directly
 * - Limited to Web standard APIs (fetch, Request, Response, Headers, etc.)
 * - Cannot use most npm packages that depend on Node.js APIs
 * - 1MB size limit for Edge functions on some platforms
 * - Cannot modify the response body (only headers and redirect/rewrite)
 *
 * What proxy CAN do:
 * - Read/write cookies
 * - Read request headers
 * - Redirect or rewrite requests
 * - Set response headers
 * - Return early with a response (e.g., 401)
 *
 * For this app, proxy:
 * - Checks for the presence of an auth cookie
 * - Performs basic token expiry validation (base64 decode is available on Edge)
 * - Redirects unauthenticated users to /login
 * - Lets authenticated users through to dashboard routes
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Simulate token expiry check
  // On Edge runtime, we can use atob() to decode our base64 tokens
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp && Date.now() > decoded.exp) {
      // Token expired — try to let the refresh flow handle it
      // We don't clear cookies here because the refresh might succeed
      // Instead, we allow the request through and let the API return 401
      // which triggers the client-side refresh flow

      // However, for page navigations (not API calls), redirect to login
      // to avoid rendering a flash of dashboard before redirect
      if (!pathname.startsWith("/api/")) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("expired", "true");
        loginUrl.searchParams.set("callbackUrl", pathname);

        // Clear the expired token
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
        return response;
      }
    }
  } catch {
    // Token is malformed — redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
