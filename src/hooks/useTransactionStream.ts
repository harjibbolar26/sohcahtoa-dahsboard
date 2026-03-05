"use client";

import { useEffect, useRef } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types";

/**
 * Custom hook for SSE-based real-time transaction updates.
 *
 * - Connects to /api/transactions/stream (SSE endpoint)
 * - Deduplicates transactions by ID before adding to store
 * - Automatically reconnects on connection loss
 * - Cleans up on unmount
 * - Does NOT cause full re-renders — only updates affected rows via Zustand
 */
export function useTransactionStream() {
  const addSSETransaction = useTransactionStore((s) => s.addSSETransaction);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource("/api/transactions/stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_transaction" && data.transaction) {
            const tx: Transaction = data.transaction;

            // Deduplicate by ID
            if (!seenIds.current.has(tx.id)) {
              seenIds.current.add(tx.id);
              addSSETransaction(tx);

              // Keep seen IDs set from growing indefinitely
              if (seenIds.current.size > 200) {
                const entries = Array.from(seenIds.current);
                seenIds.current = new Set(entries.slice(-100));
              }
            }
          }
        } catch {
          // Invalid JSON — skip
        }
      };

      es.onerror = () => {
        es.close();
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [addSSETransaction]);
}
