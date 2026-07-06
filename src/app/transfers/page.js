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
import { cancelTransfer, getTransfers } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapTransferFromApi, transferStatuses } from "@/lib/transferMapper";

const workflowTabs = ["All", "Transfer", "IT Collection", "Reassign"];
const statusFilters = ["All", ...transferStatuses];

function TransferStatusBadge({ status }) {
  const styles = {
    Pending: "border-amber-200 bg-amber-100 text-amber-700",
    "Collected by IT": "border-sky-200 bg-sky-100 text-sky-700",
    Reassigned: "border-indigo-200 bg-indigo-100 text-indigo-700",
    Completed: "border-emerald-200 bg-emerald-100 text-emerald-700",
    Cancelled: "border-red-200 bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function TransfersPage() {
  const [transferRecords, setTransferRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransfers = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getTransfers(token);
      setTransferRecords((data || []).map(mapTransferFromApi));
    } catch (requestError) {
      setError(requestError.message || "Unable to load transfers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTransfers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTransfers]);

  const filteredTransfers = useMemo(() => {
    return transferRecords.filter((transfer) => {
      const searchText = `
        ${transfer.transferCode}
        ${transfer.transferType}
        ${transfer.assetTag}
        ${transfer.assetName}
        ${transfer.fromDepartmentName}
        ${transfer.toDepartmentName}
        ${transfer.currentReceiverName}
        ${transfer.newReceiverName}
        ${transfer.transferReason}
        ${transfer.conditionAtTransfer}
        ${transfer.transferStatus}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus =
        activeStatus === "All" || transfer.transferStatus === activeStatus;
      const matchesWorkflow =
        activeWorkflow === "All" ||
        (activeWorkflow === "Transfer" &&
          transfer.transferType === "Department Transfer") ||
        (activeWorkflow === "IT Collection" &&
          transfer.transferType === "IT Collection") ||
        (activeWorkflow === "Reassign" &&
          transfer.transferType === "Reassignment");

      return matchesSearch && matchesStatus && matchesWorkflow;
    });
  }, [transferRecords, search, activeWorkflow, activeStatus]);

  async function confirmCancel() {
    const token = getSessionToken();

    if (!token || !cancelTarget) {
      return;
    }

    try {
      await cancelTransfer(cancelTarget.transferId, token);
      showToast("Transfer cancelled successfully.");
      setCancelTarget(null);
      await loadTransfers();
    } catch (requestError) {
      showToast(requestError.message || "Unable to cancel transfer.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Transfers"
        description="Manage department transfers, IT collection and reassignment of issued IT assets."
      />

      <PageActionBar
        addHref="/transfers/add"
        addLabel="Add Transfer"
        exportData={filteredTransfers}
        exportFileName="transfers"
        printTitle="Transfers"
        printDescription="Official transfer register generated from the current filtered transfer records."
      />

      {isLoading ? (
        <LoadingState
          title="Loading transfers"
          description="Fetching transfer records from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load transfers"
          description={error}
          actionLabel="Retry"
          onAction={loadTransfers}
        />
      ) : (
        <>
          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {workflowTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveWorkflow(tab)}
                    className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold ${
                      activeWorkflow === tab
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transfer code, asset, department, receiver, reason or status..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white lg:max-w-lg"
                />

                <select
                  value={activeStatus}
                  onChange={(event) => setActiveStatus(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                >
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <CompactRecordList
            records={filteredTransfers}
            titleKey="transferCode"
            subtitleKey="assetName"
            meta={[
              { label: "Type", key: "transferType" },
              { label: "From", key: "fromDepartmentName" },
              { label: "To", key: "toDepartmentName" },
              { label: "Receiver", key: "newReceiverName" },
            ]}
            statusRender={(transfer) => (
              <TransferStatusBadge status={transfer.transferStatus} />
            )}
            viewHref={(transfer) => `/transfers/view/${transfer.id}`}
            editHref={(transfer) => `/transfers/edit/${transfer.id}`}
            onArchive={setCancelTarget}
            archiveLabel="Cancel"
            emptyTitle="No transfer records found"
            emptyDescription="Try changing workflow, status or search filters."
          />

          <div className="hidden md:block">
            <TableWrapper>
              <table className="min-w-[1600px] w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr className="border-b border-slate-200">
                    {[
                      "Transfer Code",
                      "Type",
                      "Asset",
                      "From Department",
                      "To Department",
                      "Current Receiver",
                      "New Receiver",
                      "Reason",
                      "Condition",
                      "Collected By",
                      "Issue Date",
                      "Acknowledgement",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 font-semibold text-slate-700"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredTransfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        {transfer.transferCode}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.transferType}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <p className="font-medium text-slate-950">
                          {transfer.assetTag}
                        </p>
                        <p className="text-xs text-slate-500">
                          {transfer.assetName || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.fromDepartmentName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.toDepartmentName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.currentReceiverName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.newReceiverName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.transferReason || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.conditionAtTransfer}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.collectedByName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.issueDate || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {transfer.newAcknowledgement}
                      </td>
                      <td className="px-4 py-4">
                        <TransferStatusBadge status={transfer.transferStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <ActionButtons
                          viewHref={`/transfers/view/${transfer.id}`}
                          updateHref={`/transfers/edit/${transfer.id}`}
                          onDelete={() => setCancelTarget(transfer)}
                          deleteLabel="Cancel"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTransfers.length === 0 && (
                <div className="p-6">
                  <EmptyState
                    title="No transfer records found"
                    description="Try changing workflow, status or search filters."
                  />
                </div>
              )}
            </TableWrapper>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel transfer?"
        description={`This will mark ${
          cancelTarget?.transferCode || "this transfer"
        } as cancelled.`}
        confirmLabel="Cancel Transfer"
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </LayoutWrapper>
  );
}
