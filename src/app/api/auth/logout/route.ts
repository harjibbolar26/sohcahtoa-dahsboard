import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  REFRESH_COOKIE,
  USER_COOKIE,
  CSRF_COOKIE,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 },
  );

  // Clear all auth cookies
  response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(USER_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(CSRF_COOKIE, "", { maxAge: 0, path: "/" });

  return response;
}
