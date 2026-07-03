"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import CompactRecordList from "@/components/common/CompactRecordList";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { cancelDelivery, getDeliveries } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { deliveryStatuses, mapDeliveryFromApi } from "@/lib/deliveryMapper";

const filters = ["All", ...deliveryStatuses];

function DeliveryStatusBadge({ status }) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Delivered: "bg-blue-100 text-blue-700 border-blue-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
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

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDeliveries = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getDeliveries(token);
      setDeliveries((data || []).map(mapDeliveryFromApi));
    } catch (requestError) {
      setError(requestError.message || "Unable to load deliveries.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDeliveries();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDeliveries]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const searchText = `
        ${delivery.deliveryCode}
        ${delivery.assetTag}
        ${delivery.assetName}
        ${delivery.receiverName}
        ${delivery.departmentName}
        ${delivery.deliveredByName}
        ${delivery.accessories}
        ${delivery.acknowledgementStatus}
        ${delivery.deliveryStatus}
        ${delivery.remarks}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || delivery.deliveryStatus === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [deliveries, search, activeFilter]);

  async function confirmCancel() {
    const token = getSessionToken();

    if (!token || !cancelTarget) {
      return;
    }

    try {
      await cancelDelivery(cancelTarget.deliveryId, token);
      showToast("Delivery cancelled successfully.");
      setCancelTarget(null);
      await loadDeliveries();
    } catch (requestError) {
      showToast(requestError.message || "Unable to cancel delivery.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Deliveries"
        description="Track department-wise IT equipment delivery records, receiver details and acknowledgement status."
      />

      <PageActionBar
        addHref="/deliveries/delivery"
        addLabel="Add Delivery"
        exportData={filteredDeliveries}
        exportFileName="deliveries"
        printTitle="Deliveries"
        printDescription="Official delivery register generated from the current filtered delivery records."
        importModule="Deliveries"
      />

      {isLoading ? (
        <LoadingState
          title="Loading deliveries"
          description="Fetching delivery records from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load deliveries"
          description={error}
          actionLabel="Retry"
          onAction={loadDeliveries}
        />
      ) : (
        <>
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {deliveries.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Delivered</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  deliveries.filter(
                    (delivery) => delivery.deliveryStatus === "Delivered"
                  ).length
                }
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Pending</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  deliveries.filter(
                    (delivery) => delivery.deliveryStatus === "Pending"
                  ).length
                }
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Acknowledged</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  deliveries.filter(
                    (delivery) =>
                      delivery.acknowledgementStatus === "Acknowledged"
                  ).length
                }
              </h2>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by delivery code, asset tag, asset name, receiver or department..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 lg:max-w-md"
              />

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
            </div>
          </section>

          <CompactRecordList
            records={filteredDeliveries}
            titleKey="deliveryCode"
            subtitleKey="assetName"
            meta={[
              { label: "Receiver", key: "receiverName" },
              { label: "Department", key: "departmentName" },
              { label: "Delivery Date", key: "deliveryDate" },
              { label: "Ack", key: "acknowledgementStatus" },
            ]}
            statusRender={(delivery) => (
              <DeliveryStatusBadge status={delivery.deliveryStatus} />
            )}
            viewHref={(delivery) => `/deliveries/view/${delivery.id}`}
            editHref={(delivery) => `/deliveries/edit/${delivery.id}`}
            onArchive={setCancelTarget}
            archiveLabel="Cancel"
            emptyTitle="No delivery records found"
            emptyDescription="Try changing search or delivery status filters."
          />

          <div className="hidden md:block">
            <TableWrapper>
              <table className="min-w-[1280px] w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Delivery Code
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Asset
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Receiver
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Department
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Delivered By
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Delivery Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Acknowledgement
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {delivery.deliveryCode}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        <p className="font-medium text-gray-900">
                          {delivery.assetTag || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {delivery.assetName || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {delivery.receiverName}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {delivery.departmentName || "-"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {delivery.deliveredByName || "-"}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {delivery.deliveryDate}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {delivery.acknowledgementStatus}
                      </td>
                      <td className="px-4 py-4">
                        <DeliveryStatusBadge status={delivery.deliveryStatus} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ActionButtons
                          viewHref={`/deliveries/view/${delivery.id}`}
                          editHref={`/deliveries/edit/${delivery.id}`}
                          onDelete={() => setCancelTarget(delivery)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrapper>
          </div>

          {filteredDeliveries.length === 0 && (
            <EmptyState
              title="No delivery records found"
              description="Try changing search/filter or add a new delivery."
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel delivery?"
        description={`This will mark ${
          cancelTarget?.deliveryCode || "this delivery"
        } as cancelled.`}
        confirmLabel="Cancel Delivery"
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </LayoutWrapper>
  );
}
