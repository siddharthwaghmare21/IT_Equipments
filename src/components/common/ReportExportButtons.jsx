"use client";

import { showToast } from "./ToastHost";
import { createExportJob } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";

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
            className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
          >
            Export Excel
          </button>
        </>
      )}

      <button
        type="button"
        onClick={printReport}
        className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
      >
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
