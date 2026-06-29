"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import MaintenanceForm from "@/components/maintenance/MaintenanceForm";
import {
  createMaintenanceRecord,
  getAssets,
  getVendors,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import {
  createMaintenanceFormData,
  mapMaintenanceToRequest,
} from "@/lib/maintenanceMapper";
import { mapVendorFromApi } from "@/lib/vendorMapper";

export default function AddMaintenancePage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createMaintenanceFormData());
  const [assets, setAssets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadLookups = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const [assetData, vendorData] = await Promise.all([
        getAssets(token),
        getVendors(token),
      ]);
      setAssets((assetData || []).map(mapAssetFromApi));
      setVendors((vendorData || []).map(mapVendorFromApi).filter((v) => v.isActive));
    } catch (requestError) {
      setError(requestError.message || "Unable to load maintenance form.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadLookups();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadLookups]);

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
      await createMaintenanceRecord(
        mapMaintenanceToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Maintenance record saved successfully.");
      router.push("/maintenance");
    } catch (saveError) {
      setError(saveError.message || "Maintenance record could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Maintenance"
        description="Create a repair, service or maintenance record for an IT asset."
      />

      <div className="mb-6">
        <BackButton href="/maintenance" label="Maintenance" />
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading maintenance form"
          description="Preparing assets and vendors from backend."
        />
      ) : error && assets.length === 0 ? (
        <ErrorState
          title="Unable to load maintenance form"
          description={error}
          actionLabel="Retry"
          onAction={loadLookups}
        />
      ) : (
        <MaintenanceForm
          formData={formData}
          assets={assets}
          vendors={vendors}
          error={error}
          isSaving={isSaving}
          submitLabel="Save Maintenance"
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      )}
    </LayoutWrapper>
  );
}
