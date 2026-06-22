"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const maintenanceRecords = [
  {
    id: "1",
    maintenanceCode: "MNT-001",
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    issueType: "Battery Issue",
    reportedBy: "Rahul Patil",
    vendor: "Dell Service Center",
    serviceType: "Warranty Repair",
    priority: "High",
    serviceDate: "2026-03-10",
    expectedCompletion: "2026-03-15",
    completionDate: "",
    cost: "4500",
    downtimeHours: "48",
    warrantyClaim: "Yes",
    approvalStatus: "Approved",
    attachmentStatus: "Service Request",
    finalCondition: "Under Repair",
    createdBy: "IT Admin",
    createdAt: "2026-03-10 10:25 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-03-11 02:30 PM",
    status: "In Progress",
    remarks:
      "Battery backup is very low. Laptop sent to Dell Service Center for battery diagnosis and replacement.",
  },
  {
    id: "2",
    maintenanceCode: "MNT-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    issueType: "Paper Jam",
    reportedBy: "Sneha Jadhav",
    vendor: "HP World",
    serviceType: "Corrective Repair",
    priority: "Medium",
    serviceDate: "2026-02-18",
    expectedCompletion: "2026-02-20",
    completionDate: "2026-02-20",
    cost: "1200",
    downtimeHours: "8",
    warrantyClaim: "No",
    approvalStatus: "Approved",
    attachmentStatus: "Invoice + Service Report",
    finalCondition: "Working",
    createdBy: "IT Admin",
    createdAt: "2026-02-18 09:45 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-02-20 04:10 PM",
    status: "Completed",
    remarks:
      "Printer roller cleaned and paper jam issue resolved. Printer is working properly.",
  },
  {
    id: "3",
    maintenanceCode: "MNT-003",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    issueType: "Network Drop",
    reportedBy: "Priya More",
    vendor: "Network Solutions",
    serviceType: "Inspection",
    priority: "High",
    serviceDate: "2026-03-05",
    expectedCompletion: "2026-03-12",
    completionDate: "",
    cost: "2800",
    downtimeHours: "24",
    warrantyClaim: "No",
    approvalStatus: "Pending",
    attachmentStatus: "Pending",
    finalCondition: "Pending Inspection",
    createdBy: "IT Admin",
    createdAt: "2026-03-05 11:20 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-03-05 11:20 AM",
    status: "Pending",
    remarks: "Router frequently disconnects. Vendor inspection is pending.",
  },
  {
    id: "4",
    maintenanceCode: "MNT-004",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    issueType: "Display Problem",
    reportedBy: "Amit Shinde",
    vendor: "Lenovo Care",
    serviceType: "Replacement Review",
    priority: "Low",
    serviceDate: "2026-01-25",
    expectedCompletion: "2026-02-01",
    completionDate: "",
    cost: "6000",
    downtimeHours: "0",
    warrantyClaim: "No",
    approvalStatus: "Rejected",
    attachmentStatus: "Review Note",
    finalCondition: "Cancelled",
    createdBy: "IT Admin",
    createdAt: "2026-01-25 03:00 PM",
    updatedBy: "IT Manager",
    updatedAt: "2026-01-28 05:15 PM",
    status: "Cancelled",
    remarks: "Display replacement request was cancelled after internal review.",
  },
];

export default function EditMaintenancePage() {
  const params = useParams();
  const maintenanceId = params.id;

  const selectedMaintenance =
    maintenanceRecords.find((record) => record.id === maintenanceId) ||
    maintenanceRecords[0];

  const [formData, setFormData] = useState({
    maintenanceCode: selectedMaintenance.maintenanceCode,
    assetTag: selectedMaintenance.assetTag,
    assetName: selectedMaintenance.assetName,
    issueType: selectedMaintenance.issueType,
    reportedBy: selectedMaintenance.reportedBy,
    vendor: selectedMaintenance.vendor,
    serviceType: selectedMaintenance.serviceType,
    priority: selectedMaintenance.priority,
    serviceDate: selectedMaintenance.serviceDate,
    expectedCompletion: selectedMaintenance.expectedCompletion,
    completionDate: selectedMaintenance.completionDate,
    cost: selectedMaintenance.cost,
    downtimeHours: selectedMaintenance.downtimeHours,
    warrantyClaim: selectedMaintenance.warrantyClaim,
    approvalStatus: selectedMaintenance.approvalStatus,
    attachmentStatus: selectedMaintenance.attachmentStatus,
    finalCondition: selectedMaintenance.finalCondition,
    createdBy: selectedMaintenance.createdBy,
    createdAt: selectedMaintenance.createdAt,
    updatedBy: selectedMaintenance.updatedBy,
    updatedAt: selectedMaintenance.updatedAt,
    status: selectedMaintenance.status,
    remarks: selectedMaintenance.remarks,
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

    alert(
      "Maintenance changes saved successfully. Backend will be connected later."
    );
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Maintenance"
        description="Modify repair details, issue type, vendor, cost and maintenance status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/maintenance" label="Maintenance" />

        <Link
          href={`/maintenance/view/${selectedMaintenance.id}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Maintenance
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Maintenance Code
            </label>
            <input
              type="text"
              name="maintenanceCode"
              value={formData.maintenanceCode}
              onChange={handleChange}
              placeholder="MNT-001"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Tag
            </label>
            <select
              name="assetTag"
              value={formData.assetTag}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select asset tag</option>
              <option value="AST-001">AST-001 - Dell Latitude 5420</option>
              <option value="AST-002">AST-002 - HP LaserJet Printer</option>
              <option value="AST-004">AST-004 - Cisco Router</option>
              <option value="AST-007">AST-007 - Lenovo Laptop</option>
            </select>
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
              Issue Type
            </label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select issue type</option>
              <option value="Battery Issue">Battery Issue</option>
              <option value="Display Problem">Display Problem</option>
              <option value="Keyboard Issue">Keyboard Issue</option>
              <option value="Network Drop">Network Drop</option>
              <option value="Paper Jam">Paper Jam</option>
              <option value="Software Issue">Software Issue</option>
              <option value="Hardware Failure">Hardware Failure</option>
              <option value="General Service">General Service</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reported By
            </label>
            <select
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select employee</option>
              <option value="Rahul Patil">Rahul Patil</option>
              <option value="Sneha Jadhav">Sneha Jadhav</option>
              <option value="Amit Shinde">Amit Shinde</option>
              <option value="Priya More">Priya More</option>
              <option value="IT Admin">IT Admin</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Vendor / Technician
            </label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              placeholder="Dell Service Center / Local Technician"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Corrective Repair">Corrective Repair</option>
              <option value="Preventive Service">Preventive Service</option>
              <option value="Warranty Repair">Warranty Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Replacement Review">Replacement Review</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Service Date
            </label>
            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Expected Completion Date
            </label>
            <input
              type="date"
              name="expectedCompletion"
              value={formData.expectedCompletion}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Completion Date
            </label>
            <input
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Estimated / Actual Cost
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="4500"
              min="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Downtime Hours
            </label>
            <input
              type="number"
              name="downtimeHours"
              value={formData.downtimeHours}
              onChange={handleChange}
              placeholder="8"
              min="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Warranty Claim
            </label>
            <select
              name="warrantyClaim"
              value={formData.warrantyClaim}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Approval Status
            </label>
            <select
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Not Required">Not Required</option>
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
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Final Condition
            </label>
            <input
              type="text"
              name="finalCondition"
              value={formData.finalCondition}
              onChange={handleChange}
              placeholder="Working / Under Repair / Replacement Needed"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Maintenance Documents
            </label>
            <input
              type="file"
              multiple
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              Current document status: {formData.attachmentStatus}
            </p>
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
              placeholder="Issue details, service notes, parts replaced or technician remarks..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Created by {formData.createdBy} on {formData.createdAt}. Last
              updated by {formData.updatedBy} on {formData.updatedAt}.
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/maintenance"
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
