"use client";

import BackendReportPage from "@/components/reports/BackendReportPage";

const columns = [
  { key: "workOrderNumber", label: "WO Number" },
  { key: "vendorName", label: "Vendor" },
  { key: "invoiceNumber", label: "Invoice No." },
  { key: "workOrderDate", label: "WO Date" },
  { key: "expectedDeliveryDate", label: "Expected Delivery" },
  { key: "receivedDate", label: "Received Date" },
  { key: "itemCount", label: "Items" },
  { key: "totalAmount", label: "Total Amount", type: "currency" },
  { key: "approvalStatus", label: "Approval", status: true },
  { key: "paymentStatus", label: "Payment", status: true },
  { key: "receivedStatus", label: "Received", status: true },
  { key: "invoiceStatus", label: "Invoice", status: true },
  { key: "status", label: "Status", status: true },
];

const metrics = [
  { label: "Total Work Orders", resolve: (records) => records.length },
  {
    label: "Total Items",
    resolve: (records) => records.reduce((total, record) => total + Number(record.itemCount || 0), 0),
  },
  {
    label: "Received Orders",
    tone: "text-green-700",
    resolve: (records) => records.filter((record) => record.status === "Received").length,
  },
  {
    label: "Pending Approval",
    tone: "text-yellow-700",
    resolve: (records) => records.filter((record) => record.approvalStatus === "Pending").length,
  },
];

export default function PurchasesReportPage() {
  return (
    <BackendReportPage
      title="Purchases Report"
      description="View Work Order summary, vendor-wise records, invoice details and purchase status."
      reportType="purchases"
      fileName="purchases-report"
      columns={columns}
      metrics={metrics}
      summaryTitle="Purchase Report Summary"
    />
  );
}
