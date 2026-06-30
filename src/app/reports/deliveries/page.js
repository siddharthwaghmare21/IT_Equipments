"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "deliveryCode", label: "Delivery Code" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset / Material" },
  { key: "department", label: "Department" },
  { key: "receiverName", label: "Receiver" },
  { key: "deliveryDate", label: "Delivery Date" },
  { key: "accessories", label: "Accessories" },
  { key: "acknowledgementStatus", label: "Acknowledgement", status: true },
  { key: "status", label: "Status", status: true },
];

const metrics = [
  { label: "Total Deliveries", resolve: (records) => records.length },
  {
    label: "Delivered",
    tone: "text-green-700",
    resolve: (records) => records.filter((record) => record.status === "Delivered").length,
  },
  {
    label: "Pending",
    tone: "text-yellow-700",
    resolve: (records) => records.filter((record) => record.status === "Pending").length,
  },
  {
    label: "Departments",
    resolve: (records) => new Set(records.map((record) => record.department).filter(Boolean)).size,
  },
];

export default function DeliveriesReportPage() {
  return (
    <BackendReportPage
      title="Delivery Report"
      description="View department-wise equipment/material delivery records with receiver tracking."
      reportType="deliveries"
      fileName="delivery-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Delivery Report Summary"
    />
  );
}
