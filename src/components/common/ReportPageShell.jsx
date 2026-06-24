"use client";

import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton";
import LayoutWrapper from "./LayoutWrapper";
import PageHeader from "./PageHeader";
import ReportExportButtons from "./ReportExportButtons";

const REPORT_BRANDING_KEY = "itReportBranding";
const defaultBranding = {
  companyName: "Siddharth IT Department",
  companyEmail: "admin@company.com",
  companyPhone: "+91 98765 43210",
  companyAddress: "Main Office, Maharashtra, India",
  reportLogoText: "IT",
  reportPreparedBy: "IT Department",
  reportClassification: "Internal",
};

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
  const [branding, setBranding] = useState(defaultBranding);
  const [printFormat, setPrintFormat] = useState("a4-portrait");
  const selectedPrintFormat =
    printFormats.find((format) => format.value === printFormat) ||
    printFormats[0];

  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const generatedTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const reportId = `${fileName.toUpperCase()}-2026`;

  const reportMetrics = useMemo(() => {
    const attentionRecords = data.filter((item) =>
      Object.values(item).some((value) =>
        attentionWords.some((word) => String(value).includes(word))
      )
    ).length;
    const completedRecords = data.filter((item) =>
      ["Completed", "Delivered", "Returned", "Received", "Active", "Approved"].some(
        (word) =>
          Object.values(item).some((value) => String(value).includes(word))
      )
    ).length;

    return [
      { label: "Total Records", value: data.length },
      { label: "Completed / Active", value: completedRecords },
      { label: "Needs Attention", value: attentionRecords },
      { label: "Classification", value: branding.reportClassification },
    ];
  }, [data, branding.reportClassification]);

  const reportMeta = [
    { label: "Report ID", value: reportId },
    { label: "Generated On", value: `${generatedDate}, ${generatedTime}` },
    { label: "Prepared By", value: branding.reportPreparedBy },
    { label: "Source", value: "Frontend sample data" },
    { label: "Backend Status", value: "Pending integration" },
    { label: "Print Format", value: selectedPrintFormat.label },
    { label: "Version", value: "v1.0" },
  ];

  const appliedFilters = [
    { label: "Date Range", value: "All available records" },
    { label: "Department", value: "All departments" },
    { label: "Status", value: "All statuses" },
    { label: "Report View", value: "Detailed audit view" },
  ];

  useEffect(() => {
    const savedBranding = JSON.parse(
      localStorage.getItem(REPORT_BRANDING_KEY) || "null"
    );

    if (savedBranding) {
      setTimeout(() => {
        setBranding((current) => ({ ...current, ...savedBranding }));
      }, 0);
    }
  }, []);

  return (
    <LayoutWrapper>
      <div className="no-print">
        <PageHeader title={title} description={description} />
      </div>

      <section
        className={`print-area report-document report-format-${printFormat} overflow-hidden border border-gray-200 bg-white shadow-sm`}
      >
        <header className="report-letterhead border-b-4 border-gray-900 bg-white px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-gray-900 bg-gray-900 text-lg font-bold text-white">
                {branding.reportLogoText}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  IT Assets & Equipment Management
                </p>
                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  {branding.companyName}
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {branding.companyAddress}
                </p>
                <p className="text-sm leading-6 text-gray-600">
                  {branding.companyEmail} | {branding.companyPhone}
                </p>
              </div>
            </div>

            <div className="border border-gray-300">
              {reportMeta.slice(0, 3).map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[105px_1fr] border-b border-gray-200 text-xs last:border-b-0"
                >
                  <span className="bg-gray-50 px-3 py-2 font-bold uppercase text-gray-500">
                    {item.label}
                  </span>
                  <span className="px-3 py-2 font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="report-title-block border-b border-gray-200 px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Official Report
              </p>
              <h1 className="mt-1 text-3xl font-bold text-gray-950">
                {title}
              </h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">
                {description}
              </p>
            </div>

            <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center">
              <BackButton href="/reports" label="Reports" />
              <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
                Print Format
                <select
                  value={printFormat}
                  onChange={(event) => setPrintFormat(event.target.value)}
                  className="min-w-44 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-gray-900"
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

          <div className="no-print mt-4 border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <span className="font-bold text-gray-900">
              {selectedPrintFormat.label}:
            </span>{" "}
            {selectedPrintFormat.description}. Backend PDF export will use this
            same format later.
          </div>
        </div>

        <div className="report-body space-y-5 px-5 py-5">
          <section className="report-section">
            <h2 className="report-section-title">Report Metadata</h2>
            <div className="overflow-hidden border border-gray-300">
              <table className="w-full text-sm">
                <tbody>
                  {reportMeta.map((item) => (
                    <tr key={item.label} className="border-b border-gray-200">
                      <th className="w-52 bg-gray-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        {item.label}
                      </th>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-section">
            <h2 className="report-section-title">Executive Summary</h2>
            <div className="grid grid-cols-2 border border-gray-300 lg:grid-cols-4">
              {reportMetrics.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-r border-gray-200 px-4 py-3 last:border-r-0 lg:border-b-0"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl font-bold text-gray-950">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h2 className="report-section-title">Applied Filters</h2>
            <div className="overflow-hidden border border-gray-300">
              <table className="w-full text-sm">
                <tbody>
                  {appliedFilters.map((filter) => (
                    <tr key={filter.label} className="border-b border-gray-200">
                      <th className="w-52 bg-gray-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        {filter.label}
                      </th>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {filter.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-section">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="report-section-title">Detailed Records</h2>
                <p className="text-sm text-gray-600">
                  Tables below are the official report body for review, print
                  and export.
                </p>
              </div>
              <span className="w-fit border border-gray-300 px-3 py-1 text-xs font-bold uppercase text-gray-600">
                {data.length} records
              </span>
            </div>
            {children}
          </section>

          <section className="report-section">
            <h2 className="report-section-title">Reviewer Notes</h2>
            <div className="border border-gray-300">
              {[
                "Verify records marked as pending, damaged, expired or under review.",
                "Confirm department-wise ownership before final circulation.",
                "Replace sample data with backend records before official export.",
              ].map((note, index) => (
                <div
                  key={note}
                  className="grid grid-cols-[44px_1fr] border-b border-gray-200 text-sm last:border-b-0"
                >
                  <span className="bg-gray-50 px-4 py-3 font-bold text-gray-500">
                    {index + 1}
                  </span>
                  <span className="px-4 py-3 font-semibold text-gray-800">
                    {note}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h2 className="report-section-title">Approval & Sign-off</h2>
            <div className="grid grid-cols-1 border border-gray-300 md:grid-cols-3">
              {["Prepared By", "Reviewed By", "Approved By"].map((label) => (
                <div
                  key={label}
                  className="border-b border-r border-gray-200 p-4 last:border-r-0 md:border-b-0"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    {label}
                  </p>
                  <div className="mt-12 border-t border-gray-400 pt-2 text-xs font-semibold text-gray-500">
                    Name, signature and date
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="report-footer border-t border-gray-300 bg-gray-50 px-5 py-3 text-xs text-gray-600">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">
              Confidential - For internal IT department use only
            </p>
            <p>
              {title} | {reportId} | Page <span className="page-number" />
            </p>
          </div>
        </footer>
      </section>
    </LayoutWrapper>
  );
}
