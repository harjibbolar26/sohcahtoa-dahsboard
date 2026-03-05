"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransactionStore } from "@/store/transactionStore";
import { useTransactionStream } from "@/hooks/useTransactionStream";
import { useAuthStore } from "@/store/authStore";
import TransactionDetailPanel from "@/components/TransactionDetailPanel";
import { Transaction, TransactionStatus } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAmount(amount: number) {
  const abs = Math.abs(amount);
  const prefix = amount < 0 ? "-" : "+";
  return `${prefix}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TransactionsClient() {
  const router = useRouter();
  const {
    transactions,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    sortBy,
    sortOrder,
    isLoading,
    error,
    sseTransactions,
    isDetailOpen,
    fetchTransactions,
    setPage,
    setFilters,
    setSorting,
    selectTransaction,
  } = useTransactionStore();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  // SSE stream
  useTransactionStream();

  // Check authentication
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dateFrom, setDateFrom] = useState(filters.dateFrom || "");
  const [dateTo, setDateTo] = useState(filters.dateTo || "");

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSorting(column, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSorting(column, "desc");
    }
  };

  const getSortArrow = (column: string) => {
    if (sortBy !== column) return "";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ status: status ? (status as TransactionStatus) : undefined });
  };

  const handleDateFilter = () => {
    setFilters({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleRowClick = (tx: Transaction) => {
    selectTransaction(tx);
  };

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <span className="text-sm text-gray-600">
          {user?.role === "admin" ? "🔒 Admin" : "👁️ Analyst"} view
        </span>
      </div>

      {/* SSE Notification Banner */}
      {sseTransactions.length > 0 && (
        <div
          className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between"
          id="sse-banner"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <span className="text-sm font-medium text-orange-900">
              {sseTransactions.length} new transaction
              {sseTransactions.length > 1 ? "s" : ""} received
            </span>
          </div>
          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
            LIVE
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-3" id="transaction-filters">
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          value={filters.status || ""}
          onChange={(e) => handleStatusFilter(e.target.value)}
          id="filter-status"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="flagged">Flagged</option>
        </select>

        <input
          type="date"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          onBlur={handleDateFilter}
          placeholder="From date"
          id="filter-date-from"
        />

        <input
          type="date"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          onBlur={handleDateFilter}
          placeholder="To date"
          id="filter-date-to"
        />
      </div>

      {/* Error State */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
          id="error-state"
        >
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to load transactions
          </h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Table */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        id="transactions-table"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th
                  onClick={() => handleSort("sender")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  Sender / Recipient{getSortArrow("sender")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th
                  onClick={() => handleSort("amount")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  Amount{getSortArrow("amount")}
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  Status{getSortArrow("status")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th
                  onClick={() => handleSort("date")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  Date{getSortArrow("date")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* SSE Transactions — shown at top */}
              {sseTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => handleRowClick(tx)}
                  className="bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors duration-200"
                  id={`sse-row-${tx.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {/* XSS Safe: React escapes this automatically */}
                      {tx.direction === "inflow" ? tx.sender : tx.recipient}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        tx.amount >= 0 ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {formatAmount(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : tx.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === "completed"
                            ? "bg-green-500"
                            : tx.status === "pending"
                              ? "bg-yellow-500"
                              : tx.status === "failed"
                                ? "bg-red-500"
                                : "bg-orange-500"
                        }`}
                      />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tx.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                </tr>
              ))}

              {/* Loading Skeleton */}
              {isLoading &&
                transactions.length === 0 &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`}>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 rounded-full animate-pulse w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
                    </td>
                  </tr>
                ))}

              {/* Empty State */}
              {!isLoading && transactions.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div
                      className="flex flex-col items-center justify-center"
                      id="empty-state"
                    >
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        viewBox="0 0 48 48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="6" y="10" width="36" height="28" rx="3" />
                        <path d="M6 18H42" />
                        <path d="M14 26H24" />
                        <path d="M14 32H20" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No transactions found
                      </h3>
                      <p className="text-sm text-gray-500">
                        Try adjusting your filters or date range.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Transaction Rows */}
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => handleRowClick(tx)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  id={`tx-row-${tx.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {tx.direction === "inflow" ? tx.sender : tx.recipient}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {tx.reference}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {/* XSS Prevention: React auto-escapes text content.
                         The XSS payload in tx.description is rendered as plain text. */}
                    {tx.description}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        tx.amount >= 0 ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {formatAmount(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tx.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : tx.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === "completed"
                            ? "bg-green-500"
                            : tx.status === "pending"
                              ? "bg-yellow-500"
                              : tx.status === "failed"
                                ? "bg-red-500"
                                : "bg-orange-500"
                        }`}
                      />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tx.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div
            className="border-t border-gray-100 px-6 py-4 flex items-center justify-between"
            id="pagination"
          >
            <div className="text-sm text-gray-600">
              Showing {startIdx}–{endIdx} of {total} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                id="pagination-prev"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                id="pagination-next"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {isDetailOpen && <TransactionDetailPanel />}
    </div>
  );
}
