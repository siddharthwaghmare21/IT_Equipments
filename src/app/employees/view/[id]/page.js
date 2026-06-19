"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const employees = [
  {
    id: "1",
    employeeCode: "EMP-001",
    employeeName: "Rahul Patil",
    department: "IT Department",
    designation: "Software Developer",
    email: "rahul.patil@company.com",
    phone: "+91 98765 12345",
    location: "Main Office",
    joiningDate: "2024-06-10",
    status: "Active",
    deliveredAssets: "3",
    remarks: "Uses laptop, monitor and keyboard for development work.",
  },
  {
    id: "2",
    employeeCode: "EMP-002",
    employeeName: "Sneha Jadhav",
    department: "Accounts",
    designation: "Account Executive",
    email: "sneha.jadhav@company.com",
    phone: "+91 99887 45678",
    location: "Accounts Office",
    joiningDate: "2023-09-18",
    status: "Active",
    deliveredAssets: "2",
    remarks: "Delivered desktop and printer access.",
  },
];

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

function EmployeeStatusBadge({ status }) {
  const statusStyles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
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

export default function ViewEmployeePage() {
  const params = useParams();
  const employeeId = params.id;

  const employee =
    employees.find((item) => item.id === employeeId) || employees[0];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Employee Details"
        description="View employee profile, department, contact information and delivered asset summary."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/employees" label="Employees" />

        <Link
          href={`/employees/edit/${employee.id}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Employee
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {employee.employeeCode}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {employee.employeeName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {employee.department} • {employee.designation}
            </p>
          </div>

          <EmployeeStatusBadge status={employee.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Employee Code" value={employee.employeeCode} />
          <DetailItem label="Employee Name" value={employee.employeeName} />
          <DetailItem label="Department" value={employee.department} />
          <DetailItem label="Designation" value={employee.designation} />
          <DetailItem label="Email Address" value={employee.email} />
          <DetailItem label="Phone Number" value={employee.phone} />
          <DetailItem label="Location" value={employee.location} />
          <DetailItem label="Joining Date" value={employee.joiningDate} />
          <DetailItem label="Status" value={employee.status} />
          <DetailItem
            label="Delivered Assets"
            value={employee.deliveredAssets}
          />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">{employee.remarks}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-gray-900">
          Delivered Asset History
        </h3>

        <p className="mt-2 text-sm text-gray-600">
          Employee-wise asset delivery records will be connected after backend integration.
        </p>
      </section>
    </LayoutWrapper>
  );
}