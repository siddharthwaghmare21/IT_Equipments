"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const purchases = [
  {
    id: "1",
    poNumber: "PO-2026-001",
    vendorName: "Dell Technologies",
    invoiceNumber: "INV-DL-4587",
    purchaseDate: "2026-01-12",
    receivedDate: "2026-01-15",
    itemName: "Dell Latitude 5420",
    category: "Laptop",
    quantity: "8",
    unitPrice: "72500",
    warranty: "3 Years",
    status: "Received",
    remarks: "Laptops received and ready for asset registration.",
  },
  {
    id: "2",
    poNumber: "PO-2026-002",
    vendorName: "HP World",
    invoiceNumber: "INV-HP-7821",
    purchaseDate: "2026-01-18",
    receivedDate: "-",
    itemName: "HP EliteBook 840",
    category: "Laptop",
    quantity: "5",
    unitPrice: "65000",
    warranty: "3 Years",
    status: "Pending",
    remarks: "Awaiting delivery from vendor.",
  },
];

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

function PurchaseStatusBadge({ status }) {
  const statusStyles = {
    Received: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Ordered: "bg-blue-100 text-blue-700 border-blue-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function ViewPurchasePage() {
  const params = useParams();
  const purchaseId = params.id;

  const purchase =
    purchases.find((item) => item.id === purchaseId) || purchases[0];

  const quantity = Number(purchase.quantity) || 0;
  const unitPrice = Number(purchase.unitPrice) || 0;
  const totalAmount = quantity * unitPrice;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Purchase Details"
        description="View complete purchase order, vendor invoice, item and cost information."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/purchases"
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          ← Back to Purchases
        </Link>

        <Link
          href={`/purchases/edit/${purchase.id}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Update Purchase
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {purchase.poNumber}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {purchase.vendorName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Invoice: {purchase.invoiceNumber}
            </p>
          </div>

          <PurchaseStatusBadge status={purchase.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="PO Number" value={purchase.poNumber} />
          <DetailItem label="Vendor Name" value={purchase.vendorName} />
          <DetailItem label="Invoice Number" value={purchase.invoiceNumber} />
          <DetailItem label="Purchase Date" value={purchase.purchaseDate} />
          <DetailItem label="Received Date" value={purchase.receivedDate} />
          <DetailItem label="Status" value={purchase.status} />
          <DetailItem label="Item Name" value={purchase.itemName} />
          <DetailItem label="Category" value={purchase.category} />
          <DetailItem label="Quantity" value={purchase.quantity} />
          <DetailItem
            label="Unit Price"
            value={`₹${unitPrice.toLocaleString("en-IN")}`}
          />
          <DetailItem
            label="Total Amount"
            value={`₹${totalAmount.toLocaleString("en-IN")}`}
          />
          <DetailItem label="Warranty" value={purchase.warranty} />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">{purchase.remarks}</p>
        </div>
      </section>
    </LayoutWrapper>
  );
}