"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "department", label: "Department" },
  { key: "purchaseDate", label: "Purchase Date" },
  { key: "warrantyExpiry", label: "Warranty Expiry" },
  { key: "daysRemaining", label: "Days Remaining" },
  { key: "warrantyStatus", label: "Warranty Status", status: true },
  { key: "status", label: "Asset Status", status: true },
];

const metrics = [
  { label: "Warranty Records", resolve: (records) => records.length },
  {
    label: "Active",
    tone: "text-green-700",
    resolve: (records) => records.filter((record) => record.warrantyStatus === "Active").length,
  },
  {
    label: "Expiring Soon",
    tone: "text-yellow-700",
    resolve: (records) => records.filter((record) => record.warrantyStatus === "Expiring Soon").length,
  },
  {
    label: "Expired",
    tone: "text-red-700",
    resolve: (records) => records.filter((record) => record.warrantyStatus === "Expired").length,
  },
];

export default function WarrantyReportPage() {
  return (
    <BackendReportPage
      title="Warranty Report"
      description="View asset warranty coverage, expiry risk and department-wise warranty status."
      reportType="warranty"
      fileName="warranty-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Warranty Report Summary"
    />
  );
}
