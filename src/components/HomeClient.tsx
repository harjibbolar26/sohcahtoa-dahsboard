"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Card, CardTransaction, CardFlow } from "@/types";
import { mockTransactions } from "@/lib/mock-data";

interface HomeClientProps {
  userName: string;
  card: Card;
  cardTransactions: CardTransaction[];
  cardFlow: CardFlow;
}

const fxTabs = ["FX bought", "FX sold", "Others"];
const categoryTabs = ["All", "FX", "PTA", "BTA", "Medicals"];

type TransactionTypeFilter = "All" | "FX" | "PTA" | "BTA" | "Medicals";

export default function HomeClient({
  card,
  cardTransactions,
  cardFlow,
}: HomeClientProps) {
  const router = useRouter();
  const [activeFxTab, setActiveFxTab] = useState(0);
  const [activeCategory, setActiveCategory] =
    useState<TransactionTypeFilter>("All");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Filter home page transactions by category
  const homeTransactions = mockTransactions
    .filter((t) => {
      if (activeCategory === "All") return true;
      return t.type === activeCategory;
    })
    .slice(0, 7);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return d.toLocaleDateString("en-US", options);
  };

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount);
    const prefix = amount < 0 ? "-" : "";
    return `${prefix}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column — FX Overview */}
      <div>
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
          id="fx-card"
        >
          {/* FX Tabs */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex gap-2">
              {fxTabs.map((tab, i) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFxTab === i
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveFxTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors duration-200">
              <span>🇺🇸</span>
              USD
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 5L6 8L9 5" />
              </svg>
            </button>
          </div>

          {/* Total FX Units */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600 font-medium">
                Total FX units
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <circle cx="7" cy="7" r="6" />
                <path d="M7 9V7" />
                <circle cx="7" cy="4.5" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl text-gray-900 font-semibold">$</span>
              <span className="text-4xl text-gray-900 font-bold">67,048</span>
              <span className="text-2xl text-gray-500 font-medium">.00</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 grid grid-cols-3 gap-3">
            <button
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              id="buy-fx-btn"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <path d="M9 3V15" />
                  <path d="M3 9H15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">Buy FX</span>
            </button>
            <button
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              id="sell-fx-btn"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <path d="M5 9L9 5L13 9" />
                  <path d="M9 5V15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">Sell FX</span>
            </button>
            <button
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              id="receive-money-btn"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-700"
                >
                  <path d="M3 10L9 15L15 10" />
                  <path d="M9 3V15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">
                Receive money
              </span>
            </button>
          </div>

          {/* FX Transactions */}
          <div className="border-t border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm font-semibold text-gray-900">
                FX transactions
              </span>
              <button
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                onClick={() => router.push("/dashboard/transactions")}
                id="see-all-transactions"
              >
                See all
              </button>
            </div>

            <div className="flex gap-2 px-6 pb-4 border-b border-gray-100">
              {categoryTabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeCategory === tab
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    setActiveCategory(tab as TransactionTypeFilter)
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="divide-y divide-gray-100">
              {homeTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  id={`home-tx-${tx.id}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.direction === "inflow" ? "bg-green-50" : "bg-orange-50"
                    }`}
                  >
                    {tx.direction === "inflow" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <path d="M12 4L4 12" />
                        <path d="M4 4V12H12" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-orange-600"
                      >
                        <path d="M4 12L12 4" />
                        <path d="M12 12V4H4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* XSS Prevention: React auto-escapes text content.
                         We never use dangerouslySetInnerHTML. */}
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {tx.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(tx.date)}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold whitespace-nowrap ${
                      tx.amount >= 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {formatAmount(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column — Cards */}
      <div>
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
          id="cards-section"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Cards</span>
          </div>

          {/* Credit Card */}
          <div className="p-6">
            <div className="flex gap-4 items-start">
              <div
                className="relative w-full max-w-sm h-48 rounded-2xl p-5 bg-linear-to-br from-orange-500 via-orange-600 to-orange-700 text-white shadow-xl"
                id="credit-card"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-xs font-medium opacity-90 mb-1">
                      {card.type}
                    </div>
                    <div className="text-xs opacity-75">•••• {card.last4}</div>
                  </div>
                  <div className="text-2xl font-bold">VISA</div>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-end justify-between">
                    <div className="text-xs opacity-75">{card.expiry}</div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        $
                        {card.balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs opacity-75">{card.holder}</div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="shrink-0 w-12 h-12 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
                id="add-card-btn"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M10 4V16" />
                  <path d="M4 10H16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Card Transactions */}
          <div className="border-t border-gray-100">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm font-semibold text-gray-900">
                Card transactions
              </span>
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
                See all
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {cardTransactions.map((ct) => (
                <div
                  key={ct.id}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      ct.direction === "inflow" ? "bg-green-50" : "bg-orange-50"
                    }`}
                  >
                    {ct.direction === "inflow" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <path d="M12 4L4 12" />
                        <path d="M4 4V12H12" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-orange-600"
                      >
                        <path d="M4 12L12 4" />
                        <path d="M12 12V4H4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {ct.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(ct.date)}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold whitespace-nowrap ${
                      ct.amount >= 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {formatAmount(ct.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Flow */}
          <div className="border-t border-gray-100 p-6" id="card-flow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-900">
                Card transaction flows
              </span>
              <span className="text-sm font-bold text-gray-900">
                +$
                {cardFlow.total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Money In</span>
                  <span className="text-xs font-semibold text-gray-900">
                    $
                    {cardFlow.moneyIn.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${(cardFlow.moneyIn / (cardFlow.moneyIn + cardFlow.moneyOut)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Money out</span>
                  <span className="text-xs font-semibold text-gray-900">
                    $
                    {cardFlow.moneyOut.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${(cardFlow.moneyOut / (cardFlow.moneyIn + cardFlow.moneyOut)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
