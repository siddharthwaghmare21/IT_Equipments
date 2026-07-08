"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { canAccessPath } from "@/lib/rbac";

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

function MenuIcon() {
  return (
    <span className="flex w-5 flex-col gap-1" aria-hidden="true">
      <span className="h-0.5 rounded-full bg-current" />
      <span className="h-0.5 rounded-full bg-current" />
      <span className="h-0.5 rounded-full bg-current" />
    </span>
  );
}

function getInitials(name, email = "") {
  const cleanedName = String(name || "").trim();
  if (!cleanedName) return "IT";

  const words = cleanedName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  const firstWord = words[0];
  const localPart = String(email || "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const normalizedFirstWord = firstWord.toLowerCase().replace(/[^a-z]/g, "");

  if (
    normalizedFirstWord &&
    localPart.startsWith(normalizedFirstWord) &&
    localPart.length > normalizedFirstWord.length
  ) {
    const remaining = localPart.slice(normalizedFirstWord.length);
    const nextLetter = remaining[0];
    if (nextLetter) {
      return `${firstWord[0]}${nextLetter}`.toUpperCase();
    }
  }

  return firstWord.slice(0, 2).toUpperCase();
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

  function handleSearchSubmit(event) {
    event.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="relative z-20 border-b border-slate-200/80 bg-white/88 px-4 py-4 text-slate-900 backdrop-blur dark:border-slate-700 dark:bg-[#16233c]/90 dark:text-white sm:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-white lg:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>

            <div className="hidden sm:block" />
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <button
              type="button"
              onClick={() => setShowNotifications((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              aria-label="Open notifications"
            >
              <BellIcon />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <form onSubmit={handleSearchSubmit} className="w-full xl:w-[360px]">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-[#fbfcff] px-4 py-2.5 text-slate-700 shadow-[0_10px_30px_rgba(59,87,148,0.08)] dark:border-slate-600 dark:bg-[#10203f] dark:text-slate-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-slate-400 dark:text-slate-300"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search asset, WO, vendor, transfer..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-400"
              />
            </div>
          </form>

          <div className="hidden items-center gap-2 xl:flex">
            <button
              type="button"
              onClick={() => setShowNotifications((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              aria-label="Open notifications"
            >
              <BellIcon />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 xl:justify-end">
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-white">
                  {currentUser?.fullName || "IT Department"}
                </p>
                {isSuperAdmin && (
                  <span className="rounded-full bg-[#f3ecff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6a35ef] dark:bg-white/10 dark:text-white">
                    Super Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-300">
                {currentUser?.role || "Admin Panel"}
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#7c3aed_0%,#5b34f2_100%)] text-base font-bold text-white shadow-[0_12px_30px_rgba(54,78,138,0.16)] dark:bg-[#edf3ff] dark:text-[#5b73d9]">
              {getInitials(currentUser?.fullName, currentUser?.email)}
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-white md:inline-flex"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="mt-3 rounded-[24px] border border-[#d8e3fb] bg-white p-3 text-slate-900 shadow-[0_22px_54px_rgba(87,111,168,0.16)] dark:border-[#38517e] dark:bg-[#162440] dark:text-white xl:absolute xl:right-6 xl:top-[84px] xl:mt-0 xl:w-96">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Notifications</h2>
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {visibleNotifications.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-[#10203b] dark:text-slate-300">
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
                  className="w-full rounded-2xl border border-[#e7eefc] bg-[#f8fbff] p-3 text-left hover:bg-white dark:border-[#304568] dark:bg-[#10203b] dark:hover:bg-[#152847]"
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    {item.detail}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
}
