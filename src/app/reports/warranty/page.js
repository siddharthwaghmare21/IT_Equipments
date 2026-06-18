"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import TableWrapper from "@/components/common/TableWrapper";
import ReportExportButtons from "@/components/common/ReportExportButtons";

const warrantyReportData = [
  {
    id: 1,
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    category: "Laptop",
    brand: "Dell",
    vendor: "Dell Technologies",
    purchaseDate: "2026-01-12",
    warrantyExpiry: "2029-01-12",
    remainingDays: "1095",
    status: "Active",
  },
  {
    id: 2,
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    category: "Printer",
    brand: "HP",
    vendor: "HP World",
    purchaseDate: "2026-01-18",
    warrantyExpiry: "2028-01-18",
    remainingDays: "730",
    status: "Active",
  },
  {
    id: 3,
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    category: "Accessory",
    brand: "Logitech",
    vendor: "Local Vendor",
    purchaseDate: "2026-02-01",
    warrantyExpiry: "2027-02-01",
    remainingDays: "365",
    status: "Expiring Soon",
  },
  {
    id: 4,
    assetTag: "AST-004",
    assetName: "Cisco Router",
    category: "Network",
    brand: "Cisco",
    vendor: "Network Solutions",
    purchaseDate: "2026-02-10",
    warrantyExpiry: "2029-02-10",
    remainingDays: "1124",
    status: "Active",
  },
  {
    id: 5,
    assetTag: "AST-005",
    assetName: "Dell Mouse",
    category: "Accessory",
    brand: "Dell",
    vendor: "Dell Technologies",
    purchaseDate: "2025-01-10",
    warrantyExpiry: "2026-01-10",
    remainingDays: "0",
    status: "Expired",
  },
];

function WarrantyStatusBadge({ status }) {
  const statusStyles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    "Expiring Soon": "bg-yellow-100 text-yellow-700 border-yellow-200",
    Expired: "bg-red-100 text-red-700 border-red-200",
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

export default function WarrantyReportPage() {
  const totalWarrantyAssets = warrantyReportData.length;

  const activeWarranty = warrantyReportData.filter(
    (asset) => asset.status === "Active"
  ).length;

  const expiringSoon = warrantyReportData.filter(
    (asset) => asset.status === "Expiring Soon"
  ).length;

  const expiredWarranty = warrantyReportData.filter(
    (asset) => asset.status === "Expired"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Warranty Report"
        description="Track asset warranty expiry, expired assets, upcoming warranty alerts and vendor support details."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/reports" label="Reports" />

        <ReportExportButtons
          data={warrantyReportData}
          fileName="warranty-report"
        />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Warranty Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalWarrantyAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Warranty</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {activeWarranty}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Expiring Soon</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {expiringSoon}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Expired Warranty</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {expiredWarranty}
          </h2>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">
            Warranty Status Summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-gray-900">
                {activeWarranty}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Expiring Soon</span>
              <span className="font-semibold text-gray-900">
                {expiringSoon}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Expired</span>
              <span className="font-semibold text-gray-900">
                {expiredWarranty}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Vendor Summary</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dell Technologies</span>
              <span className="font-semibold text-gray-900">2</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">HP World</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Network Solutions</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Local Vendor</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Report Summary</h3>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            This warranty report currently uses sample frontend data. After SQL
            Server backend integration, it will show real-time warranty expiry
            alerts, expired assets and vendor support records.
          </p>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1350px] w-full text-sm">
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

              <th className="px-4 py-3 font-semibold text-gray-700">Vendor</th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Purchase Date
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Warranty Expiry
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Remaining Days
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>

          <tbody>
            {warrantyReportData.map((asset) => (
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

                <td className="px-4 py-4 text-gray-700">{asset.vendor}</td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.purchaseDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.warrantyExpiry}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.remainingDays}
                </td>

                <td className="px-4 py-4">
                  <WarrantyStatusBadge status={asset.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </LayoutWrapper>
  );
}