"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import TablePagination from "@/components/common/TablePagination";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
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
const printColumns = [
  { key: "deliveryCode", label: "Delivery Code" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "receiverName", label: "Receiver" },
  { key: "departmentName", label: "Department" },
  { key: "deliveryDate", label: "Delivery Date" },
  { key: "acknowledgementStatus", label: "Acknowledgement" },
  { key: "deliveryStatus", label: "Status" },
];

function DeliveryStatusBadge({ status }) {
  const statusStyles = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Delivered: "bg-sky-100 text-sky-700 border-sky-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
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

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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
      const matchesFilter =
        activeFilter === "All" || delivery.deliveryStatus === activeFilter;

      return matchesFilter;
    });
  }, [deliveries, activeFilter]);

  const pagedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredDeliveries.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredDeliveries]);

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
      />

      <PageActionBar
        addHref="/deliveries/delivery"
        addLabel="Add Delivery"
        exportData={filteredDeliveries}
        exportFileName="deliveries"
        printTitle="Deliveries"
        printColumns={printColumns}
        printDescription="Official delivery register generated from the current filtered delivery records."
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
          <section className="mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] p-3 shadow-[0_12px_28px_rgba(6,12,24,0.12)]">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter);
                      setCurrentPage(1);
                    }}
                    className={`whitespace-nowrap rounded-2xl border px-3.5 py-2 text-sm font-semibold transition ${
                      activeFilter === filter
                        ? "border-[#7c4cf3] bg-gradient-to-r from-[#6a3df0] to-[#8b5cf6] text-white shadow-[0_10px_24px_rgba(106,61,240,0.2)]"
                        : "border-[#314666] bg-[#101a2b] text-[#b8c7e6] hover:bg-[#16233a]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>


          <div>
            <TableWrapper>
              <table className="min-w-[1280px] w-full text-sm">
                <thead className="bg-[#101a2b] text-center">
                  <tr className="border-b border-[#263754]">
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Delivery Code
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Asset
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Receiver
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Department
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Delivered By
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Delivery Date
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Acknowledgement
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-[#8fa4c7]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263754] bg-[#18253d]">
                  {pagedDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="hover:bg-[#1f2f4a]"
                    >
                      <td className="text-center px-4 py-4 font-semibold text-white">
                        {delivery.deliveryCode}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        <p className="font-medium text-white">
                          {delivery.assetTag || "-"}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {delivery.assetName || "-"}
                        </p>
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {delivery.receiverName}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {delivery.departmentName || "-"}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {delivery.deliveredByName || "-"}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {delivery.deliveryDate}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {delivery.acknowledgementStatus}
                      </td>
                      <td className="text-center px-4 py-4">
                        <DeliveryStatusBadge status={delivery.deliveryStatus} />
                      </td>
                      <td className="px-4 py-4 text-center">
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

          {filteredDeliveries.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredDeliveries.length}
              pageSize={10}
              onPageChange={setCurrentPage}
              itemLabel="deliveries"
            />
          )}

          {filteredDeliveries.length === 0 && (
            <EmptyState
              title="No delivery records found"
              description="Try changing search/filter or add a new delivery."
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
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
