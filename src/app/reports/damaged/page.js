"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import TableWrapper from "@/components/common/TableWrapper";
import ReportExportButtons from "@/components/common/ReportExportButtons";

const damagedReportData = [
  {
    id: 1,
    assetTag: "AST-005",
    assetName: "Dell Mouse",
    category: "Accessory",
    brand: "Dell",
    department: "HR",
    assignedTo: "Priya More",
    damageType: "Physical Damage",
    reportedDate: "2026-07-20",
    estimatedRepairCost: "INR 800",
    inspectionBy: "IT Admin",
    decisionStatus: "Repair Approved",
    approvalStatus: "Approved",
    documentStatus: "Damage Photo",
    actionTaken: "Repair Required",
    status: "Damaged",
  },
  {
    id: 2,
    assetTag: "AST-008",
    assetName: "HP Monitor",
    category: "Monitor",
    brand: "HP",
    department: "Accounts",
    assignedTo: "Sneha Jadhav",
    damageType: "Display Issue",
    reportedDate: "2026-08-05",
    estimatedRepairCost: "INR 3,500",
    inspectionBy: "IT Admin",
    decisionStatus: "Inspection Pending",
    approvalStatus: "Pending",
    documentStatus: "Pending",
    actionTaken: "Inspection Pending",
    status: "Under Inspection",
  },
  {
    id: 3,
    assetTag: "AST-009",
    assetName: "Lenovo Laptop",
    category: "Laptop",
    brand: "Lenovo",
    department: "Admin",
    assignedTo: "Amit Shinde",
    damageType: "Motherboard Failure",
    reportedDate: "2026-09-12",
    estimatedRepairCost: "INR 12,000",
    inspectionBy: "IT Manager",
    decisionStatus: "Scrap Approved",
    approvalStatus: "Approved",
    documentStatus: "Inspection Report",
    actionTaken: "Scrap Recommended",
    status: "Scrapped",
  },
  {
    id: 4,
    assetTag: "AST-010",
    assetName: "Logitech Keyboard",
    category: "Accessory",
    brand: "Logitech",
    department: "IT Department",
    assignedTo: "Rahul Patil",
    damageType: "Keys Not Working",
    reportedDate: "2026-10-01",
    estimatedRepairCost: "INR 500",
    inspectionBy: "IT Admin",
    decisionStatus: "Replacement Approved",
    approvalStatus: "Approved",
    documentStatus: "Damage Photo",
    actionTaken: "Replacement Required",
    status: "Damaged",
  },
];

function DamagedStatusBadge({ status }) {
  const statusStyles = {
    Damaged: "bg-red-100 text-red-700 border-red-200",
    "Under Inspection": "bg-yellow-100 text-yellow-700 border-yellow-200",
    Scrapped: "bg-gray-200 text-gray-800 border-gray-300",
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

export default function DamagedAssetsReportPage() {
  const totalDamagedRecords = damagedReportData.length;

  const damagedAssets = damagedReportData.filter(
    (asset) => asset.status === "Damaged"
  ).length;

  const underInspectionAssets = damagedReportData.filter(
    (asset) => asset.status === "Under Inspection"
  ).length;

  const scrappedAssets = damagedReportData.filter(
    (asset) => asset.status === "Scrapped"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Damaged Assets Report"
        description="View damaged, under inspection and scrapped IT assets with repair cost and action status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/reports" label="Reports" />

        <ReportExportButtons
          data={damagedReportData}
          fileName="damaged-assets-report"
        />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Damage Records</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalDamagedRecords}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Damaged Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {damagedAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Under Inspection</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {underInspectionAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Scrapped Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {scrappedAssets}
          </h2>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">
            Damage Status Summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Damaged</span>
              <span className="font-semibold text-gray-900">
                {damagedAssets}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Under Inspection</span>
              <span className="font-semibold text-gray-900">
                {underInspectionAssets}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Scrapped</span>
              <span className="font-semibold text-gray-900">
                {scrappedAssets}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">
            Category Summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Accessory</span>
              <span className="font-semibold text-gray-900">2</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Monitor</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Laptop</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Report Summary</h3>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            This damaged assets report currently uses sample frontend data.
            After MySQL backend integration, it will show real-time damage
            reports, inspection records, repair decisions and scrapped asset
            history.
          </p>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1700px] w-full text-sm">
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
                Damage Type
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Reported Date
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Repair Cost
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Inspection By
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Decision
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Approval
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Action Taken
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {damagedReportData.map((asset) => (
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
                  {asset.damageType}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.reportedDate}
                </td>

                <td className="px-4 py-4 font-semibold text-gray-900">
                  {asset.estimatedRepairCost}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.inspectionBy}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.decisionStatus}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.approvalStatus}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {asset.actionTaken}
                </td>

                <td className="px-4 py-4">
                  <DamagedStatusBadge status={asset.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </LayoutWrapper>
  );
}
