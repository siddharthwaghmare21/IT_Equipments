"use client";

import { useState } from "react";
import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

export default function AssignDeliveryPage() {
  const [formData, setFormData] = useState({
    deliveryCode: "",
    assetTag: "",
    assetName: "",
    assignedTo: "",
    department: "",
    assignedDate: "",
    expectedReturnDate: "",
    condition: "Good",
    status: "Assigned",
    remarks: "",
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

    console.log("Delivery Assignment Data:", formData);

    alert("Asset assigned successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Assign Asset"
        description="Assign IT asset or equipment to an employee or department with delivery details."
      />

      <div className="mb-6">
        <BackButton href="/deliveries" label="Deliveries" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Code
            </label>
            <input
              type="text"
              name="deliveryCode"
              value={formData.deliveryCode}
              onChange={handleChange}
              placeholder="DLV-001"
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
              <option value="AST-003">AST-003 - Logitech Keyboard</option>
              <option value="AST-004">AST-004 - Cisco Router</option>
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
              Assigned To
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
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
              Assigned Date
            </label>
            <input
              type="date"
              name="assignedDate"
              value={formData.assignedDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Expected Return Date
            </label>
            <input
              type="date"
              name="expectedReturnDate"
              value={formData.expectedReturnDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Working">Working</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Damaged">Damaged</option>
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
              <option value="Assigned">Assigned</option>
              <option value="Pending Return">Pending Return</option>
              <option value="Returned">Returned</option>
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
              placeholder="Handover notes, employee acknowledgement or assignment remarks..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/deliveries"
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Save Assignment
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}