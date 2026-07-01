"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import {
  getAssets,
  getDeliveries,
  getDepartment,
  getReturns,
  getTransfers,
} from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";
import { mapDeliveryFromApi } from "@/lib/deliveryMapper";
import { mapReturnFromApi } from "@/lib/returnMapper";
import { mapTransferFromApi } from "@/lib/transferMapper";

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
  const [departmentStats, setDepartmentStats] = useState({
    assetCount: 0,
    inUseAssets: 0,
    workflowCount: 0,
    openWorkflows: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDepartment = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = getSessionToken();
      const response = await getDepartment(departmentId, token);
      const mappedDepartment = mapDepartmentFromApi(response);
      setDepartment(mappedDepartment);

      const [assetsResult, deliveriesResult, transfersResult, returnsResult] =
        await Promise.allSettled([
          getAssets(token),
          getDeliveries(token),
          getTransfers(token),
          getReturns(token),
        ]);

      const normalizedDepartmentId = String(mappedDepartment.departmentId);
      const assets =
        assetsResult.status === "fulfilled"
          ? assetsResult.value.map(mapAssetFromApi)
          : [];
      const deliveries =
        deliveriesResult.status === "fulfilled"
          ? deliveriesResult.value.map(mapDeliveryFromApi)
          : [];
      const transfers =
        transfersResult.status === "fulfilled"
          ? transfersResult.value.map(mapTransferFromApi)
          : [];
      const returns =
        returnsResult.status === "fulfilled"
          ? returnsResult.value.map(mapReturnFromApi)
          : [];

      const departmentAssets = assets.filter(
        (asset) =>
          String(asset.currentDepartmentId) === normalizedDepartmentId ||
          String(asset.custodianDepartmentId) === normalizedDepartmentId
      );
      const departmentDeliveries = deliveries.filter(
        (delivery) => String(delivery.departmentId) === normalizedDepartmentId
      );
      const departmentTransfers = transfers.filter(
        (transfer) =>
          String(transfer.fromDepartmentId) === normalizedDepartmentId ||
          String(transfer.toDepartmentId) === normalizedDepartmentId
      );
      const departmentReturns = returns.filter(
        (returnRecord) =>
          String(returnRecord.departmentId) === normalizedDepartmentId
      );
      const workflows = [
        ...departmentDeliveries,
        ...departmentTransfers,
        ...departmentReturns,
      ];

      setDepartmentStats({
        assetCount: departmentAssets.length,
        inUseAssets: departmentAssets.filter(
          (asset) => asset.lifecycleStatus === "In Use"
        ).length,
        workflowCount: workflows.length,
        openWorkflows:
          departmentDeliveries.filter(
            (delivery) => delivery.deliveryStatus === "Pending"
          ).length +
          departmentTransfers.filter(
            (transfer) => transfer.transferStatus === "Pending"
          ).length +
          departmentReturns.filter(
            (returnRecord) =>
              returnRecord.returnStatus === "Pending Inspection" ||
              returnRecord.inspectionStatus === "Pending"
          ).length,
      });
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
                {departmentStats.assetCount} assets linked
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {departmentStats.inUseAssets} assets are currently marked as in
                use for this department.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Activity Summary</p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                {departmentStats.workflowCount} workflow records
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {departmentStats.openWorkflows} linked delivery, transfer or
                return records need follow-up.
              </p>
            </div>
          </section>
        </>
      )}
    </LayoutWrapper>
  );
}
