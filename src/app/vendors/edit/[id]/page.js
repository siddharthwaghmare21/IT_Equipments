"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const vendors = [
  {
    id: "1",
    vendorCode: "VEN-001",
    vendorName: "Dell Technologies",
    contactPerson: "Amit Sharma",
    phone: "+91 98765 43210",
    email: "sales@dellvendor.com",
    city: "Pune",
    state: "Maharashtra",
    address: "Baner Road, Pune, Maharashtra",
    gstNumber: "27ABCDE1234F1Z5",
    category: "Laptop Supplier",
    status: "Active",
    remarks: "Primary supplier for Dell laptops and accessories.",
  },
  {
    id: "2",
    vendorCode: "VEN-002",
    vendorName: "HP World",
    contactPerson: "Rohit Patil",
    phone: "+91 99887 77665",
    email: "orders@hpworld.com",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Andheri East, Mumbai, Maharashtra",
    gstNumber: "27HPWLD5678K1Z8",
    category: "Laptop Supplier",
    status: "Active",
    remarks: "Preferred vendor for HP laptops and desktops.",
  },
];

export default function EditVendorPage() {
  const params = useParams();
  const vendorId = params.id;

  const selectedVendor =
    vendors.find((vendor) => vendor.id === vendorId) || vendors[0];

  const [formData, setFormData] = useState(selectedVendor);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    console.log("Updated Vendor Data:", formData);

    alert("Vendor updated successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Vendor"
        description="Update vendor contact, GST, address, category and current status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/vendors"
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          ← Back to Vendors
        </Link>

        <Link
          href={`/vendors/view/${selectedVendor.id}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          View Vendor
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Vendor Code
            </label>
            <input
              type="text"
              name="vendorCode"
              value={formData.vendorCode}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Vendor Name
            </label>
            <input
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            >
              <option value="">Select category</option>
              <option value="Laptop Supplier">Laptop Supplier</option>
              <option value="Desktop Supplier">Desktop Supplier</option>
              <option value="Printer Supplier">Printer Supplier</option>
              <option value="Network Equipment">Network Equipment</option>
              <option value="Accessories Supplier">Accessories Supplier</option>
              <option value="Service Provider">Service Provider</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              GST Number
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-gray-900"
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
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
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/vendors"
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Update Vendor
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}