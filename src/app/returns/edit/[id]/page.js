"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import ReturnForm from "@/components/returns/ReturnForm";
import {
  getAssets,
  getDeliveries,
  getDepartments,
  getReturn,
  updateReturn,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDeliveryFromApi } from "@/lib/deliveryMapper";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";
import {
  createReturnFormData,
  mapReturnFromApi,
  mapReturnToRequest,
} from "@/lib/returnMapper";

export default function EditReturnPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id;
  const [formData, setFormData] = useState(createReturnFormData());
  const [deliveries, setDeliveries] = useState([]);
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadReturn = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const [returnData, deliveryData, assetData, departmentData] =
        await Promise.all([
          getReturn(returnId, token),
          getDeliveries(token),
          getAssets(token),
          getDepartments(token),
        ]);
      const mappedReturn = mapReturnFromApi(returnData);

      setFormData(createReturnFormData(mappedReturn));
      setDeliveries((deliveryData || []).map(mapDeliveryFromApi));
      setAssets((assetData || []).map(mapAssetFromApi));
      setDepartments(
        (departmentData || [])
          .map(mapDepartmentFromApi)
          .filter((department) => department.isActive)
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load return.");
    } finally {
      setIsLoading(false);
    }
  }, [returnId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReturn();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReturn]);

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
      await updateReturn(
        returnId,
        mapReturnToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Return changes saved successfully.");
      router.push("/returns");
    } catch (saveError) {
      setError(saveError.message || "Return could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Return"
        description="Modify return details, condition, received location and inspection status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/returns" label="Returns" />

        <Link
          href={`/returns/view/${returnId}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Return
        </Link>
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading return"
          description="Fetching return details from backend."
        />
      ) : error && !formData.returnCode ? (
        <ErrorState
          title="Unable to load return"
          description={error}
          actionLabel="Retry"
          onAction={loadReturn}
        />
      ) : (
        <ReturnForm
          formData={formData}
          deliveries={deliveries}
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
