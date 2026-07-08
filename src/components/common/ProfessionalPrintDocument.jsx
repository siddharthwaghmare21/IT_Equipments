"use client";

import { useMemo } from "react";
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

export default function ProfessionalPrintDocument({
  title,
  data = [],
  labelCard = null,
  detailSections = null,
  fileName = "records",
}) {
  const columns = useMemo(() => {
    const firstRecord = data[0] || {};
    return Object.keys(firstRecord)
      .filter((column) => !hiddenColumns.has(column))
      .slice(0, 12);
  }, [data]);
  return (
    <section
      className="print-only print-root print-area report-document overflow-hidden border border-gray-200 bg-white shadow-sm"
    >
      <header className="report-letterhead border-b border-gray-300 bg-white px-5 py-4">
        <h1 className="text-2xl font-bold text-gray-950">{title}</h1>
      </header>

      <div className="report-body px-5 py-5">
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

          {detailSections ? (
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
          ) : (
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
                    <tr
                      key={`${fileName}-${index}`}
                      className="border-b border-gray-100"
                    >
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
          )}
        </section>
      </div>

      <footer className="report-footer border-t border-gray-300 bg-gray-50 px-5 py-3 text-right text-xs text-gray-600">
        <p className="font-semibold">Page 1</p>
      </footer>
    </section>
  );
}
