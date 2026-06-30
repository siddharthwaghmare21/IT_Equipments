"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "transferCode", label: "Transfer Code" },
  { key: "transferType", label: "Type" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "fromDepartment", label: "From Department" },
  { key: "toDepartment", label: "To Department" },
  { key: "currentReceiverName", label: "Current Receiver" },
  { key: "newReceiverName", label: "New Receiver" },
  { key: "transferReason", label: "Reason" },
  { key: "conditionAtTransfer", label: "Condition", status: true },
  { key: "collectionDate", label: "Collection Date" },
  { key: "issueDate", label: "Issue Date" },
  { key: "handoverAcknowledgement", label: "Handover Ack", status: true },
  { key: "newAcknowledgement", label: "New Ack", status: true },
  { key: "status", label: "Status", status: true },
];

const metrics = [
  { label: "Total Transfers", resolve: (records) => records.length },
  {
    label: "Completed",
    tone: "text-green-700",
    resolve: (records) => records.filter((record) => record.status === "Completed").length,
  },
  {
    label: "Pending",
    tone: "text-yellow-700",
    resolve: (records) => records.filter((record) => record.status === "Pending").length,
  },
  {
    label: "Departments",
    resolve: (records) =>
      new Set(records.flatMap((record) => [record.fromDepartment, record.toDepartment]).filter(Boolean)).size,
  },
];

export default function TransfersReportPage() {
  return (
    <BackendReportPage
      title="Transfers Report"
      description="View asset transfers, IT collection, reassignment and acknowledgement status."
      reportType="transfers"
      fileName="transfers-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Transfers Report Summary"
    />
  );
}
