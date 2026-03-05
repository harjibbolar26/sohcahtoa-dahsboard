"use client";

import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initFromCookie: () => void;
}

/**
 * Auth Store using Zustand
 *
 * Security Model:
 * - Access tokens and refresh tokens are stored in httpOnly cookies (cannot be read by JS)
 * - User info is stored in a non-httpOnly cookie for display purposes only
 * - All auth decisions are made server-side (middleware + API routes)
 * - This store only manages UI state based on the user cookie
 * - If user cookie exists, we assume user is authenticated
 * - Server will validate tokens and redirect if session is truly invalid
 */

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  initFromCookie: () => {
    try {
      // Read user info from the non-httpOnly cookie
      // Note: Access token and refresh token are httpOnly and cannot be read here
      const cookies = document.cookie.split(";").reduce(
        (acc, cookie) => {
          const [key, ...rest] = cookie.trim().split("=");
          acc[key] = rest.join("=");
          return acc;
        },
        {} as Record<string, string>,
      );

      const userCookie = cookies["sct_user"];

      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie));
          // User cookie exists, assume authenticated
          // Server-side middleware will redirect if tokens are actually invalid
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // Failed to parse user cookie
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        // No user cookie, not authenticated
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }

      const data = await res.json();
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
