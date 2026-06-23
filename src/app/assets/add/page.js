"use client";

import { useState } from "react";
import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import FormStepper from "@/components/common/FormStepper";
import { showToast } from "@/components/common/ToastHost";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";

const assetFormSteps = [
  {
    title: "Identity",
    description: "Asset tag, name, category, brand, model and serial number.",
  },
  {
    title: "Purchase & Location",
    description: "Purchase reference, warranty, custodian, location and status.",
  },
  {
    title: "Documents & Notes",
    description: "Documents, specifications, description, remarks and tracking.",
  },
];

export default function AddAssetPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setIsDirty(true);
  }

  useUnsavedChanges(isDirty);

  function handleSubmit(event) {
    event.preventDefault();

    setIsDirty(false);
    showToast("Asset saved successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Asset"
        description="Register a new IT asset with serial number, warranty, specifications, description, location and status."
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Tag
            </label>
            <input
              type="text"
              name="assetTag"
              value={formData.assetTag}
              onChange={handleChange}
              placeholder="IT-LAP-001"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Name
            </label>
            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              placeholder="Dell Latitude 5420"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select category</option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Network">Network</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Dell / HP / Lenovo / Canon"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Latitude 5420"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="Enter serial number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Purchase Reference
            </label>
            <input
              type="text"
              name="purchaseRef"
              value={formData.purchaseRef}
              onChange={handleChange}
              placeholder="PO-2026-0001 / Invoice No."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Warranty Expiry
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              value={formData.warrantyExpiry}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Custodian Department
            </label>
            <select
              name="custodianDepartment"
              value={formData.custodianDepartment}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="">Select department</option>
              <option value="IT Store">IT Store</option>
              <option value="IT Department">IT Department</option>
              <option value="Accounts">Accounts</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Store Room / IT Dept / Admin Office"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assigned To
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="Employee / Department / -"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Working">Working</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Lifecycle Status
            </label>
            <select
              name="lifecycleStatus"
              value={formData.lifecycleStatus}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="In Stock">In Stock</option>
              <option value="In Use">In Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Available">Available</option>
              <option value="Delivered">Delivered</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Damaged">Damaged</option>
              <option value="Scrapped">Scrapped</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              QR Code Reference
            </label>
            <input
              type="text"
              name="qrCode"
              value={formData.qrCode}
              onChange={handleChange}
              placeholder="Auto-generated after save"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Attachment Status
            </label>
            <select
              name="attachmentStatus"
              value={formData.attachmentStatus}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

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

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Specifications (optional)
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
              placeholder="Example: Intel i5, 16GB RAM, 512GB SSD, Windows 11 Pro..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Add asset details, included accessories, usage purpose or extra information..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="4"
              placeholder="Additional notes about this asset..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="text-sm font-bold text-gray-900">System Tracking</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Created By
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formData.createdBy}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Created At
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                After save
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Updated By
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formData.updatedBy}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Updated At
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                After save
              </p>
            </div>
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




