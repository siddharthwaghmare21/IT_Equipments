"use client";

import { showToast } from "./ToastHost";
import { createExportJob } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";

function ExportIcon({ type }) {
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
    csv: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
    excel: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="m9 11 4 6" />
        <path d="m13 11-4 6" />
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

export default function ReportExportButtons({
  data = [],
  fileName = "report",
  showDataExports = true,
}) {
  async function createTrackingJob(exportType) {
    const token = getSessionToken();

    if (!token) {
      showToast("Login session expired. Export tracking was not saved.", "warning");
      return;
    }

    try {
      await createExportJob(
        {
          exportType,
          exportModule: fileName,
          rowCount: data.length,
          remarks: `${exportType} export requested from report page.`,
        },
        token
      );
    } catch {
      showToast("Export downloaded, but tracking job could not be saved.", "warning");
    }
  }

  async function exportToCSV() {
    if (!data || data.length === 0) {
      showToast("No data available to export.", "warning");
      return;
    }

    const headers = Object.keys(data[0]);

    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] ?? "";
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    await createTrackingJob("CSV");
    showToast("CSV export downloaded.");
  }

  async function exportToExcel() {
    if (!data || data.length === 0) {
      showToast("No data available to export.", "warning");
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = data
      .map(
        (row) =>
          `<tr>${headers
            .map((header) => `<td>${escapeHtml(row[header] ?? "")}</td>`)
            .join("")}</tr>`
      )
      .join("");
    const table = `
      <html>
        <head><meta charset="utf-8" /></head>
        <body>
          <table border="1">
            <thead><tr>${headers
              .map((header) => `<th>${escapeHtml(header)}</th>`)
              .join("")}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`;
    const blob = new Blob([table], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.xls`;
    link.click();

    URL.revokeObjectURL(url);
    await createTrackingJob("Excel");
    showToast("Excel export downloaded.");
  }

  async function printReport() {
    await createTrackingJob("PDF");
    window.print();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      {showDataExports && (
        <>
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
          >
            <ExportIcon type="csv" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
          >
            <ExportIcon type="excel" />
            Export Excel
          </button>
        </>
      )}

      <button
        type="button"
        onClick={printReport}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
      >
        <ExportIcon type="print" />
        Print / PDF
      </button>
    </div>
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
