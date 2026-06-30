"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "department", label: "Department" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "assetCondition", label: "Asset Condition", status: true },
  { key: "lastReturnCondition", label: "Return Condition", status: true },
  { key: "damageDecision", label: "Damage Decision", status: true },
  { key: "inspectionStatus", label: "Inspection", status: true },
  { key: "maintenanceStatus", label: "Maintenance", status: true },
  { key: "maintenancePriority", label: "Priority", status: true },
  { key: "status", label: "Asset Status", status: true },
];

const metrics = [
  { label: "Damaged / Repair Assets", tone: "text-red-700", resolve: (records) => records.length },
  {
    label: "Repair Required",
    tone: "text-yellow-700",
    resolve: (records) => records.filter((record) => record.damageDecision === "Repair Required").length,
  },
  {
    label: "Write-off Required",
    tone: "text-red-700",
    resolve: (records) => records.filter((record) => record.damageDecision === "Write-off Required").length,
  },
  {
    label: "Under Maintenance",
    resolve: (records) => records.filter((record) => record.maintenanceStatus === "In Progress").length,
  },
];

export default function DamagedReportPage() {
  return (
    <BackendReportPage
      title="Damaged Assets Report"
      description="View damaged assets, inspection outcomes, damage decisions and maintenance status."
      reportType="damaged"
      fileName="damaged-assets-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Damaged Assets Report Summary"
    />
  );
}
