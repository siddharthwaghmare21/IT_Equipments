"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/data/sidebarLinks";

const SIDEBAR_SCROLL_KEY = "itAssetSidebarScroll";

const accessManagementLinks = [
  {
    label: "Admin Request Management",
    path: "/admin-request-management",
    short: "AR",
  },
];

const superAdminOnlyLinks = [
  {
    label: "Admin Users Management",
    path: "/admin-user-management",
    short: "AU",
  },
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
    "/import-data": (
      <>
        <path d="M12 4v10" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 16v3h14v-3" />
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
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
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
        <path d="M7 9h1" />
        <path d="M7 13h1" />
        <path d="M15 13h1" />
      </>
    ),
    "/deliveries": (
      <>
        <path d="M3 7h11v10H3z" />
        <path d="M14 11h4l3 3v3h-7" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
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
        <path d="M13 7a4 4 0 0 1 5.5-3.7l-3 3 2.2 2.2 3-3A4 4 0 0 1 17 11" />
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
        <path d="M19 8v4" />
        <path d="M21 10h-4" />
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
        <path d="M12 17h.01" />
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
  onLogout,
}) {
  const pathname = usePathname();
  const navRef = useRef(null);

  const groupedLinks = [
    {
      title: "Overview",
      links: sidebarLinks.filter((link) => link.path === "/dashboard"),
    },
    {
      title: "Procurement",
      links: sidebarLinks.filter((link) =>
        ["/import-data", "/purchases", "/vendors"].includes(link.path)
      ),
    },
    {
      title: "Asset Lifecycle",
      links: sidebarLinks.filter((link) =>
        [
          "/assets",
          "/departments",
          "/deliveries",
          "/transfers",
          "/returns",
          "/maintenance",
        ].includes(link.path)
      ),
    },
    {
      title: "Reports",
      links: sidebarLinks.filter((link) =>
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
      links: sidebarLinks.filter((link) =>
        ["/settings", "/profile", "/help"].includes(link.path)
      ),
    },
  ].filter((group) => group.links.length > 0);

  useEffect(() => {
    const navElement = navRef.current;
    const savedScroll = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0);

    if (navElement) {
      navElement.scrollTop = savedScroll;
    }
  }, [pathname]);

  function handleSidebarScroll(event) {
    sessionStorage.setItem(
      SIDEBAR_SCROLL_KEY,
      String(event.currentTarget.scrollTop)
    );
  }

  return (
    <aside className="flex h-full w-72 flex-col bg-gray-950 text-white">
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-5">
        <div>
          <h2 className="text-lg font-bold">IT Assets</h2>
          <p className="text-xs text-gray-400">Management System</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-9 w-9 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 lg:hidden"
          aria-label="Close menu"
        >
          x
        </button>
      </div>

      <nav
        ref={navRef}
        onScroll={handleSidebarScroll}
        className="flex-1 space-y-1 overflow-y-auto p-4"
      >
        {groupedLinks.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 pt-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">
              {group.title}
            </p>

            {group.links.map((link) => {
              const isActive =
                pathname === link.path || pathname.startsWith(`${link.path}/`);

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-white font-semibold text-gray-950"
                      : "text-gray-300 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-gray-950 text-white"
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    <SidebarIcon path={link.path} />
                  </span>

                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="rounded-xl bg-gray-900 p-4">
          <p className="text-sm font-semibold">
            {currentUser?.fullName || "IT Staff"}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {currentUser?.role || "Frontend setup in progress"}
          </p>

          {currentUser?.email && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {currentUser.email}
            </p>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 w-full rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
