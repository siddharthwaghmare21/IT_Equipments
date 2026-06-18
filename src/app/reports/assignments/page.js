"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import TableWrapper from "@/components/common/TableWrapper";
import ReportExportButtons from "@/components/common/ReportExportButtons";

const assignmentReportData = [
  {
    id: 1,
    assignmentCode: "DLV-001",
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    assignedTo: "Rahul Patil",
    department: "IT Department",
    designation: "Software Developer",
    assignedDate: "2026-01-15",
    expectedReturnDate: "2026-12-31",
    condition: "Good",
    status: "Assigned",
  },
  {
    id: 2,
    assignmentCode: "DLV-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    assignedTo: "Sneha Jadhav",
    department: "Accounts",
    designation: "Account Executive",
    assignedDate: "2026-01-20",
    expectedReturnDate: "2026-12-31",
    condition: "New",
    status: "Assigned",
  },
  {
    id: 3,
    assignmentCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    assignedTo: "Amit Shinde",
    department: "Admin",
    designation: "Admin Manager",
    assignedDate: "2026-02-01",
    expectedReturnDate: "2026-08-01",
    condition: "Good",
    status: "Returned",
  },
  {
    id: 4,
    assignmentCode: "DLV-004",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    assignedTo: "Priya More",
    department: "HR",
    designation: "HR Executive",
    assignedDate: "2026-02-10",
    expectedReturnDate: "2026-09-10",
    condition: "Working",
    status: "Pending Return",
  },
];

function AssignmentStatusBadge({ status }) {
  const statusStyles = {
    Assigned: "bg-blue-100 text-blue-700 border-blue-200",
    Returned: "bg-green-100 text-green-700 border-green-200",
    "Pending Return": "bg-yellow-100 text-yellow-700 border-yellow-200",
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

export default function AssignmentsReportPage() {
  const totalAssignments = assignmentReportData.length;

  const assignedCount = assignmentReportData.filter(
    (assignment) => assignment.status === "Assigned"
  ).length;

  const returnedCount = assignmentReportData.filter(
    (assignment) => assignment.status === "Returned"
  ).length;

  const pendingReturnCount = assignmentReportData.filter(
    (assignment) => assignment.status === "Pending Return"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Assignments Report"
        description="View employee-wise and department-wise IT asset assignment records with return status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/reports" label="Reports" />

        <ReportExportButtons
          data={assignmentReportData}
          fileName="assignments-report"
        />
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Assignments</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalAssignments}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Currently Assigned</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {assignedCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Returned</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {returnedCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Return</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {pendingReturnCount}
          </h2>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">
            Department Assignment Summary
          </h3>

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
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">
            Asset Condition Summary
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">New</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Good</span>
              <span className="font-semibold text-gray-900">2</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Working</span>
              <span className="font-semibold text-gray-900">1</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Report Summary</h3>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            This assignment report shows sample frontend data. After backend
            integration, it will show real-time employee-wise asset allocation,
            department usage and return tracking records.
          </p>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1350px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Assignment Code
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Tag
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Name
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Assigned To
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Designation
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Assigned Date
              </th>

              <th className="px-4 py-3 font-semibold text-gray-700">
                Expected Return
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
            {assignmentReportData.map((assignment) => (
              <tr
                key={assignment.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {assignment.assignmentCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.assetTag}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.assetName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.assignedTo}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.department}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.designation}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.assignedDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.expectedReturnDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {assignment.condition}
                </td>

                <td className="px-4 py-4">
                  <AssignmentStatusBadge status={assignment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </LayoutWrapper>
  );
}