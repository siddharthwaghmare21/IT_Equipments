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
import { cancelTransfer, getTransfers } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapTransferFromApi, transferStatuses } from "@/lib/transferMapper";

const workflowTabs = ["All", "Transfer", "IT Collection", "Reassign"];
const statusFilters = ["All", ...transferStatuses];
const printColumns = [
  { key: "transferCode", label: "Transfer Code" },
  { key: "transferType", label: "Type" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "fromDepartmentName", label: "From Department" },
  { key: "toDepartmentName", label: "To Department" },
  { key: "newReceiverName", label: "New Receiver" },
  { key: "transferStatus", label: "Status" },
];

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
  const [activeWorkflow, setActiveWorkflow] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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

      return matchesStatus && matchesWorkflow;
    });
  }, [transferRecords, activeWorkflow, activeStatus]);

  const pagedTransfers = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredTransfers.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredTransfers]);

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
      />

      <PageActionBar
        addHref="/transfers/add"
        addLabel="Add Transfer"
        exportData={filteredTransfers}
        exportFileName="transfers"
        printTitle="Transfers"
        printColumns={printColumns}
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
          <section className="mb-4 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {workflowTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveWorkflow(tab);
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                      activeWorkflow === tab
                        ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(106,61,240,0.2)]"
                        : "border-[#314666] bg-[#101a2b] text-[#b8c7e6] hover:bg-[#16233a]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
                <select
                  value={activeStatus}
                  onChange={(event) => {
                    setActiveStatus(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none focus:border-[#7c4cf3]"
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
            emptyDescription="Try changing workflow or status filters."
          />

          <div className="hidden md:block">
            <TableWrapper>
              <table className="min-w-[1600px] w-full text-sm">
                <thead className="bg-[#101a2b] text-left">
                  <tr className="border-b border-[#263754]">
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
                        className="px-4 py-3 font-semibold text-[#8fa4c7]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263754] bg-[#18253d]">
                  {pagedTransfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="hover:bg-[#1f2f4a]"
                    >
                      <td className="px-4 py-4 font-semibold text-white">
                        {transfer.transferCode}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.transferType}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        <p className="font-medium text-white">
                          {transfer.assetTag}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {transfer.assetName || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.fromDepartmentName || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.toDepartmentName || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.currentReceiverName || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.newReceiverName || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.transferReason || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.conditionAtTransfer}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.collectedByName || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
                        {transfer.issueDate || "-"}
                      </td>
                      <td className="px-4 py-4 text-[#c8d4ec]">
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
              {filteredTransfers.length > 0 && (
                <TablePagination
                  currentPage={currentPage}
                  totalItems={filteredTransfers.length}
                  pageSize={10}
                  onPageChange={setCurrentPage}
                  itemLabel="transfers"
                />
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
