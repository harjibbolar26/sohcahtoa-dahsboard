"use client";

import { useAuthStore } from "@/store/authStore";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌙";
}

export default function TopBar() {
  const user = useAuthStore((s) => s.user);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <header
      className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"
      id="topbar"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg">
          {userInitials}
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-600">
            {getGreeting()} {getGreetingEmoji()}
          </h2>
          <h1 className="text-xl font-bold text-gray-900">
            {user?.name || "..."}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-80 hover:bg-gray-100 transition-colors duration-200"
          id="search-bar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M14 14L11 11" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
          />
          <span className="text-xs text-gray-400 font-medium px-1.5 py-0.5 bg-white border border-gray-200 rounded">
            ⌘K
          </span>
        </div>

        <button
          className="relative w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
          id="notifications-btn"
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
            className="text-gray-600"
          >
            <path d="M10 2C7.24 2 5 4.24 5 7V11L3 13V14H17V13L15 11V7C15 4.24 12.76 2 10 2Z" />
            <path d="M8.5 17C8.5 17.83 9.17 18.5 10 18.5C10.83 18.5 11.5 17.83 11.5 17" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
