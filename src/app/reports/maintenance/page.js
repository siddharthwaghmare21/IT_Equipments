"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "maintenanceCode", label: "Maintenance Code" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "issueType", label: "Issue Type" },
  { key: "reportedByName", label: "Reported By" },
  { key: "vendorName", label: "Vendor" },
  { key: "serviceType", label: "Service Type" },
  { key: "priority", label: "Priority", status: true },
  { key: "serviceDate", label: "Service Date" },
  { key: "expectedCompletionDate", label: "Expected Completion" },
  { key: "completionDate", label: "Completion Date" },
  { key: "downtimeHours", label: "Downtime Hours" },
  { key: "warrantyClaim", label: "Warranty Claim", type: "boolean" },
  { key: "approvalStatus", label: "Approval", status: true },
  { key: "maintenanceCost", label: "Cost", type: "currency" },
  { key: "status", label: "Status", status: true },
];

const metrics = [
  { label: "Total Records", resolve: (records) => records.length },
  {
    label: "Completed",
    tone: "text-green-700",
    resolve: (records) => records.filter((record) => record.status === "Completed").length,
  },
  {
    label: "In Progress",
    tone: "text-yellow-700",
    resolve: (records) => records.filter((record) => record.status === "In Progress").length,
  },
  {
    label: "Total Cost",
    resolve: (records) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(records.reduce((total, record) => total + Number(record.maintenanceCost || 0), 0)),
  },
];

export default function MaintenanceReportPage() {
  return (
    <BackendReportPage
      title="Maintenance Report"
      description="View maintenance issues, service status, vendor work, warranty claims and costs."
      reportType="maintenance"
      fileName="maintenance-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Maintenance Report Summary"
    />
  );
}
