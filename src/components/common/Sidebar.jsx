"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/data/sidebarLinks";

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  return (
    <aside className="h-full w-72 bg-gray-950 text-white flex flex-col">
      <div className="h-16 px-5 flex items-center justify-between border-b border-gray-800">
        <div>
          <h2 className="text-lg font-bold">IT Assets</h2>
          <p className="text-xs text-gray-400">Management System</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="lg:hidden h-9 w-9 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive =
            pathname === link.path || pathname.startsWith(`${link.path}/`);

          return (
            <Link
              key={link.path}
              href={link.path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-white text-gray-950 font-semibold"
                  : "text-gray-300 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <span
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
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

      <div className="p-4 border-t border-gray-800">
        <div className="rounded-xl bg-gray-900 p-4">
          <p className="text-sm font-semibold">System Status</p>
          <p className="mt-1 text-xs text-gray-400">
            Frontend setup in progress
          </p>
        </div>
      </div>
    </aside>
  );
}