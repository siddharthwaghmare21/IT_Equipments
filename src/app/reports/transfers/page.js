"use client";

import TableWrapper from "@/components/common/TableWrapper";
import ReportPageShell from "@/components/common/ReportPageShell";

const transferReportData = [
  {
    transferCode: "TRF-001",
    transferType: "Department Transfer",
    assetTag: "IT-LAP-001",
    assetName: "Dell Latitude 5420",
    fromDepartment: "IT Department",
    toDepartment: "Accounts",
    currentReceiver: "Rahul Patil",
    newReceiver: "Sneha Jadhav",
    reason: "Project need",
    condition: "Good",
    collectionDate: "-",
    collectedBy: "-",
    issueDate: "2026-06-12",
    acknowledgement: "Acknowledged",
    status: "Completed",
  },
  {
    transferCode: "TRF-002",
    transferType: "IT Collection",
    assetTag: "IT-PRN-001",
    assetName: "Canon Laser Printer",
    fromDepartment: "Admin",
    toDepartment: "IT Store",
    currentReceiver: "Admin Office",
    newReceiver: "IT Store",
    reason: "Needs repair inspection",
    condition: "Needs Repair",
    collectionDate: "2026-06-14",
    collectedBy: "IT Support",
    issueDate: "-",
    acknowledgement: "Pending",
    status: "Collected by IT",
  },
  {
    transferCode: "TRF-003",
    transferType: "Reassignment",
    assetTag: "IT-MON-001",
    assetName: "Dell 24 Inch Monitor",
    fromDepartment: "IT Store",
    toDepartment: "HR",
    currentReceiver: "IT Store",
    newReceiver: "Priya More",
    reason: "New workstation setup",
    condition: "Working",
    collectionDate: "2026-06-15",
    collectedBy: "IT Admin",
    issueDate: "2026-06-16",
    acknowledgement: "Acknowledged",
    status: "Reassigned",
  },
];

function TransferStatusBadge({ status }) {
  const styles = {
    Completed: "border-green-200 bg-green-100 text-green-700",
    "Collected by IT": "border-blue-200 bg-blue-100 text-blue-700",
    Reassigned: "border-indigo-200 bg-indigo-100 text-indigo-700",
    Pending: "border-yellow-200 bg-yellow-100 text-yellow-700",
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

export default function TransfersReportPage() {
  const totalTransfers = transferReportData.length;
  const collectedByIt = transferReportData.filter(
    (item) => item.status === "Collected by IT"
  ).length;
  const reassigned = transferReportData.filter(
    (item) => item.status === "Reassigned"
  ).length;
  const completed = transferReportData.filter(
    (item) => item.status === "Completed"
  ).length;

  return (
    <ReportPageShell
      title="Transfers Report"
      description="Track department-wise transfers, IT collection, reassignment, condition and receiver acknowledgement."
      data={transferReportData}
      fileName="transfers-report"
    >
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Transfers" value={totalTransfers} />
        <SummaryCard label="Collected by IT" value={collectedByIt} />
        <SummaryCard label="Reassigned" value={reassigned} />
        <SummaryCard label="Completed" value={completed} />
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {[
            "Date Range",
            "From Department",
            "To Department",
            "Transfer Type",
            "Status",
          ].map((filter) => (
            <div
              key={filter}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <p className="text-xs font-semibold uppercase text-gray-500">
                Filter
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900">{filter}</p>
            </div>
          ))}
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1750px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              {[
                "Transfer Code",
                "Type",
                "Asset Tag",
                "Asset",
                "From Department",
                "To Department",
                "Current Receiver",
                "New Receiver",
                "Reason",
                "Condition",
                "Collection Date",
                "Collected By",
                "Issue Date",
                "Acknowledgement",
                "Status",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 font-semibold text-gray-700"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {transferReportData.map((item) => (
              <tr
                key={item.transferCode}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {item.transferCode}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {item.transferType}
                </td>
                <td className="px-4 py-4 text-gray-700">{item.assetTag}</td>
                <td className="px-4 py-4 text-gray-700">{item.assetName}</td>
                <td className="px-4 py-4 text-gray-700">
                  {item.fromDepartment}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {item.toDepartment}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {item.currentReceiver}
                </td>
                <td className="px-4 py-4 text-gray-700">
                  {item.newReceiver}
                </td>
                <td className="px-4 py-4 text-gray-700">{item.reason}</td>
                <td className="px-4 py-4 text-gray-700">{item.condition}</td>
                <td className="px-4 py-4 text-gray-700">
                  {item.collectionDate}
                </td>
                <td className="px-4 py-4 text-gray-700">{item.collectedBy}</td>
                <td className="px-4 py-4 text-gray-700">{item.issueDate}</td>
                <td className="px-4 py-4 text-gray-700">
                  {item.acknowledgement}
                </td>
                <td className="px-4 py-4">
                  <TransferStatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>

      <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
        Note: Transfer approval rules are intentionally pending for backend.
        Later we will connect role-based approval, high-value asset approval and
        requester/approver audit history.
      </p>
    </ReportPageShell>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="mt-2 text-3xl font-bold text-gray-900">{value}</h2>
    </div>
  );
}
