"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import PageActionBar from "@/components/common/PageActionBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import { getActivityLogs } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";

function ActivityStatusBadge({ status }) {
  const statusStyles = {
    Success: "bg-green-100 text-green-700 border-green-200",
    Failed: "bg-red-100 text-red-700 border-red-200",
    Warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function formatLogDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("en-CA");
}

function formatLogTime(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapActivityLogFromApi(log) {
  const createdAt = log.createdAt || log.CreatedAt;

  return {
    id: log.activityLogId || log.ActivityLogId,
    date: formatLogDate(createdAt),
    time: formatLogTime(createdAt),
    module: log.moduleName || log.ModuleName || "-",
    action: log.actionName || log.ActionName || "-",
    description: log.description || log.Description || "-",
    performedBy: log.userFullName || log.UserFullName || "System",
    role: log.userRoleName || log.UserRoleName || "-",
    status: log.status || log.Status || "-",
  };
}

export default function ActivityLogsPage() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [activeModule, setActiveModule] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivityLogs = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getActivityLogs(token);
      setActivityLogs((data || []).map(mapActivityLogFromApi));
    } catch (requestError) {
      setError(requestError.message || "Unable to load activity logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadActivityLogs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadActivityLogs]);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const searchText = `
        ${log.date}
        ${log.time}
        ${log.module}
        ${log.action}
        ${log.description}
        ${log.performedBy}
        ${log.role}
        ${log.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesModule =
        activeModule === "All" || log.module === activeModule;

      const matchesStatus =
        statusFilter === "All" || log.status === statusFilter;

      const matchesUser =
        userFilter === "All" || log.performedBy === userFilter;

      const matchesDate = !dateFilter || log.date === dateFilter;

      return matchesSearch && matchesModule && matchesStatus && matchesUser && matchesDate;
    });
  }, [activityLogs, search, activeModule, statusFilter, userFilter, dateFilter]);

  const moduleFilters = [
    "All",
    ...new Set(activityLogs.map((log) => log.module).filter(Boolean)),
  ];
  const userFilters = [
    "All",
    ...new Set(activityLogs.map((log) => log.performedBy).filter(Boolean)),
  ];
  const statusFilters = [
    "All",
    ...new Set(activityLogs.map((log) => log.status).filter(Boolean)),
  ];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Activity Logs"
      />

      {isLoading ? (
        <LoadingState
          title="Loading activity logs"
          description="Fetching audit records from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load activity logs"
          description={error}
          onRetry={loadActivityLogs}
        />
      ) : (
        <>
      <PageActionBar
        onRefresh={loadActivityLogs}
        exportData={filteredLogs}
        exportFileName="activity-logs"
        printTitle="Activity Logs"
        printDescription="Official activity log report generated from the current filtered audit records."
      />

      <section className="mb-4 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by module, action, user, role, status or description..."
            className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-[#7d90b2] focus:border-[#7c4cf3]"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {moduleFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveModule(filter)}
                className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                  activeModule === filter
                    ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(106,61,240,0.2)]"
                    : "border-[#314666] bg-[#101a2b] text-[#b8c7e6] hover:bg-[#16233a]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#7c4cf3]"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Statuses" : status}
                </option>
              ))}
            </select>

            <select
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
              className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#7c4cf3]"
            >
              {userFilters.map((user) => (
                <option key={user} value={user}>
                  {user === "All" ? "All Users" : user}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#7c4cf3]"
            />
          </div>
        </div>
      </section>

      <div className="no-print mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#b8c7e6]">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredLogs.length}
          </span>{" "}
          activity log records
        </p>
      </div>

      <TableWrapper>
        <table className="min-w-[1300px] w-full text-sm">
          <thead className="bg-[#101a2b] text-left">
            <tr className="border-b border-[#263754]">
              <th className="px-4 py-3 font-semibold text-[#8fa4c7]">Date</th>
              <th className="px-4 py-3 font-semibold text-[#8fa4c7]">Time</th>
              <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                Module
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                Action
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                Description
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                Performed By
              </th>
              <th className="px-4 py-3 font-semibold text-[#8fa4c7]">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#263754] bg-[#18253d]">
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-[#1f2f4a]"
              >
                <td className="px-4 py-4 font-semibold text-white">
                  {log.date}
                </td>

                <td className="px-4 py-4 text-[#c8d4ec]">{log.time}</td>

                <td className="px-4 py-4 text-[#c8d4ec]">{log.module}</td>

                <td className="px-4 py-4 font-semibold text-white">
                  {log.action}
                </td>

                <td className="px-4 py-4 text-[#c8d4ec]">
                  {log.description}
                </td>

                <td className="px-4 py-4 text-[#c8d4ec]">
                  {log.performedBy}
                </td>

                <td className="px-4 py-4 text-[#c8d4ec]">{log.role}</td>

                <td className="px-4 py-4">
                  <ActivityStatusBadge status={log.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="No activity logs found"
              description="Try changing module, status, user, date or search filters."
            />
          </div>
        )}
      </TableWrapper>
        </>
      )}
    </LayoutWrapper>
  );
}
