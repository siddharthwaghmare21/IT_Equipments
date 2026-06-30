"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "department", label: "Department" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "custodianDepartment", label: "Custodian" },
  { key: "purchaseRef", label: "Purchase Ref" },
  { key: "purchaseDate", label: "Purchase Date" },
  { key: "warrantyExpiry", label: "Warranty Expiry" },
  { key: "lifecycleStatus", label: "Lifecycle", status: true },
  { key: "assetCondition", label: "Condition", status: true },
  { key: "attachmentStatus", label: "Documents", status: true },
  { key: "status", label: "Status", status: true },
];

const metrics = [
  { label: "Total Assets", resolve: (records) => records.length },
  {
    label: "Assigned",
    resolve: (records) => records.filter((record) => record.status === "Assigned").length,
  },
  {
    label: "Available",
    resolve: (records) => records.filter((record) => record.status === "Available").length,
  },
  {
    label: "Needs Attention",
    tone: "text-red-700",
    resolve: (records) =>
      records.filter((record) =>
        ["Damaged", "Needs Repair", "Maintenance"].includes(record.status) ||
        ["Damaged", "Needs Repair"].includes(record.assetCondition)
      ).length,
  },
];

export default function AssetsReportPage() {
  return (
    <BackendReportPage
      title="Assets Report"
      description="View asset-wise summary, category details, assigned users, warranty and current asset status."
      reportType="assets"
      fileName="assets-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Asset Report Summary"
    />
  );
}
