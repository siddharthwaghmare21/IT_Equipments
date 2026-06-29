"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import WorkOrderForm from "@/components/purchases/WorkOrderForm";
import { getVendors, getWorkOrder, updateWorkOrder } from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapVendorFromApi } from "@/lib/vendorMapper";
import {
  createEmptyWorkOrderItem,
  createWorkOrderFormData,
  mapWorkOrderFromApi,
  mapWorkOrderToRequest,
} from "@/lib/workOrderMapper";

export default function EditPurchasePage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params.id;
  const [formData, setFormData] = useState(createWorkOrderFormData());
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadWorkOrder = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const [workOrderData, vendorData] = await Promise.all([
        getWorkOrder(workOrderId, token),
        getVendors(token),
      ]);
      const mappedWorkOrder = mapWorkOrderFromApi(workOrderData);

      setFormData(createWorkOrderFormData(mappedWorkOrder));
      setVendors(
        (vendorData || []).map(mapVendorFromApi).filter((vendor) => vendor.isActive)
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load work order.");
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorkOrder();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkOrder]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setError("");
  }

  function handleItemChange(index, field, value) {
    setFormData((previousData) => ({
      ...previousData,
      items: previousData.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
    setError("");
  }

  function handleAddItem() {
    setFormData((previousData) => ({
      ...previousData,
      items: [...previousData.items, createEmptyWorkOrderItem()],
    }));
  }

  function handleRemoveItem(index) {
    setFormData((previousData) => ({
      ...previousData,
      items: previousData.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await updateWorkOrder(
        workOrderId,
        mapWorkOrderToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Work order changes saved successfully.");
      router.push("/purchases");
    } catch (saveError) {
      setError(saveError.message || "Work order could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Work Order"
        description="Update vendor invoice, equipment item lines, status, specifications and cost details."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/purchases" label="Work Orders" />

        <Link
          href={`/purchases/view/${workOrderId}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          View Work Order
        </Link>
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading work order"
          description="Fetching work order details from backend."
        />
      ) : error && !formData.workOrderNumber ? (
        <ErrorState
          title="Unable to load work order"
          description={error}
          actionLabel="Retry"
          onAction={loadWorkOrder}
        />
      ) : (
        <WorkOrderForm
          formData={formData}
          vendors={vendors}
          error={error}
          isSaving={isSaving}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onChange={handleChange}
          onItemChange={handleItemChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />
      )}
    </LayoutWrapper>
  );
}
