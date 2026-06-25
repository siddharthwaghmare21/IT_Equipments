"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { getDepartment } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";

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

  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDepartment = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getDepartment(departmentId, getSessionToken());
      setDepartment(mapDepartmentFromApi(response));
    } catch (loadError) {
      setError(loadError.message || "Department could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDepartment();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDepartment]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Department Details"
        description="View department information, department head and operational status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/departments" label="Departments" />

        <Link
          href={`/departments/edit/${departmentId}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Department
        </Link>
      </div>

      {isLoading && (
        <LoadingState
          title="Loading department"
          description="Fetching department details from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Department could not be loaded"
          description={error}
          onRetry={loadDepartment}
        />
      )}

      {!isLoading && !error && department && (
        <>
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
                  Head: {department.headOfDepartment || "-"}
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
              <DetailItem label="Status" value={department.status} />
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Description
              </p>
              <p className="mt-2 text-sm text-gray-700">
                {department.description || "-"}
              </p>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Asset Allocation</p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                Pending asset integration
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Department-wise asset counts will be calculated from real asset
                records after Assets integration.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Activity Summary</p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                Pending workflow integration
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Delivery, transfer, return and maintenance activity will appear
                here after module integration.
              </p>
            </div>
          </section>
        </>
      )}
    </LayoutWrapper>
  );
}
