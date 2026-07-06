"use client";

import Link from "next/link";
import {
  transferAcknowledgements,
  transferConditions,
  transferReasons,
  transferStatuses,
  transferTypes,
} from "@/lib/transferMapper";

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
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

export default function TransferForm({
  formData,
  assets,
  departments,
  error,
  isSaving,
  submitLabel,
  onSubmit,
  onChange,
}) {
  const selectedAsset = assets.find(
    (asset) => String(asset.assetId) === String(formData.assetId)
  );

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

      <section className="mb-6 border-b border-gray-100 pb-6">
        <h2 className="text-lg font-bold text-gray-900">Transfer Request</h2>
        <p className="mt-1 text-sm text-gray-600">
          Select the asset and capture movement reason, receiver and condition
          details.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Transfer Code">
            <input
              type="text"
              name="transferCode"
              value={formData.transferCode}
              onChange={onChange}
              placeholder="TRF-2026-001"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </Field>

          <Field label="Transfer Type">
            <Select
              name="transferType"
              value={formData.transferType}
              onChange={onChange}
              options={transferTypes}
            />
          </Field>

          <Field label="Asset Tag">
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

          <Field label="Current Asset Info">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
              {selectedAsset
                ? `${selectedAsset.currentDepartmentName || "-"} | ${
                    selectedAsset.currentReceiverName || "-"
                  }`
                : "Select asset to view current department"}
            </div>
          </Field>

          <Field label="From Department">
            <Select
              name="fromDepartmentId"
              value={formData.fromDepartmentId}
              onChange={onChange}
              required
              options={[
                { value: "", label: "Select from department" },
                ...departments.map((department) => ({
                  value: String(department.departmentId),
                  label: department.departmentName,
                })),
              ]}
            />
          </Field>

          <Field label="To Department">
            <Select
              name="toDepartmentId"
              value={formData.toDepartmentId}
              onChange={onChange}
              required
              options={[
                { value: "", label: "Select to department" },
                ...departments.map((department) => ({
                  value: String(department.departmentId),
                  label: department.departmentName,
                })),
              ]}
            />
          </Field>

          <Field label="Current Receiver Name">
            <input
              type="text"
              name="currentReceiverName"
              value={formData.currentReceiverName}
              onChange={onChange}
              placeholder="Current receiver / desk / department user"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>

          <Field
            label="New Receiver Name"
            hint="Asset remains department-owned; this records who receives it."
          >
            <input
              type="text"
              name="newReceiverName"
              value={formData.newReceiverName}
              onChange={onChange}
              placeholder="Name of person collecting asset"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>

          <Field label="Transfer Reason">
            <Select
              name="transferReason"
              value={formData.transferReason}
              onChange={onChange}
              options={transferReasons}
            />
          </Field>

          <Field label="Condition at Transfer">
            <Select
              name="conditionAtTransfer"
              value={formData.conditionAtTransfer}
              onChange={onChange}
              options={transferConditions}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Accessories Transferred">
              <textarea
                name="accessories"
                value={formData.accessories}
                onChange={onChange}
                rows={2}
                placeholder="Charger, bag, mouse, cable"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="mb-6 border-b border-gray-100 pb-6">
        <h2 className="text-lg font-bold text-gray-900">IT Collection</h2>
        <p className="mt-1 text-sm text-gray-600">
          Use this section when IT collects an asset before repair, inspection
          or reassignment.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Collection Date">
            <input
              type="text"
              name="collectionDate"
              value={formData.collectionDate}
              onChange={onChange}
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>

          <Field label="Collected By User ID">
            <input
              type="number"
              min="1"
              name="collectedBy"
              value={formData.collectedBy}
              onChange={onChange}
              placeholder="Optional backend user id"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>

          <Field label="Receiver Handover Acknowledgement">
            <Select
              name="handoverAcknowledgement"
              value={formData.handoverAcknowledgement}
              onChange={onChange}
              options={transferAcknowledgements}
            />
          </Field>

          <Field label="Transfer Status">
            <Select
              name="transferStatus"
              value={formData.transferStatus}
              onChange={onChange}
              options={transferStatuses}
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900">Reassignment</h2>
        <p className="mt-1 text-sm text-gray-600">
          Capture issue date and acknowledgement after assigning the asset to
          the new department or receiver.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Issue Date">
            <input
              type="text"
              name="issueDate"
              value={formData.issueDate}
              onChange={onChange}
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </Field>

          <Field label="New Acknowledgement">
            <Select
              name="newAcknowledgement"
              value={formData.newAcknowledgement}
              onChange={onChange}
              options={transferAcknowledgements}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Remarks">
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={onChange}
                rows={3}
                placeholder="Transfer notes, collection remarks or reassignment details."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/transfers"
          className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
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
