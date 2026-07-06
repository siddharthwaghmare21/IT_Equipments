"use client";

import { useState } from "react";
import Link from "next/link";
import ProfessionalPrintDocument from "./ProfessionalPrintDocument";
import ReportExportButtons from "./ReportExportButtons";
import { showToast } from "./ToastHost";
import { readSession } from "@/lib/authSession";
import { canUseBackupExport, canUseWriteActions } from "@/lib/rbac";

const printFormats = [
  {
    value: "a4-portrait",
    label: "A4 Portrait",
    description: "Official readable format",
  },
  {
    value: "a4-landscape",
    label: "A4 Landscape",
    description: "Full wide table format",
  },
  {
    value: "compact",
    label: "Compact Portrait",
    description: "Dense table format",
  },
  {
    value: "appendix",
    label: "Portrait + Appendix",
    description: "Key columns with details below",
  },
];

export default function PageActionBar({
  addHref,
  addLabel = "Add New",
  onRefresh,
  onExport,
  onPrint,
  exportData,
  exportFileName,
  printTitle,
  printDescription,
  children,
}) {
  const currentUser = readSession();
  const canAddRecords = canUseWriteActions(currentUser);
  const canExportRecords = canUseBackupExport(currentUser);
  const [printFormat, setPrintFormat] = useState("a4-portrait");
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
    <>
    <section className="no-print mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-end gap-2">
        {addHref && canAddRecords && (
          <Link
            href={addHref}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-violet-700"
          >
            {addLabel}
          </Link>
        )}
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          Refresh
        </button>
        {!exportData && canExportRecords && (
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Export
          </button>
        )}
        {exportData ? (
          <>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              Print Format
              <select
                value={printFormat}
                onChange={(event) => setPrintFormat(event.target.value)}
                className="h-10 min-w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
              >
                {printFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </label>
            <ReportExportButtons
              data={exportData}
              fileName={exportFileName || "records"}
              showDataExports={canExportRecords}
            />
          </>
        ) : (
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Print / PDF
          </button>
        )}
      </div>

      {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </section>
    {exportData && (
      <ProfessionalPrintDocument
        title={printTitle || "Records"}
        description={
          printDescription ||
          "Official printable report generated from current page records."
        }
        data={exportData}
        fileName={exportFileName || "records"}
        printFormat={printFormat}
      />
    )}
    </>
  );
}
