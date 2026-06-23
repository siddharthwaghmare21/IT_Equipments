"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ReportExportButtons from "@/components/common/ReportExportButtons";
import { EmptyState } from "@/components/common/StateBlock";

const activityLogs = [
  {
    id: 1,
    date: "2026-03-01",
    time: "10:15 AM",
    module: "Assets",
    action: "Asset Added",
    description: "New asset AST-001 - Dell Latitude 5420 was added.",
    performedBy: "IT Admin",
    role: "Admin",
    status: "Success",
  },
  {
    id: 2,
    date: "2026-03-01",
    time: "11:05 AM",
    module: "Purchases",
    action: "Purchase Created",
    description: "Work Order WO-2026-001 was created for Dell Technologies.",
    performedBy: "IT Admin",
    role: "Admin",
    status: "Success",
  },
  {
    id: 3,
    date: "2026-03-02",
    time: "09:30 AM",
    module: "Vendors",
    action: "Vendor Updated",
    description: "Vendor details for HP World were updated.",
    performedBy: "IT Manager",
    role: "Manager",
    status: "Success",
  },
  {
    id: 4,
    date: "2026-03-02",
    time: "12:45 PM",
    module: "Deliveries",
    action: "Asset Delivered",
    description: "Asset AST-001 was delivered to Rahul Patil.",
    performedBy: "IT Admin",
    role: "Admin",
    status: "Success",
  },
  {
    id: 5,
    date: "2026-03-03",
    time: "03:20 PM",
    module: "Returns",
    action: "Asset Returned",
    description: "Asset AST-003 was returned by Amit Shinde.",
    performedBy: "IT Support",
    role: "Support",
    status: "Success",
  },
  {
    id: 6,
    date: "2026-03-04",
    time: "04:10 PM",
    module: "Maintenance",
    action: "Maintenance Updated",
    description: "Maintenance record MNT-001 status changed to In Progress.",
    performedBy: "IT Admin",
    role: "Admin",
    status: "Success",
  },
  {
    id: 7,
    date: "2026-03-05",
    time: "01:25 PM",
    module: "Departments",
    action: "Department Updated",
    description: "Accounts department receiver tracking details were updated.",
    performedBy: "IT Admin",
    role: "Admin",
    status: "Success",
  },
  {
    id: 8,
    date: "2026-03-05",
    time: "05:40 PM",
    module: "Login",
    action: "Login Failed",
    description: "Invalid login attempt detected for admin account.",
    performedBy: "Unknown User",
    role: "Guest",
    status: "Failed",
  },
];

const moduleFilters = [
  "All",
  "Assets",
  "Purchases",
  "Vendors",
  "Departments",
  "Deliveries",
  "Returns",
  "Maintenance",
  "Login",
];

function ActivityStatusBadge({ status }) {
  const statusStyles = {
    Success: "bg-green-100 text-green-700 border-green-200",
    Failed: "bg-red-100 text-red-700 border-red-200",
    Warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function ActivityLogsPage() {
  const [search, setSearch] = useState("");
  const [activeModule, setActiveModule] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

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
  }, [search, activeModule, statusFilter, userFilter, dateFilter]);

  const successLogs = activityLogs.filter(
    (log) => log.status === "Success"
  ).length;

  const failedLogs = activityLogs.filter((log) => log.status === "Failed")
    .length;

  const uniqueModules = new Set(activityLogs.map((log) => log.module)).size;
  const userFilters = ["All", ...new Set(activityLogs.map((log) => log.performedBy))];
  const statusFilters = ["All", "Success", "Failed", "Warning"];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Activity Logs"
        description="Track system activities, user actions, login events and audit history."
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Logs</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {activityLogs.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Successful Actions</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {successLogs}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Failed Actions</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {failedLogs}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Tracked Modules</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {uniqueModules}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by module, action, user, role, status or description..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {moduleFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveModule(filter)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                  activeModule === filter
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredLogs.length}
          </span>{" "}
          activity log records
        </p>

        <ReportExportButtons data={filteredLogs} fileName="activity-logs" />
      </div>

      <TableWrapper>
        <table className="min-w-[1300px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Time</th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Module
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Action
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Description
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Performed By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {log.date}
                </td>

                <td className="px-4 py-4 text-gray-700">{log.time}</td>

                <td className="px-4 py-4 text-gray-700">{log.module}</td>

                <td className="px-4 py-4 font-semibold text-gray-900">
                  {log.action}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {log.description}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {log.performedBy}
                </td>

                <td className="px-4 py-4 text-gray-700">{log.role}</td>

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

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">Activity Timeline</h3>

        <div className="mt-4 space-y-4">
          {filteredLogs.slice(0, 5).map((log) => (
            <div key={`timeline-${log.id}`} className="flex gap-3">
              <span
                className={`mt-1 h-3 w-3 rounded-full ${
                  log.status === "Failed" ? "bg-red-600" : "bg-green-700"
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {log.action}
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {log.description}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  {log.date} {log.time} by {log.performedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">Audit Note</h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Activity logs are read-only audit records. After backend integration,
          logs will be automatically created whenever users add, edit, delete,
          deliver, return or update IT asset records.
        </p>
      </section>
    </LayoutWrapper>
  );
}
