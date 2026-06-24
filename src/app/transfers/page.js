"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import CompactRecordList from "@/components/common/CompactRecordList";
import { EmptyState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";

const transferRecords = [
  {
    id: "1",
    transferCode: "TRF-001",
    transferType: "Department Transfer",
    assetTag: "IT-LAP-001",
    assetName: "Dell Latitude 5420",
    fromDepartment: "IT Department",
    toDepartment: "Accounts",
    currentReceiver: "Rahul Patil",
    newReceiver: "Sneha Jadhav",
    reason: "Project need",
    accessories: "Charger, laptop bag",
    condition: "Good",
    collectionDate: "-",
    collectedBy: "-",
    issueDate: "2026-06-12",
    acknowledgement: "Acknowledged",
    status: "Completed",
    createdBy: "IT Admin",
    createdAt: "2026-06-12 10:30",
  },
  {
    id: "2",
    transferCode: "TRF-002",
    transferType: "IT Collection",
    assetTag: "IT-PRN-001",
    assetName: "Canon Laser Printer",
    fromDepartment: "Admin",
    toDepartment: "IT Store",
    currentReceiver: "Admin Office",
    newReceiver: "IT Store",
    reason: "Needs repair inspection",
    accessories: "Power cable",
    condition: "Needs Repair",
    collectionDate: "2026-06-14",
    collectedBy: "IT Support",
    issueDate: "-",
    acknowledgement: "Pending",
    status: "Collected by IT",
    createdBy: "IT Support",
    createdAt: "2026-06-14 15:10",
  },
  {
    id: "3",
    transferCode: "TRF-003",
    transferType: "Reassignment",
    assetTag: "IT-MON-001",
    assetName: "Dell 24 Inch Monitor",
    fromDepartment: "IT Store",
    toDepartment: "HR",
    currentReceiver: "IT Store",
    newReceiver: "Priya More",
    reason: "New workstation setup",
    accessories: "HDMI cable, power cable",
    condition: "Working",
    collectionDate: "2026-06-15",
    collectedBy: "IT Admin",
    issueDate: "2026-06-16",
    acknowledgement: "Acknowledged",
    status: "Reassigned",
    createdBy: "IT Admin",
    createdAt: "2026-06-16 11:20",
  },
  {
    id: "4",
    transferCode: "TRF-004",
    transferType: "Temporary Handover",
    assetTag: "IT-RTR-001",
    assetName: "TP-Link Router",
    fromDepartment: "IT Infrastructure",
    toDepartment: "Operations",
    currentReceiver: "IT Infrastructure",
    newReceiver: "Operations Desk",
    reason: "Temporary network setup",
    accessories: "Adapter, patch cable",
    condition: "Good",
    collectionDate: "-",
    collectedBy: "-",
    issueDate: "2026-06-18",
    acknowledgement: "Pending",
    status: "Pending",
    createdBy: "IT Manager",
    createdAt: "2026-06-18 09:00",
  },
];

const workflowTabs = ["All", "Transfer", "IT Collection", "Reassign"];
const statusFilters = [
  "All",
  "Pending",
  "Collected by IT",
  "Reassigned",
  "Completed",
  "Cancelled",
];

function TransferStatusBadge({ status }) {
  const styles = {
    Pending: "border-yellow-200 bg-yellow-100 text-yellow-700",
    "Collected by IT": "border-blue-200 bg-blue-100 text-blue-700",
    Reassigned: "border-indigo-200 bg-indigo-100 text-indigo-700",
    Completed: "border-green-200 bg-green-100 text-green-700",
    Cancelled: "border-red-200 bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function TransfersPage() {
  const [search, setSearch] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [archiveTransfer, setArchiveTransfer] = useState(null);

  const filteredTransfers = useMemo(() => {
    return transferRecords.filter((transfer) => {
      const searchText = `
        ${transfer.transferCode}
        ${transfer.transferType}
        ${transfer.assetTag}
        ${transfer.assetName}
        ${transfer.fromDepartment}
        ${transfer.toDepartment}
        ${transfer.currentReceiver}
        ${transfer.newReceiver}
        ${transfer.reason}
        ${transfer.condition}
        ${transfer.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus =
        activeStatus === "All" || transfer.status === activeStatus;
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
  }, [search, activeWorkflow, activeStatus]);

  function confirmArchive() {
    showToast("Transfer archive action added. Backend will be connected later.");
    setArchiveTransfer(null);
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Transfers"
        description="Manage department transfers, IT collection and reassignment of already issued IT assets."
      />

      <PageActionBar addHref="/transfers/add" addLabel="Add Transfer" />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Transfers" value={transferRecords.length} />
        <SummaryCard
          label="Collected by IT"
          value={
            transferRecords.filter((item) => item.status === "Collected by IT")
              .length
          }
        />
        <SummaryCard
          label="Reassigned"
          value={
            transferRecords.filter((item) => item.status === "Reassigned")
              .length
          }
        />
        <SummaryCard
          label="Pending"
          value={
            transferRecords.filter((item) => item.status === "Pending").length
          }
        />
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {workflowTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveWorkflow(tab)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold ${
                  activeWorkflow === tab
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 lg:max-w-lg"
            />

            <select
              value={activeStatus}
              onChange={(event) => setActiveStatus(event.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
          { label: "From", key: "fromDepartment" },
          { label: "To", key: "toDepartment" },
          { label: "Receiver", key: "newReceiver" },
        ]}
        statusRender={(transfer) => (
          <TransferStatusBadge status={transfer.status} />
        )}
        viewHref={(transfer) => `/transfers/view/${transfer.id}`}
        editHref={(transfer) => `/transfers/edit/${transfer.id}`}
        onArchive={setArchiveTransfer}
        emptyTitle="No transfer records found"
        emptyDescription="Try changing workflow, status or search filters."
      />

      <div className="hidden md:block">
        <TableWrapper>
          <table className="min-w-[1800px] w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="border-b border-gray-200">
                {[
                  "Transfer Code",
                  "Type",
                  "Asset Tag",
                  "Asset",
                  "From Department",
                  "To Department",
                  "Current Receiver",
                  "New Receiver",
                  "Reason",
                  "Accessories",
                  "Condition",
                  "Collected By",
                  "Issue Date",
                  "Acknowledgement",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 font-semibold text-gray-700"
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
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {transfer.transferCode}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.transferType}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.assetTag}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.assetName}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.fromDepartment}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.toDepartment}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.currentReceiver}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.newReceiver}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.reason}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.accessories}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.condition}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.collectedBy}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.issueDate}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {transfer.acknowledgement}
                  </td>
                  <td className="px-4 py-4">
                    <TransferStatusBadge status={transfer.status} />
                  </td>
                  <td className="px-4 py-4">
                    <ActionButtons
                      viewHref={`/transfers/view/${transfer.id}`}
                      updateHref={`/transfers/edit/${transfer.id}`}
                      onDelete={() => setArchiveTransfer(transfer)}
                      deleteLabel="Archive"
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

      <ConfirmDialog
        isOpen={Boolean(archiveTransfer)}
        title="Archive transfer?"
        description={`Transfer ${
          archiveTransfer?.transferCode || ""
        } will keep its audit history for reports.`}
        confirmLabel="Archive"
        onCancel={() => setArchiveTransfer(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold text-gray-900">{value}</h2>
    </div>
  );
}
