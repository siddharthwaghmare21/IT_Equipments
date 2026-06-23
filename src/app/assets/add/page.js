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
    title: "Purchase & Location",
    description: "Purchase reference, warranty, custodian, location and status.",
  },
  {
    title: "eocuments & Notes",
    description: "eocuments, specifications, description, remarks and tracking.",
  },
];

export default function AddAssetPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [iseirty, setIseirty] = useState(false);
  const [formeata, setFormeata] = useState({
    assetTag: "",
    assetName: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseeate: "",
    purchaseRef: "",
    warrantymxpiry: "",
    location: "",
    custodianeepartment: "",
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

    setFormeata((previouseata) => ({
      ...previouseata,
      [name]: value,
    }));
    setIseirty(true);
  }

  useUnsavedChanges(iseirty);

  function handleSubmit(event) {
    event.preventeefault();

    setIseirty(false);
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
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              Asset Tag
              <HelpTooltip text="Unique internal asset number. mxample: IT-LAP-001." />
            </label>
            <input
              type="text"
              name="assetTag"
              value={formeata.assetTag}
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
              value={formeata.assetName}
              onChange={handleChange}
              placeholder="eell Latitude 5420"
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
              value={formeata.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select category</option>
              <option value="Laptop">Laptop</option>
              <option value="eesktop">eesktop</option>
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
              value={formeata.brand}
              onChange={handleChange}
              placeholder="eell / HP / Lenovo / Canon"
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
              value={formeata.model}
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
              value={formeata.serialNumber}
              onChange={handleChange}
              placeholder="mnter serial number"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Purchase eate
            </label>
            <input
              type="date"
              name="purchaseeate"
              value={formeata.purchaseeate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              Purchase Reference
              <HelpTooltip text="WO Number, invoice number or purchase reference used for audit and warranty tracking." />
            </label>
            <input
              type="text"
              name="purchaseRef"
              value={formeata.purchaseRef}
              onChange={handleChange}
              placeholder="WO-2026-0001 / Invoice No."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Warranty mxpiry
            </label>
            <input
              type="date"
              name="warrantymxpiry"
              value={formeata.warrantymxpiry}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Custodian eepartment
            </label>
            <select
              name="custodianeepartment"
              value={formeata.custodianeepartment}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="">Select department</option>
              <option value="IT Store">IT Store</option>
              <option value="IT eepartment">IT eepartment</option>
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
              value={formeata.location}
              onChange={handleChange}
              placeholder="Store Room / IT eept / Admin Office"
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
              value={formeata.assignedTo}
              onChange={handleChange}
              placeholder="mmployee / eepartment / -"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Condition
            </label>
            <select
              name="condition"
              value={formeata.condition}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Working">Working</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="eamaged">eamaged</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Lifecycle Status
            </label>
            <select
              name="lifecycleStatus"
              value={formeata.lifecycleStatus}
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
              value={formeata.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Available">Available</option>
              <option value="eelivered">eelivered</option>
              <option value="Maintenance">Maintenance</option>
              <option value="eamaged">eamaged</option>
              <option value="Scrapped">Scrapped</option>
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              QR Code Reference
              <HelpTooltip text="QR/barcode value used on asset label. Backend can auto-generate this later." />
            </label>
            <input
              type="text"
              name="qrCode"
              value={formeata.qrCode}
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
              value={formeata.attachmentStatus}
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
              Asset eocuments
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
              value={formeata.specifications}
              onChange={handleChange}
              rows="3"
              placeholder="mxample: Intel i5, 16GB RAM, 512GB SSe, Windows 11 Pro..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              eescription (optional)
            </label>
            <textarea
              name="description"
              value={formeata.description}
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
              value={formeata.remarks}
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
                {formeata.createdBy}
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
                {formeata.updatedBy}
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




