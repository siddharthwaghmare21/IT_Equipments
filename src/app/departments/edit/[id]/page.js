"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { showToast } from "@/components/common/ToastHost";

const departments = [
  {
    id: "1",
    departmentCode: "DEP-001",
    departmentName: "IT Department",
    headOfDepartment: "Rahul Patil",
    email: "it@company.com",
    phone: "+91 98765 12345",
    location: "Main Office",
    costCenter: "CC-IT-001",
    businessUnit: "Corporate",
    assetBudget: "INR 12,00,000",
    approvalRequired: "Yes",
    assetPolicy: "Standard IT Policy",
    totalUsers: "12",
    deliveredAssets: "34",
    createdBy: "Admin",
    createdAt: "2026-01-01 10:00 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-15 04:15 PM",
    status: "Active",
    description:
      "Responsible for IT infrastructure, software systems, hardware support and equipment management.",
  },
  {
    id: "2",
    departmentCode: "DEP-002",
    departmentName: "Accounts",
    headOfDepartment: "Sneha Jadhav",
    email: "accounts@company.com",
    phone: "+91 99887 45678",
    location: "Accounts Office",
    costCenter: "CC-ACC-002",
    businessUnit: "Finance",
    assetBudget: "INR 6,50,000",
    approvalRequired: "Yes",
    assetPolicy: "Finance Asset Policy",
    totalUsers: "8",
    deliveredAssets: "18",
    createdBy: "Admin",
    createdAt: "2026-01-01 10:10 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-20 12:10 PM",
    status: "Active",
    description:
      "Handles billing, finance records, purchase invoices and payment documentation.",
  },
  {
    id: "3",
    departmentCode: "DEP-003",
    departmentName: "Admin",
    headOfDepartment: "Amit Shinde",
    email: "admin@company.com",
    phone: "+91 91234 56789",
    location: "Admin Office",
    costCenter: "CC-ADM-003",
    businessUnit: "Operations",
    assetBudget: "INR 4,00,000",
    approvalRequired: "Yes",
    assetPolicy: "Admin Asset Policy",
    totalUsers: "6",
    deliveredAssets: "14",
    createdBy: "Admin",
    createdAt: "2026-01-01 10:20 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-02-04 03:20 PM",
    status: "Active",
    description:
      "Manages office administration, internal coordination and resource allocation.",
  },
  {
    id: "4",
    departmentCode: "DEP-004",
    departmentName: "HR",
    headOfDepartment: "Priya More",
    email: "hr@company.com",
    phone: "+91 90123 45678",
    location: "HR Office",
    costCenter: "CC-HR-004",
    businessUnit: "People",
    assetBudget: "INR 2,50,000",
    approvalRequired: "No",
    assetPolicy: "Basic Asset Policy",
    totalUsers: "4",
    deliveredAssets: "9",
    createdBy: "Admin",
    createdAt: "2026-01-01 10:30 AM",
    updatedBy: "Admin",
    updatedAt: "2026-01-30 05:00 PM",
    status: "Inactive",
    description:
      "Handles department user records, recruitment coordination and HR documentation.",
  },
];

export default function EditDepartmentPage() {
  const params = useParams();
  const departmentId = params.id;

  const selectedDepartment =
    departments.find((department) => department.id === departmentId) ||
    departments[0];

  const [formData, setFormData] = useState({
    departmentCode: selectedDepartment.departmentCode,
    departmentName: selectedDepartment.departmentName,
    headOfDepartment: selectedDepartment.headOfDepartment,
    email: selectedDepartment.email,
    phone: selectedDepartment.phone,
    location: selectedDepartment.location,
    costCenter: selectedDepartment.costCenter,
    businessUnit: selectedDepartment.businessUnit,
    assetBudget: selectedDepartment.assetBudget,
    approvalRequired: selectedDepartment.approvalRequired,
    assetPolicy: selectedDepartment.assetPolicy,
    totalUsers: selectedDepartment.totalUsers,
    deliveredAssets: selectedDepartment.deliveredAssets,
    createdBy: selectedDepartment.createdBy,
    createdAt: selectedDepartment.createdAt,
    updatedBy: selectedDepartment.updatedBy,
    updatedAt: selectedDepartment.updatedAt,
    status: selectedDepartment.status,
    description: selectedDepartment.description,
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

    showToast("Department changes saved successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Department"
        description="Modify department details, department head, location and status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/departments" label="Departments" />

        <Link
          href={`/departments/view/${selectedDepartment.id}`}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Department
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Department Code
            </label>
            <input
              type="text"
              name="departmentCode"
              value={formData.departmentCode}
              onChange={handleChange}
              placeholder="DEP-001"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Department Name
            </label>
            <input
              type="text"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              placeholder="IT Department"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Head of Department
            </label>
            <input
              type="text"
              name="headOfDepartment"
              value={formData.headOfDepartment}
              onChange={handleChange}
              placeholder="Rahul Patil"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
              placeholder="it@company.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
              placeholder="+91 98765 12345"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
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
              placeholder="Main Office"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cost Center
            </label>
            <input
              type="text"
              name="costCenter"
              value={formData.costCenter}
              onChange={handleChange}
              placeholder="CC-IT-001"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Business Unit
            </label>
            <input
              type="text"
              name="businessUnit"
              value={formData.businessUnit}
              onChange={handleChange}
              placeholder="Corporate / Finance / Operations"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Budget
            </label>
            <input
              type="text"
              name="assetBudget"
              value={formData.assetBudget}
              onChange={handleChange}
              placeholder="INR 12,00,000"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Approval Required
            </label>
            <select
              name="approvalRequired"
              value={formData.approvalRequired}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Department Users
            </label>
            <input
              type="number"
              name="totalUsers"
              value={formData.totalUsers}
              onChange={handleChange}
              placeholder="12"
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Asset Policy
            </label>
            <textarea
              name="assetPolicy"
              value={formData.assetPolicy}
              onChange={handleChange}
              rows="3"
              placeholder="Department-wise asset issue rules or approval notes..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Department purpose, responsibilities or notes..."
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Delivered assets: {formData.deliveredAssets}. Created by{" "}
              {formData.createdBy} on {formData.createdAt}. Last updated by{" "}
              {formData.updatedBy} on {formData.updatedAt}.
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/departments"
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




