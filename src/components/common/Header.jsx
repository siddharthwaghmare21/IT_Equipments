"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { canAccessPath } from "@/lib/rbac";

function getInitials(name) {
  if (!name) return "IT";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function ThemeIcon({ isDarkMode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      {isDarkMode ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
        </>
      ) : (
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8z" />
      )}
    </svg>
  );
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
      title: "Warranty Report",
      detail: "Open warranty records that need review.",
      href: "/reports/warranty",
    },
    {
      title: "Approval Queue",
      detail: "Review pending access requests.",
      href: "/admin-request-management",
    },
    {
      title: "Maintenance Records",
      detail: "Open maintenance follow-up records.",
      href: "/maintenance",
    },
  ];
  const visibleNotifications = notifications.filter((item) =>
    canAccessPath(currentUser, item.href)
  );

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
          aria-label="Open menu"
        >
          <span className="flex w-5 flex-col gap-1" aria-hidden="true">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
          </span>
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-950 sm:text-lg">
            IT Equipment Management
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            Assets, purchases, deliveries and reports
          </p>
        </div>
      </div>

        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-white"
            aria-label="Open notifications"
          >
            <BellIcon />
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-white"
            aria-label="Toggle dark mode"
          >
            <ThemeIcon isDarkMode={isDarkMode} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <form onSubmit={handleSearchSubmit} className="w-full xl:w-80">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search asset, WO, vendor, transfer..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </form>

        <div className="relative hidden xl:block">
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-white"
            aria-label="Open notifications"
          >
            <BellIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-white xl:inline-flex"
          aria-label="Toggle dark mode"
        >
          <ThemeIcon isDarkMode={isDarkMode} />
        </button>

      <div className="flex items-center justify-between gap-3 xl:justify-end">
        <div className="hidden text-right sm:block">
          <div className="flex items-center justify-end gap-2">
            <p className="text-sm font-semibold text-slate-950">
              {currentUser?.fullName || "IT Department"}
            </p>

            {isSuperAdmin && (
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                Super Admin
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {currentUser?.role || "Admin Panel"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm">
          {getInitials(currentUser?.fullName)}
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white md:inline-flex"
          >
            Logout
          </button>
        )}
      </div>
      </div>

      {showNotifications && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg xl:absolute xl:right-28 xl:top-16 xl:mt-0 xl:w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-950">Notifications</h2>
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-950"
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {visibleNotifications.length === 0 ? (
              <p className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">
                No quick notifications are available for your current role.
              </p>
            ) : (
              visibleNotifications.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  router.push(item.href);
                }}
                className="w-full rounded-lg border border-slate-100 bg-slate-50 p-3 text-left hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-950">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              </button>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
