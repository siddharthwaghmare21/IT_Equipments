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
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
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

  const slaIndicators = [
    {
      label: "High Priority Open",
      value: maintenanceRecords.filter(
        (record) =>
          (record.priority === "High" || record.priority === "Critical") &&
          record.maintenanceStatus !== "Completed" &&
          record.maintenanceStatus !== "Cancelled"
      ).length,
      detail: "Needs priority follow-up",
    },
    {
      label: "Approval Pending",
      value: maintenanceRecords.filter(
        (record) => record.approvalStatus === "Pending"
      ).length,
      detail: "Waiting for admin decision",
    },
    {
      label: "Warranty Claims",
      value: maintenanceRecords.filter((record) => record.warrantyClaim).length,
      detail: "Track with vendor service desk",
    },
    {
      label: "Downtime Hours",
      value: maintenanceRecords.reduce(
        (total, record) => total + Number(record.downtimeHours || 0),
        0
      ),
      detail: "Total reported downtime",
    },
  ];

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

      <PageActionBar addHref="/maintenance/add" addLabel="Add Maintenance" />

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
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Records</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {maintenanceRecords.length}
              </h2>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Pending</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  maintenanceRecords.filter(
                    (record) => record.maintenanceStatus === "Pending"
                  ).length
                }
              </h2>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">In Progress</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  maintenanceRecords.filter(
                    (record) => record.maintenanceStatus === "In Progress"
                  ).length
                }
              </h2>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Completed</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  maintenanceRecords.filter(
                    (record) => record.maintenanceStatus === "Completed"
                  ).length
                }
              </h2>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by code, asset, issue, vendor, priority or status..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 lg:max-w-md"
              />

              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                      activeFilter === filter
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              SLA Indicators
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {slaIndicators.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {item.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
                </div>
              ))}
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
                <thead className="bg-gray-50 text-left">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Maintenance Code
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Asset
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Issue Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Priority
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Service Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Cost
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Approval
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {record.maintenanceCode}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        <p className="font-medium text-gray-900">
                          {record.assetTag}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.assetName || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {record.issueType}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {record.vendorName || "-"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {record.priority}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {record.serviceDate || "-"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {formatMaintenanceCurrency(record.maintenanceCost)}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
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
