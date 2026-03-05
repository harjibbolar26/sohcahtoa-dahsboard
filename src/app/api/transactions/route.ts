import { NextRequest, NextResponse } from "next/server";
import { mockTransactions } from "@/lib/mock-data";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  PaginatedResponse,
} from "@/types";
import { AUTH_COOKIE, decodeToken } from "@/lib/auth";

export const dynamic = "force-dynamic"; // no-store: real-time data must always be fresh

export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "10")),
    );
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const status = searchParams.get("status") as TransactionStatus | null;
    const type = searchParams.get("type") as TransactionType | null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");

    // Filter
    let filtered: Transaction[] = [...mockTransactions];

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      filtered = filtered.filter((t) => new Date(t.date).getTime() >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime();
      filtered = filtered.filter((t) => new Date(t.date).getTime() <= to);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.sender.toLowerCase().includes(q) ||
          t.recipient.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "sender":
          comparison = a.sender.localeCompare(b.sender);
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Transaction> = {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error", code: "INTERNAL_ERROR", status: 500 },
      { status: 500 },
    );
  }
}
