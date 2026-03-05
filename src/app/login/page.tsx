"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Suspense } from "react";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const expired = searchParams.get("expired");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    expired ? "Your session has expired. Please log in again." : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      setIsSubmitting(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      router.push(callbackUrl);
    } else {
      setError("Invalid email or password. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image src="/sch.jpeg" alt="SohCahToa Holdings" width={36} height={36} />
          <span className="text-lg font-semibold text-gray-900">
            SohCahToa Holdings
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Welcome back
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Sign in to access your admin dashboard
        </p>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-3.5 py-2.5 pr-12 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            disabled={isSubmitting}
            id="login-submit"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200 leading-relaxed">
          <strong className="font-semibold text-gray-900">
            Test Credentials:
          </strong>
          <br />
          Admin:{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-600 font-mono text-xs">
            admin@sohcahtoa.com
          </code>
          <br />
          Analyst:{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-600 font-mono text-xs">
            analyst@sohcahtoa.com
          </code>
          <br />
          Password:{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-600 font-mono text-xs">
            password123
          </code>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-orange-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
            <div className="text-center py-8 text-gray-400">Loading...</div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
