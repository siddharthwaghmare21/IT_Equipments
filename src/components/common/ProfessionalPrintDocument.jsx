"use client";

import { useEffect, useMemo, useState } from "react";
import { getReportBrandingSettings } from "@/lib/apiClient";

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
const reportBrandingFieldMap = {
  company_name: "companyName",
  company_email: "companyEmail",
  company_phone: "companyPhone",
  company_address: "companyAddress",
  report_logo_text: "reportLogoText",
  report_prepared_by: "reportPreparedBy",
  report_classification: "reportClassification",
};
const hiddenColumns = new Set([
  "id",
  "assetId",
  "departmentId",
  "vendorId",
  "workOrderId",
  "deliveryId",
  "returnId",
  "maintenanceId",
  "transferId",
]);

function mapSettingsFromApi(apiSettings = []) {
  return apiSettings.reduce((mappedSettings, setting) => {
    const settingKey = setting.settingKey || setting.SettingKey;
    const settingValue = setting.settingValue ?? setting.SettingValue ?? "";
    const fieldName = reportBrandingFieldMap[settingKey];

    if (fieldName) {
      mappedSettings[fieldName] = settingValue;
    }

    return mappedSettings;
  }, {});
}

function formatColumnName(column) {
  return column
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase())
    .trim();
}

export default function ProfessionalPrintDocument({
  title,
  description,
  data = [],
  fileName = "records",
  sourceLabel = "MySQL live API",
  backendStatus = "Connected",
}) {
  const [branding, setBranding] = useState(defaultBranding);

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

  const columns = useMemo(() => {
    const firstRecord = data[0] || {};
    return Object.keys(firstRecord)
      .filter((column) => !hiddenColumns.has(column))
      .slice(0, 12);
  }, [data]);

  useEffect(() => {
    let isMounted = true;

    async function loadBranding() {
      try {
        const apiSettings = await getReportBrandingSettings();
        const mappedSettings = mapSettingsFromApi(apiSettings);

        if (isMounted) {
          setBranding((current) => ({ ...current, ...mappedSettings }));
        }
      } catch {
        const savedBranding = JSON.parse(
          localStorage.getItem(REPORT_BRANDING_KEY) || "null"
        );

        if (isMounted && savedBranding) {
          setBranding((current) => ({ ...current, ...savedBranding }));
        }
      }
    }

    loadBranding();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="print-only print-area report-document report-format-a4-landscape overflow-hidden border border-gray-200 bg-white shadow-sm">
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
            {[
              ["Report ID", reportId],
              ["Generated On", `${generatedDate}, ${generatedTime}`],
              ["Prepared By", branding.reportPreparedBy],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[105px_1fr] border-b border-gray-200 text-xs last:border-b-0"
              >
                <span className="bg-gray-50 px-3 py-2 font-bold uppercase text-gray-500">
                  {label}
                </span>
                <span className="px-3 py-2 font-semibold text-gray-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="report-title-block border-b border-gray-200 px-5 py-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Official Report
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">{title}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">
          {description}
        </p>
      </div>

      <div className="report-body space-y-5 px-5 py-5">
        <section className="report-section report-print-hidden">
          <h2 className="report-section-title">Report Metadata</h2>
          <div className="overflow-hidden border border-gray-300">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Source", sourceLabel],
                  ["Backend Status", backendStatus],
                  ["Classification", branding.reportClassification],
                  ["Total Records", data.length],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-200">
                    <th className="w-52 bg-gray-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      {label}
                    </th>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="report-section-title">Detailed Records</h2>
              <p className="text-sm text-gray-600">
                Official printable view generated from current page records.
              </p>
            </div>
            <span className="border border-gray-300 px-3 py-1 text-xs font-bold uppercase text-gray-600">
              {data.length} records
            </span>
          </div>

          <div className="overflow-hidden border border-gray-300">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="border-b border-r border-gray-200 px-3 py-2 text-left font-bold uppercase tracking-wide text-gray-500 last:border-r-0"
                    >
                      {formatColumnName(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((record, index) => (
                  <tr key={`${fileName}-${index}`} className="border-b border-gray-100">
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="border-r border-gray-100 px-3 py-2 font-medium text-gray-800 last:border-r-0"
                      >
                        {String(record[column] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-4 py-6 text-center font-semibold text-gray-500"
                    >
                      No records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
        <div className="flex items-center justify-between">
          <p className="font-semibold">
            Confidential - For internal IT department use only
          </p>
          <p>
            {title} | {reportId} | Page <span className="page-number" />
          </p>
        </div>
      </footer>
    </section>
  );
}
