"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import TableWrapper from "@/components/common/TableWrapper";
import ReportExportButtons from "@/components/common/ReportExportButtons";

const purchaseReportData = [
  {
    id: 1,
    poNumber: "PO-2026-001",
    vendorName: "Dell Technologies",
    invoiceNumber: "INV-DL-4587",
    purchaseDate: "2026-01-12",
    expectedDeliveryDate: "2026-01-18",
    receivedDate: "2026-01-15",
    itemName: "Dell Latitude 5420",
    category: "Laptop",
    quantity: 8,
    approvalStatus: "Approved",
    paymentStatus: "Paid",
    receivedStatus: "Fully Received",
    invoiceStatus: "Verified",
    totalAmount: "INR 5,80,000",
    status: "Received",
  },
  {
    id: 2,
    poNumber: "PO-2026-002",
    vendorName: "HP World",
    invoiceNumber: "INV-HP-7821",
    purchaseDate: "2026-01-18",
    expectedDeliveryDate: "2026-01-28",
    receivedDate: "",
    itemName: "HP LaserJet Printer",
    category: "Printer",
    quantity: 5,
    approvalStatus: "Approved",
    paymentStatus: "Pending",
    receivedStatus: "Awaiting Delivery",
    invoiceStatus: "Pending",
    totalAmount: "INR 3,25,000",
    status: "Pending",
  },
  {
    id: 3,
    poNumber: "PO-2026-003",
    vendorName: "Canon India",
    invoiceNumber: "INV-CN-2190",
    purchaseDate: "2026-02-02",
    expectedDeliveryDate: "2026-02-07",
    receivedDate: "2026-02-06",
    itemName: "Canon Scanner",
    category: "Scanner",
    quantity: 3,
    approvalStatus: "Approved",
    paymentStatus: "Paid",
    receivedStatus: "Fully Received",
    invoiceStatus: "Verified",
    totalAmount: "INR 78,000",
    status: "Received",
  },
  {
    id: 4,
    poNumber: "PO-2026-004",
    vendorName: "Network Solutions",
    invoiceNumber: "INV-NS-1002",
    purchaseDate: "2026-02-10",
    expectedDeliveryDate: "2026-02-18",
    receivedDate: "",
    itemName: "Cisco Router",
    category: "Network",
    quantity: 12,
    approvalStatus: "Pending",
    paymentStatus: "Not Started",
    receivedStatus: "Not Received",
    invoiceStatus: "Awaiting Invoice",
    totalAmount: "INR 1,42,000",
    status: "Ordered",
  },
];

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

export default function PurchasesReportPage() {
  const totalPurchases = purchaseReportData.length;

  const totalQuantity = purchaseReportData.reduce(
    (total, purchase) => total + purchase.quantity,
    0
  );

  const receivedPurchases = purchaseReportData.filter(
    (purchase) => purchase.status === "Received"
  ).length;

  const pendingPurchases = purchaseReportData.filter(
    (purchase) => purchase.status === "Pending"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Purchases Report"
        description="View purchase order summary, vendor-wise records, invoice details and purchase status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/reports" label="Reports" />

        <ReportExportButtons
          data={purchaseReportData}
          fileName="purchases-report"
        />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Purchase Orders</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalPurchases}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Items Purchased</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalQuantity}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Received Orders</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {receivedPurchases}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {pendingPurchases}
          </h2>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Vendor Summary</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dell Technologies</span>
              <span className="font-semibold text-gray-900">INR 5,80,000</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">HP World</span>
              <span className="font-semibold text-gray-900">INR 3,25,000</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Canon India</span>
              <span className="font-semibold text-gray-900">INR 78,000</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Network Solutions</span>
              <span className="font-semibold text-gray-900">INR 1,42,000</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Category Summary</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Laptop</span>
              <span className="font-semibold text-gray-900">8</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Printer</span>
              <span className="font-semibold text-gray-900">5</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Scanner</span>
              <span className="font-semibold text-gray-900">3</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Network</span>
              <span className="font-semibold text-gray-900">12</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Report Summary</h3>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            This purchase report currently uses sample frontend data. After
            MySQL backend integration, it will show real-time purchase totals,
            vendor-wise amounts, invoices and exportable purchase reports.
          </p>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1650px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                PO Number
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Vendor
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Invoice No.
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Purchase Date
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Expected Delivery
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Received Status
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Item Name
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Category
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Quantity
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Total Amount
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Approval
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Payment
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Invoice
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {purchaseReportData.map((purchase) => (
              <tr
                key={purchase.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {purchase.poNumber}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.vendorName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.invoiceNumber}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.purchaseDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.expectedDeliveryDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.receivedStatus}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.itemName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.category}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.quantity}
                </td>

                <td className="px-4 py-4 font-semibold text-gray-900">
                  {purchase.totalAmount}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.approvalStatus}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.paymentStatus}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {purchase.invoiceStatus}
                </td>

                <td className="px-4 py-4">
                  <PurchaseStatusBadge status={purchase.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </LayoutWrapper>
  );
}
