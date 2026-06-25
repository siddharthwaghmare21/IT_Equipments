"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { getDepartment, updateDepartment } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  mapDepartmentFromApi,
  mapDepartmentToUpdateRequest,
} from "@/lib/departmentMapper";

const emptyForm = {
  departmentCode: "",
  departmentName: "",
  headOfDepartment: "",
  email: "",
  phone: "",
  location: "",
  status: "Active",
  description: "",
};

export default function EditDepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id;

  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const loadDepartment = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getDepartment(departmentId, getSessionToken());
      const department = mapDepartmentFromApi(response);
      setFormData({
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
        headOfDepartment: department.headOfDepartment,
        email: department.email,
        phone: department.phone,
        location: department.location,
        status: department.status,
        description: department.description,
      });
    } catch (loadError) {
      setError(loadError.message || "Department could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDepartment();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDepartment]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setSaveError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      await updateDepartment(
        departmentId,
        mapDepartmentToUpdateRequest(formData),
        getSessionToken()
      );
      showToast("Department changes saved successfully.");
      router.push("/departments");
    } catch (updateError) {
      setSaveError(updateError.message || "Department could not be updated.");
    } finally {
      setIsSaving(false);
    }
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
          href={`/departments/view/${departmentId}`}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          View Department
        </Link>
      </div>

      {isLoading && (
        <LoadingState
          title="Loading department"
          description="Fetching department details from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Department could not be loaded"
          description={error}
          onRetry={loadDepartment}
        />
      )}

      {!isLoading && !error && (
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
          </div>

          {saveError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {saveError}
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
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </LayoutWrapper>
  );
}
