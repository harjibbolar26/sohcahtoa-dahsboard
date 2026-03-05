"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

const navItems = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7.5L10 2L17 7.5V16C17 16.55 16.55 17 16 17H4C3.45 17 3 16.55 3 16V7.5Z" />
        <path d="M7 17V10H13V17" />
      </svg>
    ),
  },
  {
    label: "Calculator",
    href: "/dashboard/calculator",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="2" width="14" height="16" rx="2" />
        <path d="M6 6H14" />
        <path d="M6 10H8" />
        <path d="M12 10H14" />
        <path d="M6 14H8" />
        <path d="M12 14H14" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6H17" />
        <path d="M3 10H17" />
        <path d="M3 14H17" />
        <rect x="2" y="3" width="16" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: "Cards",
    href: "/dashboard/cards",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="4" width="16" height="12" rx="2" />
        <path d="M2 8H18" />
        <path d="M6 12H10" />
      </svg>
    ),
    badge: 2,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <aside
      className="w-64 bg-white border-r border-gray-200 flex flex-col"
      id="sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-100">
        <Image src="/sch.jpeg" alt="SohCahToa Holdings" width={36} height={36} />
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm leading-tight">
            SohCahToa
          </span>
          <span className="text-xs text-gray-500 leading-tight">
            Payout BDC
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => router.push(item.href)}
              id={`nav-${item.label.toLowerCase()}`}
            >
              <span className={isActive ? "text-blue-600" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          onClick={handleLogout}
          id="logout-btn"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M7 17H4C3.45 17 3 16.55 3 16V4C3 3.45 3.45 3 4 3H7" />
            <path d="M14 10H7" />
            <path d="M14 10L11 7" />
            <path d="M14 10L11 13" />
          </svg>
          Logout
        </button>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
          <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Loading..."}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email || "..."}
            </div>
          </div>
          <svg
            className="text-gray-400 shrink-0"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 4L10 8L6 12" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
