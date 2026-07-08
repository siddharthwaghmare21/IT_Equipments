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
      />

      <PageActionBar
        addHref="/vendors/add"
        addLabel="Add Vendor"
        exportData={filteredVendors}
        exportFileName="vendors"
        printTitle="Vendors"
        printDescription="Official vendor register generated from the current filtered vendor records."
      />

      <section className="mb-4 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by vendor, GST, payment terms, category, compliance or status..."
            className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-[#7d90b2] focus:border-[#7c4cf3] xl:max-w-md"
          />

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                    activeFilter === filter
                      ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(106,61,240,0.2)]"
                      : "border-[#314666] bg-[#101a2b] text-[#b8c7e6] hover:bg-[#16233a]"
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
                  className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                    complianceFilter === filter
                      ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(106,61,240,0.2)]"
                      : "border-[#314666] bg-[#101a2b] text-[#b8c7e6] hover:bg-[#16233a]"
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
            <thead className="bg-[#101a2b] text-left">
              <tr className="border-b border-[#263754]">
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Vendor Code
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Vendor Name
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Contact Person
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Phone
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Service Category
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  GST
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Payment Terms
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Compliance
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-[#8fa4c7]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#263754] bg-[#18253d]">
              {filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-[#1f2f4a]"
                >
                  <td className="px-4 py-4 font-semibold text-white">
                    {vendor.vendorCode}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {vendor.vendorName}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {vendor.contactPerson || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {vendor.phone || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {vendor.email || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {vendor.serviceCategory || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
                    {vendor.gstNumber || "-"}
                  </td>

                  <td className="px-4 py-4 text-[#c8d4ec]">
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
