"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import WorkOrderForm from "@/components/purchases/WorkOrderForm";
import { createWorkOrder, getVendors } from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapVendorFromApi } from "@/lib/vendorMapper";
import {
  createEmptyWorkOrderItem,
  createWorkOrderFormData,
  mapWorkOrderToRequest,
} from "@/lib/workOrderMapper";

export default function AddPurchasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState(createWorkOrderFormData());
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadVendors = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getVendors(token);
      setVendors((data || []).map(mapVendorFromApi).filter((vendor) => vendor.isActive));
    } catch (requestError) {
      setError(requestError.message || "Unable to load vendors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadVendors();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadVendors]);

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
      await createWorkOrder(
        mapWorkOrderToRequest(formData, readSession()?.id || null),
        getSessionToken()
      );
      showToast("Work order saved successfully.");
      router.push("/purchases");
    } catch (saveError) {
      setError(saveError.message || "Work order could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Work Order"
        description="Create a new work order with vendor, invoice, equipment item lines, specifications and cost details."
      />

      {isLoading ? (
        <LoadingState
          title="Loading vendors"
          description="Preparing vendor list for this work order."
        />
      ) : error && vendors.length === 0 ? (
        <ErrorState
          title="Unable to load vendors"
          description={error}
          actionLabel="Retry"
          onAction={loadVendors}
        />
      ) : (
        <WorkOrderForm
          formData={formData}
          vendors={vendors}
          error={error}
          isSaving={isSaving}
          submitLabel="Save Work Order"
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
