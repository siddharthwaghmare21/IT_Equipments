"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import {
  getAssets,
  getMaintenanceRecord,
  getVendors,
  updateMaintenanceRecord,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import {
  createMaintenanceFormData,
  mapMaintenanceFromApi,
  mapMaintenanceToRequest,
} from "@/lib/maintenanceMapper";
import { mapVendorFromApi } from "@/lib/vendorMapper";

export default function EditMaintenancePage() {
  const params = useParams();
  const router = useRouter();
  const maintenanceId = params.id;
  const [formData, setFormData] = useState(createMaintenanceFormData());
  const [assets, setAssets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
      const [recordData, assetData, vendorData] = await Promise.all([
        getMaintenanceRecord(maintenanceId, token),
        getAssets(token),
        getVendors(token),
      ]);
      const mappedRecord = mapMaintenanceFromApi(recordData);

      setFormData(createMaintenanceFormData(mappedRecord));
      setAssets((assetData || []).map(mapAssetFromApi));
      setVendors((vendorData || []).map(mapVendorFromApi).filter((v) => v.isActive));
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

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await updateMaintenanceRecord(
        maintenanceId,
        mapMaintenanceToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Maintenance changes saved successfully.");
      router.push("/maintenance");
    } catch (saveError) {
      setError(saveError.message || "Maintenance record could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Maintenance"
        description="Modify repair details, issue type, vendor, cost and maintenance status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/maintenance" label="Maintenance" />

        <Link
          href={`/maintenance/view/${maintenanceId}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Maintenance
        </Link>
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading maintenance"
          description="Fetching maintenance details from backend."
        />
      ) : error && !formData.maintenanceCode ? (
        <ErrorState
          title="Unable to load maintenance"
          description={error}
          actionLabel="Retry"
          onAction={loadMaintenance}
        />
      ) : (
        <MaintenanceForm
          formData={formData}
          assets={assets}
          vendors={vendors}
          error={error}
          isSaving={isSaving}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      )}
    </LayoutWrapper>
  );
}
