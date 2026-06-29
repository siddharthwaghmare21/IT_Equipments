"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { getMaintenanceRecord } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  formatMaintenanceCurrency,
  mapMaintenanceFromApi,
} from "@/lib/maintenanceMapper";

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

function MaintenanceStatusBadge({ status }) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
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

export default function ViewMaintenancePage() {
  const params = useParams();
  const maintenanceId = params.id;
  const [maintenanceRecord, setMaintenanceRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMaintenance = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getMaintenanceRecord(maintenanceId, token);
      setMaintenanceRecord(mapMaintenanceFromApi(data));
    } catch (requestError) {
      setError(requestError.message || "Unable to load maintenance record.");
    } finally {
      setIsLoading(false);
    }
  }, [maintenanceId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMaintenance();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadMaintenance]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Maintenance Details"
        description="View asset repair, service issue, vendor, cost and maintenance status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/maintenance" label="Maintenance" />

        {maintenanceRecord && (
          <Link
            href={`/maintenance/edit/${maintenanceRecord.id}`}
            prefetch={false}
            className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Edit Maintenance
          </Link>
        )}
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading maintenance"
          description="Fetching maintenance details from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load maintenance"
          description={error}
          actionLabel="Retry"
          onAction={loadMaintenance}
        />
      ) : (
        <>
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {maintenanceRecord.maintenanceCode}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {maintenanceRecord.assetName || maintenanceRecord.assetTag}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {maintenanceRecord.assetTag} | {maintenanceRecord.issueType}
                </p>
              </div>

              <MaintenanceStatusBadge
                status={maintenanceRecord.maintenanceStatus}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailItem
                label="Maintenance Code"
                value={maintenanceRecord.maintenanceCode}
              />
              <DetailItem label="Asset Tag" value={maintenanceRecord.assetTag} />
              <DetailItem
                label="Asset Name"
                value={maintenanceRecord.assetName}
              />
              <DetailItem
                label="Issue Type"
                value={maintenanceRecord.issueType}
              />
              <DetailItem
                label="Reported By"
                value={maintenanceRecord.reportedByName}
              />
              <DetailItem
                label="Vendor / Technician"
                value={maintenanceRecord.vendorName}
              />
              <DetailItem
                label="Service Type"
                value={maintenanceRecord.serviceType}
              />
              <DetailItem label="Priority" value={maintenanceRecord.priority} />
              <DetailItem
                label="Service Date"
                value={maintenanceRecord.serviceDate}
              />
              <DetailItem
                label="Expected Completion"
                value={maintenanceRecord.expectedCompletionDate}
              />
              <DetailItem
                label="Completion Date"
                value={maintenanceRecord.completionDate}
              />
              <DetailItem
                label="Cost"
                value={formatMaintenanceCurrency(
                  maintenanceRecord.maintenanceCost
                )}
              />
              <DetailItem
                label="Downtime Hours"
                value={maintenanceRecord.downtimeHours}
              />
              <DetailItem
                label="Warranty Claim"
                value={maintenanceRecord.warrantyClaim ? "Yes" : "No"}
              />
              <DetailItem
                label="Approval Status"
                value={maintenanceRecord.approvalStatus}
              />
              <DetailItem
                label="Status"
                value={maintenanceRecord.maintenanceStatus}
              />
              <DetailItem label="Created At" value={maintenanceRecord.createdAt} />
              <DetailItem label="Updated At" value={maintenanceRecord.updatedAt} />
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Remarks
              </p>
              <p className="mt-2 text-sm text-gray-700">
                {maintenanceRecord.remarks || "-"}
              </p>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Maintenance Summary</p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                {maintenanceRecord.issueType}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {maintenanceRecord.assetName || maintenanceRecord.assetTag} is
                handled by {maintenanceRecord.vendorName || "internal team"}.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Financial Impact</p>
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                {formatMaintenanceCurrency(maintenanceRecord.maintenanceCost)}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Downtime recorded: {maintenanceRecord.downtimeHours || 0} hours.
              </p>
            </div>
          </section>
        </>
      )}
    </LayoutWrapper>
  );
}
