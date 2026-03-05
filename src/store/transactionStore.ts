"use client";

import { create } from "zustand";
import { Transaction, TransactionFilters, PaginatedResponse } from "@/types";
import { fetchWithAuth } from "@/lib/auth";

interface TransactionState {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: TransactionFilters;
  sortBy: string;
  sortOrder: "asc" | "desc";
  isLoading: boolean;
  error: string | null;
  sseTransactions: Transaction[];
  selectedTransaction: Transaction | null;
  isDetailOpen: boolean;

  // Actions
  fetchTransactions: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
  addSSETransaction: (transaction: Transaction) => void;
  selectTransaction: (transaction: Transaction | null) => void;
  setDetailOpen: (open: boolean) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  rollbackTransaction: (id: string, original: Transaction) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  filters: {},
  sortBy: "date",
  sortOrder: "desc",
  isLoading: false,
  error: null,
  sseTransactions: [],
  selectedTransaction: null,
  isDetailOpen: false,

  fetchTransactions: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams({
        page: state.page.toString(),
        pageSize: state.pageSize.toString(),
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      });

      if (state.filters.status) params.set("status", state.filters.status);
      if (state.filters.type) params.set("type", state.filters.type);
      if (state.filters.dateFrom)
        params.set("dateFrom", state.filters.dateFrom);
      if (state.filters.dateTo) params.set("dateTo", state.filters.dateTo);
      if (state.filters.search) params.set("search", state.filters.search);

      const res = await fetchWithAuth(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data: PaginatedResponse<Transaction> = await res.json();
      set({
        transactions: data.data,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchTransactions();
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    }));
    get().fetchTransactions();
  },

  setSorting: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder, page: 1 });
    get().fetchTransactions();
  },

  addSSETransaction: (transaction) => {
    set((state) => {
      // Prevent duplicates by ID
      const exists =
        state.sseTransactions.find((t) => t.id === transaction.id) ||
        state.transactions.find((t) => t.id === transaction.id);
      if (exists) return state;

      return {
        sseTransactions: [transaction, ...state.sseTransactions].slice(0, 20),
      };
    });
  },

  selectTransaction: (transaction) => {
    set({ selectedTransaction: transaction, isDetailOpen: !!transaction });
  },

  setDetailOpen: (open) => {
    set({ isDetailOpen: open });
    if (!open) set({ selectedTransaction: null });
  },

  // Optimistic update
  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
      selectedTransaction:
        state.selectedTransaction?.id === id
          ? { ...state.selectedTransaction, ...updates }
          : state.selectedTransaction,
    }));
  },

  // Rollback on failure
  rollbackTransaction: (id, original) => {
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? original : t)),
      selectedTransaction:
        state.selectedTransaction?.id === id
          ? original
          : state.selectedTransaction,
    }));
  },
}));
