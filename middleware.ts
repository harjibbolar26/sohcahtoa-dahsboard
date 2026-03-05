import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, REFRESH_COOKIE, decodeToken } from "@/lib/auth";

/**
 * Middleware for route protection.
 *
 * This middleware runs on the Edge Runtime and:
 * 1. Protects /dashboard/** routes
 * 2. Checks for the presence of auth cookies
 * 3. Validates token expiry
 * 4. Redirects to /login if not authenticated
 *
 * Edge Runtime Limitations:
 * - Cannot access Node.js APIs
 * - No file system access
 * - Limited to 30 seconds execution
 * - crypto is available for generating CSRF tokens
 *
 * Session Persistence Strategy:
 * - If access token is expired BUT refresh token exists, we allow the request through
 * - Client-side code (authStore.initFromCookie) will detect expired token and trigger refresh
 * - This prevents unwanted logouts on page refresh when session is still valid
 */

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect /dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Check for refresh token first
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const accessToken = request.cookies.get(AUTH_COOKIE)?.value;

  // If refresh token exists, always allow through
  // Client-side will handle token refresh if access token is expired
  if (refreshToken) {
    // Validate refresh token structure
    const refreshDecoded = decodeToken(refreshToken);
    if (refreshDecoded && refreshDecoded.type === "refresh") {
      // Check if refresh token is expired
      if (Date.now() <= refreshDecoded.exp) {
        // Refresh token is valid, allow request
        // Client will refresh access token if needed
        return NextResponse.next();
      }
    }
  }

  // No valid refresh token, check access token
  if (!accessToken) {
    // No tokens at all — redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate access token structure
  const decoded = decodeToken(accessToken);
  if (!decoded) {
    // Invalid access token and no refresh token — redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("error", "invalid_token");
    return NextResponse.redirect(loginUrl);
  }

  // Access token expired and no refresh token — redirect to login
  if (Date.now() > decoded.exp) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("expired", "true");
    return NextResponse.redirect(loginUrl);
  }

  // Access token valid — allow request
  return NextResponse.next();
}

export const config = {
  // Protect dashboard routes
  matcher: ["/dashboard/:path*"],
};
