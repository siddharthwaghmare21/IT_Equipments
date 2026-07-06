"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import CompactRecordList from "@/components/common/CompactRecordList";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import {
  cancelMaintenanceRecord,
  getMaintenanceRecords,
} from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  formatMaintenanceCurrency,
  maintenanceStatuses,
  mapMaintenanceFromApi,
} from "@/lib/maintenanceMapper";

const filters = ["All", ...maintenanceStatuses];

function MaintenanceStatusBadge({ status }) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
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

export default function MaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMaintenanceRecords = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getMaintenanceRecords(token);
      setMaintenanceRecords((data || []).map(mapMaintenanceFromApi));
    } catch (requestError) {
      setError(requestError.message || "Unable to load maintenance records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMaintenanceRecords();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadMaintenanceRecords]);

  const filteredMaintenanceRecords = useMemo(() => {
    return maintenanceRecords.filter((record) => {
      const searchText = `
        ${record.maintenanceCode}
        ${record.assetTag}
        ${record.assetName}
        ${record.issueType}
        ${record.reportedByName}
        ${record.vendorName}
        ${record.serviceType}
        ${record.priority}
        ${record.approvalStatus}
        ${record.maintenanceStatus}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || record.maintenanceStatus === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [maintenanceRecords, search, activeFilter]);

  async function confirmCancel() {
    const token = getSessionToken();

    if (!token || !cancelTarget) {
      return;
    }

    try {
      await cancelMaintenanceRecord(cancelTarget.maintenanceId, token);
      showToast("Maintenance record cancelled successfully.");
      setCancelTarget(null);
      await loadMaintenanceRecords();
    } catch (requestError) {
      showToast(requestError.message || "Unable to cancel maintenance record.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Maintenance"
        description="Manage asset repair, servicing, issue tracking, vendor support and maintenance status."
      />

      <PageActionBar
        addHref="/maintenance/add"
        addLabel="Add Maintenance"
        exportData={filteredMaintenanceRecords}
        exportFileName="maintenance"
        printTitle="Maintenance"
        printDescription="Official maintenance register generated from the current filtered maintenance records."
      />

      {isLoading ? (
        <LoadingState
          title="Loading maintenance"
          description="Fetching maintenance records from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load maintenance"
          description={error}
          actionLabel="Retry"
          onAction={loadMaintenanceRecords}
        />
      ) : (
        <>
          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by code, asset, issue, vendor, priority or status..."
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 lg:max-w-md"
              />

              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`h-10 whitespace-nowrap rounded-lg border px-4 text-sm font-medium ${
                      activeFilter === filter
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <CompactRecordList
            records={filteredMaintenanceRecords}
            titleKey="maintenanceCode"
            subtitleKey="assetName"
            meta={[
              { label: "Issue", key: "issueType" },
              { label: "Priority", key: "priority" },
              { label: "Vendor", key: "vendorName" },
              { label: "Cost", key: "maintenanceCost" },
            ]}
            statusRender={(record) => (
              <MaintenanceStatusBadge status={record.maintenanceStatus} />
            )}
            viewHref={(record) => `/maintenance/view/${record.id}`}
            editHref={(record) => `/maintenance/edit/${record.id}`}
            onArchive={setCancelTarget}
            archiveLabel="Cancel"
            emptyTitle="No maintenance records found"
            emptyDescription="Try changing asset, issue, priority or status filters."
          />

          <div className="hidden md:block">
            <TableWrapper>
              <table className="min-w-[1450px] w-full text-sm">
                <thead className="bg-slate-50 text-left dark:bg-slate-900">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Maintenance Code
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Asset
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Issue Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Vendor
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Priority
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Service Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Cost
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Approval
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {record.maintenanceCode}
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {record.assetTag}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {record.assetName || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        {record.issueType}
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        {record.vendorName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        {record.priority}
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        {record.serviceDate || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        {formatMaintenanceCurrency(record.maintenanceCost)}
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        {record.approvalStatus}
                      </td>
                      <td className="px-4 py-4">
                        <MaintenanceStatusBadge
                          status={record.maintenanceStatus}
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ActionButtons
                          viewHref={`/maintenance/view/${record.id}`}
                          editHref={`/maintenance/edit/${record.id}`}
                          onDelete={() => setCancelTarget(record)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrapper>
          </div>

          {filteredMaintenanceRecords.length === 0 && (
            <EmptyState
              title="No maintenance records found"
              description="Try changing search/filter or add a new maintenance record."
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel maintenance record?"
        description={`This will mark ${
          cancelTarget?.maintenanceCode || "this maintenance record"
        } as cancelled.`}
        confirmLabel="Cancel Record"
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </LayoutWrapper>
  );
}
