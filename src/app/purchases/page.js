"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import CompactRecordList from "@/components/common/CompactRecordList";
import { EmptyState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";

const purchases = [
  {
    id: "1",
    poNumber: "PO-2026-001",
    vendorName: "Dell Technologies",
    invoiceNumber: "INV-DL-4587",
    purchaseDate: "2026-01-12",
    expectedDeliveryDate: "2026-01-18",
    receivedDate: "2026-01-15",
    items: 8,
    approvalStatus: "Approved",
    approvedBy: "IT Head",
    paymentStatus: "Paid",
    receivedStatus: "Fully Received",
    invoiceStatus: "Verified",
    attachmentStatus: "PO + Invoice",
    createdBy: "Procurement Admin",
    createdAt: "2026-01-12 10:30 AM",
    updatedBy: "Stores Team",
    updatedAt: "2026-01-15 04:15 PM",
    totalAmount: "INR 5,80,000",
    status: "Received",
  },
  {
    id: "2",
    poNumber: "PO-2026-002",
    vendorName: "HP World",
    invoiceNumber: "INV-HP-7821",
    purchaseDate: "2026-01-18",
    expectedDeliveryDate: "2026-01-28",
    receivedDate: "",
    items: 5,
    approvalStatus: "Approved",
    approvedBy: "IT Head",
    paymentStatus: "Pending",
    receivedStatus: "Awaiting Delivery",
    invoiceStatus: "Pending",
    attachmentStatus: "PO Uploaded",
    createdBy: "Procurement Admin",
    createdAt: "2026-01-18 11:10 AM",
    updatedBy: "Procurement Admin",
    updatedAt: "2026-01-18 11:10 AM",
    totalAmount: "INR 3,25,000",
    status: "Pending",
  },
  {
    id: "3",
    poNumber: "PO-2026-003",
    vendorName: "Canon India",
    invoiceNumber: "INV-CN-2190",
    purchaseDate: "2026-02-02",
    expectedDeliveryDate: "2026-02-07",
    receivedDate: "2026-02-06",
    items: 3,
    approvalStatus: "Approved",
    approvedBy: "IT Manager",
    paymentStatus: "Paid",
    receivedStatus: "Fully Received",
    invoiceStatus: "Verified",
    attachmentStatus: "PO + Invoice",
    createdBy: "Procurement Admin",
    createdAt: "2026-02-02 09:40 AM",
    updatedBy: "Stores Team",
    updatedAt: "2026-02-06 03:20 PM",
    totalAmount: "INR 78,000",
    status: "Received",
  },
  {
    id: "4",
    poNumber: "PO-2026-004",
    vendorName: "Network Solutions",
    invoiceNumber: "INV-NS-1002",
    purchaseDate: "2026-02-10",
    expectedDeliveryDate: "2026-02-18",
    receivedDate: "",
    items: 12,
    approvalStatus: "Pending",
    approvedBy: "-",
    paymentStatus: "Not Started",
    receivedStatus: "Not Received",
    invoiceStatus: "Awaiting Invoice",
    attachmentStatus: "Pending",
    createdBy: "Procurement Admin",
    createdAt: "2026-02-10 02:05 PM",
    updatedBy: "Procurement Admin",
    updatedAt: "2026-02-10 02:05 PM",
    totalAmount: "INR 1,42,000",
    status: "Ordered",
  },
];

const filters = ["All", "Received", "Pending", "Ordered", "Cancelled"];

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

export default function PurchasesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [archivePurchase, setArchivePurchase] = useState(null);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const searchText = `
        ${purchase.poNumber}
        ${purchase.vendorName}
        ${purchase.invoiceNumber}
        ${purchase.purchaseDate}
        ${purchase.expectedDeliveryDate}
        ${purchase.receivedDate}
        ${purchase.totalAmount}
        ${purchase.approvalStatus}
        ${purchase.paymentStatus}
        ${purchase.receivedStatus}
        ${purchase.invoiceStatus}
        ${purchase.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || purchase.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const receivingSteps = [
    {
      title: "PO Created",
      detail: "Purchase order and vendor invoice reference captured",
      count: purchases.length,
    },
    {
      title: "Approved",
      detail: "Approval completed before receiving",
      count: purchases.filter(
        (purchase) => purchase.approvalStatus === "Approved"
      ).length,
    },
    {
      title: "Received",
      detail: "Items physically received by stores team",
      count: purchases.filter((purchase) => purchase.status === "Received")
        .length,
    },
    {
      title: "Asset Registration",
      detail: "Serial number and QR code creation pending after backend",
      count: purchases.filter(
        (purchase) => purchase.receivedStatus === "Fully Received"
      ).length,
    },
  ];

  function handleArchive(purchase) {
    setArchivePurchase(purchase);
  }

  function confirmArchive() {
    showToast("Purchase archive action added. Backend will be connected later.");
    setArchivePurchase(null);
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Purchases"
        description="Track purchase orders, vendor invoices, received items and pending procurement."
      />

      <PageActionBar addHref="/purchases/add" addLabel="Add Purchase" />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {purchases.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Received</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              purchases.filter((purchase) => purchase.status === "Received")
                .length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              purchases.filter((purchase) => purchase.status === "Pending")
                .length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ordered</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              purchases.filter((purchase) => purchase.status === "Ordered")
                .length
            }
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by PO, vendor, invoice, approval, payment or status..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 lg:max-w-md"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                  activeFilter === filter
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Purchase Receiving Flow
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              PO to asset registration tracking
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              This keeps procurement, stores and asset registration aligned
              before items become available in inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              showToast(
                "Asset registration handoff is ready for backend API connection."
              )
            }
            className="w-fit rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Prepare Registration
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {receivingSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900">
                  {index + 1}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {step.count}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">
                {step.title}
              </p>
              <p className="mt-1 text-xs text-gray-500">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <CompactRecordList
        records={filteredPurchases}
        titleKey="poNumber"
        subtitleKey="vendorName"
        meta={[
          { label: "Amount", key: "totalAmount" },
          { label: "Purchase Date", key: "purchaseDate" },
          { label: "Payment", key: "paymentStatus" },
          { label: "Approval", key: "approvalStatus" },
        ]}
        statusRender={(purchase) => (
          <PurchaseStatusBadge status={purchase.status} />
        )}
        viewHref={(purchase) => `/purchases/view/${purchase.id}`}
        editHref={(purchase) => `/purchases/edit/${purchase.id}`}
        onArchive={handleArchive}
        emptyTitle="No purchases found"
        emptyDescription="Try changing PO, vendor, payment or status filters."
      />

      <div className="hidden md:block">
      <TableWrapper>
        <table className="min-w-[1550px] w-full text-sm">
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
                Items
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
              <th className="px-4 py-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredPurchases.map((purchase) => (
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

                <td className="px-4 py-4 text-gray-700">{purchase.items}</td>

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

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/purchases/view/${purchase.id}`}
                    updateHref={`/purchases/edit/${purchase.id}`}
                    onDelete={() => handleArchive(purchase)}
                    deleteLabel="Archive"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPurchases.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="No purchases found"
              description="Try changing PO, vendor, payment or status filters."
            />
          </div>
        )}
      </TableWrapper>
      </div>

      <ConfirmDialog
        isOpen={Boolean(archivePurchase)}
        title="Archive purchase?"
        description={`Purchase ${
          archivePurchase?.poNumber || ""
        } will be archived after backend integration.`}
        confirmLabel="Archive"
        onCancel={() => setArchivePurchase(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
