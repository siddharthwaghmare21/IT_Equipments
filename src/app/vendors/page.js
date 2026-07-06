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
    Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Inactive: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function ComplianceBadge({ status }) {
  const statusStyles = {
    Compliant: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Review Required": "bg-amber-50 text-amber-700 border-amber-200",
    Blocked: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-700 border-slate-200"
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
      showToast("Vendor deleted successfully.");
      setArchiveTarget(null);
      await loadVendors();
    } catch (archiveError) {
      showToast(archiveError.message || "Vendor could not be deleted.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Vendors"
        description="Manage IT equipment suppliers, contact details, compliance status and purchase sources."
      />

      <PageActionBar
        addHref="/vendors/add"
        addLabel="Add Vendor"
        exportData={filteredVendors}
        exportFileName="vendors"
        printTitle="Vendors"
        printDescription="Official vendor register generated from the current filtered vendor records."
      />

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by vendor, GST, payment terms, category, compliance or status..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white xl:max-w-md"
          />

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold ${
                    activeFilter === filter
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
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
                  className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold ${
                    complianceFilter === filter
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
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
            <thead className="bg-slate-50 text-left">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Vendor Code
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Vendor Name
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Contact Person
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Phone
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Service Category
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  GST
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Payment Terms
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Compliance
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-4 font-semibold text-slate-950">
                    {vendor.vendorCode}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {vendor.vendorName}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {vendor.contactPerson || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {vendor.phone || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {vendor.email || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {vendor.serviceCategory || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {vendor.gstNumber || "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-700">
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
        title="Delete vendor?"
        description={`Vendor ${
          archiveTarget?.vendorName || ""
        } will be removed from active vendor lists. Purchase and audit history will remain available.`}
        confirmLabel={isArchiving ? "Deleting..." : "Delete"}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
