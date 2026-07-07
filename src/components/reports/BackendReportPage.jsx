"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function BackendReportPage({
  title,
  description,
  reportType,
  fileName,
  columns,
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
          <TableWrapper variant="report">
            <table
              className="min-w-[1400px] w-full text-sm"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            >
              <thead
                className="bg-slate-50 text-left"
                style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
              >
                <tr
                  className="border-b border-slate-200"
                  style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                >
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap border-r border-slate-200 px-4 py-3 font-semibold text-slate-700 last:border-r-0"
                      style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody style={{ backgroundColor: "#ffffff", color: "#0f172a" }}>
                {records.map((record, index) => (
                  <tr
                    key={record.id || `${reportType}-${index}`}
                    className="border-b border-slate-100 bg-white hover:bg-slate-50"
                    style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap border-r border-slate-100 px-4 py-4 text-slate-700 last:border-r-0"
                        style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
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
