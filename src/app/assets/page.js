"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";

const assets = [
  {
    id: "1",
    assetTag: "IT-LAP-001",
    name: "Dell Latitude 5420",
    category: "Laptop",
    serialNumber: "DL5420-9821",
    assignedTo: "Rahul Patil",
    location: "IT Department",
    status: "Assigned",
    lifecycleStatus: "In Use",
    purchaseRef: "PO-2024-0412",
    warrantyExpiry: "2027-04-12",
    qrCode: "QR-IT-LAP-001",
    condition: "Good",
    custodianDepartment: "IT Department",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2024-04-12 10:00",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-15 10:30",
  },
  {
    id: "2",
    assetTag: "IT-LAP-002",
    name: "HP EliteBook 840",
    category: "Laptop",
    serialNumber: "HP840-4421",
    assignedTo: "-",
    location: "Store Room",
    status: "Available",
    lifecycleStatus: "In Stock",
    purchaseRef: "PO-2024-0620",
    warrantyExpiry: "2027-06-20",
    qrCode: "QR-IT-LAP-002",
    condition: "New",
    custodianDepartment: "IT Store",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2024-06-20 11:00",
    updatedBy: "IT Admin",
    updatedAt: "2024-06-20 11:00",
  },
  {
    id: "3",
    assetTag: "IT-MON-001",
    name: "Dell 24 Inch Monitor",
    category: "Monitor",
    serialNumber: "MON24-1189",
    assignedTo: "Sneha Jadhav",
    location: "Accounts",
    status: "Assigned",
    lifecycleStatus: "In Use",
    purchaseRef: "PO-2024-0705",
    warrantyExpiry: "2027-07-05",
    qrCode: "QR-IT-MON-001",
    condition: "Good",
    custodianDepartment: "Accounts",
    attachmentStatus: "Pending",
    createdBy: "IT Support",
    createdAt: "2024-07-05 12:15",
    updatedBy: "IT Support",
    updatedAt: "2026-01-20 09:30",
  },
  {
    id: "4",
    assetTag: "IT-PRN-001",
    name: "Canon Laser Printer",
    category: "Printer",
    serialNumber: "CAN-7782",
    assignedTo: "-",
    location: "Admin Office",
    status: "Maintenance",
    lifecycleStatus: "Under Maintenance",
    purchaseRef: "PO-2024-0830",
    warrantyExpiry: "2027-08-30",
    qrCode: "QR-IT-PRN-001",
    condition: "Needs Repair",
    custodianDepartment: "Admin",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2024-08-30 16:00",
    updatedBy: "IT Support",
    updatedAt: "2026-02-10 14:45",
  },
  {
    id: "5",
    assetTag: "IT-RTR-001",
    name: "TP-Link Router",
    category: "Network",
    serialNumber: "TPL-9981",
    assignedTo: "-",
    location: "Server Room",
    status: "Available",
    lifecycleStatus: "In Stock",
    purchaseRef: "PO-2024-0915",
    warrantyExpiry: "2027-09-15",
    qrCode: "QR-IT-RTR-001",
    condition: "Good",
    custodianDepartment: "IT Infrastructure",
    attachmentStatus: "Uploaded",
    createdBy: "IT Manager",
    createdAt: "2024-09-15 15:30",
    updatedBy: "IT Manager",
    updatedAt: "2024-09-15 15:30",
  },
];

const filters = ["All", "Available", "Assigned", "Maintenance", "Damaged"];

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [archiveAsset, setArchiveAsset] = useState(null);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const searchText = `
        ${asset.assetTag}
        ${asset.name}
        ${asset.category}
        ${asset.serialNumber}
        ${asset.assignedTo}
        ${asset.location}
        ${asset.lifecycleStatus}
        ${asset.purchaseRef}
        ${asset.warrantyExpiry}
        ${asset.qrCode}
        ${asset.condition}
        ${asset.custodianDepartment}
        ${asset.attachmentStatus}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || asset.status === activeFilter;

      const matchesCategory =
        categoryFilter === "All" || asset.category === categoryFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        asset.custodianDepartment === departmentFilter;

      const matchesCondition =
        conditionFilter === "All" || asset.condition === conditionFilter;

      return (
        matchesSearch &&
        matchesFilter &&
        matchesCategory &&
        matchesDepartment &&
        matchesCondition
      );
    });
  }, [search, activeFilter, categoryFilter, departmentFilter, conditionFilter]);

  function toggleAssetSelection(assetId) {
    setSelectedAssets((previousAssets) =>
      previousAssets.includes(assetId)
        ? previousAssets.filter((id) => id !== assetId)
        : [...previousAssets, assetId]
    );
  }

  function clearSelectedAssets() {
    setSelectedAssets([]);
  }

  function handleArchive(asset) {
    setArchiveAsset(asset);
  }

  function confirmArchive() {
    showToast(
      `Asset ${archiveAsset.assetTag} archive action added. Backend will be connected later.`
    );
    setArchiveAsset(null);
  }

  function applyQuickView(view) {
    if (view === "available-laptops") {
      setSearch("");
      setActiveFilter("Available");
      setCategoryFilter("Laptop");
      setDepartmentFilter("All");
      setConditionFilter("All");
    }

    if (view === "maintenance") {
      setSearch("");
      setActiveFilter("Maintenance");
      setCategoryFilter("All");
      setDepartmentFilter("All");
      setConditionFilter("Needs Repair");
    }

    if (view === "pending-documents") {
      setSearch("pending");
      setActiveFilter("All");
      setCategoryFilter("All");
      setDepartmentFilter("All");
      setConditionFilter("All");
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
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by asset tag, name, serial number, employee, purchase ref, QR or location..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickView("available-laptops")}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Available Laptops
            </button>
            <button
              type="button"
              onClick={() => applyQuickView("maintenance")}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Repair Queue
            </button>
            <button
              type="button"
              onClick={() => applyQuickView("pending-documents")}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Pending Documents
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="All">All Categories</option>
              <option value="Laptop">Laptop</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Network">Network</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="All">All Departments</option>
              <option value="IT Department">IT Department</option>
              <option value="IT Store">IT Store</option>
              <option value="Accounts">Accounts</option>
              <option value="Admin">Admin</option>
              <option value="IT Infrastructure">IT Infrastructure</option>
            </select>

            <select
              value={conditionFilter}
              onChange={(event) => setConditionFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="All">All Conditions</option>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Needs Repair">Needs Repair</option>
            </select>
          </div>
        </div>
      </section>

      {selectedAssets.length > 0 && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-gray-900">
              {selectedAssets.length} assets selected
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Export Selected
              </button>
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Create Maintenance
              </button>
              <button
                type="button"
                onClick={clearSelectedAssets}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:hidden">
        {filteredAssets.map((asset) => (
          <article
            key={asset.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {asset.assetTag}
                </p>
                <p className="mt-1 text-sm text-gray-600">{asset.name}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedAssets.includes(asset.id)}
                onChange={() => toggleAssetSelection(asset.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-gray-900"
                aria-label={`Select ${asset.assetTag}`}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-semibold text-gray-900">{asset.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-semibold text-gray-900">
                  {asset.custodianDepartment}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-semibold text-gray-900">{asset.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Warranty</p>
                <p className="font-semibold text-gray-900">
                  {asset.warrantyExpiry}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <StatusBadge status={asset.status} />
              <ActionButtons
                viewHref={`/assets/view/${asset.id}`}
                updateHref={`/assets/edit/${asset.id}`}
                onDelete={() => handleArchive(asset)}
                deleteLabel="Archive"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block">
        <TableWrapper>
        <table className="min-w-[1700px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Select
              </th>
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
                Lifecycle
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Warranty
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                QR Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Documents
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
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => toggleAssetSelection(asset.id)}
                    className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                    aria-label={`Select ${asset.assetTag}`}
                  />
                </td>

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

                <td className="px-4 py-4 text-gray-700">
                  {asset.lifecycleStatus}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.warrantyExpiry}
                </td>

                <td className="px-4 py-4 font-medium text-gray-700">
                  {asset.qrCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.attachmentStatus}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={asset.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/assets/view/${asset.id}`}
                    updateHref={`/assets/edit/${asset.id}`}
                    onDelete={() => handleArchive(asset)}
                    deleteLabel="Archive"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

          {filteredAssets.length === 0 && (
            <div className="p-6">
              <EmptyState
                title="No assets found"
                description="Try changing search, status, category, department or condition filters."
              />
            </div>
          )}
        </TableWrapper>
      </div>

      {filteredAssets.length === 0 && (
        <div className="md:hidden">
          <EmptyState
            title="No assets found"
            description="Try changing search, status, category, department or condition filters."
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(archiveAsset)}
        title="Archive asset?"
        description={`Asset ${
          archiveAsset?.assetTag || ""
        } will be archived after backend integration. Lifecycle history will remain available for audit and reports.`}
        confirmLabel="Archive"
        onCancel={() => setArchiveAsset(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
