"use client";

import { useState } from "react";
import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import FormStepper from "@/components/common/FormStepper";
import HelpTooltip from "@/components/common/HelpTooltip";
import { showToast } from "@/components/common/ToastHost";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";

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
    description: "Documents, specifications, description, remarks and tracking.",
  },
];

const initialFormData = {
  assetTag: "",
  assetName: "",
  category: "",
  brand: "",
  model: "",
  serialNumber: "",
  purchaseDate: "",
  purchaseRef: "",
  warrantyExpiry: "",
  location: "",
  custodianDepartment: "",
  assignedTo: "",
  condition: "New",
  lifecycleStatus: "In Stock",
  qrCode: "",
  attachmentStatus: "Pending",
  createdBy: "IT Admin",
  createdAt: "",
  updatedBy: "IT Admin",
  updatedAt: "",
  status: "Available",
  specifications: "",
  description: "",
  remarks: "",
};

export default function AddAssetPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useUnsavedChanges(isDirty);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setIsDirty(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsDirty(false);
    showToast("Asset saved successfully. Backend will be connected later.");
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
            options={[
              "Laptop",
              "Desktop",
              "Monitor",
              "Printer",
              "Network",
              "Keyboard",
              "Mouse",
              "Other",
            ]}
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
            type="date"
            value={formData.purchaseDate}
            onChange={handleChange}
          />

          <TextInput
            label="Work Order Reference"
            name="purchaseRef"
            value={formData.purchaseRef}
            onChange={handleChange}
            placeholder="WO-2026-0001 / Invoice No."
            tooltip="WO number, invoice number or purchase reference used for audit and warranty tracking."
          />

          <TextInput
            label="Warranty Expiry"
            name="warrantyExpiry"
            type="date"
            value={formData.warrantyExpiry}
            onChange={handleChange}
          />

          <SelectInput
            label="Custodian Department"
            name="custodianDepartment"
            value={formData.custodianDepartment}
            onChange={handleChange}
            options={[
              "IT Store",
              "IT Department",
              "Accounts",
              "Admin",
              "HR",
              "Operations",
            ]}
          />

          <TextInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Store Room / IT Dept / Admin Office"
          />

          <TextInput
            label="Assigned Department"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            placeholder="Department name or -"
          />

          <SelectInput
            label="Asset Condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            options={["New", "Good", "Working", "Needs Repair", "Damaged"]}
          />

          <SelectInput
            label="Lifecycle Status"
            name="lifecycleStatus"
            value={formData.lifecycleStatus}
            onChange={handleChange}
            options={[
              "In Stock",
              "In Use",
              "Under Maintenance",
              "Retired",
              "Archived",
            ]}
          />

          <SelectInput
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              "Available",
              "Delivered",
              "Maintenance",
              "Damaged",
              "Scrapped",
            ]}
          />

          <TextInput
            label="QR Code Reference"
            name="qrCode"
            value={formData.qrCode}
            onChange={handleChange}
            placeholder="Auto-generated after save"
            tooltip="QR/barcode value used on asset label. Backend can auto-generate this later."
          />

          <SelectInput
            label="Attachment Status"
            name="attachmentStatus"
            value={formData.attachmentStatus}
            onChange={handleChange}
            options={["Pending", "Uploaded", "Not Required"]}
          />

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Documents
            </label>
            <input
              type="file"
              multiple
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white focus:border-gray-900"
            />
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

        <section className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-sm font-bold text-gray-900">System Tracking</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
            <TrackingItem label="Created By" value={formData.createdBy} />
            <TrackingItem label="Created At" value="After save" />
            <TrackingItem label="Updated By" value={formData.updatedBy} />
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
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Save Asset
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
