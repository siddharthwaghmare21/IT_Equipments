"use client";

import LayoutWrapper from "./LayoutWrapper";
import BackButton from "./BackButton";
import ProfessionalPrintDocument from "./ProfessionalPrintDocument";
import ReportExportButtons from "./ReportExportButtons";

function buildReportId(fileName) {
  return `${fileName.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toUpperCase()}-2026`;
}

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

      <section className="screen-report no-print overflow-hidden rounded-[24px] border border-[#2c3f63] bg-[#18253d] shadow-sm">
        <header className="report-letterhead border-b border-[#314666] bg-[#101a2b] px-5 py-4">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </header>

        <div className="report-body bg-[#18253d] px-5 py-5">
          <section className="report-section">
            {children}
          </section>
        </div>

        <footer className="report-footer flex items-center justify-between gap-3 border-t border-[#314666] bg-[#101a2b] px-5 py-3 text-xs text-[#c8d4ec]">
          <p className="font-semibold">Report ID: {buildReportId(fileName)}</p>
          <p className="font-semibold">{data.length} records</p>
        </footer>
      </section>

      <ProfessionalPrintDocument
        title={title}
        data={data}
        columns={printColumns}
        fileName={fileName}
      />
    </LayoutWrapper>
  );
}
