"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import {
  getAssets,
  getDeliveries,
  getMaintenanceRecords,
  getReturns,
  getTransfers,
  getVendors,
  getWorkOrders,
} from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDeliveryFromApi } from "@/lib/deliveryMapper";
import { mapMaintenanceFromApi } from "@/lib/maintenanceMapper";
import { mapReturnFromApi } from "@/lib/returnMapper";
import { mapTransferFromApi } from "@/lib/transferMapper";
import { mapVendorFromApi } from "@/lib/vendorMapper";
import { mapWorkOrderFromApi } from "@/lib/workOrderMapper";

const reportSearchItems = [
  {
    type: "Report",
    title: "Assets Report",
    detail: "Asset category, status and availability summary",
    href: "/reports/assets",
  },
  {
    type: "Report",
    title: "Warranty Report",
    detail: "Warranty expiry, expired assets and upcoming alerts",
    href: "/reports/warranty",
  },
  {
    type: "Report",
    title: "Maintenance Report",
    detail: "Repair status, vendor support and maintenance cost",
    href: "/reports/maintenance",
  },
  {
    type: "Report",
    title: "Transfers Report",
    detail: "Department movement, reassignment and acknowledgement records",
    href: "/reports/transfers",
  },
];

const typeFilters = [
  "All",
  "Asset",
  "Work Order",
  "Vendor",
  "Maintenance",
  "Delivery",
  "Transfer",
  "Return",
  "Report",
];

function buildSearchItems(records) {
  return [
    ...records.assets.map((asset) => ({
      type: "Asset",
      title: asset.assetTag || asset.assetName,
      detail: `${asset.assetName} | ${asset.category} | ${asset.currentDepartmentName || asset.location || "No location"} | ${asset.assetStatus}`,
      href: `/assets/view/${asset.id}`,
    })),
    ...records.workOrders.map((workOrder) => ({
      type: "Work Order",
      title: workOrder.workOrderNumber,
      detail: `${workOrder.vendorName} | ${workOrder.invoiceNumber || "No invoice"} | ${workOrder.approvalStatus} | ${workOrder.workOrderStatus}`,
      href: `/purchases/view/${workOrder.id}`,
    })),
    ...records.vendors.map((vendor) => ({
      type: "Vendor",
      title: vendor.vendorName,
      detail: `${vendor.vendorCode} | ${vendor.contactPerson || "No contact"} | ${vendor.serviceCategory || "No category"} | ${vendor.complianceStatus}`,
      href: `/vendors/view/${vendor.id}`,
    })),
    ...records.deliveries.map((delivery) => ({
      type: "Delivery",
      title: delivery.deliveryCode,
      detail: `${delivery.assetTag} ${delivery.assetName} | ${delivery.receiverName} | ${delivery.departmentName} | ${delivery.deliveryStatus}`,
      href: `/deliveries/view/${delivery.id}`,
    })),
    ...records.transfers.map((transfer) => ({
      type: "Transfer",
      title: transfer.transferCode,
      detail: `${transfer.assetTag} ${transfer.assetName} | ${transfer.fromDepartmentName} to ${transfer.toDepartmentName} | ${transfer.transferStatus}`,
      href: `/transfers/view/${transfer.id}`,
    })),
    ...records.returns.map((returnRecord) => ({
      type: "Return",
      title: returnRecord.returnCode,
      detail: `${returnRecord.assetTag} ${returnRecord.assetName} | ${returnRecord.returnedByName} | ${returnRecord.returnCondition} | ${returnRecord.returnStatus}`,
      href: `/returns/view/${returnRecord.id}`,
    })),
    ...records.maintenance.map((record) => ({
      type: "Maintenance",
      title: record.maintenanceCode,
      detail: `${record.assetTag} ${record.assetName} | ${record.issueType} | ${record.priority} | ${record.maintenanceStatus}`,
      href: `/maintenance/view/${record.id}`,
    })),
    ...reportSearchItems,
  ].filter((item) => item.title);
}

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchItems, setSearchItems] = useState(reportSearchItems);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSearchItems = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const [
        assets,
        workOrders,
        vendors,
        deliveries,
        transfers,
        returns,
        maintenance,
      ] = await Promise.all([
        getAssets(token),
        getWorkOrders(token),
        getVendors(token),
        getDeliveries(token),
        getTransfers(token),
        getReturns(token),
        getMaintenanceRecords(token),
      ]);

      setSearchItems(
        buildSearchItems({
          assets: (assets || []).map(mapAssetFromApi),
          workOrders: (workOrders || []).map(mapWorkOrderFromApi),
          vendors: (vendors || []).map(mapVendorFromApi),
          deliveries: (deliveries || []).map(mapDeliveryFromApi),
          transfers: (transfers || []).map(mapTransferFromApi),
          returns: (returns || []).map(mapReturnFromApi),
          maintenance: (maintenance || []).map(mapMaintenanceFromApi),
        })
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to load search records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSearchItems();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSearchItems]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return searchItems.filter((item) => {
      const matchesType = typeFilter === "All" || item.type === typeFilter;
      const matchesQuery =
        !normalizedQuery ||
        `${item.type} ${item.title} ${item.detail}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [query, searchItems, typeFilter]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Search"
        description="Search across assets, work orders, vendors, deliveries, transfers, maintenance and reports."
      />

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search asset tag, WO, vendor, receiver, transfer, maintenance or report..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {typeFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTypeFilter(filter)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold ${
                  typeFilter === filter
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <LoadingState
          title="Loading search"
          description="Fetching searchable records from backend modules."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load search"
          description={error}
          onRetry={loadSearchItems}
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No search results"
          description="Try another asset tag, WO number, vendor name or module name."
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.title}`}
              type="button"
              onClick={() => router.push(result.href)}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-gray-300 hover:bg-gray-50"
            >
              <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
                {result.type}
              </span>
              <h2 className="mt-3 text-lg font-bold text-gray-900">
                {result.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {result.detail}
              </p>
            </button>
          ))}
        </section>
      )}
    </LayoutWrapper>
  );
}
