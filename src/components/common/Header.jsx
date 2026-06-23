"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getInitials(name) {
  if (!name) return "IT";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function Header({
  onMenuClick,
  currentUser,
  isSuperAdmin = false,
  onLogout,
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    return localStorage.getItem("itAssetTheme") === "dark";
  });

  const notifications = [
    {
      title: "Warranty Expiring",
      detail: "3 assets need warranty review",
      href: "/reports/warranty",
    },
    {
      title: "Pending Approvals",
      detail: "5 access or workflow approvals pending",
      href: "/admin-request-management",
    },
    {
      title: "Maintenance Follow-up",
      detail: "4 high priority service records",
      href: "/maintenance",
    },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const query = searchTerm.trim().toLowerCase();

    if (!query) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function toggleDarkMode() {
    const nextValue = !isDarkMode;

    document.documentElement.classList.toggle("dark", nextValue);
    localStorage.setItem("itAssetTheme", nextValue ? "dark" : "light");
    setIsDarkMode(nextValue);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <span className="flex w-5 flex-col gap-1" aria-hidden="true">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
          </span>
        </button>

        <div>
          <h1 className="text-base font-bold text-gray-900 sm:text-lg">
            IT Equipment Management
          </h1>

          <p className="hidden text-xs text-gray-500 sm:block">
            Assets, purchases, deliveries and reports
          </p>
        </div>
      </div>

        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100"
            aria-label="Open notifications"
          >
            N
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "L" : "D"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <form onSubmit={handleSearchSubmit} className="w-full xl:w-80">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search asset, PO, vendor, maintenance..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </form>

        <div className="relative hidden xl:block">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100"
            aria-label="Open notifications"
          >
            N
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100 xl:inline-flex"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? "L" : "D"}
        </button>

      <div className="flex items-center justify-between gap-3 xl:justify-end">
        <div className="hidden text-right sm:block">
          <div className="flex items-center justify-end gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {currentUser?.fullName || "IT Department"}
            </p>

            {isSuperAdmin && (
              <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700">
                Super Admin
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500">
            {currentUser?.role || "Admin Panel"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
          {getInitials(currentUser?.fullName)}
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 md:inline-flex"
          >
            Logout
          </button>
        )}
      </div>
      </div>

      {showNotifications && (
        <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg xl:absolute xl:right-28 xl:top-16 xl:mt-0 xl:w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {notifications.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  router.push(item.href);
                }}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 text-left hover:bg-white"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
