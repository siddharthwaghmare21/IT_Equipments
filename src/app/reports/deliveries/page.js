"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import BackButton from "@/components/common/BackButton";
import ReportExportButtons from "@/components/common/ReportExportButtons";

const deliveryReportData = [
  {
    deliveryId: "DEL-001",
    assetName: "Dell Latitude 5420 Laptop",
    category: "Laptop",
    deliveredTo: "Rahul Patil",
    department: "HR Department",
    deliveryDate: "2026-02-01",
    condition: "Good",
    deliveredBy: "IT Admin",
    status: "Delivered",
  },
  {
    deliveryId: "DEL-002",
    assetName: "HP LaserJet Printer",
    category: "Printer",
    deliveredTo: "Accounts Team",
    department: "Accounts Department",
    deliveryDate: "2026-02-04",
    condition: "New",
    deliveredBy: "IT Support",
    status: "Delivered",
  },
  {
    deliveryId: "DEL-003",
    assetName: "Lenovo ThinkCentre Desktop",
    category: "Desktop",
    deliveredTo: "Amit Jadhav",
    department: "Sales Department",
    deliveryDate: "2026-02-08",
    condition: "Good",
    deliveredBy: "IT Admin",
    status: "Delivered",
  },
  {
    deliveryId: "DEL-004",
    assetName: "Dell Monitor 24 inch",
    category: "Monitor",
    deliveredTo: "Priya Sharma",
    department: "Admin Department",
    deliveryDate: "2026-02-12",
    condition: "Good",
    deliveredBy: "IT Support",
    status: "Pending",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Delivered: "border-green-200 bg-green-100 text-green-700",
    Pending: "border-yellow-200 bg-yellow-100 text-yellow-700",
    Cancelled: "border-red-200 bg-red-100 text-red-700",
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

export default function DeliveryReportPage() {
  const totalDeliveries = deliveryReportData.length;

  const deliveredCount = deliveryReportData.filter(
    (item) => item.status === "Delivered"
  ).length;

  const pendingCount = deliveryReportData.filter(
    (item) => item.status === "Pending"
  ).length;

  const departmentsCovered = new Set(
    deliveryReportData.map((item) => item.department)
  ).size;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Delivery Report"
        description="View employee-wise and department-wise equipment/material delivery records."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/reports" label="Reports" />

        <ReportExportButtons
          data={deliveryReportData}
          fileName="delivery-report"
        />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Deliveries</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalDeliveries}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Delivered</p>
          <h2 className="mt-2 text-3xl font-bold text-green-700">
            {deliveredCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-700">
            {pendingCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Departments Covered</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {departmentsCovered}
          </h2>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Delivery ID
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Asset / Material
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Category
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Delivered To
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Department
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Delivery Date
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Condition
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Delivered By
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {deliveryReportData.map((item) => (
              <tr key={item.deliveryId} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">
                  {item.deliveryId}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                  {item.assetName}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                  {item.category}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                  {item.deliveredTo}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                  {item.department}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                  {item.deliveryDate}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                  {item.condition}
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                  {item.deliveredBy}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>

      <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
        Note: This delivery report currently uses sample frontend data. After
        SQL Server backend integration, this report will show real delivery and
        issued equipment/material records.
      </p>
    </LayoutWrapper>
  );
}