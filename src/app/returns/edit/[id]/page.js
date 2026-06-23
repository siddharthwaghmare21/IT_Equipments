"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { showToast } from "@/components/common/ToastHost";

const returnRecords = [
  {
    id: "1",
    returnCode: "RET-001",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    returnedBy: "Amit Shinde",
    department: "Admin",
    deliveryDate: "2026-02-01",
    returnDate: "2026-08-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    receivedLocation: "IT Store",
    acknowledgementStatus: "Acknowledged",
    inspectionStatus: "Completed",
    inspectionBy: "IT Admin",
    damageDecision: "No Damage",
    qrCode: "QR-RET-001",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2026-08-01 11:00",
    updatedBy: "IT Admin",
    updatedAt: "2026-08-01 11:00",
    status: "Returned",
    remarks: "Keyboard returned in good working condition.",
  },
  {
    id: "2",
    returnCode: "RET-002",
    deliveryCode: "DLV-005",
    assetTag: "AST-005",
    assetName: "Dell Mouse",
    returnedBy: "Priya More",
    department: "HR",
    deliveryDate: "2026-01-10",
    returnDate: "2026-07-20",
    returnCondition: "Damaged",
    receivedBy: "IT Admin",
    receivedLocation: "IT Store",
    acknowledgementStatus: "Acknowledged",
    inspectionStatus: "Damage Review",
    inspectionBy: "IT Manager",
    damageDecision: "Repair Required",
    qrCode: "QR-RET-002",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2026-07-20 12:30",
    updatedBy: "IT Manager",
    updatedAt: "2026-07-21 10:00",
    status: "Damaged",
    remarks: "Mouse returned with physical damage. Repair decision pending.",
  },
  {
    id: "3",
    returnCode: "RET-003",
    deliveryCode: "DLV-006",
    assetTag: "AST-006",
    assetName: "HP Monitor",
    returnedBy: "Sneha Jadhav",
    department: "Accounts",
    deliveryDate: "2026-03-05",
    returnDate: "2026-09-10",
    returnCondition: "Needs Inspection",
    receivedBy: "IT Support",
    receivedLocation: "Inspection Desk",
    acknowledgementStatus: "Pending",
    inspectionStatus: "Pending",
    inspectionBy: "IT Support",
    damageDecision: "Pending",
    qrCode: "QR-RET-003",
    attachmentStatus: "Pending",
    createdBy: "IT Support",
    createdAt: "2026-09-10 15:15",
    updatedBy: "IT Support",
    updatedAt: "2026-09-10 15:15",
    status: "Pending Inspection",
    remarks: "Monitor received. Technical inspection is pending.",
  },
  {
    id: "4",
    returnCode: "RET-004",
    deliveryCode: "DLV-007",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    returnedBy: "Rahul Patil",
    department: "IT Department",
    deliveryDate: "2026-02-15",
    returnDate: "2026-10-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    receivedLocation: "IT Store",
    acknowledgementStatus: "Acknowledged",
    inspectionStatus: "Completed",
    inspectionBy: "IT Admin",
    damageDecision: "No Damage",
    qrCode: "QR-RET-004",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2026-10-01 10:40",
    updatedBy: "IT Admin",
    updatedAt: "2026-10-01 10:40",
    status: "Returned",
    remarks: "Laptop returned with charger and bag.",
  },
];

export default function EditReturnPage() {
  const params = useParams();
  const returnId = params.id;

  const selectedReturn =
    returnRecords.find((returnItem) => returnItem.id === returnId) ||
    returnRecords[0];

  const [formData, setFormData] = useState({
    returnCode: selectedReturn.returnCode,
    deliveryCode: selectedReturn.deliveryCode,
    assetTag: selectedReturn.assetTag,
    assetName: selectedReturn.assetName,
    returnedBy: selectedReturn.returnedBy,
    department: selectedReturn.department,
    deliveryDate: selectedReturn.deliveryDate,
    returnDate: selectedReturn.returnDate,
    returnCondition: selectedReturn.returnCondition,
    receivedBy: selectedReturn.receivedBy,
    receivedLocation: selectedReturn.receivedLocation,
    acknowledgementStatus: selectedReturn.acknowledgementStatus,
    inspectionStatus: selectedReturn.inspectionStatus,
    inspectionBy: selectedReturn.inspectionBy,
    damageDecision: selectedReturn.damageDecision,
    qrCode: selectedReturn.qrCode,
    attachmentStatus: selectedReturn.attachmentStatus,
    createdBy: selectedReturn.createdBy,
    createdAt: selectedReturn.createdAt,
    updatedBy: selectedReturn.updatedBy,
    updatedAt: selectedReturn.updatedAt,
    status: selectedReturn.status,
    remarks: selectedReturn.remarks,
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    showToast("Return changes saved successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Return"
        description="Modify return details, asset condition, received by information and inspection status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/returns" label="Returns" />

        <Link
          href={`/returns/view/${selectedReturn.id}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Return
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Return Code
            </label>
            <input
              type="text"
              name="returnCode"
              value={formData.returnCode}
              onChange={handleChange}
              placeholder="RET-001"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Code
            </label>
            <select
              name="deliveryCode"
              value={formData.deliveryCode}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select delivery code</option>
              <option value="DLV-001">DLV-001 - Dell Latitude 5420</option>
              <option value="DLV-002">DLV-002 - HP LaserJet Printer</option>
              <option value="DLV-003">DLV-003 - Logitech Keyboard</option>
              <option value="DLV-004">DLV-004 - Cisco Router</option>
              <option value="DLV-005">DLV-005 - Dell Mouse</option>
              <option value="DLV-006">DLV-006 - HP Monitor</option>
              <option value="DLV-007">DLV-007 - Lenovo Laptop</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Tag
            </label>
            <input
              type="text"
              name="assetTag"
              value={formData.assetTag}
              onChange={handleChange}
              placeholder="AST-001"
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
              Returned By
            </label>
            <select
              name="returnedBy"
              value={formData.returnedBy}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select employee</option>
              <option value="Rahul Patil">Rahul Patil</option>
              <option value="Sneha Jadhav">Sneha Jadhav</option>
              <option value="Amit Shinde">Amit Shinde</option>
              <option value="Priya More">Priya More</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select department</option>
              <option value="IT Department">IT Department</option>
              <option value="Accounts">Accounts</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Date
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Return Date
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Return Condition
            </label>
            <select
              name="returnCondition"
              value={formData.returnCondition}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Good">Good</option>
              <option value="Working">Working</option>
              <option value="Needs Inspection">Needs Inspection</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Damaged">Damaged</option>
              <option value="Missing Accessories">Missing Accessories</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Received By
            </label>
            <input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleChange}
              placeholder="IT Admin / IT Support"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Received Location
            </label>
            <input
              type="text"
              name="receivedLocation"
              value={formData.receivedLocation}
              onChange={handleChange}
              placeholder="IT Store / Inspection Desk"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
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
              <option value="Returned">Returned</option>
              <option value="Damaged">Damaged</option>
              <option value="Pending Inspection">Pending Inspection</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Acknowledgement Status
            </label>
            <select
              name="acknowledgementStatus"
              value={formData.acknowledgementStatus}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Inspection Status
            </label>
            <select
              name="inspectionStatus"
              value={formData.inspectionStatus}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Damage Review">Damage Review</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Inspection By
            </label>
            <input
              type="text"
              name="inspectionBy"
              value={formData.inspectionBy}
              onChange={handleChange}
              placeholder="IT Admin / IT Support"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Damage Decision
            </label>
            <select
              name="damageDecision"
              value={formData.damageDecision}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="No Damage">No Damage</option>
              <option value="Repair Required">Repair Required</option>
              <option value="Write-off Required">Write-off Required</option>
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
              placeholder="QR-RET-001"
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
              Return Documents
            </label>
            <input
              type="file"
              multiple
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white focus:border-gray-900"
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
              placeholder="Return notes, damage remarks, missing accessories or inspection comments..."
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
                {formData.createdAt}
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
                {formData.updatedAt}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/returns"
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}




