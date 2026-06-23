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
  const reportVersion = "v1.0";
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const generatedTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const attentionWords = [
    "Pending",
    "Damaged",
    "Expired",
    "Maintenance",
    "Rejected",
    "Under Review",
    "Under Inspection",
    "Cancelled",
    "Needs Repair",
  ];
  const attentionRecords = data.filter((item) =>
    Object.values(item).some((value) =>
      attentionWords.some((word) => String(value).includes(word))
    )
  ).length;
  const completedRecords = data.filter((item) =>
    ["Completed", "Delivered", "Returned", "Received", "Active", "Approved"].some(
      (word) => Object.values(item).some((value) => String(value).includes(word))
    )
  ).length;
  const appliedFilters = [
    { label: "Date Range", value: "All available records" },
    { label: "Department", value: "All departments" },
    { label: "Status", value: "All statuses" },
    { label: "View", value: "Audit-ready summary" },
  ];
  const executiveSummary = [
    { label: "Total Records", value: data.length },
    { label: "Completed / Active", value: completedRecords },
    { label: "Needs Attention", value: attentionRecords },
    { label: "Report Version", value: reportVersion },
  ];

  return (
    <LayoutWrapper>
      <PageHeader title={title} description={description} />

      <section className="print-area relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="report-watermark pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-bold uppercase text-gray-100">
          Internal
        </div>
        <div className="relative z-10 border-b border-gray-200 bg-white px-5 py-4">
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
                <div>
                  <p className="font-semibold uppercase tracking-wide text-gray-500">
                    Version
                  </p>
                  <p className="mt-1 font-bold text-gray-900">
                    {reportVersion}
                  </p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide text-gray-500">
                    Last Refreshed
                  </p>
                  <p className="mt-1 font-bold text-gray-900">
                    {generatedTime}
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

        <div className="relative z-10 space-y-6 p-5">
          <section className="report-section grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Executive Summary
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {executiveSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <p className="text-xs font-semibold text-gray-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                This report is prepared for internal IT review. Attention count
                highlights records containing pending, damaged, expired,
                maintenance or review-related statuses.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Applied Filters
              </p>
              <div className="mt-4 space-y-3">
                {appliedFilters.map((filter) => (
                  <div
                    key={filter.label}
                    className="flex justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-gray-500">
                      {filter.label}
                    </span>
                    <span className="text-right font-bold text-gray-900">
                      {filter.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {attentionRecords > 0 && (
            <section className="report-section rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-bold text-yellow-900">
                Attention Highlights
              </p>
              <p className="mt-1 text-sm leading-6 text-yellow-800">
                {attentionRecords} records need review before this report is
                considered final for audit or management circulation.
              </p>
            </section>
          )}

          {children}

          <section className="report-section rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Approval & Sign-off
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {["Prepared By", "Reviewed By", "Approved By"].map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <div className="mt-10 border-t border-gray-300 pt-2 text-xs font-semibold text-gray-500">
                    Name, signature and date
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="report-footer relative z-10 border-t border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-600">
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
