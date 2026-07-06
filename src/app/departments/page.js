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
    Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Inactive: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-700 border-slate-200"
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
      />

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by department, head, email, phone or location..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white lg:max-w-md"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold ${
                  activeFilter === filter
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
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
            <thead className="bg-slate-50 text-left">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Department Code
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Department Name
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Department Head
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Phone
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Location
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.map((department) => (
                <tr
                  key={department.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 font-semibold text-slate-950">
                    {department.departmentCode}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {department.departmentName}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {department.headOfDepartment || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {department.email || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {department.phone || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
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
