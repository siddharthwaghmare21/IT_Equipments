"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_REPORT_BRANDING,
  readStoredReportBranding,
} from "@/lib/reportBranding";

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
function formatColumnName(column) {
  return column
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase())
    .trim();
}

function buildReportId(fileName) {
  return `${fileName.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toUpperCase()}-2026`;
}

function ReportFooter({ fileName, pageNumber, totalPages }) {
  return (
    <footer className="report-footer">
      <span className="font-semibold">Report ID: {buildReportId(fileName)}</span>
      <span className="font-semibold">
        Page {pageNumber} / {totalPages}
      </span>
    </footer>
  );
}

function ReportLetterhead({ title, branding }) {
  return (
    <header className="report-letterhead border-b border-gray-300 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {branding.reportClassification} Report
          </p>
          <h1 className="mt-1 text-2xl font-black text-gray-950">
            {branding.companyName}
          </h1>
          <p className="mt-1 text-sm font-bold text-gray-800">{title}</p>
        </div>
        <div className="max-w-[240px] text-right text-xs font-semibold leading-5 text-gray-600">
          <p>{branding.companyAddress}</p>
          <p>{branding.companyEmail}</p>
          <p>{branding.companyPhone}</p>
        </div>
      </div>
    </header>
  );
}

export default function ProfessionalPrintDocument({
  title,
  data = [],
  columns: providedColumns = [],
  labelCard = null,
  detailSections = null,
  fileName = "records",
  branding: providedBranding = null,
}) {
  const [storedBranding] = useState(() => readStoredReportBranding());
  const branding = providedBranding || storedBranding;

  const columns = useMemo(() => {
    if (providedColumns.length > 0) {
      return providedColumns.slice(0, 6);
    }

    const firstRecord = data[0] || {};
    return Object.keys(firstRecord)
      .filter((column) => !hiddenColumns.has(column))
      .slice(0, 6)
      .map((column) => ({
        key: column,
        label: formatColumnName(column),
      }));
  }, [data, providedColumns]);

  const tablePages = useMemo(() => {
    const rowsPerPage = 18;
    const rows = data.length > 0 ? data : [];
    if (rows.length === 0) {
      return [[]];
    }

    const pages = [];
    for (let index = 0; index < rows.length; index += rowsPerPage) {
      pages.push(rows.slice(index, index + rowsPerPage));
    }
    return pages;
  }, [data]);

  const totalPages = detailSections || labelCard ? 1 : tablePages.length;

  return (
    <section
      className="print-only print-root print-area report-document bg-white"
    >
      {(detailSections || labelCard) ? (
        <article className="print-page border border-gray-200 bg-white shadow-sm">
          <ReportLetterhead title={title} branding={branding} />

          <div className="report-body flex-1 px-5 py-5">
            <section className="report-section">
              {labelCard && (
                <div className="mb-5 border-2 border-gray-900 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_220px]">
                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        {labelCard.eyebrow || "Official Asset Identification Label"}
                      </p>
                      <h3 className="mt-2 text-3xl font-black tracking-wide text-gray-950">
                        {labelCard.primary || "-"}
                      </h3>
                      <p className="mt-2 text-base font-bold text-gray-900">
                        {labelCard.secondary || "-"}
                      </p>
                      <div className="mt-4 grid grid-cols-1 gap-0 border border-gray-300 sm:grid-cols-2">
                        {(labelCard.fields || []).map((field, fieldIndex) => (
                          <div
                            key={`${field.label}-${fieldIndex}`}
                            className="grid grid-cols-[110px_1fr] border-b border-r border-gray-200 text-sm"
                          >
                            <span className="bg-gray-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                              {field.label}
                            </span>
                            <span className="px-3 py-2 font-semibold text-gray-900">
                              {field.value || "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-900 bg-gray-50 p-5 md:border-l md:border-t-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                        Label Control
                      </p>
                      <div className="mt-4 border border-gray-300 bg-white p-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Asset Tag
                        </p>
                        <p className="mt-2 text-xl font-black text-gray-950">
                          {labelCard.primary || "-"}
                        </p>
                      </div>
                      <div className="mt-8 border-t border-gray-400 pt-2 text-xs font-semibold text-gray-500">
                        Verified signature / date
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailSections && (
                <div className="space-y-4">
                  {detailSections.map((section) => (
                    <div key={section.title} className="overflow-hidden border border-gray-300">
                      <div className="bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                        {section.title}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {section.items.map((item, itemIndex) => (
                          <div
                            key={`${section.title}-${item.label}-${itemIndex}`}
                            className="grid grid-cols-[145px_1fr] border-b border-r border-gray-200 text-sm"
                          >
                            <span className="bg-gray-50 px-3 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                              {item.label}
                            </span>
                            <span className="px-3 py-3 font-semibold text-gray-900">
                              {item.value || "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <ReportFooter fileName={fileName} pageNumber={1} totalPages={totalPages} />
        </article>
      ) : (
        tablePages.map((pageRows, pageIndex) => (
          <article
            key={`${fileName}-page-${pageIndex}`}
            className="print-page border border-gray-200 bg-white shadow-sm"
          >
            {pageIndex === 0 && (
              <ReportLetterhead title={title} branding={branding} />
            )}

            <div className="report-body flex-1 px-5 py-5">
              <section className="report-section">
                <div className="overflow-hidden border border-gray-300">
                  <table className="w-full table-fixed text-[10px]">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            className="break-words border-b border-r border-gray-200 px-2 py-2 text-left font-bold uppercase tracking-wide text-gray-500 last:border-r-0"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((record, index) => (
                        <tr
                          key={`${fileName}-${pageIndex}-${index}`}
                          className="border-b border-gray-100"
                        >
                          {columns.map((column) => (
                            <td
                              key={column.key}
                              className="break-words border-r border-gray-100 px-2 py-2 font-medium text-gray-800 last:border-r-0"
                            >
                              {String(record[column.key] ?? "-")}
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
            </div>

            <ReportFooter
              fileName={fileName}
              pageNumber={pageIndex + 1}
              totalPages={totalPages}
            />
          </article>
        ))
      )}
    </section>
  );
}
