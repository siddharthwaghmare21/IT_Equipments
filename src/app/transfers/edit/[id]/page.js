"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import TransferForm from "@/components/transfers/TransferForm";
import {
  getAssets,
  getDepartments,
  getTransfer,
  updateTransfer,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDepartmentFromApi } from "@/lib/departmentMapper";
import {
  createTransferFormData,
  mapTransferFromApi,
  mapTransferToRequest,
} from "@/lib/transferMapper";

export default function EditTransferPage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params.id;
  const [formData, setFormData] = useState(createTransferFormData());
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTransfer = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const [transferData, assetData, departmentData] = await Promise.all([
        getTransfer(transferId, token),
        getAssets(token),
        getDepartments(token),
      ]);
      const mappedTransfer = mapTransferFromApi(transferData);

      setFormData(createTransferFormData(mappedTransfer));
      setAssets((assetData || []).map(mapAssetFromApi));
      setDepartments(
        (departmentData || [])
          .map(mapDepartmentFromApi)
          .filter((department) => department.isActive)
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load transfer.");
    } finally {
      setIsLoading(false);
    }
  }, [transferId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTransfer();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTransfer]);

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
      await updateTransfer(
        transferId,
        mapTransferToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Transfer record updated successfully.");
      router.push("/transfers");
    } catch (saveError) {
      setError(saveError.message || "Transfer record could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Transfer"
        description="Update transfer, IT collection and reassignment details for this asset."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/transfers" label="Transfers" />

        <Link
          href={`/transfers/view/${transferId}`}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Transfer
        </Link>
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading transfer"
          description="Fetching transfer details from backend."
        />
      ) : error && !formData.transferCode ? (
        <ErrorState
          title="Unable to load transfer"
          description={error}
          actionLabel="Retry"
          onAction={loadTransfer}
        />
      ) : (
        <TransferForm
          formData={formData}
          assets={assets}
          departments={departments}
          error={error}
          isSaving={isSaving}
          submitLabel="Update Transfer"
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      )}
    </LayoutWrapper>
  );
}
