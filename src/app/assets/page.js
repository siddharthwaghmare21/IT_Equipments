"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";

const assets = [
  {
    id: 1,
    assetTag: "IT-LAP-001",
    name: "Dell Latitude 5420",
    category: "Laptop",
    serialNumber: "DL5420-9821",
    assignedTo: "Rahul Patil",
    location: "IT Department",
    status: "Assigned",
  },
  {
    id: 2,
    assetTag: "IT-LAP-002",
    name: "HP EliteBook 840",
    category: "Laptop",
    serialNumber: "HP840-4421",
    assignedTo: "-",
    location: "Store Room",
    status: "Available",
  },
  {
    id: 3,
    assetTag: "IT-MON-001",
    name: "Dell 24 Inch Monitor",
    category: "Monitor",
    serialNumber: "MON24-1189",
    assignedTo: "Sneha Jadhav",
    location: "Accounts",
    status: "Assigned",
  },
  {
    id: 4,
    assetTag: "IT-PRN-001",
    name: "Canon Laser Printer",
    category: "Printer",
    serialNumber: "CAN-7782",
    assignedTo: "-",
    location: "Admin Office",
    status: "Maintenance",
  },
  {
    id: 5,
    assetTag: "IT-RTR-001",
    name: "TP-Link Router",
    category: "Network",
    serialNumber: "TPL-9981",
    assignedTo: "-",
    location: "Server Room",
    status: "Available",
  },
];

const filters = ["All", "Available", "Assigned", "Maintenance", "Damaged"];

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const searchText = `
        ${asset.assetTag}
        ${asset.name}
        ${asset.category}
        ${asset.serialNumber}
        ${asset.assignedTo}
        ${asset.location}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || asset.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleDelete(asset) {
    const confirmed = confirm(
      `Are you sure you want to delete ${asset.assetTag}?`
    );

    if (confirmed) {
      alert("Asset delete action added. Backend will be connected later.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Assets"
        description="Manage all IT equipment, assignment status, serial numbers and locations."
        buttonText="Add Asset"
        buttonHref="/assets/add"
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {assets.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Available</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {assets.filter((asset) => asset.status === "Available").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assigned</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {assets.filter((asset) => asset.status === "Assigned").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Maintenance</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {assets.filter((asset) => asset.status === "Maintenance").length}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by asset tag, name, serial number, employee or location..."
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
        <table className="min-w-[1150px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Tag
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Category
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Serial No.
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Assigned To
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Location
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
            {filteredAssets.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {asset.assetTag}
                </td>

                <td className="px-4 py-4 text-gray-700">{asset.name}</td>

                <td className="px-4 py-4 text-gray-700">{asset.category}</td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.serialNumber}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.assignedTo}
                </td>

                <td className="px-4 py-4 text-gray-700">{asset.location}</td>

                <td className="px-4 py-4">
                  <StatusBadge status={asset.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/assets/view/${asset.id}`}
                    updateHref={`/assets/edit/${asset.id}`}
                    onDelete={() => handleDelete(asset)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No assets found.
          </div>
        )}
      </TableWrapper>
    </LayoutWrapper>
  );
}