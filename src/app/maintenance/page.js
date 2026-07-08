"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import TablePagination from "@/components/common/TablePagination";
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
const printColumns = [
  { key: "maintenanceCode", label: "Maintenance Code" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "issueType", label: "Issue Type" },
  { key: "vendorName", label: "Vendor" },
  { key: "priority", label: "Priority" },
  { key: "serviceDate", label: "Service Date" },
  { key: "maintenanceStatus", label: "Status" },
];

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
  const [currentPage, setCurrentPage] = useState(1);
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

  const pagedMaintenanceRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredMaintenanceRecords.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredMaintenanceRecords]);

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
      />

      <PageActionBar
        addHref="/maintenance/add"
        addLabel="Add Maintenance"
        exportData={filteredMaintenanceRecords}
        exportFileName="maintenance"
        printTitle="Maintenance"
        printColumns={printColumns}
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
          <section className="mb-4 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by code, asset, issue, vendor, priority or status..."
                className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-[#7d90b2] focus:border-[#7c4cf3] lg:max-w-md"
              />

              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter);
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                      activeFilter === filter
                        ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(106,61,240,0.2)]"
                        : "border-[#314666] bg-[#101a2b] text-[#b8c7e6] hover:bg-[#16233a]"
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
                <thead className="bg-[#101a2b] text-left">
                  <tr className="border-b border-[#263754]">
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Maintenance Code
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Asset
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Issue Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Vendor
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Priority
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Service Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Cost
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Approval
                    </th>
                    <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-[#8fa4c7]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263754] bg-[#18253d]">
                  {pagedMaintenanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-[#1f2f4a]"
                    >
                      <td className="px-4 py-4 font-semibold text-white">
                        {record.maintenanceCode}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        <p className="font-medium text-white">
                          {record.assetTag}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {record.assetName || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {record.issueType}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {record.vendorName || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {record.priority}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {record.serviceDate || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {formatMaintenanceCurrency(record.maintenanceCost)}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
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

          {filteredMaintenanceRecords.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredMaintenanceRecords.length}
              pageSize={10}
              onPageChange={setCurrentPage}
              itemLabel="maintenance records"
            />
          )}

          {filteredMaintenanceRecords.length === 0 && (
            <EmptyState
              title="No maintenance records found"
              description="Try changing search/filter or add a new maintenance record."
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
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
