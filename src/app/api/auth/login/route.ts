import { NextRequest, NextResponse } from "next/server";
import {
  validateCredentials,
  buildAuthResponse,
  generateCsrfToken,
  AUTH_COOKIE,
  REFRESH_COOKIE,
  USER_COOKIE,
  CSRF_COOKIE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
          code: "VALIDATION_ERROR",
          status: 400,
        },
        { status: 400 },
      );
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          message: "Invalid input types",
          code: "VALIDATION_ERROR",
          status: 400,
        },
        { status: 400 },
      );
    }

    // Validate credentials
    const user = validateCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
          status: 401,
        },
        { status: 401 },
      );
    }

    // Build auth response
    const authResponse = buildAuthResponse(user);
    const csrfToken = generateCsrfToken();

    // Create response with httpOnly cookies
    const response = NextResponse.json(authResponse, { status: 200 });

    // Set httpOnly, Secure, SameSite=Strict cookies
    // This prevents:
    // - XSS from accessing tokens (httpOnly)
    // - CSRF attacks (SameSite=Strict)
    // - Token theft via network interception (Secure in production)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };

    response.cookies.set(AUTH_COOKIE, authResponse.accessToken, {
      ...cookieOptions,
      maxAge: authResponse.expiresIn,
    });

    response.cookies.set(REFRESH_COOKIE, authResponse.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // User info cookie (non-httpOnly for client display, no sensitive data)
    response.cookies.set(
      USER_COOKIE,
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      },
    );

    // CSRF token cookie (readable by client JS to include in headers)
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: authResponse.expiresIn,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR", status: 500 },
      { status: 500 },
    );
  }
}
