"use client";

import { useState } from "react";
import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { showToast } from "@/components/common/ToastHost";

export default function AddDeliveryPage() {
  const [formData, setFormData] = useState({
    deliveryCode: "",
    assetTag: "",
    assetName: "",
    deliveredTo: "",
    department: "",
    issuedBy: "",
    location: "",
    accessoriesIncluded: "",
    acknowledgementStatus: "Pending",
    qrCode: "",
    returnStatus: "Not Due",
    attachmentStatus: "Pending",
    createdBy: "IT Admin",
    createdAt: "",
    updatedBy: "IT Admin",
    updatedAt: "",
    deliveryDate: "",
    expectedReturnDate: "",
    condition: "Good",
    status: "Delivered",
    specifications: "",
    description: "",
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

    showToast("Delivery saved successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Delivery"
        description="Add IT equipment/material delivery details for an employee or department."
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
              Asset / Material Name
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
              Delivered To
            </label>
            <select
              name="deliveredTo"
              value={formData.deliveredTo}
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
              Issued By
            </label>
            <select
              name="issuedBy"
              value={formData.issuedBy}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select issuer</option>
              <option value="IT Admin">IT Admin</option>
              <option value="IT Support">IT Support</option>
              <option value="IT Manager">IT Manager</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Pune Office - IT Bay"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
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
              Delivery Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Delivered">Delivered</option>
              <option value="Pending Return">Pending Return</option>
              <option value="Returned">Returned</option>
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
              <option value="Returned">Returned</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Return Status
            </label>
            <select
              name="returnStatus"
              value={formData.returnStatus}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Not Due">Not Due</option>
              <option value="Pending Return">Pending Return</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
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
              placeholder="Auto-generated after save"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Accessories Included
            </label>
            <textarea
              name="accessoriesIncluded"
              value={formData.accessoriesIncluded}
              onChange={handleChange}
              rows="3"
              placeholder="Example: charger, laptop bag, mouse, keyboard, power cable..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Documents
            </label>
            <input
              type="file"
              multiple
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Specifications (optional)
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
              placeholder="Example: Intel i5, 16GB RAM, 512GB SSD, Windows 11 Pro..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Add extra delivery details, included accessories or usage purpose..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
              placeholder="Handover notes, employee acknowledgement or delivery remarks..."
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
                After save
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
                After save
              </p>
            </div>
          </div>
        </section>

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
            Save Delivery
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}




