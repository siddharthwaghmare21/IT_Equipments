"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { getVendor } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapVendorFromApi } from "@/lib/vendorMapper";

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

function VendorStatusBadge({ status }) {
  const statusStyles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function ComplianceBadge({ status }) {
  const statusStyles = {
    Compliant: "bg-green-50 text-green-700 border-green-200",
    "Review Required": "bg-yellow-50 text-yellow-700 border-yellow-200",
    Blocked: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function ViewVendorPage() {
  const params = useParams();
  const vendorId = params.id;

  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVendor = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getVendor(vendorId, getSessionToken());
      setVendor(mapVendorFromApi(response));
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

  return (
    <LayoutWrapper>
      <PageHeader
        title="Vendor Details"
        description="View vendor contact, GST, address, category and status information."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/vendors" label="Vendors" />

        <Link
          href={`/vendors/edit/${vendorId}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Vendor
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

      {!isLoading && !error && vendor && (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {vendor.vendorCode}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {vendor.vendorName}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {vendor.serviceCategory || "Service category not set"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ComplianceBadge status={vendor.complianceStatus} />
              <VendorStatusBadge status={vendor.status} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Vendor Code" value={vendor.vendorCode} />
            <DetailItem label="Vendor Name" value={vendor.vendorName} />
            <DetailItem label="Contact Person" value={vendor.contactPerson} />
            <DetailItem label="Phone Number" value={vendor.phone} />
            <DetailItem label="Email Address" value={vendor.email} />
            <DetailItem label="Service Category" value={vendor.serviceCategory} />
            <DetailItem label="GST Number" value={vendor.gstNumber} />
            <DetailItem label="Payment Terms" value={vendor.paymentTerms} />
            <DetailItem
              label="Compliance Status"
              value={vendor.complianceStatus}
            />
            <DetailItem label="Status" value={vendor.status} />
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Address
            </p>
            <p className="mt-2 text-sm text-gray-700">
              {vendor.address || "-"}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Vendor documents, PAN, bank proof, rating and purchase history will
            appear here after vendor document and work order integration.
          </div>
        </section>
      )}
    </LayoutWrapper>
  );
}
