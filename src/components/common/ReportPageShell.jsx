"use client";

import LayoutWrapper from "./LayoutWrapper";
import BackButton from "./BackButton";
import ReportExportButtons from "./ReportExportButtons";

export default function ReportPageShell({
  title,
  data = [],
  fileName = "report",
  children,
}) {
  return (
    <LayoutWrapper>
      <section
        className="screen-report print-root print-area report-document overflow-hidden border border-gray-200 bg-white shadow-sm dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-100"
      >
        <header className="report-letterhead border-b border-gray-300 bg-white px-5 py-4 dark:!border-slate-700 dark:!bg-slate-900">
          <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <BackButton href="/reports" label="Reports" />
            <ReportExportButtons
              data={data}
              fileName={fileName}
              showDataExports={Boolean(data?.length)}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-950 dark:!text-white">{title}</h1>
        </header>

        <div className="report-body px-5 py-5 dark:!bg-slate-900">
          <section className="report-section">
            {children}
          </section>
        </div>

        <footer className="report-footer border-t border-gray-300 bg-gray-50 px-5 py-3 text-right text-xs text-gray-600 dark:!border-slate-700 dark:!bg-slate-900 dark:!text-slate-200">
          <p className="font-semibold">Page 1</p>
        </footer>
      </section>
    </LayoutWrapper>
  );
}
