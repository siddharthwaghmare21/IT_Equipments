"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { showToast } from "@/components/common/ToastHost";
import { createDepartment } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapDepartmentToCreateRequest } from "@/lib/departmentMapper";

export default function AddDepartmentPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    departmentCode: "",
    departmentName: "",
    headOfDepartment: "",
    email: "",
    phone: "",
    location: "",
    description: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await createDepartment(
        mapDepartmentToCreateRequest(formData),
        getSessionToken()
      );
      showToast("Department saved successfully.");
      router.push("/departments");
    } catch (saveError) {
      setError(saveError.message || "Department could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Add Department"
        description="Create a department for department grouping and IT asset allocation."
      />

      <div className="mb-6">
        <BackButton href="/departments" label="Departments" />
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
              Asset counts and allocation summary will be calculated from real
              asset records after asset integration.
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/departments"
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Department"}
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}
