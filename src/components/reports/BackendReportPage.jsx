"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReportPageShell from "@/components/common/ReportPageShell";
import StatusBadge from "@/components/common/StatusBadge";
import TableWrapper from "@/components/common/TableWrapper";
import TablePagination from "@/components/common/TablePagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 10;
  const visibleColumns = useMemo(() => columns.slice(0, 8), [columns]);
  const printColumns = useMemo(() => columns.slice(0, 6), [columns]);
  const pagedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return records.slice(startIndex, startIndex + pageSize);
  }, [currentPage, records]);

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
      data={records}
      fileName={fileName}
      printColumns={printColumns}
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
            <table className="min-w-[1400px] w-full text-xs">
              <thead className="bg-[#101a2b]">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap border-b border-r border-[#314666] px-3 py-2 text-center font-bold uppercase tracking-wide text-[#9fb3d7] last:border-r-0"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {pagedRecords.map((record, index) => (
                  <tr
                    key={record.id || `${reportType}-${index}`}
                    className="border-b border-[#2c3f63] bg-[#18253d] hover:bg-[#1d2d49]"
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap border-r border-[#2c3f63] px-3 py-2 text-center font-medium text-[#dce7fb] last:border-r-0"
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
            <TablePagination
              currentPage={currentPage}
              totalItems={records.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="report rows"
            />
          </TableWrapper>
        </>
      )}
    </ReportPageShell>
  );
}
