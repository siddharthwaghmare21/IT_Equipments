"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { canAccessPath } from "@/lib/rbac";

const commands = [
  { label: "Open Dashboard", href: "/dashboard", keywords: "home overview" },
  { label: "Open Assets", href: "/assets", keywords: "equipment laptop stock" },
  { label: "Add Asset", href: "/assets/add", keywords: "new register equipment" },
  { label: "Open Purchases", href: "/purchases", keywords: "po procurement" },
  { label: "Open Deliveries", href: "/deliveries", keywords: "issue handover" },
  { label: "Create Delivery", href: "/deliveries/delivery", keywords: "assign issue" },
  { label: "Open Returns", href: "/returns", keywords: "return receive" },
  { label: "Open Maintenance", href: "/maintenance", keywords: "repair service" },
  { label: "Open Reports", href: "/reports", keywords: "export print" },
  { label: "Open Settings", href: "/settings", keywords: "system preferences" },
];

export default function CommandPalette({ currentUser }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const allowedCommands = commands.filter((command) =>
      canAccessPath(currentUser, command.href)
    );

    if (!normalizedQuery) return allowedCommands;

    return allowedCommands.filter((command) =>
      `${command.label} ${command.keywords}`.toLowerCase().includes(normalizedQuery)
    );
  }, [currentUser, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] bg-black/50 px-4 pt-20">
      <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">Quick Actions</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <input
          autoFocus
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search page or action..."
          className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
        />

        <div className="mt-3 max-h-80 overflow-y-auto">
          {filteredCommands.map((command) => (
            <button
              key={command.href}
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(command.href);
              }}
              className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              {command.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
