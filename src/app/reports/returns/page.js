"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import BackButton from "@/components/common/BackButton";
import ReportExportButtons from "@/components/common/ReportExportButtons";

const returnsReportData = [
  {
    returnId: "RET-001",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    returnedBy: "Amit Shinde",
    department: "Admin",
    returnDate: "2026-02-15",
    receivedBy: "IT Support",
    condition: "Good",
    status: "Returned",
  },
  {
    returnId: "RET-002",
    deliveryCode: "DLV-005",
    assetTag: "AST-008",
    assetName: "Dell Mouse",
    returnedBy: "Sneha Jadhav",
    department: "Accounts",
    returnDate: "2026-02-18",
    receivedBy: "IT Admin",
    condition: "Working",
    status: "Returned",
  },
  {
    returnId: "RET-003",
    deliveryCode: "DLV-007",
    assetTag: "AST-011",
    assetName: "HP Monitor",
    returnedBy: "Rahul Patil",
    department: "IT Department",
    returnDate: "2026-02-21",
    receivedBy: "IT Support",
    condition: "Needs Repair",
    status: "Received for Check",
  },
  {
    returnId: "RET-004",
    deliveryCode: "DLV-009",
    assetTag: "AST-014",
    assetName: "Cisco Router",
    returnedBy: "Priya More",
    department: "HR",
    returnDate: "2026-02-24",
    receivedBy: "IT Admin",
    condition: "Damaged",
    status: "Under Review",
  },
];

function ReturnStatusBadge({ status }) {
  const styles = {
    Returned: "border-green-200 bg-green-100 text-green-700",
    "Received for Check": "border-blue-200 bg-blue-100 text-blue-700",
    "Under Review": "border-yellow-200 bg-yellow-100 text-yellow-700",
    Rejected: "border-red-200 bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function ReturnsReportPage() {
  const totalReturns = returnsReportData.length;

  const goodReturns = returnsReportData.filter(
    (item) => item.condition === "Good" || item.condition === "Working"
  ).length;

  const repairNeeded = returnsReportData.filter(
    (item) => item.condition === "Needs Repair"
  ).length;

  const damagedReturns = returnsReportData.filter(
    (item) => item.condition === "Damaged"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Returns Report"
        description="Track returned equipment/material records, return condition, returned by and received details."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/reports" label="Reports" />

        <ReportExportButtons
          data={returnsReportData}
          fileName="returns-report"
        />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Returns</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalReturns}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Good / Working</p>
          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {goodReturns}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Repair Needed</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-700">
            {repairNeeded}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Damaged Returns</p>
          <h2 className="mt-2 text-3xl font-bold text-red-700">
            {damagedReturns}
          </h2>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Return ID
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Delivery Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Tag
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset / Material
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Returned By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Return Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Received By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Condition
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {returnsReportData.map((item) => (
              <tr
                key={item.returnId}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {item.returnId}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {item.deliveryCode}
                </td>

                <td className="px-4 py-4 text-gray-700">{item.assetTag}</td>

                <td className="px-4 py-4 text-gray-700">{item.assetName}</td>

                <td className="px-4 py-4 text-gray-700">{item.returnedBy}</td>

                <td className="px-4 py-4 text-gray-700">{item.department}</td>

                <td className="px-4 py-4 text-gray-700">{item.returnDate}</td>

                <td className="px-4 py-4 text-gray-700">{item.receivedBy}</td>

                <td className="px-4 py-4 text-gray-700">{item.condition}</td>

                <td className="px-4 py-4">
                  <ReturnStatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>

      <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
        Note: This returns report currently uses sample frontend data. After SQL
        Server backend integration, this report will show real returned
        equipment/material records.
      </p>
    </LayoutWrapper>
  );
}