"use client";

import Link from "next/link";
import { showToast } from "./ToastHost";
import { readSession } from "@/lib/authSession";
import { canUseBackupExport, canUseWriteActions } from "@/lib/rbac";

export default function PageActionBar({
  addHref,
  addLabel = "Add New",
  onRefresh,
  onExport,
  onPrint,
  children,
}) {
  const currentUser = readSession();
  const canAddRecords = canUseWriteActions(currentUser);
  const canExportRecords = canUseBackupExport(currentUser);

  function handleRefresh() {
    if (onRefresh) {
      onRefresh();
      return;
    }

    showToast("Page refreshed.");
  }

  function handleExport() {
    if (onExport) {
      onExport();
      return;
    }

    showToast("Use the report pages for backend-connected exports.", "warning");
  }

  function handlePrint() {
    if (onPrint) {
      onPrint();
      return;
    }

    window.print();
  }

  return (
    <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {addHref && canAddRecords && (
          <Link
            href={addHref}
            className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            {addLabel}
          </Link>
        )}

        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Refresh
        </button>
        {canExportRecords && (
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Export
          </button>
        )}
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Print
        </button>
      </div>

      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </section>
  );
}
