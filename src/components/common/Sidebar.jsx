"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/data/sidebarLinks";

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

export default function Sidebar({
  onClose,
  currentUser,
  isSuperAdmin = false,
  canManageAccessRequests = false,
  onLogout,
}) {
  const pathname = usePathname();

  const visibleLinks = [
    ...sidebarLinks,
    ...(canManageAccessRequests ? accessManagementLinks : []),
    ...(isSuperAdmin ? superAdminOnlyLinks : []),
  ];

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

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleLinks.map((link) => {
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
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                  isActive
                    ? "bg-gray-950 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                {link.short}
              </span>

              <span>{link.label}</span>
            </Link>
          );
        })}
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
