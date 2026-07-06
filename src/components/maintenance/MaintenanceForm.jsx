"use client";

import Link from "next/link";
import {
  issueTypes,
  maintenanceApprovalStatuses,
  maintenancePriorities,
  maintenanceStatuses,
  serviceTypes,
} from "@/lib/maintenanceMapper";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({ name, value, onChange, options, required = false }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
    >
      {options.map((option) => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
}

export default function MaintenanceForm({
  formData,
  assets,
  vendors,
  error,
  isSaving,
  submitLabel,
  onSubmit,
  onChange,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Maintenance Code">
          <input
            type="text"
            name="maintenanceCode"
            value={formData.maintenanceCode}
            onChange={onChange}
            placeholder="MNT-2026-001"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Asset">
          <Select
            name="assetId"
            value={formData.assetId}
            onChange={onChange}
            required
            options={[
              { value: "", label: "Select asset" },
              ...assets.map((asset) => ({
                value: String(asset.assetId),
                label: `${asset.assetTag} - ${asset.assetName}`,
              })),
            ]}
          />
        </Field>

        <Field label="Issue Type">
          <Select
            name="issueType"
            value={formData.issueType}
            onChange={onChange}
            required
            options={[{ value: "", label: "Select issue type" }, ...issueTypes]}
          />
        </Field>

        <Field label="Reported By">
          <input
            type="text"
            name="reportedByName"
            value={formData.reportedByName}
            onChange={onChange}
            placeholder="Department user / IT team member"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Vendor / Technician">
          <Select
            name="vendorId"
            value={formData.vendorId}
            onChange={onChange}
            options={[
              { value: "", label: "Select vendor if applicable" },
              ...vendors.map((vendor) => ({
                value: String(vendor.vendorId),
                label: vendor.vendorName,
              })),
            ]}
          />
        </Field>

        <Field label="Service Type">
          <Select
            name="serviceType"
            value={formData.serviceType}
            onChange={onChange}
            options={serviceTypes}
          />
        </Field>

        <Field label="Priority">
          <Select
            name="priority"
            value={formData.priority}
            onChange={onChange}
            options={maintenancePriorities}
          />
        </Field>

        <Field label="Service Date">
          <input
            type="text"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Expected Completion Date">
          <input
            type="text"
            name="expectedCompletionDate"
            value={formData.expectedCompletionDate}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Completion Date">
          <input
            type="text"
            name="completionDate"
            value={formData.completionDate}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Maintenance Cost">
          <input
            type="number"
            min="0"
            step="0.01"
            name="maintenanceCost"
            value={formData.maintenanceCost}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Downtime Hours">
          <input
            type="number"
            min="0"
            step="0.01"
            name="downtimeHours"
            value={formData.downtimeHours}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Warranty Claim">
          <Select
            name="warrantyClaim"
            value={formData.warrantyClaim}
            onChange={onChange}
            options={["No", "Yes"]}
          />
        </Field>

        <Field label="Approval Status">
          <Select
            name="approvalStatus"
            value={formData.approvalStatus}
            onChange={onChange}
            options={maintenanceApprovalStatuses}
          />
        </Field>

        <Field label="Maintenance Status">
          <Select
            name="maintenanceStatus"
            value={formData.maintenanceStatus}
            onChange={onChange}
            options={maintenanceStatuses}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Remarks">
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              rows={3}
              placeholder="Issue notes, service observations, vendor remarks or closure summary."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/maintenance"
          className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
