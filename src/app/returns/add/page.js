"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import ReturnForm from "@/components/returns/ReturnForm";
import {
  createReturn,
  getAssets,
  getDeliveries,
  getDepartments,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDeliveryFromApi } from "@/lib/deliveryMapper";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";
import {
  createReturnFormData,
  mapReturnToRequest,
} from "@/lib/returnMapper";

export default function AddReturnPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createReturnFormData());
  const [deliveries, setDeliveries] = useState([]);
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
      const [deliveryData, assetData, departmentData] = await Promise.all([
        getDeliveries(token),
        getAssets(token),
        getDepartments(token),
      ]);
      setDeliveries((deliveryData || []).map(mapDeliveryFromApi));
      setAssets((assetData || []).map(mapAssetFromApi));
      setDepartments(
        (departmentData || [])
          .map(mapDepartmentFromApi)
          .filter((department) => department.isActive)
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load return form.");
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
      await createReturn(
        mapReturnToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Return record saved successfully.");
      router.push("/returns");
    } catch (saveError) {
      setError(saveError.message || "Return could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Return"
        description="Record returned IT assets, condition, received location and inspection status."
      />

      <div className="mb-6">
        <BackButton href="/returns" label="Returns" />
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading return form"
          description="Preparing deliveries, assets and departments from backend."
        />
      ) : error && assets.length === 0 ? (
        <ErrorState
          title="Unable to load return form"
          description={error}
          actionLabel="Retry"
          onAction={loadLookups}
        />
      ) : (
        <ReturnForm
          formData={formData}
          deliveries={deliveries}
          assets={assets}
          departments={departments}
          error={error}
          isSaving={isSaving}
          submitLabel="Save Return"
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      )}
    </LayoutWrapper>
  );
}
