import { AuthResponse, User } from "@/types";

// ===== Simulated Token Generation =====
export function generateAccessToken(user: User): string {
  const payload = {
    sub: user.id,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes
  };
  return btoa(JSON.stringify(payload));
}

export function generateRefreshToken(user: User): string {
  const payload = {
    sub: user.id,
    type: "refresh",
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return btoa(JSON.stringify(payload));
}

// ===== Token Validation =====
export function decodeToken(token: string): {
  sub: string;
  role: string;
  exp: number;
  iat: number;
  type?: string;
} | null {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return Date.now() > decoded.exp;
}

export function getUserFromToken(token: string): User | null {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  const users = getTestUsers();
  return users.find((u) => u.id === decoded.sub) || null;
}

// ===== Test Users =====
export function getTestUsers(): User[] {
  return [
    {
      id: "usr_001",
      name: "Emmanuel Israel",
      email: "admin@sohcahtoa.com",
      role: "admin",
    },
    {
      id: "usr_002",
      name: "Ada Okonkwo",
      email: "analyst@sohcahtoa.com",
      role: "analyst",
    },
  ];
}

export function validateCredentials(
  email: string,
  password: string,
): User | null {
  const users = getTestUsers();
  // Simulated password: "password123" for all test users
  if (password !== "password123") return null;
  return users.find((u) => u.email === email) || null;
}

// ===== Cookie Names =====
export const AUTH_COOKIE = "sct_access_token";
export const REFRESH_COOKIE = "sct_refresh_token";
export const USER_COOKIE = "sct_user";
export const CSRF_COOKIE = "sct_csrf_token";

// ===== CSRF Token =====
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  // Use crypto in both Edge and Node runtimes
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ===== Auth Response Builder =====
export function buildAuthResponse(user: User): AuthResponse {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: 900, // 15 minutes in seconds
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

// ===== Client-side Token Refresh with Mutex =====
/**
 * Race Condition Prevention Strategy:
 *
 * We use a mutex (promise-based lock) to prevent multiple simultaneous
 * refresh calls. When a token expires:
 *
 * 1. The first request that detects expiry acquires the lock and calls /api/auth/refresh
 * 2. All subsequent requests that detect expiry wait for the same promise
 * 3. Once the refresh completes, all waiting requests proceed with the new token
 * 4. If refresh fails, all waiting requests are rejected and user is redirected to login
 *
 * This is implemented in the client-side `fetchWithAuth` wrapper.
 */
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        // Refresh failed — logout
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "/login";
        return false;
      }

      return true;
    } catch {
      window.location.href = "/login";
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ===== Fetch with Auth wrapper =====
const activeControllers = new Set<AbortController>();

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  activeControllers.add(controller);

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      signal: controller.signal,
    });

    if (res.status === 401) {
      // Token expired — try refresh
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        // Cancel all in-flight requests
        cancelAllRequests();
        throw new Error("Session expired");
      }

      // Retry original request with new token
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    }

    return res;
  } finally {
    activeControllers.delete(controller);
  }
}

export function cancelAllRequests(): void {
  activeControllers.forEach((c) => c.abort());
  activeControllers.clear();
}

// ===== Data Masking =====
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length < 4) return "••••";
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
}

export function maskSensitiveField(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return "•".repeat(value.length);
  return "•".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
