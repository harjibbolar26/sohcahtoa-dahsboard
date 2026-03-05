import { NextRequest, NextResponse } from "next/server";
import {
  decodeToken,
  getUserFromToken,
  generateAccessToken,
  generateCsrfToken,
  AUTH_COOKIE,
  REFRESH_COOKIE,
  CSRF_COOKIE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token provided", code: "NO_TOKEN", status: 401 },
        { status: 401 },
      );
    }

    // Decode and validate refresh token
    const decoded = decodeToken(refreshToken);
    if (!decoded || decoded.type !== "refresh") {
      return NextResponse.json(
        {
          message: "Invalid refresh token",
          code: "INVALID_TOKEN",
          status: 401,
        },
        { status: 401 },
      );
    }

    // Check expiry
    if (Date.now() > decoded.exp) {
      // Clear all cookies on expired refresh token
      const response = NextResponse.json(
        {
          message: "Refresh token expired",
          code: "TOKEN_EXPIRED",
          status: 401,
        },
        { status: 401 },
      );
      response.cookies.delete(AUTH_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }

    // Get user from token
    const user = getUserFromToken(refreshToken);
    if (!user) {
      return NextResponse.json(
        { message: "User not found", code: "USER_NOT_FOUND", status: 401 },
        { status: 401 },
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    const csrfToken = generateCsrfToken();

    const response = NextResponse.json(
      {
        accessToken: newAccessToken,
        expiresIn: 900,
      },
      { status: 200 },
    );

    // Update access token cookie
    response.cookies.set(AUTH_COOKIE, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 900,
    });

    // Update CSRF token
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 900,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR", status: 500 },
      { status: 500 },
    );
  }
}
