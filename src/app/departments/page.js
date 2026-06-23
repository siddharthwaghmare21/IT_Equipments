"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import { EmptyState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";

const departments = [
  {
    id: "1",
    departmentCode: "DEP-001",
    departmentName: "IT Department",
    headOfDepartment: "Rahul Patil",
    email: "it@company.com",
    phone: "+91 98765 12345",
    location: "Main Office",
    costCenter: "CC-IT-001",
    businessUnit: "Corporate",
    assetBudget: "INR 12,00,000",
    approvalRequired: "Yes",
    assetPolicy: "Standard IT Policy",
    totalUsers: 12,
    deliveredAssets: 34,
    createdBy: "Admin",
    createdAt: "2026-01-01 10:00 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-15 04:15 PM",
    status: "Active",
  },
  {
    id: "2",
    departmentCode: "DEP-002",
    departmentName: "Accounts",
    headOfDepartment: "Sneha Jadhav",
    email: "accounts@company.com",
    phone: "+91 99887 45678",
    location: "Accounts Office",
    costCenter: "CC-ACC-002",
    businessUnit: "Finance",
    assetBudget: "INR 6,50,000",
    approvalRequired: "Yes",
    assetPolicy: "Finance Asset Policy",
    totalUsers: 8,
    deliveredAssets: 18,
    createdBy: "Admin",
    createdAt: "2026-01-01 10:10 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-20 12:10 PM",
    status: "Active",
  },
  {
    id: "3",
    departmentCode: "DEP-003",
    departmentName: "Admin",
    headOfDepartment: "Amit Shinde",
    email: "admin@company.com",
    phone: "+91 91234 56789",
    location: "Admin Office",
    costCenter: "CC-ADM-003",
    businessUnit: "Operations",
    assetBudget: "INR 4,00,000",
    approvalRequired: "Yes",
    assetPolicy: "Admin Asset Policy",
    totalUsers: 6,
    deliveredAssets: 14,
    createdBy: "Admin",
    createdAt: "2026-01-01 10:20 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-02-04 03:20 PM",
    status: "Active",
  },
  {
    id: "4",
    departmentCode: "DEP-004",
    departmentName: "HR",
    headOfDepartment: "Priya More",
    email: "hr@company.com",
    phone: "+91 90123 45678",
    location: "HR Office",
    costCenter: "CC-HR-004",
    businessUnit: "People",
    assetBudget: "INR 2,50,000",
    approvalRequired: "No",
    assetPolicy: "Basic Asset Policy",
    totalUsers: 4,
    deliveredAssets: 9,
    createdBy: "Admin",
    createdAt: "2026-01-01 10:30 AM",
    updatedBy: "Admin",
    updatedAt: "2026-01-30 05:00 PM",
    status: "Inactive",
  },
];

const filters = ["All", "Active", "Inactive"];

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

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [archiveDepartment, setArchiveDepartment] = useState(null);

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchText = `
        ${department.departmentCode}
        ${department.departmentName}
        ${department.headOfDepartment}
        ${department.email}
        ${department.phone}
        ${department.location}
        ${department.costCenter}
        ${department.businessUnit}
        ${department.assetPolicy}
        ${department.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || department.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleArchive(department) {
    setArchiveDepartment(department);
  }

  function confirmArchive() {
    showToast("Department archive action added. Backend will be connected later.");
    setArchiveDepartment(null);
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Departments"
        description="Manage company departments, department heads and asset delivery structure."
      />

      <PageActionBar addHref="/departments/add" addLabel="Add Department" />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Departments</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {departments.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Departments</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              departments.filter(
                (department) => department.status === "Active"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Department Users</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {departments.reduce(
              (total, department) => total + department.totalUsers,
              0
            )}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Delivered Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {departments.reduce(
              (total, department) => total + department.deliveredAssets,
              0
            )}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by department, head, cost center, business unit or location..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 lg:max-w-md"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                  activeFilter === filter
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-[1550px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department Head
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Phone
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Location
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Cost Center
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Business Unit
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Budget
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Users
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Delivered Assets
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredDepartments.map((department) => (
              <tr
                key={department.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {department.departmentCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.departmentName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.headOfDepartment}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.email}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.phone}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.location}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.costCenter}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.businessUnit}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.assetBudget}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.totalUsers}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {department.deliveredAssets}
                </td>

                <td className="px-4 py-4">
                  <DepartmentStatusBadge status={department.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/departments/view/${department.id}`}
                    updateHref={`/departments/edit/${department.id}`}
                    onDelete={() => handleArchive(department)}
                    deleteLabel="Archive"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDepartments.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="No departments found"
              description="Try changing department search or status filters."
            />
          </div>
        )}
      </TableWrapper>

      <ConfirmDialog
        isOpen={Boolean(archiveDepartment)}
        title="Archive department?"
        description={`Department ${
          archiveDepartment?.departmentName || ""
        } will be archived after backend integration.`}
        confirmLabel="Archive"
        onCancel={() => setArchiveDepartment(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
