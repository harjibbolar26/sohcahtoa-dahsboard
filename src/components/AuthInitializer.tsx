"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * AuthInitializer Component
 *
 * Initializes authentication state from cookies on app mount.
 * This ensures the user's session is restored when the page refreshes.
 *
 * Usage: Add to root layout or dashboard layout
 */
export default function AuthInitializer() {
  const initFromCookie = useAuthStore((s) => s.initFromCookie);

  useEffect(() => {
    initFromCookie();
  }, [initFromCookie]);

  // This component doesn't render anything
  return null;
}
