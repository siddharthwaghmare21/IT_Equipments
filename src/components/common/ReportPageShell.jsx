"use client";

import BackButton from "./BackButton";
import LayoutWrapper from "./LayoutWrapper";
import PageHeader from "./PageHeader";
import ReportExportButtons from "./ReportExportButtons";

export default function ReportPageShell({
  title,
  description,
  data = [],
  fileName,
  children,
}) {
  const reportId = `${fileName.toUpperCase()}-2026`;
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const generatedTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <LayoutWrapper>
      <PageHeader title={title} description={description} />

      <section className="print-area rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-white px-5 py-4">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-900 text-lg font-bold text-white">
                IT
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  IT Assets & Equipment Management
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Siddharth IT Department
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Main Office, Maharashtra, India | admin@company.com | +91
                  98765 43210
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-semibold uppercase tracking-wide text-gray-500">
                    Report ID
                  </p>
                  <p className="mt-1 font-bold text-gray-900">{reportId}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide text-gray-500">
                    Generated
                  </p>
                  <p className="mt-1 font-bold text-gray-900">
                    {generatedDate}, {generatedTime}
                  </p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide text-gray-500">
                    Prepared By
                  </p>
                  <p className="mt-1 font-bold text-gray-900">IT Department</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="mt-1 font-bold text-gray-900">
                    Frontend Preview
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Official Report
                </p>
                <h1 className="mt-1 text-2xl font-bold text-gray-900">
                  {title}
                </h1>
                <p className="mt-1 max-w-4xl text-sm leading-6 text-gray-600">
                  {description}
                </p>
              </div>

              <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
                <BackButton href="/reports" label="Reports" />
                <ReportExportButtons data={data} fileName={fileName} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                Classification: Internal
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                Source: Frontend Demo Data
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                Backend: Pending
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                Records: {data.length}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">{children}</div>

        <div className="report-footer border-t border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-600">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">
              Confidential - For internal IT department use only
            </p>
            <p>
              {title} | {reportId} | Page <span className="page-number" />
            </p>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
