"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { archiveDepartment, getDepartments } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";

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
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState("");

  const loadDepartments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = getSessionToken();
      const response = await getDepartments(token);
      setDepartments(response.map(mapDepartmentFromApi));
    } catch (loadError) {
      setError(loadError.message || "Departments could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDepartments();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDepartments]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchText = `
        ${department.departmentCode}
        ${department.departmentName}
        ${department.headOfDepartment}
        ${department.email}
        ${department.phone}
        ${department.location}
        ${department.description}
        ${department.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || department.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [departments, search, activeFilter]);

  async function confirmArchive() {
    if (!archiveTarget) return;

    setIsArchiving(true);

    try {
      await archiveDepartment(archiveTarget.departmentId, getSessionToken());
      showToast("Department deleted successfully.");
      setArchiveTarget(null);
      await loadDepartments();
    } catch (archiveError) {
      showToast(archiveError.message || "Department could not be deleted.");
    } finally {
      setIsArchiving(false);
    }
  }

  const activeCount = departments.filter((department) => department.isActive).length;
  const inactiveCount = departments.length - activeCount;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Departments"
        description="Manage company departments, department heads and asset delivery structure."
      />

      <PageActionBar
        addHref="/departments/add"
        addLabel="Add Department"
        exportData={filteredDepartments}
        exportFileName="departments"
        printTitle="Departments"
        printDescription="Official department register generated from the current filtered department records."
        importModule="Departments"
      />

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
            {activeCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Departments</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {inactiveCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Visible Records</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {filteredDepartments.length}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by department, head, email, phone or location..."
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

      {isLoading && (
        <LoadingState
          title="Loading departments"
          description="Fetching department records from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Departments could not be loaded"
          description={error}
          onRetry={loadDepartments}
        />
      )}

      {!isLoading && !error && (
        <TableWrapper>
          <table className="min-w-[1050px] w-full text-sm">
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
                    {department.headOfDepartment || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {department.email || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {department.phone || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {department.location || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <DepartmentStatusBadge status={department.status} />
                  </td>

                  <td className="px-4 py-4">
                    <ActionButtons
                      viewHref={`/departments/view/${department.id}`}
                      updateHref={`/departments/edit/${department.id}`}
                      onDelete={() => setArchiveTarget(department)}
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
      )}

      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        title="Delete department?"
        description={`Department ${
          archiveTarget?.departmentName || ""
        } will be removed from active department lists. Audit history will remain available.`}
        confirmLabel={isArchiving ? "Deleting..." : "Delete"}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
