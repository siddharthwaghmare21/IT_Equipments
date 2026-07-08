"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import TablePagination from "@/components/common/TablePagination";
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
const printColumns = [
  { key: "departmentCode", label: "Department Code" },
  { key: "departmentName", label: "Department Name" },
  { key: "headOfDepartment", label: "Department Head" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
];

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
  const [activeFilter, setActiveFilter] = useState("All");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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
      const matchesFilter =
        activeFilter === "All" || department.status === activeFilter;

      return matchesFilter;
    });
  }, [departments, activeFilter]);

  const pagedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredDepartments.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredDepartments]);

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
      />

      <PageActionBar
        addHref="/departments/add"
        addLabel="Add Department"
        exportData={filteredDepartments}
        exportFileName="departments"
        printTitle="Departments"
        printColumns={printColumns}
        printDescription="Official department register generated from the current filtered department records."
      />

      <section className="mb-4 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(106,61,240,0.2)]"
                    : "border-[#314666] bg-[#101a2b] text-[#b8c7e6] hover:bg-[#16233a]"
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
            <thead className="bg-[#101a2b] text-left">
              <tr className="border-b border-[#263754]">
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Department Code
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Department Name
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Department Head
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Phone
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Location
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#263754] bg-[#18253d]">
              {pagedDepartments.map((department) => (
                <tr
                  key={department.id}
                  className="hover:bg-[#1f2f4a]"
                >
                  <td className="px-4 py-4 font-semibold text-white">
                    {department.departmentCode}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {department.departmentName}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {department.headOfDepartment || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {department.email || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {department.phone || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
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
          {filteredDepartments.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredDepartments.length}
              pageSize={10}
              onPageChange={setCurrentPage}
              itemLabel="departments"
            />
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
