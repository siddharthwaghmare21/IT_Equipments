"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import DeliveryForm from "@/components/deliveries/DeliveryForm";
import {
  getAssets,
  getDelivery,
  getDepartments,
  updateDelivery,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";
import {
  createDeliveryFormData,
  mapDeliveryFromApi,
  mapDeliveryToRequest,
} from "@/lib/deliveryMapper";

export default function EditDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id;
  const [formData, setFormData] = useState(createDeliveryFormData());
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDelivery = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const [deliveryData, assetData, departmentData] = await Promise.all([
        getDelivery(deliveryId, token),
        getAssets(token),
        getDepartments(token),
      ]);
      const mappedDelivery = mapDeliveryFromApi(deliveryData);

      setFormData(createDeliveryFormData(mappedDelivery));
      setAssets((assetData || []).map(mapAssetFromApi));
      setDepartments(
        (departmentData || [])
          .map(mapDepartmentFromApi)
          .filter((department) => department.isActive)
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load delivery.");
    } finally {
      setIsLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDelivery();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDelivery]);

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
      await updateDelivery(
        deliveryId,
        mapDeliveryToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Delivery saved successfully.");
      router.push("/deliveries");
    } catch (saveError) {
      setError(saveError.message || "Delivery could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Delivery"
        description="Modify asset handover details, receiver name, acknowledgement and delivery status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/deliveries" label="Deliveries" />

        <Link
          href={`/deliveries/view/${deliveryId}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Delivery
        </Link>
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading delivery"
          description="Fetching delivery details from backend."
        />
      ) : error && !formData.deliveryCode ? (
        <ErrorState
          title="Unable to load delivery"
          description={error}
          actionLabel="Retry"
          onAction={loadDelivery}
        />
      ) : (
        <DeliveryForm
          formData={formData}
          assets={assets}
          departments={departments}
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
