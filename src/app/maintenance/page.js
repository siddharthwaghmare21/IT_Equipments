"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";

const maintenanceRecords = [
  {
    id: 1,
    maintenanceCode: "MNT-001",
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    issueType: "Battery Issue",
    reportedBy: "Rahul Patil",
    vendor: "Dell Service Center",
    serviceDate: "2026-03-10",
    expectedCompletion: "2026-03-15",
    cost: "₹4,500",
    status: "In Progress",
  },
  {
    id: 2,
    maintenanceCode: "MNT-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    issueType: "Paper Jam",
    reportedBy: "Sneha Jadhav",
    vendor: "HP World",
    serviceDate: "2026-02-18",
    expectedCompletion: "2026-02-20",
    cost: "₹1,200",
    status: "Completed",
  },
  {
    id: 3,
    maintenanceCode: "MNT-003",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    issueType: "Network Drop",
    reportedBy: "Priya More",
    vendor: "Network Solutions",
    serviceDate: "2026-03-05",
    expectedCompletion: "2026-03-12",
    cost: "₹2,800",
    status: "Pending",
  },
  {
    id: 4,
    maintenanceCode: "MNT-004",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    issueType: "Display Problem",
    reportedBy: "Amit Shinde",
    vendor: "Lenovo Care",
    serviceDate: "2026-01-25",
    expectedCompletion: "2026-02-01",
    cost: "₹6,000",
    status: "Cancelled",
  },
];

const filters = ["All", "Pending", "In Progress", "Completed", "Cancelled"];

function MaintenanceStatusBadge({ status }) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
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

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredMaintenanceRecords = useMemo(() => {
    return maintenanceRecords.filter((record) => {
      const searchText = `
        ${record.maintenanceCode}
        ${record.assetTag}
        ${record.assetName}
        ${record.issueType}
        ${record.reportedBy}
        ${record.vendor}
        ${record.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || record.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleDelete(record) {
    const confirmed = confirm(
      `Are you sure you want to delete maintenance record ${record.maintenanceCode}?`
    );

    if (confirmed) {
      alert("Maintenance delete action added. Backend will be connected later.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Maintenance"
        description="Manage asset repair, servicing, issue tracking, vendor support and maintenance status."
        buttonText="Add Maintenance"
        buttonHref="/maintenance/add"
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Records</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {maintenanceRecords.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              maintenanceRecords.filter((record) => record.status === "Pending")
                .length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              maintenanceRecords.filter(
                (record) => record.status === "In Progress"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              maintenanceRecords.filter(
                (record) => record.status === "Completed"
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
            placeholder="Search by maintenance code, asset tag, asset name, issue, vendor or status..."
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
                Maintenance Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Tag
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Issue Type
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Reported By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Vendor / Technician
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Service Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Expected Completion
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Cost
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
            {filteredMaintenanceRecords.map((record) => (
              <tr
                key={record.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {record.maintenanceCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.assetTag}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.assetName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.issueType}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.reportedBy}
                </td>

                <td className="px-4 py-4 text-gray-700">{record.vendor}</td>

                <td className="px-4 py-4 text-gray-700">
                  {record.serviceDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.expectedCompletion}
                </td>

                <td className="px-4 py-4 text-gray-700">{record.cost}</td>

                <td className="px-4 py-4">
                  <MaintenanceStatusBadge status={record.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/maintenance/view/${record.id}`}
                    updateHref={`/maintenance/edit/${record.id}`}
                    onDelete={() => handleDelete(record)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMaintenanceRecords.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No maintenance records found.
          </div>
        )}
      </TableWrapper>
    </LayoutWrapper>
  );
}