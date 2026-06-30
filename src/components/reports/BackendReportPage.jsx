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

  if (isLoading) {
    return (
      <LayoutWrapper>
        <PageHeader title={title} description={description} />
        <LoadingState
          title="Loading report"
          description="Fetching real-time report data from backend."
        />
      </LayoutWrapper>
    );
  }

  if (error) {
    return (
      <LayoutWrapper>
        <PageHeader title={title} description={description} />
        <ErrorState
          title="Report data unavailable"
          description={error}
          onRetry={loadReport}
        />
      </LayoutWrapper>
    );
  }

  return (
    <ReportPageShell
      title={title}
      description={description}
      data={records}
      fileName={fileName}
      sourceLabel="MySQL live report API"
      backendStatus="Connected"
    >
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{metric.label}</p>
            <h2 className={`mt-2 text-3xl font-bold ${metric.tone}`}>
              {metric.value}
            </h2>
          </div>
        ))}
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">{summaryTitle}</h3>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          This report is connected to backend MySQL records through the Phase 6
          report API. Export buttons currently use browser-side output; PDF,
          Excel and backup automation remain planned for Phase 7.
        </p>
      </section>

      {records.length === 0 ? (
        <EmptyState
          title="No report records found"
          description="The API is connected, but matching records are not available yet."
        />
      ) : (
        <TableWrapper>
          <table className="min-w-[1400px] w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="border-b border-gray-200">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700"
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
                      className="whitespace-nowrap px-4 py-4 text-gray-700"
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
      )}
    </ReportPageShell>
  );
}
