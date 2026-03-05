import TransactionsClient from "@/components/TransactionsClient";

/**
 * Transactions Page — Server Component Shell
 *
 * This page demonstrates clear separation of server and client concerns:
 * - The Server Component renders the page shell
 * - Interactive features (table, pagination, filters, SSE) are delegated
 *   to the TransactionsClient component ("use client")
 *
 * Caching: force-dynamic because transaction data is real-time
 */

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  return <TransactionsClient />;
}
