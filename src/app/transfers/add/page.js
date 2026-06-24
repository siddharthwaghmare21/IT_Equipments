"use client";

import { useState } from "react";
import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { showToast } from "@/components/common/ToastHost";

const departments = [
  "IT Department",
  "IT Store",
  "Accounts",
  "Admin",
  "HR",
  "Operations",
  "Sales",
];

const assets = [
  {
    tag: "IT-LAP-001",
    name: "Dell Latitude 5420",
    department: "IT Department",
    receiver: "Rahul Patil",
  },
  {
    tag: "IT-MON-001",
    name: "Dell 24 Inch Monitor",
    department: "Accounts",
    receiver: "Sneha Jadhav",
  },
  {
    tag: "IT-PRN-001",
    name: "Canon Laser Printer",
    department: "Admin",
    receiver: "Admin Office",
  },
];

const initialFormData = {
  transferCode: "",
  transferType: "Department Transfer",
  assetTag: "",
  assetName: "",
  currentDepartment: "",
  fromDepartment: "",
  toDepartment: "",
  currentReceiver: "",
  newReceiver: "",
  reason: "Internal movement",
  accessories: "",
  condition: "Good",
  collectionDate: "",
  collectedBy: "",
  handoverAcknowledgement: "Pending",
  issueDate: "",
  newAcknowledgement: "Pending",
  status: "Pending",
  remarks: "",
};

export default function AddTransferPage() {
  const [formData, setFormData] = useState(initialFormData);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "assetTag") {
      const selectedAsset = assets.find((asset) => asset.tag === value);
      setFormData((previousData) => ({
        ...previousData,
        assetTag: value,
        assetName: selectedAsset?.name || "",
        currentDepartment: selectedAsset?.department || "",
        fromDepartment: selectedAsset?.department || previousData.fromDepartment,
        currentReceiver: selectedAsset?.receiver || "",
      }));
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    showToast("Transfer record saved successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Transfer"
        description="Create department transfer, IT collection or reassignment record for an already issued asset."
      />

      <div className="mb-6">
        <BackButton href="/transfers" label="Transfers" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <section className="mb-6 border-b border-gray-100 pb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Transfer Request
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Select the asset and capture movement reason, receiver and
            condition details.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Transfer Code">
              <input
                type="text"
                name="transferCode"
                value={formData.transferCode}
                onChange={handleChange}
                placeholder="TRF-005"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Transfer Type">
              <select
                name="transferType"
                value={formData.transferType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Department Transfer">Department Transfer</option>
                <option value="IT Collection">IT Collection</option>
                <option value="Reassignment">Reassignment</option>
                <option value="Repair Return">Repair Return</option>
                <option value="Temporary Handover">Temporary Handover</option>
              </select>
            </Field>

            <Field label="Asset Tag">
              <select
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset.tag} value={asset.tag}>
                    {asset.tag} - {asset.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Asset Name">
              <input
                type="text"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                placeholder="Auto-filled after asset selection"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Current Department">
              <input
                type="text"
                name="currentDepartment"
                value={formData.currentDepartment}
                onChange={handleChange}
                placeholder="Auto-filled from asset"
                className={inputClass}
                readOnly
              />
            </Field>

            <DepartmentSelect
              label="From Department"
              name="fromDepartment"
              value={formData.fromDepartment}
              onChange={handleChange}
            />

            <DepartmentSelect
              label="To Department"
              name="toDepartment"
              value={formData.toDepartment}
              onChange={handleChange}
            />

            <Field label="Current Receiver Name">
              <input
                type="text"
                name="currentReceiver"
                value={formData.currentReceiver}
                onChange={handleChange}
                placeholder="Current receiver / desk / department user"
                className={inputClass}
              />
            </Field>

            <Field label="New Receiver Name">
              <input
                type="text"
                name="newReceiver"
                value={formData.newReceiver}
                onChange={handleChange}
                placeholder="Name of person collecting asset"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Transfer Reason">
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Internal movement">Internal movement</option>
                <option value="Replacement">Replacement</option>
                <option value="Project need">Project need</option>
                <option value="Employee change">Employee change</option>
                <option value="Repair return">Repair return</option>
                <option value="Temporary setup">Temporary setup</option>
              </select>
            </Field>

            <Field label="Accessories Transferred">
              <input
                type="text"
                name="accessories"
                value={formData.accessories}
                onChange={handleChange}
                placeholder="Charger, bag, mouse, cable"
                className={inputClass}
              />
            </Field>

            <Field label="Condition at Transfer">
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Good">Good</option>
                <option value="Working">Working</option>
                <option value="Needs Inspection">Needs Inspection</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </Field>
          </div>
        </section>

        <section className="mb-6 border-b border-gray-100 pb-6">
          <h2 className="text-lg font-bold text-gray-900">IT Collection</h2>
          <p className="mt-1 text-sm text-gray-600">
            Use this section when IT collects an asset before repair,
            inspection or reassignment.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Collection Date">
              <input
                type="date"
                name="collectionDate"
                value={formData.collectionDate}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Collected By">
              <input
                type="text"
                name="collectedBy"
                value={formData.collectedBy}
                onChange={handleChange}
                placeholder="IT Admin / IT Support"
                className={inputClass}
              />
            </Field>

            <Field label="Receiver Handover Acknowledgement">
              <select
                name="handoverAcknowledgement"
                value={formData.handoverAcknowledgement}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Pending">Pending</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Pending">Pending</option>
                <option value="Collected by IT">Collected by IT</option>
                <option value="Reassigned">Reassigned</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Condition Photo / Documents">
                <input
                  type="file"
                  multiple
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white focus:border-gray-900"
                />
              </Field>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900">Reassignment</h2>
          <p className="mt-1 text-sm text-gray-600">
            Capture new issue date and acknowledgement when the asset moves to
            the next department or receiver.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Issue Date">
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="New Acknowledgement">
              <select
                name="newAcknowledgement"
                value={formData.newAcknowledgement}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Pending">Pending</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Remarks">
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Transfer notes, condition remarks, missing accessories or reassignment comments..."
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
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Save Transfer
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900";

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

function DepartmentSelect({ label, name, value, onChange }) {
  return (
    <Field label={label}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
        required
      >
        <option value="">Select department</option>
        {departments.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>
    </Field>
  );
}
