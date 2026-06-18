"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const departments = [
  {
    id: "1",
    departmentCode: "DEP-001",
    departmentName: "IT Department",
    headOfDepartment: "Rahul Patil",
    email: "it@company.com",
    phone: "+91 98765 12345",
    location: "Main Office",
    totalEmployees: 12,
    assignedAssets: 34,
    status: "Active",
    description:
      "Responsible for IT infrastructure, software systems, hardware support and equipment management.",
  },
  {
    id: "2",
    departmentCode: "DEP-002",
    departmentName: "Accounts",
    headOfDepartment: "Sneha Jadhav",
    email: "accounts@company.com",
    phone: "+91 99887 45678",
    location: "Accounts Office",
    totalEmployees: 8,
    assignedAssets: 18,
    status: "Active",
    description:
      "Handles billing, finance records, purchase invoices and payment documentation.",
  },
  {
    id: "3",
    departmentCode: "DEP-003",
    departmentName: "Admin",
    headOfDepartment: "Amit Shinde",
    email: "admin@company.com",
    phone: "+91 91234 56789",
    location: "Admin Office",
    totalEmployees: 6,
    assignedAssets: 14,
    status: "Active",
    description:
      "Manages office administration, internal coordination and resource allocation.",
  },
  {
    id: "4",
    departmentCode: "DEP-004",
    departmentName: "HR",
    headOfDepartment: "Priya More",
    email: "hr@company.com",
    phone: "+91 90123 45678",
    location: "HR Office",
    totalEmployees: 4,
    assignedAssets: 9,
    status: "Inactive",
    description:
      "Handles employee records, recruitment coordination and HR documentation.",
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

function DepartmentStatusBadge({ status }) {
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

export default function ViewDepartmentPage() {
  const params = useParams();
  const departmentId = params.id;

  const department =
    departments.find((item) => item.id === departmentId) || departments[0];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Department Details"
        description="View department information, department head, employee count and assigned asset summary."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/departments" label="Departments" />

        <Link
          href={`/departments/edit/${department.id}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Department
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {department.departmentCode}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {department.departmentName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Head: {department.headOfDepartment}
            </p>
          </div>

          <DepartmentStatusBadge status={department.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem
            label="Department Code"
            value={department.departmentCode}
          />
          <DetailItem
            label="Department Name"
            value={department.departmentName}
          />
          <DetailItem
            label="Head of Department"
            value={department.headOfDepartment}
          />
          <DetailItem label="Email Address" value={department.email} />
          <DetailItem label="Phone Number" value={department.phone} />
          <DetailItem label="Location" value={department.location} />
          <DetailItem
            label="Total Employees"
            value={department.totalEmployees}
          />
          <DetailItem
            label="Assigned Assets"
            value={department.assignedAssets}
          />
          <DetailItem label="Status" value={department.status} />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Description
          </p>
          <p className="mt-2 text-sm text-gray-700">
            {department.description}
          </p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Employees in Department</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            {department.totalEmployees}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Employee-wise department mapping will be connected after backend
            integration.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assets Assigned</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">
            {department.assignedAssets}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Department-wise asset allocation records will be connected after
            backend integration.
          </p>
        </div>
      </section>
    </LayoutWrapper>
  );
}