"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";

const returnRecords = [
  {
    id: 1,
    returnCode: "RET-001",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    returnedBy: "Amit Shinde",
    department: "Admin",
    assignedDate: "2026-02-01",
    returnDate: "2026-08-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    status: "Returned",
  },
  {
    id: 2,
    returnCode: "RET-002",
    deliveryCode: "DLV-005",
    assetTag: "AST-005",
    assetName: "Dell Mouse",
    returnedBy: "Priya More",
    department: "HR",
    assignedDate: "2026-01-10",
    returnDate: "2026-07-20",
    returnCondition: "Damaged",
    receivedBy: "IT Admin",
    status: "Damaged",
  },
  {
    id: 3,
    returnCode: "RET-003",
    deliveryCode: "DLV-006",
    assetTag: "AST-006",
    assetName: "HP Monitor",
    returnedBy: "Sneha Jadhav",
    department: "Accounts",
    assignedDate: "2026-03-05",
    returnDate: "2026-09-10",
    returnCondition: "Needs Inspection",
    receivedBy: "IT Support",
    status: "Pending Inspection",
  },
  {
    id: 4,
    returnCode: "RET-004",
    deliveryCode: "DLV-007",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    returnedBy: "Rahul Patil",
    department: "IT Department",
    assignedDate: "2026-02-15",
    returnDate: "2026-10-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    status: "Returned",
  },
];

const filters = ["All", "Returned", "Damaged", "Pending Inspection"];

function ReturnStatusBadge({ status }) {
  const statusStyles = {
    Returned: "bg-green-100 text-green-700 border-green-200",
    Damaged: "bg-red-100 text-red-700 border-red-200",
    "Pending Inspection": "bg-yellow-100 text-yellow-700 border-yellow-200",
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

export default function ReturnsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredReturnRecords = useMemo(() => {
    return returnRecords.filter((returnItem) => {
      const searchText = `
        ${returnItem.returnCode}
        ${returnItem.deliveryCode}
        ${returnItem.assetTag}
        ${returnItem.assetName}
        ${returnItem.returnedBy}
        ${returnItem.department}
        ${returnItem.returnCondition}
        ${returnItem.receivedBy}
        ${returnItem.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || returnItem.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleDelete(returnItem) {
    const confirmed = confirm(
      `Are you sure you want to delete return record ${returnItem.returnCode}?`
    );

    if (confirmed) {
      alert("Return delete action added. Backend will be connected later.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Returns"
        description="Manage returned IT assets, return condition, received by details and inspection status."
        buttonText="Add Return"
        buttonHref="/returns/add"
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Returns</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {returnRecords.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Returned Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              returnRecords.filter(
                (returnItem) => returnItem.status === "Returned"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Damaged Returns</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              returnRecords.filter(
                (returnItem) => returnItem.status === "Damaged"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Inspection</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              returnRecords.filter(
                (returnItem) => returnItem.status === "Pending Inspection"
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
            placeholder="Search by return code, asset tag, asset name, employee, department or status..."
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
        <table className="min-w-[1300px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Return Code
              </th>
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
                Returned By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Assigned Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Return Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Condition
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Received By
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
            {filteredReturnRecords.map((returnItem) => (
              <tr
                key={returnItem.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {returnItem.returnCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.deliveryCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.assetTag}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.assetName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.returnedBy}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.department}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.assignedDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.returnDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.returnCondition}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {returnItem.receivedBy}
                </td>

                <td className="px-4 py-4">
                  <ReturnStatusBadge status={returnItem.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/returns/view/${returnItem.id}`}
                    updateHref={`/returns/edit/${returnItem.id}`}
                    onDelete={() => handleDelete(returnItem)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReturnRecords.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No return records found.
          </div>
        )}
      </TableWrapper>
    </LayoutWrapper>
  );
}