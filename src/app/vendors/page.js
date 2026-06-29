"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { archiveVendor, getVendors } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapVendorFromApi } from "@/lib/vendorMapper";

const filters = ["All", "Active", "Inactive"];
const complianceFilters = ["All", "Compliant", "Review Required", "Blocked"];

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

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [complianceFilter, setComplianceFilter] = useState("All");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState("");

  const loadVendors = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getVendors(getSessionToken());
      setVendors(response.map(mapVendorFromApi));
    } catch (loadError) {
      setError(loadError.message || "Vendors could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadVendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const searchText = `
        ${vendor.vendorCode}
        ${vendor.vendorName}
        ${vendor.contactPerson}
        ${vendor.phone}
        ${vendor.email}
        ${vendor.gstNumber}
        ${vendor.address}
        ${vendor.paymentTerms}
        ${vendor.serviceCategory}
        ${vendor.complianceStatus}
        ${vendor.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus =
        activeFilter === "All" || vendor.status === activeFilter;
      const matchesCompliance =
        complianceFilter === "All" ||
        vendor.complianceStatus === complianceFilter;

      return matchesSearch && matchesStatus && matchesCompliance;
    });
  }, [vendors, search, activeFilter, complianceFilter]);

  async function confirmArchive() {
    if (!archiveTarget) return;

    setIsArchiving(true);

    try {
      await archiveVendor(archiveTarget.vendorId, getSessionToken());
      showToast("Vendor archived successfully.");
      setArchiveTarget(null);
      await loadVendors();
    } catch (archiveError) {
      showToast(archiveError.message || "Vendor could not be archived.");
    } finally {
      setIsArchiving(false);
    }
  }

  const activeCount = vendors.filter((vendor) => vendor.isActive).length;
  const inactiveCount = vendors.length - activeCount;
  const reviewCount = vendors.filter(
    (vendor) => vendor.complianceStatus === "Review Required"
  ).length;
  const blockedCount = vendors.filter(
    (vendor) => vendor.complianceStatus === "Blocked"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Vendors"
        description="Manage IT equipment suppliers, contact details, compliance status and purchase sources."
      />

      <PageActionBar addHref="/vendors/add" addLabel="Add Vendor" />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Vendors</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {vendors.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Vendors</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {activeCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Vendors</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {inactiveCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Review / Blocked</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {reviewCount + blockedCount}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by vendor, GST, payment terms, category, compliance or status..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 xl:max-w-md"
          />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                    activeFilter === filter
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {complianceFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setComplianceFilter(filter)}
                  className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                    complianceFilter === filter
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isLoading && (
        <LoadingState
          title="Loading vendors"
          description="Fetching vendor records from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Vendors could not be loaded"
          description={error}
          onRetry={loadVendors}
        />
      )}

      {!isLoading && !error && (
        <TableWrapper>
          <table className="min-w-[1280px] w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Vendor Code
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Vendor Name
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Contact Person
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Phone
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Service Category
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  GST
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Payment Terms
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Compliance
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {vendor.vendorCode}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {vendor.vendorName}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {vendor.contactPerson || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {vendor.phone || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {vendor.email || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {vendor.serviceCategory || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {vendor.gstNumber || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    {vendor.paymentTerms || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <ComplianceBadge status={vendor.complianceStatus} />
                  </td>

                  <td className="px-4 py-4">
                    <VendorStatusBadge status={vendor.status} />
                  </td>

                  <td className="px-4 py-4">
                    <ActionButtons
                      viewHref={`/vendors/view/${vendor.id}`}
                      updateHref={`/vendors/edit/${vendor.id}`}
                      onDelete={() => setArchiveTarget(vendor)}
                      deleteLabel="Archive"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVendors.length === 0 && (
            <div className="p-6">
              <EmptyState
                title="No vendors found"
                description="Try changing vendor search, compliance or status filters."
              />
            </div>
          )}
        </TableWrapper>
      )}

      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        title="Archive vendor?"
        description={`Vendor ${
          archiveTarget?.vendorName || ""
        } will be marked inactive.`}
        confirmLabel={isArchiving ? "Archiving..." : "Archive"}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
