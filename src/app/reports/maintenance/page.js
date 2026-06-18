"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import TableWrapper from "@/components/common/TableWrapper";
import ReportExportButtons from "@/components/common/ReportExportButtons";

const maintenanceReportData = [
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

export default function MaintenanceReportPage() {
  const totalRecords = maintenanceReportData.length;

  const pendingRecords = maintenanceReportData.filter(
    (record) => record.status === "Pending"
  ).length;

  const inProgressRecords = maintenanceReportData.filter(
    (record) => record.status === "In Progress"
  ).length;

  const completedRecords = maintenanceReportData.filter(
    (record) => record.status === "Completed"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Maintenance Report"
        description="View maintenance records, repair status, vendor support, issue type and maintenance cost summary."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/reports" label="Reports" />

        <ReportExportButtons
          data={maintenanceReportData}
          fileName="maintenance-report"
        />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Records</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalRecords}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {pendingRecords}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {inProgressRecords}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {completedRecords}
          </h2>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">
            Maintenance Status Summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-gray-900">
                {pendingRecords}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-gray-900">
                {inProgressRecords}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-gray-900">
                {completedRecords}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">
            Vendor / Technician Summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dell Service Center</span>
              <span className="font-semibold text-gray-900">1</span>
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
              <span className="text-gray-600">Lenovo Care</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Report Summary</h3>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            This maintenance report currently uses sample frontend data. After
            SQL Server backend integration, it will show real-time repair
            records, service cost, technician details and maintenance status.
          </p>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1350px] w-full text-sm">
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
            </tr>
          </thead>

          <tbody>
            {maintenanceReportData.map((record) => (
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

                <td className="px-4 py-4 text-gray-700">
                  {record.vendor}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.serviceDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.expectedCompletion}
                </td>

                <td className="px-4 py-4 font-semibold text-gray-900">
                  {record.cost}
                </td>

                <td className="px-4 py-4">
                  <MaintenanceStatusBadge status={record.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </LayoutWrapper>
  );
}