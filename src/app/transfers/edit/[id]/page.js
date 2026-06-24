"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { showToast } from "@/components/common/ToastHost";

const transferRecords = [
  {
    id: "1",
    transferCode: "TRF-001",
    transferType: "Department Transfer",
    assetTag: "IT-LAP-001",
    assetName: "Dell Latitude 5420",
    currentDepartment: "IT Department",
    fromDepartment: "IT Department",
    toDepartment: "Accounts",
    currentReceiver: "Rahul Patil",
    newReceiver: "Sneha Jadhav",
    reason: "Project need",
    accessories: "Charger, laptop bag",
    condition: "Good",
    collectionDate: "",
    collectedBy: "",
    handoverAcknowledgement: "Acknowledged",
    issueDate: "2026-06-12",
    newAcknowledgement: "Acknowledged",
    status: "Completed",
    remarks: "Asset moved for finance reporting work.",
  },
  {
    id: "2",
    transferCode: "TRF-002",
    transferType: "IT Collection",
    assetTag: "IT-PRN-001",
    assetName: "Canon Laser Printer",
    currentDepartment: "Admin",
    fromDepartment: "Admin",
    toDepartment: "IT Store",
    currentReceiver: "Admin Office",
    newReceiver: "IT Store",
    reason: "Repair return",
    accessories: "Power cable",
    condition: "Needs Repair",
    collectionDate: "2026-06-14",
    collectedBy: "IT Support",
    handoverAcknowledgement: "Pending",
    issueDate: "",
    newAcknowledgement: "Pending",
    status: "Collected by IT",
    remarks: "Printer collected for inspection.",
  },
];

const departments = [
  "IT Department",
  "IT Store",
  "Accounts",
  "Admin",
  "HR",
  "Operations",
  "Sales",
];

export default function EditTransferPage() {
  const params = useParams();
  const transfer =
    transferRecords.find((item) => item.id === params.id) || transferRecords[0];
  const [formData, setFormData] = useState(transfer);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    showToast("Transfer record updated successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Transfer"
        description="Update transfer, IT collection and reassignment details for this asset."
      />

      <div className="mb-6">
        <BackButton href="/transfers" label="Transfers" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Transfer Code"
            name="transferCode"
            value={formData.transferCode}
            onChange={handleChange}
            required
          />

          <SelectField
            label="Transfer Type"
            name="transferType"
            value={formData.transferType}
            onChange={handleChange}
            options={[
              "Department Transfer",
              "IT Collection",
              "Reassignment",
              "Repair Return",
              "Temporary Handover",
            ]}
          />

          <InputField
            label="Asset Tag"
            name="assetTag"
            value={formData.assetTag}
            onChange={handleChange}
            required
          />

          <InputField
            label="Asset Name"
            name="assetName"
            value={formData.assetName}
            onChange={handleChange}
            required
          />

          <InputField
            label="Current Department"
            name="currentDepartment"
            value={formData.currentDepartment}
            onChange={handleChange}
          />

          <SelectField
            label="From Department"
            name="fromDepartment"
            value={formData.fromDepartment}
            onChange={handleChange}
            options={departments}
          />

          <SelectField
            label="To Department"
            name="toDepartment"
            value={formData.toDepartment}
            onChange={handleChange}
            options={departments}
          />

          <InputField
            label="Current Receiver Name"
            name="currentReceiver"
            value={formData.currentReceiver}
            onChange={handleChange}
          />

          <InputField
            label="New Receiver Name"
            name="newReceiver"
            value={formData.newReceiver}
            onChange={handleChange}
            required
          />

          <SelectField
            label="Transfer Reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            options={[
              "Internal movement",
              "Replacement",
              "Project need",
              "Employee change",
              "Repair return",
              "Temporary setup",
            ]}
          />

          <InputField
            label="Accessories Transferred"
            name="accessories"
            value={formData.accessories}
            onChange={handleChange}
          />

          <SelectField
            label="Condition at Transfer"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            options={[
              "Good",
              "Working",
              "Needs Inspection",
              "Needs Repair",
              "Damaged",
            ]}
          />

          <InputField
            label="Collection Date"
            name="collectionDate"
            type="date"
            value={formData.collectionDate}
            onChange={handleChange}
          />

          <InputField
            label="Collected By"
            name="collectedBy"
            value={formData.collectedBy}
            onChange={handleChange}
          />

          <SelectField
            label="Receiver Handover Acknowledgement"
            name="handoverAcknowledgement"
            value={formData.handoverAcknowledgement}
            onChange={handleChange}
            options={["Pending", "Acknowledged", "Rejected"]}
          />

          <InputField
            label="Issue Date"
            name="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={handleChange}
          />

          <SelectField
            label="New Acknowledgement"
            name="newAcknowledgement"
            value={formData.newAcknowledgement}
            onChange={handleChange}
            options={["Pending", "Acknowledged", "Rejected"]}
          />

          <SelectField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              "Pending",
              "Collected by IT",
              "Reassigned",
              "Completed",
              "Cancelled",
            ]}
          />

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="4"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>

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
            Update Transfer
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900";

function InputField({ label, name, value, onChange, type = "text", required }) {
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

function SelectField({ label, name, value, onChange, options }) {
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
