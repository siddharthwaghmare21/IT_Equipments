"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { getVendor, updateVendor } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  mapVendorFromApi,
  mapVendorToUpdateRequest,
  vendorComplianceStatuses,
} from "@/lib/vendorMapper";

const serviceCategories = [
  "Laptop Supplier",
  "Desktop Supplier",
  "Printer Supplier",
  "Network Equipment",
  "Accessories Supplier",
  "Service Provider",
  "Other",
];

const emptyForm = {
  vendorCode: "",
  vendorName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  gstNumber: "",
  paymentTerms: "",
  serviceCategory: "",
  complianceStatus: "Review Required",
  status: "Active",
};

export default function EditVendorPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id;

  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const loadVendor = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getVendor(vendorId, getSessionToken());
      const vendor = mapVendorFromApi(response);
      setFormData({
        vendorCode: vendor.vendorCode,
        vendorName: vendor.vendorName,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        gstNumber: vendor.gstNumber,
        paymentTerms: vendor.paymentTerms,
        serviceCategory: vendor.serviceCategory,
        complianceStatus: vendor.complianceStatus,
        status: vendor.status,
      });
    } catch (loadError) {
      setError(loadError.message || "Vendor could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendor();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadVendor]);

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
      await updateVendor(
        vendorId,
        mapVendorToUpdateRequest(formData),
        getSessionToken()
      );
      showToast("Vendor updated successfully.");
      router.push("/vendors");
    } catch (updateError) {
      setSaveError(updateError.message || "Vendor could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Edit Vendor"
        description="Update vendor contact, GST, address, category and current status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/vendors" label="Vendors" />

        <Link
          href={`/vendors/view/${vendorId}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          View Vendor
        </Link>
      </div>

      {isLoading && (
        <LoadingState
          title="Loading vendor"
          description="Fetching vendor details from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Vendor could not be loaded"
          description={error}
          onRetry={loadVendor}
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
                Service Category
              </label>
              <select
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                <option value="">Select category</option>
                {serviceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
                Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                <option value="">Select payment terms</option>
                <option value="Advance">Advance</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="45 Days">45 Days</option>
                <option value="60 Days">60 Days</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Compliance Status
              </label>
              <select
                name="complianceStatus"
                value={formData.complianceStatus}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                {vendorComplianceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
                rows="4"
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
              href="/vendors"
              className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Update Vendor"}
            </button>
          </div>
        </form>
      )}
    </LayoutWrapper>
  );
}
