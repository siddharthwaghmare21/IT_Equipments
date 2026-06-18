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
    serviceDate: "2026-03-10",
    expectedCompletion: "2026-03-15",
    cost: "4500",
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
    serviceDate: "2026-02-18",
    expectedCompletion: "2026-02-20",
    cost: "1200",
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
    serviceDate: "2026-03-05",
    expectedCompletion: "2026-03-12",
    cost: "2800",
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
    serviceDate: "2026-01-25",
    expectedCompletion: "2026-02-01",
    cost: "6000",
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
    serviceDate: selectedMaintenance.serviceDate,
    expectedCompletion: selectedMaintenance.expectedCompletion,
    cost: selectedMaintenance.cost,
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

    console.log("Updated Maintenance Data:", formData);

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