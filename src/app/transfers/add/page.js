"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import TransferForm from "@/components/transfers/TransferForm";
import { createTransfer, getAssets, getDepartments } from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";
import {
  createTransferFormData,
  mapTransferToRequest,
} from "@/lib/transferMapper";

export default function AddTransferPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createTransferFormData());
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
      setError(requestError.message || "Unable to load transfer form.");
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

    if (name === "assetId") {
      const selectedAsset = assets.find(
        (asset) => String(asset.assetId) === String(value)
      );
      setFormData((previousData) => ({
        ...previousData,
        assetId: value,
        fromDepartmentId:
          selectedAsset?.currentDepartmentId || previousData.fromDepartmentId,
        currentReceiverName:
          selectedAsset?.currentReceiverName || previousData.currentReceiverName,
      }));
      setError("");
      return;
    }

    setFormData((previousData) => ({ ...previousData, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createTransfer(
        mapTransferToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Transfer record saved successfully.");
      router.push("/transfers");
    } catch (saveError) {
      setError(saveError.message || "Transfer record could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Transfer"
        description="Create department transfer, IT collection or reassignment record for an already issued asset."
      />

      <div className="mb-6">
        <BackButton href="/transfers" label="Transfers" />
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading transfer form"
          description="Preparing assets and departments from backend."
        />
      ) : error && (assets.length === 0 || departments.length === 0) ? (
        <ErrorState
          title="Unable to load transfer form"
          description={error}
          actionLabel="Retry"
          onAction={loadLookups}
        />
      ) : (
        <TransferForm
          formData={formData}
          assets={assets}
          departments={departments}
          error={error}
          isSaving={isSaving}
          submitLabel="Save Transfer"
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      )}
    </LayoutWrapper>
  );
}
