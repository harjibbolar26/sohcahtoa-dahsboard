import { NextRequest, NextResponse } from "next/server";
import { mockTransactions } from "@/lib/mock-data";
import { TransactionUpdate } from "@/types";
import { AUTH_COOKIE, CSRF_COOKIE, decodeToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized", code: "UNAUTHORIZED", status: 401 },
      { status: 401 },
    );
  }

  const transaction = mockTransactions.find((t) => t.id === id);
  if (!transaction) {
    return NextResponse.json(
      { message: "Transaction not found", code: "NOT_FOUND", status: 404 },
      { status: 404 },
    );
  }

  return NextResponse.json(transaction);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate auth
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", code: "UNAUTHORIZED", status: 401 },
        { status: 401 },
      );
    }

    const decoded = decodeToken(token);
    if (!decoded || Date.now() > decoded.exp) {
      return NextResponse.json(
        { message: "Token expired", code: "TOKEN_EXPIRED", status: 401 },
        { status: 401 },
      );
    }

    // CSRF check for mutations
    const csrfHeader = request.headers.get("x-csrf-token");
    const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value;
    if (!csrfHeader || csrfHeader !== csrfCookie) {
      return NextResponse.json(
        { message: "Invalid CSRF token", code: "CSRF_ERROR", status: 403 },
        { status: 403 },
      );
    }

    const body: TransactionUpdate = await request.json();

    // Find transaction
    const txIndex = mockTransactions.findIndex((t) => t.id === id);
    if (txIndex === -1) {
      return NextResponse.json(
        { message: "Transaction not found", code: "NOT_FOUND", status: 404 },
        { status: 404 },
      );
    }

    // Role-based access: only admin can flag
    if (body.status === "flagged") {
      if (decoded.role !== "admin") {
        return NextResponse.json(
          {
            message: "Only admins can flag transactions",
            code: "FORBIDDEN",
            status: 403,
          },
          { status: 403 },
        );
      }
      mockTransactions[txIndex] = {
        ...mockTransactions[txIndex],
        status: "flagged",
        flaggedBy: decoded.sub,
        flaggedAt: new Date().toISOString(),
      };
    }

    // Add note
    if (body.note) {
      if (typeof body.note !== "string" || body.note.length > 500) {
        return NextResponse.json(
          {
            message: "Note must be a string under 500 characters",
            code: "VALIDATION_ERROR",
            status: 400,
          },
          { status: 400 },
        );
      }
      mockTransactions[txIndex] = {
        ...mockTransactions[txIndex],
        note: body.note,
      };
    }

    return NextResponse.json(mockTransactions[txIndex], { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR", status: 500 },
      { status: 500 },
    );
  }
}
