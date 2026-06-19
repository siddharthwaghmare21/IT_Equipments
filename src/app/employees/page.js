"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";

const employees = [
  {
    id: 1,
    employeeCode: "EMP-001",
    employeeName: "Rahul Patil",
    department: "IT Department",
    designation: "Software Developer",
    email: "rahul.patil@company.com",
    phone: "+91 98765 12345",
    location: "Main Office",
    status: "Active",
  },
  {
    id: 2,
    employeeCode: "EMP-002",
    employeeName: "Sneha Jadhav",
    department: "Accounts",
    designation: "Account Executive",
    email: "sneha.jadhav@company.com",
    phone: "+91 99887 45678",
    location: "Accounts Office",
    status: "Active",
  },
  {
    id: 3,
    employeeCode: "EMP-003",
    employeeName: "Amit Shinde",
    department: "Admin",
    designation: "Admin Manager",
    email: "amit.shinde@company.com",
    phone: "+91 91234 56789",
    location: "Admin Office",
    status: "Active",
  },
  {
    id: 4,
    employeeCode: "EMP-004",
    employeeName: "Priya More",
    department: "HR",
    designation: "HR Executive",
    email: "priya.more@company.com",
    phone: "+91 90123 45678",
    location: "HR Office",
    status: "Inactive",
  },
];

const filters = ["All", "Active", "Inactive"];

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

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchText = `
        ${employee.employeeCode}
        ${employee.employeeName}
        ${employee.department}
        ${employee.designation}
        ${employee.email}
        ${employee.phone}
        ${employee.location}
        ${employee.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || employee.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleDelete(employee) {
    const confirmed = confirm(
      `Are you sure you want to delete ${employee.employeeName}?`
    );

    if (confirmed) {
      alert("Employee delete action added. Backend will be connected later.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Employees"
        description="Manage employees, departments, designations and asset delivery users."
        buttonText="Add Employee"
        buttonHref="/employees/add"
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Employees</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {employees.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Employees</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {employees.filter((employee) => employee.status === "Active").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Employees</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              employees.filter((employee) => employee.status === "Inactive")
                .length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Departments</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {new Set(employees.map((employee) => employee.department)).size}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee code, name, department, email or location..."
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
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Employee Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Employee Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Designation
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
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {employee.employeeCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {employee.employeeName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {employee.department}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {employee.designation}
                </td>

                <td className="px-4 py-4 text-gray-700">{employee.email}</td>

                <td className="px-4 py-4 text-gray-700">{employee.phone}</td>

                <td className="px-4 py-4 text-gray-700">
                  {employee.location}
                </td>

                <td className="px-4 py-4">
                  <EmployeeStatusBadge status={employee.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/employees/view/${employee.id}`}
                    updateHref={`/employees/edit/${employee.id}`}
                    onDelete={() => handleDelete(employee)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No employees found.
          </div>
        )}
      </TableWrapper>
    </LayoutWrapper>
  );
}