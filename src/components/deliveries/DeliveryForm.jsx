"use client";

import Link from "next/link";
import {
  acknowledgementStatuses,
  deliveryStatuses,
} from "@/lib/deliveryMapper";

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default function DeliveryForm({
  formData,
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
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Delivery Code">
          <input
            type="text"
            name="deliveryCode"
            value={formData.deliveryCode}
            onChange={onChange}
            placeholder="DLV-2026-001"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Asset Tag">
          <select
            name="assetId"
            value={formData.assetId}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          >
            <option value="">Select asset</option>
            {assets.map((asset) => (
              <option key={asset.assetId} value={String(asset.assetId)}>
                {asset.assetTag} - {asset.assetName}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Department"
          hint="Asset is assigned to the department; receiver name records who collected it."
        >
          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option
                key={department.departmentId}
                value={String(department.departmentId)}
              >
                {department.departmentName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Receiver / Employee Name">
          <input
            type="text"
            name="receiverName"
            value={formData.receiverName}
            onChange={onChange}
            placeholder="Name of person collecting asset"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Delivery Date">
          <input
            type="text"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={onChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            required
          />
        </Field>

        <Field label="Delivered By User ID">
          <input
            type="number"
            min="1"
            name="deliveredBy"
            value={formData.deliveredBy}
            onChange={onChange}
            placeholder="Optional backend user id"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </Field>

        <Field label="Acknowledgement Status">
          <select
            name="acknowledgementStatus"
            value={formData.acknowledgementStatus}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            {acknowledgementStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Delivery Status">
          <select
            name="deliveryStatus"
            value={formData.deliveryStatus}
            onChange={onChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            {deliveryStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Accessories Included">
            <textarea
              name="accessories"
              value={formData.accessories}
              onChange={onChange}
              rows={3}
              placeholder="Charger, laptop bag, mouse, cable..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Remarks">
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              rows={3}
              placeholder="Delivery notes, acknowledgement remarks or handover details."
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/deliveries"
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
