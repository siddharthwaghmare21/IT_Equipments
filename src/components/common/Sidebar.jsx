"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/data/sidebarLinks";
import { canAccessSidebarPath } from "@/lib/rbac";
import AppLogoMark from "./AppLogoMark";

const SIDEBAR_SCROLL_KEY = "itAssetSidebarScroll";

const accessManagementLinks = [
  { label: "Admin Request Management", path: "/admin-request-management" },
];

const superAdminOnlyLinks = [
  { label: "Admin Users Management", path: "/admin-user-management" },
];

function SidebarIcon({ path }) {
  const iconMap = {
    "/dashboard": (
      <>
        <path d="M4 5h6v6H4z" />
        <path d="M14 5h6v4h-6z" />
        <path d="M14 13h6v6h-6z" />
        <path d="M4 15h6v4H4z" />
      </>
    ),
    "/purchases": (
      <>
        <path d="M7 6h14l-2 8H8z" />
        <path d="M7 6 6 3H3" />
        <path d="M9 20h.01" />
        <path d="M18 20h.01" />
      </>
    ),
    "/vendors": (
      <>
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    "/assets": (
      <>
        <path d="M5 6h14v9H5z" />
        <path d="M9 20h6" />
        <path d="M12 15v5" />
      </>
    ),
    "/departments": (
      <>
        <path d="M4 21V5h7v16" />
        <path d="M11 9h9v12" />
      </>
    ),
    "/deliveries": (
      <>
        <path d="M3 7h11v10H3z" />
        <path d="M14 11h4l3 3v3h-7" />
      </>
    ),
    "/transfers": (
      <>
        <path d="M7 7h11" />
        <path d="m15 4 3 3-3 3" />
        <path d="M17 17H6" />
        <path d="m9 14-3 3 3 3" />
      </>
    ),
    "/returns": (
      <>
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10a6 6 0 1 1 0 12h-2" />
      </>
    ),
    "/maintenance": (
      <>
        <path d="m14.7 6.3 3 3" />
        <path d="M4 20l6.5-6.5" />
      </>
    ),
    "/reports": (
      <>
        <path d="M4 19V5" />
        <path d="M8 19v-7" />
        <path d="M12 19V8" />
        <path d="M16 19v-4" />
        <path d="M20 19V4" />
      </>
    ),
    "/activity-logs": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    "/admin-request-management": (
      <>
        <path d="M9 12l2 2 4-4" />
        <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
      </>
    ),
    "/admin-user-management": (
      <>
        <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    "/settings": (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L15 5.5h-4l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a8 8 0 0 0 .1 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.4z" />
      </>
    ),
    "/profile": (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    "/help": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.6-1.6 1.1-1.6 2.1" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      {iconMap[path] || iconMap["/dashboard"]}
    </svg>
  );
}

export default function Sidebar({
  onClose,
  currentUser,
  isSuperAdmin = false,
  canManageAccessRequests = false,
  isPersistent = false,
}) {
  const pathname = usePathname();
  const navRef = useRef(null);
  const visibleSidebarLinks = sidebarLinks.filter((link) =>
    canAccessSidebarPath(currentUser, link.path)
  );

  const groupedLinks = [
    {
      title: "Overview",
      links: visibleSidebarLinks.filter((link) => link.path === "/dashboard"),
    },
    {
      title: "Procurement",
      links: visibleSidebarLinks.filter((link) =>
        ["/purchases", "/vendors"].includes(link.path)
      ),
    },
    {
      title: "Asset Lifecycle",
      links: visibleSidebarLinks.filter((link) =>
        ["/assets", "/departments", "/deliveries", "/transfers", "/returns", "/maintenance"].includes(link.path)
      ),
    },
    {
      title: "Reports",
      links: visibleSidebarLinks.filter((link) =>
        ["/reports", "/activity-logs"].includes(link.path)
      ),
    },
    {
      title: "Administration",
      links: [
        ...(canManageAccessRequests ? accessManagementLinks : []),
        ...(isSuperAdmin ? superAdminOnlyLinks : []),
      ],
    },
    {
      title: "System",
      links: visibleSidebarLinks.filter((link) =>
        ["/settings", "/profile", "/help"].includes(link.path)
      ),
    },
  ].filter((group) => group.links.length > 0);

  useEffect(() => {
    const navElement = navRef.current;
    const savedScroll = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0);
    if (navElement) navElement.scrollTop = savedScroll;
  }, [pathname]);

  function handleSidebarScroll(event) {
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(event.currentTarget.scrollTop));
  }

  return (
    <aside className="flex h-full w-[260px] flex-col overflow-hidden border-r border-slate-200/80 bg-white/85 text-slate-900 backdrop-blur dark:border-slate-700 dark:bg-[#16233c] dark:text-white">
      <div className="flex items-start justify-between px-5 py-6">
        <AppLogoMark />

        {!isPersistent && (
          <button
            type="button"
            onClick={onClose}
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            aria-label="Close menu"
          >
            x
          </button>
        )}
      </div>

      <nav
        ref={navRef}
        onScroll={handleSidebarScroll}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {groupedLinks.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400">
              {group.title}
            </p>

            <div className="mt-2 space-y-1.5">
              {group.links.map((link) => {
                const isActive =
                  pathname === link.path || pathname.startsWith(`${link.path}/`);

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={isPersistent ? undefined : onClose}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                      isActive
                        ? "bg-gradient-to-r from-[#7c3aed] to-[#5b34f2] text-white shadow-[0_14px_30px_rgba(101,74,204,0.25)]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <SidebarIcon path={link.path} />
                    </span>
                    <span className={isActive ? "font-semibold" : "font-medium"}>
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
