"use client";

import LayoutWrapper from "./LayoutWrapper";
import BackButton from "./BackButton";
import ReportExportButtons from "./ReportExportButtons";

export default function ReportPageShell({
  title,
  data = [],
  fileName = "report",
  printColumns,
  children,
}) {
  return (
    <LayoutWrapper>
      <section className="no-print mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] p-2.5 shadow-[0_14px_30px_rgba(6,12,24,0.12)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <BackButton href="/reports" label="Reports" />
          <ReportExportButtons
            data={data}
            fileName={fileName}
            showDataExports={Boolean(data?.length)}
            columns={printColumns}
          />
        </div>
      </section>

      <section
        className="screen-report print-root print-area report-document overflow-hidden border border-gray-200 bg-white shadow-sm"
      >
        <header className="report-letterhead border-b border-gray-300 bg-white px-5 py-4">
          <h1 className="text-2xl font-bold text-gray-950">{title}</h1>
        </header>

        <div className="report-body bg-white px-5 py-5">
          <section className="report-section">
            {children}
          </section>
        </div>

        <footer className="report-footer border-t border-gray-300 bg-gray-50 px-5 py-3 text-right text-xs text-gray-600">
          <p className="font-semibold">Page 1</p>
        </footer>
      </section>
    </LayoutWrapper>
  );
}
