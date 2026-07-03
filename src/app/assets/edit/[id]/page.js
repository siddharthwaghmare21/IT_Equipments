"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { getAsset, getDepartments, updateAsset } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  assetCategories,
  assetConditions,
  assetLifecycleStatuses,
  assetStatuses,
  createAssetFormData,
  mapAssetFromApi,
  mapAssetToRequest,
} from "@/lib/assetMapper";

export default function EditAssetPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id;

  const [formData, setFormData] = useState(createAssetFormData());
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = getSessionToken();
      const [assetResponse, departmentResponse] = await Promise.all([
        getAsset(assetId, token),
        getDepartments(token),
      ]);
      setFormData(createAssetFormData(mapAssetFromApi(assetResponse)));
      setDepartments(
        departmentResponse.filter((department) => department.isActive)
      );
    } catch (loadError) {
      setError(loadError.message || "Asset could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPageData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPageData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setSaveError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      await updateAsset(assetId, mapAssetToRequest(formData), getSessionToken());
      showToast("Asset changes saved successfully.");
      router.push("/assets");
    } catch (updateError) {
      setSaveError(updateError.message || "Asset could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Asset"
        description="Update asset information, serial number, warranty, specifications, description, location and current status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/assets" label="Assets" />

        <Link
          href={`/assets/view/${assetId}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          View Asset
        </Link>
      </div>

      {isLoading && (
        <LoadingState
          title="Loading asset"
          description="Fetching asset details from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Asset could not be loaded"
          description={error}
          onRetry={loadPageData}
        />
      )}

      {!isLoading && !error && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label="Asset Tag"
              name="assetTag"
              value={formData.assetTag}
              onChange={handleChange}
              required
            />

            <TextInput
              label="Asset Name"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              required
            />

            <SelectInput
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={assetCategories}
              required
            />

            <TextInput
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />

            <TextInput
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
            />

            <TextInput
              label="Serial Number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
            />

            <TextInput
              label="Work Order Date"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
            />

            <TextInput
              label="Work Order Reference"
              name="workOrderRef"
              value={formData.workOrderRef}
              onChange={handleChange}
            />

            <TextInput
              label="Invoice Number"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
            />

            <TextInput
              label="Warranty Expiry"
              name="warrantyExpiry"
              type="date"
              value={formData.warrantyExpiry}
              onChange={handleChange}
            />

            <DepartmentSelect
              label="Custodian Department"
              name="custodianDepartmentId"
              value={formData.custodianDepartmentId}
              onChange={handleChange}
              departments={departments}
            />

            <DepartmentSelect
              label="Current Department"
              name="currentDepartmentId"
              value={formData.currentDepartmentId}
              onChange={handleChange}
              departments={departments}
            />

            <TextInput
              label="Current Receiver Name"
              name="currentReceiverName"
              value={formData.currentReceiverName}
              onChange={handleChange}
            />

            <TextInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />

            <SelectInput
              label="Asset Condition"
              name="assetCondition"
              value={formData.assetCondition}
              onChange={handleChange}
              options={assetConditions}
            />

            <SelectInput
              label="Lifecycle Status"
              name="lifecycleStatus"
              value={formData.lifecycleStatus}
              onChange={handleChange}
              options={assetLifecycleStatuses}
            />

            <SelectInput
              label="Status"
              name="assetStatus"
              value={formData.assetStatus}
              onChange={handleChange}
              options={assetStatuses}
            />

            <TextareaInput
              label="Specifications"
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
            />

            <TextareaInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />

            <TextareaInput
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {saveError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {saveError}
            </p>
          )}

          <section className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-sm font-bold text-gray-900">System Tracking</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
              <TrackingItem label="Created At" value="Stored in backend" />
              <TrackingItem label="Updated At" value="Updated after save" />
              <TrackingItem label="Documents" value="Managed separately" />
              <TrackingItem label="History" value="Lifecycle tracked" />
            </div>
          </section>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/assets"
              className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </LayoutWrapper>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900";

function TextInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
        required={required}
      />
    </div>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
        required={required}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function DepartmentSelect({ label, name, value, onChange, departments }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
      >
        <option value="">Select department</option>
        {departments.map((department) => (
          <option
            key={department.departmentId}
            value={department.departmentId}
          >
            {department.departmentName}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaInput({ label, name, value, onChange, rows }) {
  return (
    <div className="md:col-span-2">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
      />
    </div>
  );
}

function TrackingItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
