"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";

const purchases = [
  {
    id: 1,
    poNumber: "PO-2026-001",
    vendorName: "Dell Technologies",
    invoiceNumber: "INV-DL-4587",
    purchaseDate: "2026-01-12",
    items: 8,
    totalAmount: "₹5,80,000",
    status: "Received",
  },
  {
    id: 2,
    poNumber: "PO-2026-002",
    vendorName: "HP World",
    invoiceNumber: "INV-HP-7821",
    purchaseDate: "2026-01-18",
    items: 5,
    totalAmount: "₹3,25,000",
    status: "Pending",
  },
  {
    id: 3,
    poNumber: "PO-2026-003",
    vendorName: "Canon India",
    invoiceNumber: "INV-CN-2190",
    purchaseDate: "2026-02-02",
    items: 3,
    totalAmount: "₹78,000",
    status: "Received",
  },
  {
    id: 4,
    poNumber: "PO-2026-004",
    vendorName: "Network Solutions",
    invoiceNumber: "INV-NS-1002",
    purchaseDate: "2026-02-10",
    items: 12,
    totalAmount: "₹1,42,000",
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

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const searchText = `
        ${purchase.poNumber}
        ${purchase.vendorName}
        ${purchase.invoiceNumber}
        ${purchase.purchaseDate}
        ${purchase.totalAmount}
        ${purchase.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || purchase.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Purchases"
        description="Track purchase orders, vendor invoices, received items and pending procurement."
        buttonText="Add Purchase"
        buttonHref="/purchases/add"
      />

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
            {purchases.filter((purchase) => purchase.status === "Received").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {purchases.filter((purchase) => purchase.status === "Pending").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ordered</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {purchases.filter((purchase) => purchase.status === "Ordered").length}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by PO number, vendor, invoice number or status..."
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

      <TableWrapper>
        <table className="min-w-[1000px] w-full text-sm">
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
                Items
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Total Amount
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
                  {purchase.items}
                </td>

                <td className="px-4 py-4 font-semibold text-gray-900">
                  {purchase.totalAmount}
                </td>

                <td className="px-4 py-4">
                  <PurchaseStatusBadge status={purchase.status} />
                </td>

                <td className="px-4 py-4">
                  <Link
                    href={`/purchases/view/${purchase.id}`}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPurchases.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No purchases found.
          </div>
        )}
      </TableWrapper>
    </LayoutWrapper>
  );
}