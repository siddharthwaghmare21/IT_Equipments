"use client";

import { useState } from "react";
import BackButton from "./BackButton";
import LayoutWrapper from "./LayoutWrapper";
import PageHeader from "./PageHeader";
import ReportExportButtons from "./ReportExportButtons";

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

export default function ReportPageShell({
  title,
  description,
  data = [],
  fileName,
  children,
}) {
  const [printFormat, setPrintFormat] = useState("a4-portrait");
  const reportId = `${fileName.toUpperCase()}-2026`;

  return (
    <LayoutWrapper>
      <div className="no-print">
        <PageHeader title={title} description={description} />
      </div>

      <section
        className={`print-area report-document report-format-${printFormat} overflow-hidden border border-gray-200 bg-white shadow-sm dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-100`}
      >
        <header className="report-letterhead border-b-2 border-gray-900 bg-white px-5 py-4 dark:!border-slate-700 dark:!bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-bold text-gray-950 dark:!text-white">{title}</h1>
            <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
              <BackButton href="/reports" label="Reports" />
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600 dark:!text-slate-200">
                Print Format
                <select
                  value={printFormat}
                  onChange={(event) => setPrintFormat(event.target.value)}
                  className="min-w-44 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-gray-900 dark:!border-slate-600 dark:!bg-slate-950 dark:!text-white"
                >
                  {printFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </label>
              <ReportExportButtons data={data} fileName={fileName} />
            </div>
          </div>
        </header>

        <div className="report-body px-5 py-5 dark:!bg-slate-900">
          <section className="report-section">
            {children}
          </section>
        </div>

        <footer className="report-footer border-t border-gray-300 bg-gray-50 px-5 py-3 text-xs text-gray-600 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">Report ID: {reportId}</p>
            <p className="font-semibold">Page 1</p>
          </div>
        </footer>
      </section>
    </LayoutWrapper>
  );
}
