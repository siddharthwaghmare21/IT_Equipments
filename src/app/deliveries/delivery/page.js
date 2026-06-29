"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import DeliveryForm from "@/components/deliveries/DeliveryForm";
import { createDelivery, getAssets, getDepartments } from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";
import {
  createDeliveryFormData,
  mapDeliveryToRequest,
} from "@/lib/deliveryMapper";

export default function AddDeliveryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createDeliveryFormData());
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
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
      const [assetData, departmentData] = await Promise.all([
        getAssets(token),
        getDepartments(token),
      ]);
      setAssets((assetData || []).map(mapAssetFromApi));
      setDepartments(
        (departmentData || [])
          .map(mapDepartmentFromApi)
          .filter((department) => department.isActive)
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load delivery lookups.");
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

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createDelivery(
        mapDeliveryToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Delivery saved successfully.");
      router.push("/deliveries");
    } catch (saveError) {
      setError(saveError.message || "Delivery could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Delivery"
        description="Issue IT equipment to a department and record the receiver name for handover tracking."
      />

      <div className="mb-6">
        <BackButton href="/deliveries" label="Deliveries" />
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading delivery form"
          description="Preparing assets and departments from backend."
        />
      ) : error && (assets.length === 0 || departments.length === 0) ? (
        <ErrorState
          title="Unable to load delivery form"
          description={error}
          actionLabel="Retry"
          onAction={loadLookups}
        />
      ) : (
        <DeliveryForm
          formData={formData}
          assets={assets}
          departments={departments}
          error={error}
          isSaving={isSaving}
          submitLabel="Save Delivery"
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      )}
    </LayoutWrapper>
  );
}
