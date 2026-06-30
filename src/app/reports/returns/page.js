"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "returnCode", label: "Return Code" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "department", label: "Department" },
  { key: "returnedByName", label: "Returned By" },
  { key: "returnDate", label: "Return Date" },
  { key: "returnCondition", label: "Condition", status: true },
  { key: "receivedLocation", label: "Received Location" },
  { key: "acknowledgementStatus", label: "Acknowledgement", status: true },
  { key: "inspectionStatus", label: "Inspection", status: true },
  { key: "damageDecision", label: "Damage Decision", status: true },
  { key: "status", label: "Status", status: true },
];

const metrics = [
  { label: "Total Returns", resolve: (records) => records.length },
  {
    label: "Returned",
    tone: "text-green-700",
    resolve: (records) => records.filter((record) => record.status === "Returned").length,
  },
  {
    label: "Under Review",
    tone: "text-yellow-700",
    resolve: (records) => records.filter((record) => record.status === "Under Review").length,
  },
  {
    label: "Damaged",
    tone: "text-red-700",
    resolve: (records) =>
      records.filter((record) => record.status === "Damaged" || record.returnCondition === "Damaged").length,
  },
];

export default function ReturnsReportPage() {
  return (
    <BackendReportPage
      title="Returns Report"
      description="View returned assets, inspection status, damage decisions and receiver tracking."
      reportType="returns"
      fileName="returns-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Returns Report Summary"
    />
  );
}
