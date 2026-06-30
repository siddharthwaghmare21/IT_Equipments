"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import ReportPageShell from "@/components/common/ReportPageShell";
import StatusBadge from "@/components/common/StatusBadge";
import TableWrapper from "@/components/common/TableWrapper";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import { getReportData } from "@/lib/apiClient";
import { readSession } from "@/lib/authSession";

function formatValue(value, column = {}) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (column.type === "currency") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  if (column.type === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function defaultMetrics(records, metrics) {
  if (metrics?.length) {
    return metrics.map((metric) => ({
      label: metric.label,
      value: metric.resolve(records),
      tone: metric.tone || "text-gray-900",
    }));
  }

  return [
    { label: "Total Records", value: records.length, tone: "text-gray-900" },
  ];
}

function ReportHighlights({ items }) {
  return (
    <section className="report-print-hidden mb-6 border border-gray-300 bg-white">
      <div className="border-b border-gray-300 bg-gray-50 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700">
          Report Highlights
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((metric) => (
          <div
            key={metric.label}
            className="border-b border-r border-gray-200 px-4 py-3 last:border-r-0 xl:border-b-0"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {metric.label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${metric.tone}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportOperationalNote({ title }) {
  return (
    <section className="report-print-hidden mb-6 border border-gray-300 bg-white">
      <div className="grid grid-cols-1 text-sm md:grid-cols-[220px_1fr]">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 font-bold uppercase tracking-wide text-gray-500 md:border-b-0 md:border-r">
          {title}
        </div>
        <div className="px-4 py-3 leading-6 text-gray-700">
          Live MySQL report data is connected through Phase 6 APIs. CSV,
          Excel-style spreadsheet download and print/PDF tracking are available
          in Phase 7. Physical PDF rendering, scheduled exports and backup
          automation continue in later Phase 7 substeps.
        </div>
      </div>
    </section>
  );
}

export default function BackendReportPage({
  title,
  description,
  reportType,
  fileName,
  columns,
  metrics,
  summaryTitle = "Report Summary",
}) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    const session = readSession();

    if (!session?.token) {
      setRecords([]);
      setError("Login session expired. Please login again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getReportData(reportType, session.token);
      setRecords(response?.records || []);
    } catch (loadError) {
      setError(loadError.message || "Report data could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReport();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadReport]);

  const metricCards = useMemo(
    () => defaultMetrics(records, metrics),
    [records, metrics]
  );

  return (
    <ReportPageShell
      title={title}
      description={description}
      data={records}
      fileName={fileName}
      sourceLabel="MySQL live report API"
      backendStatus="Connected"
    >
      {isLoading ? (
        <LoadingState
          title="Loading report"
          description="Fetching real-time report data from backend."
        />
      ) : error ? (
        <ErrorState
          title="Report data unavailable"
          description={error}
          onRetry={loadReport}
        />
      ) : records.length === 0 ? (
        <EmptyState
          title="No report records found"
          description="The API is connected, but matching records are not available yet."
        />
      ) : (
        <>
          <ReportHighlights items={metricCards} />
          <ReportOperationalNote title={summaryTitle} />
          <TableWrapper>
            <table className="min-w-[1400px] w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr className="border-b border-gray-200">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap border-r border-gray-200 px-4 py-3 font-semibold text-gray-700 last:border-r-0"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={record.id || `${reportType}-${index}`}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap border-r border-gray-100 px-4 py-4 text-gray-700 last:border-r-0"
                      >
                        {column.status ? (
                          <StatusBadge
                            status={formatValue(record[column.key], column)}
                          />
                        ) : (
                          formatValue(record[column.key], column)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </>
      )}
    </ReportPageShell>
  );
}
