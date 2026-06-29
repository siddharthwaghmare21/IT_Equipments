"use client";

import Link from "next/link";
import {
  damageDecisions,
  inspectionStatuses,
  returnAcknowledgementStatuses,
  returnConditions,
  returnStatuses,
} from "@/lib/returnMapper";

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

export default function ReturnForm({
  formData,
  deliveries,
  assets,
  departments,
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
        <Field label="Return Code">
          <input
            type="text"
            name="returnCode"
            value={formData.returnCode}
            onChange={onChange}
            placeholder="RET-2026-001"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Delivery Code">
          <Select
            name="deliveryId"
            value={formData.deliveryId}
            onChange={onChange}
            options={[
              { value: "", label: "Select delivery if available" },
              ...deliveries.map((delivery) => ({
                value: String(delivery.deliveryId),
                label: `${delivery.deliveryCode} - ${
                  delivery.assetName || delivery.assetTag
                }`,
              })),
            ]}
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

        <Field label="Department">
          <Select
            name="departmentId"
            value={formData.departmentId}
            onChange={onChange}
            options={[
              { value: "", label: "Select department" },
              ...departments.map((department) => ({
                value: String(department.departmentId),
                label: department.departmentName,
              })),
            ]}
          />
        </Field>

        <Field label="Returned By / Receiver Name">
          <input
            type="text"
            name="returnedByName"
            value={formData.returnedByName}
            onChange={onChange}
            placeholder="Name of person returning asset"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Return Date">
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Return Condition">
          <Select
            name="returnCondition"
            value={formData.returnCondition}
            onChange={onChange}
            options={returnConditions}
          />
        </Field>

        <Field label="Received By User ID">
          <input
            type="number"
            min="1"
            name="receivedBy"
            value={formData.receivedBy}
            onChange={onChange}
            placeholder="Optional backend user id"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Received Location">
          <input
            type="text"
            name="receivedLocation"
            value={formData.receivedLocation}
            onChange={onChange}
            placeholder="IT Store / Inspection Desk"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Acknowledgement Status">
          <Select
            name="acknowledgementStatus"
            value={formData.acknowledgementStatus}
            onChange={onChange}
            options={returnAcknowledgementStatuses}
          />
        </Field>

        <Field label="Inspection Status">
          <Select
            name="inspectionStatus"
            value={formData.inspectionStatus}
            onChange={onChange}
            options={inspectionStatuses}
          />
        </Field>

        <Field label="Inspection By User ID">
          <input
            type="number"
            min="1"
            name="inspectionBy"
            value={formData.inspectionBy}
            onChange={onChange}
            placeholder="Optional backend user id"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Damage Decision">
          <Select
            name="damageDecision"
            value={formData.damageDecision}
            onChange={onChange}
            options={damageDecisions}
          />
        </Field>

        <Field label="Return Status">
          <Select
            name="returnStatus"
            value={formData.returnStatus}
            onChange={onChange}
            options={returnStatuses}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Remarks">
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              rows={3}
              placeholder="Return notes, inspection observations or damage remarks."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/returns"
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
