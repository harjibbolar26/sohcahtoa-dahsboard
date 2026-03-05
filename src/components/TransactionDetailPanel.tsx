"use client";

import { useState, useCallback } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import { useAuthStore } from "@/store/authStore";
import { Transaction } from "@/types";

function getCsrfToken(): string {
  const cookies = document.cookie.split(";").reduce(
    (acc, cookie) => {
      const [key, ...rest] = cookie.trim().split("=");
      acc[key] = rest.join("=");
      return acc;
    },
    {} as Record<string, string>,
  );
  return cookies["sct_csrf_token"] || "";
}

export default function TransactionDetailPanel() {
  const {
    selectedTransaction,
    setDetailOpen,
    updateTransaction,
    rollbackTransaction,
  } = useTransactionStore();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [note, setNote] = useState(selectedTransaction?.note || "");
  const [isFlagging, setIsFlagging] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  if (!selectedTransaction) return null;

  const tx = selectedTransaction;

  const handleFlag = async () => {
    if (!isAdmin || tx.status === "flagged") return;

    setIsFlagging(true);
    const original: Transaction = { ...tx };

    // Optimistic update
    updateTransaction(tx.id, {
      status: "flagged",
      flaggedBy: user?.id,
      flaggedAt: new Date().toISOString(),
    });

    try {
      const res = await fetch(`/api/transactions/${tx.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ status: "flagged" }),
      });

      if (!res.ok) {
        // Rollback on failure
        rollbackTransaction(tx.id, original);
        const data = await res.json();
        showToast(data.message || "Failed to flag transaction", "error");
      } else {
        showToast("Transaction flagged successfully", "success");
      }
    } catch {
      // Rollback on network error
      rollbackTransaction(tx.id, original);
      showToast("Network error. Changes reverted.", "error");
    } finally {
      setIsFlagging(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;

    setIsSavingNote(true);
    const original: Transaction = { ...tx };

    // Optimistic update
    updateTransaction(tx.id, { note });

    try {
      const res = await fetch(`/api/transactions/${tx.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ note }),
      });

      if (!res.ok) {
        rollbackTransaction(tx.id, original);
        const data = await res.json();
        showToast(data.message || "Failed to save note", "error");
      } else {
        showToast("Note saved successfully", "success");
      }
    } catch {
      rollbackTransaction(tx.id, original);
      showToast("Network error. Changes reverted.", "error");
    } finally {
      setIsSavingNote(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount);
    const prefix = amount < 0 ? "-" : "+";
    return `${prefix}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 bg-opacity-50 z-40"
        onClick={() => setDetailOpen(false)}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right overflow-hidden"
        id="detail-panel"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Transaction Details
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setDetailOpen(false)}
            id="close-detail"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M5 5L15 15" />
              <path d="M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Amount */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Amount
            </div>
            <div
              className={`text-3xl font-bold mb-1 ${
                tx.amount >= 0 ? "text-green-600" : "text-gray-900"
              }`}
            >
              {formatAmount(tx.amount)}
            </div>
            <div className="text-sm text-gray-500">{tx.currency}</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Reference
              </div>
              <div className="text-sm font-medium text-gray-900">
                {tx.reference}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Status
              </div>
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
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sender
            </div>
            {/* XSS Safe: React auto-escapes */}
            <div className="text-sm font-medium text-gray-900">{tx.sender}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recipient
            </div>
            <div className="text-sm font-medium text-gray-900">
              {tx.recipient}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </div>
            {/* XSS Safe: Even the malicious <script> tag is rendered as text */}
            <div className="text-sm font-medium text-gray-900">
              {tx.description}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Type
              </div>
              <div className="text-sm font-medium text-gray-900">{tx.type}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Direction
              </div>
              <div className="text-sm font-medium text-gray-900">
                {tx.direction}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Date
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(tx.date)}
            </div>
          </div>

          {/* Card Info (masked) */}
          {tx.cardLast4 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Card
              </div>
              <div className="text-sm font-medium text-gray-900">
                •••• •••• •••• {tx.cardLast4}
              </div>
            </div>
          )}

          {/* Flagged Info */}
          {tx.flaggedBy && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Flagged At
              </div>
              <div className="text-sm font-medium text-gray-900">
                {tx.flaggedAt ? formatDate(tx.flaggedAt) : "—"}
              </div>
            </div>
          )}

          {/* Existing Note */}
          {tx.note && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Internal Note
              </div>
              <div className="text-sm italic text-gray-600">{tx.note}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 space-y-4">
          {/* Flag Button */}
          {isAdmin ? (
            <button
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                tx.status === "flagged"
                  ? "bg-orange-100 text-orange-700 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
              onClick={handleFlag}
              disabled={isFlagging || tx.status === "flagged"}
              id="flag-transaction-btn"
            >
              {tx.status === "flagged" ? (
                <>🚩 Transaction Flagged</>
              ) : isFlagging ? (
                <>Flagging...</>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 2V14" />
                    <path d="M2 2L10 2L8 5L10 8H2" />
                  </svg>
                  Flag Transaction
                </>
              )}
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              ⚠️ Only admin users can flag transactions. You are logged in as an
              analyst.
            </div>
          )}

          {/* Note Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Note
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow duration-200"
              placeholder="Add an internal note about this transaction..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={4}
              id="note-input"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{note.length}/500</span>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={handleSaveNote}
                disabled={isSavingNote || !note.trim()}
                id="save-note-btn"
              >
                {isSavingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg z-60 animate-slide-up ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
          id="toast"
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 10L8 14L16 6" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 4V12" />
                <circle cx="10" cy="16" r="1" fill="currentColor" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
