"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import TableWrapper from "@/components/common/TableWrapper";
import StatusBadge from "@/components/common/StatusBadge";

const assetReportData = [
  {
    id: 1,
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    category: "Laptop",
    brand: "Dell",
    department: "IT Department",
    assignedTo: "Rahul Patil",
    purchaseDate: "2026-01-12",
    warrantyExpiry: "2029-01-12",
    status: "Assigned",
  },
  {
    id: 2,
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    category: "Printer",
    brand: "HP",
    department: "Accounts",
    assignedTo: "Sneha Jadhav",
    purchaseDate: "2026-01-18",
    warrantyExpiry: "2028-01-18",
    status: "Assigned",
  },
  {
    id: 3,
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    category: "Accessory",
    brand: "Logitech",
    department: "Admin",
    assignedTo: "Amit Shinde",
    purchaseDate: "2026-02-01",
    warrantyExpiry: "2027-02-01",
    status: "Available",
  },
  {
    id: 4,
    assetTag: "AST-004",
    assetName: "Cisco Router",
    category: "Network",
    brand: "Cisco",
    department: "HR",
    assignedTo: "Priya More",
    purchaseDate: "2026-02-10",
    warrantyExpiry: "2029-02-10",
    status: "Maintenance",
  },
  {
    id: 5,
    assetTag: "AST-005",
    assetName: "Dell Mouse",
    category: "Accessory",
    brand: "Dell",
    department: "HR",
    assignedTo: "Priya More",
    purchaseDate: "2026-01-10",
    warrantyExpiry: "2027-01-10",
    status: "Damaged",
  },
];

export default function AssetsReportPage() {
  const totalAssets = assetReportData.length;
  const assignedAssets = assetReportData.filter(
    (asset) => asset.status === "Assigned"
  ).length;
  const availableAssets = assetReportData.filter(
    (asset) => asset.status === "Available"
  ).length;
  const maintenanceAssets = assetReportData.filter(
    (asset) => asset.status === "Maintenance"
  ).length;
  const damagedAssets = assetReportData.filter(
    (asset) => asset.status === "Damaged"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Assets Report"
        description="View asset-wise summary, category details, assigned users, warranty and current asset status."
      />

      <div className="mb-6">
        <BackButton href="/reports" label="Reports" />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assigned</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {assignedAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Available</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {availableAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Maintenance</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {maintenanceAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Damaged</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {damagedAssets}
          </h2>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Category Summary</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Laptop</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Printer</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accessory</span>
              <span className="font-semibold text-gray-900">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Department Usage</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">IT Department</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accounts</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admin</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">HR</span>
              <span className="font-semibold text-gray-900">2</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Report Summary</h3>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            This report shows sample asset data. After backend integration, it
            will display real-time asset records from SQL Server with filters,
            export and printable report options.
          </p>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1300px] w-full text-sm">
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
              <th className="px-4 py-3 font-semibold text-gray-700">Brand</th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Assigned To
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Purchase Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Warranty Expiry
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>

          <tbody>
            {assetReportData.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {asset.assetTag}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {asset.assetName}
                </td>
                <td className="px-4 py-4 text-gray-700">{asset.category}</td>
                <td className="px-4 py-4 text-gray-700">{asset.brand}</td>
                <td className="px-4 py-4 text-gray-700">
                  {asset.department}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {asset.assignedTo}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {asset.purchaseDate}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {asset.warrantyExpiry}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={asset.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </LayoutWrapper>
  );
}