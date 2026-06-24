"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/StateBlock";

const searchItems = [
  { type: "Asset", title: "IT-LAP-001", detail: "Dell Latitude 5420 assigned to IT Department", href: "/assets/view/1" },
  { type: "Asset", title: "IT-MON-001", detail: "Dell 24 Inch Monitor in Accounts", href: "/assets" },
  { type: "Work Order", title: "WO-2026-004", detail: "Network Solutions work order approval pending", href: "/purchases" },
  { type: "Vendor", title: "Dell Technologies", detail: "Laptop supplier, compliant vendor", href: "/vendors" },
  { type: "Maintenance", title: "MNT-001", detail: "Battery issue, high priority service", href: "/maintenance" },
  { type: "Report", title: "Warranty Report", detail: "Assets with warranty expiring soon", href: "/reports/warranty" },
  { type: "Delivery", title: "DLV-001", detail: "Laptop issued to IT Department, received by Rahul Patil", href: "/deliveries/view/1" },
  { type: "Transfer", title: "TRF-001", detail: "Dell Latitude 5420 moved from IT Department to Accounts", href: "/transfers/view/1" },
];

const typeFilters = ["All", "Asset", "Work Order", "Vendor", "Maintenance", "Delivery", "Transfer", "Report"];

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState("All");

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
  }, [query, typeFilter]);

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

      {results.length === 0 ? (
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
