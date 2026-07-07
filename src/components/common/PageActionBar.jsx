"use client";

import { useState } from "react";
import Link from "next/link";
import ProfessionalPrintDocument from "./ProfessionalPrintDocument";
import ReportExportButtons from "./ReportExportButtons";
import { showToast } from "./ToastHost";
import { readSession } from "@/lib/authSession";
import { canUseBackupExport, canUseWriteActions } from "@/lib/rbac";

function ToolbarIcon({ type }) {
  const commonProps = {
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-4 w-4",
  };

  const paths = {
    add: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </>
    ),
    export: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    print: (
      <>
        <path d="M7 9V4h10v5" />
        <path d="M6 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
        <path d="M7 14h10v6H7z" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[type]}</svg>;
}

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
    <section className="no-print mb-3 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-end gap-2">
        {addHref && canAddRecords && (
          <Link
            href={addHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-violet-700"
          >
            <ToolbarIcon type="add" />
            {addLabel}
          </Link>
        )}
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <ToolbarIcon type="refresh" />
          Refresh
        </button>
        {!exportData && canExportRecords && (
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <ToolbarIcon type="export" />
            Export
          </button>
        )}
        {exportData ? (
          <>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Print Format
              <select
                value={printFormat}
                onChange={(event) => setPrintFormat(event.target.value)}
                className="h-10 min-w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <ToolbarIcon type="print" />
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
