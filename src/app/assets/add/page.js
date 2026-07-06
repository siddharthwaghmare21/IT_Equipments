"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import FormStepper from "@/components/common/FormStepper";
import HelpTooltip from "@/components/common/HelpTooltip";
import { showToast } from "@/components/common/ToastHost";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { createAsset, getDepartments } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  assetCategories,
  assetConditions,
  assetLifecycleStatuses,
  assetStatuses,
  createAssetFormData,
  mapAssetToRequest,
} from "@/lib/assetMapper";

const assetFormSteps = [
  {
    title: "Identity",
    description: "Asset tag, name, category, brand, model and serial number.",
  },
  {
    title: "Work Order & Location",
    description:
      "Work order reference, warranty, custodian department, location and status.",
  },
  {
    title: "Documents & Notes",
    description: "Specifications, description, remarks and tracking.",
  },
];

export default function AddAssetPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(createAssetFormData());

  useUnsavedChanges(isDirty);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await getDepartments(getSessionToken());
      setDepartments(response.filter((department) => department.isActive));
    } catch {
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDepartments();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDepartments]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setError("");
    setIsDirty(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createAsset(mapAssetToRequest(formData), getSessionToken());
      setIsDirty(false);
      showToast("Asset saved successfully.");
      router.push("/assets");
    } catch (saveError) {
      setError(saveError.message || "Asset could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Asset"
        description="Register a new IT asset with serial number, warranty, specifications, department, location and lifecycle status."
      />

      <FormStepper
        steps={assetFormSteps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">
          {assetFormSteps[currentStep].title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          {assetFormSteps[currentStep].description}
        </p>
      </section>

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
            placeholder="IT-LAP-001"
            tooltip="Unique internal asset number. Example: IT-LAP-001."
            required
          />

          <TextInput
            label="Asset Name"
            name="assetName"
            value={formData.assetName}
            onChange={handleChange}
            placeholder="Dell Latitude 5420"
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
            placeholder="Dell / HP / Lenovo / Canon"
          />

          <TextInput
            label="Model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Latitude 5420"
          />

          <TextInput
            label="Serial Number"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="Enter serial number"
            required
          />

          <TextInput
            label="Work Order Date"
            name="purchaseDate"
            type="text"
            value={formData.purchaseDate}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            label="Work Order Reference"
            name="workOrderRef"
            value={formData.workOrderRef}
            onChange={handleChange}
            placeholder="WO-2026-0001"
            tooltip="WO number used for audit and warranty tracking."
          />

          <TextInput
            label="Invoice Number"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            placeholder="INV-0001"
          />

          <TextInput
            label="Warranty Expiry"
            name="warrantyExpiry"
            type="text"
            value={formData.warrantyExpiry}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
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
            placeholder="Employee/person name if asset is issued"
          />

          <TextInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Store Room / IT Dept / Admin Office"
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

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Asset document upload is handled through the document metadata
              workflow after asset save.
            </div>
          </div>

          <TextareaInput
            label="Specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleChange}
            rows="3"
            placeholder="Example: Intel i5, 16GB RAM, 512GB SSD, Windows 11 Pro..."
          />

          <TextareaInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Add asset details, included accessories, usage purpose or extra information..."
          />

          <TextareaInput
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="4"
            placeholder="Additional notes about this asset..."
          />
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-sm font-bold text-gray-900">System Tracking</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
            <TrackingItem label="Created By" value="Logged-in user" />
            <TrackingItem label="Created At" value="After save" />
            <TrackingItem label="Updated By" value="Logged-in user" />
            <TrackingItem label="Updated At" value="After save" />
          </div>
        </section>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Previous Step
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentStep((step) =>
                Math.min(step + 1, assetFormSteps.length - 1)
              )
            }
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Next Step
          </button>

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
            {isSaving ? "Saving..." : "Save Asset"}
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900";

function FieldLabel({ label, tooltip }) {
  return (
    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
      {label}
      {tooltip && <HelpTooltip text={tooltip} />}
    </label>
  );
}

function TextInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  tooltip,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <FieldLabel label={label} tooltip={tooltip} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
      <FieldLabel label={label} />
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
      <FieldLabel label={label} />
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

function TextareaInput({ label, name, value, onChange, rows, placeholder }) {
  return (
    <div className="md:col-span-2">
      <FieldLabel label={label} />
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
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
