"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";

const deliveries = [
  {
    id: "1",
    deliveryCode: "DLV-001",
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    deliveredTo: "Rahul Patil",
    department: "IT Department",
    deliveryDate: "2026-01-15",
    expectedReturnDate: "2026-12-31",
    condition: "Good",
    status: "Delivered",
  },
  {
    id: "2",
    deliveryCode: "DLV-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    deliveredTo: "Sneha Jadhav",
    department: "Accounts",
    deliveryDate: "2026-01-20",
    expectedReturnDate: "2026-12-31",
    condition: "New",
    status: "Delivered",
  },
  {
    id: "3",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    deliveredTo: "Amit Shinde",
    department: "Admin",
    deliveryDate: "2026-02-01",
    expectedReturnDate: "2026-08-01",
    condition: "Good",
    status: "Returned",
  },
  {
    id: "4",
    deliveryCode: "DLV-004",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    deliveredTo: "Priya More",
    department: "HR",
    deliveryDate: "2026-02-10",
    expectedReturnDate: "2026-09-10",
    condition: "Working",
    status: "Pending Return",
  },
];

const filters = ["All", "Delivered", "Returned", "Pending Return"];

function DeliveryStatusBadge({ status }) {
  const statusStyles = {
    Delivered: "bg-blue-100 text-blue-700 border-blue-200",
    Returned: "bg-green-100 text-green-700 border-green-200",
    "Pending Return": "bg-yellow-100 text-yellow-700 border-yellow-200",
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

export default function DeliveriesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const searchText = `
        ${delivery.deliveryCode}
        ${delivery.assetTag}
        ${delivery.assetName}
        ${delivery.deliveredTo}
        ${delivery.department}
        ${delivery.condition}
        ${delivery.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || delivery.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleDelete(delivery) {
    const confirmed = confirm(
      `Are you sure you want to delete delivery ${delivery.deliveryCode}?`
    );

    if (confirmed) {
      alert("Delivery delete action added. Backend will be connected later.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Deliveries"
        description="Track IT equipment/material delivery records, employee allocation and return status."
        buttonText="Add Delivery"
        buttonHref="/deliveries/delivery"
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Deliveries</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {deliveries.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Delivered Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              deliveries.filter((delivery) => delivery.status === "Delivered")
                .length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Returned Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              deliveries.filter((delivery) => delivery.status === "Returned")
                .length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Returns</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              deliveries.filter(
                (delivery) => delivery.status === "Pending Return"
              ).length
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
            placeholder="Search by delivery code, asset tag, asset name, employee or department..."
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
        <table className="min-w-[1250px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Delivery Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Tag
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Delivered To
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Delivery Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Expected Return
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Condition
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
            {filteredDeliveries.map((delivery) => (
              <tr
                key={delivery.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {delivery.deliveryCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {delivery.assetTag}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {delivery.assetName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {delivery.deliveredTo}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {delivery.department}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {delivery.deliveryDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {delivery.expectedReturnDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {delivery.condition}
                </td>

                <td className="px-4 py-4">
                  <DeliveryStatusBadge status={delivery.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/deliveries/view/${delivery.id}`}
                    updateHref={`/deliveries/edit/${delivery.id}`}
                    onDelete={() => handleDelete(delivery)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDeliveries.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No delivery records found.
          </div>
        )}
      </TableWrapper>
    </LayoutWrapper>
  );
}
