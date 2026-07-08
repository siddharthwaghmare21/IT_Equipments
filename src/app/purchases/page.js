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
import { cancelWorkOrder, getWorkOrders } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  formatCurrency,
  mapWorkOrderFromApi,
  workOrderStatuses,
} from "@/lib/workOrderMapper";

const filters = ["All", ...workOrderStatuses];

function WorkOrderStatusBadge({ status }) {
  const statusStyles = {
    Draft: "bg-slate-100 text-slate-700 border-slate-200",
    Ordered: "bg-sky-100 text-sky-700 border-sky-200",
    Received: "bg-emerald-100 text-emerald-700 border-emerald-200",
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

export default function PurchasesPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkOrders = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getWorkOrders(token);
      setWorkOrders((data || []).map(mapWorkOrderFromApi));
    } catch (requestError) {
      setError(requestError.message || "Unable to load work orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorkOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkOrders]);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((workOrder) => {
      const searchText = `
        ${workOrder.workOrderNumber}
        ${workOrder.vendorName}
        ${workOrder.invoiceNumber}
        ${workOrder.workOrderDate}
        ${workOrder.expectedDeliveryDate}
        ${workOrder.receivedDate}
        ${formatCurrency(workOrder.totalAmount)}
        ${workOrder.approvalStatus}
        ${workOrder.paymentStatus}
        ${workOrder.receivedStatus}
        ${workOrder.invoiceStatus}
        ${workOrder.workOrderStatus}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || workOrder.workOrderStatus === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [workOrders, search, activeFilter]);

  async function confirmCancel() {
    const token = getSessionToken();

    if (!token || !cancelTarget) {
      return;
    }

    try {
      await cancelWorkOrder(cancelTarget.workOrderId, token);
      showToast("Work order cancelled successfully.");
      setCancelTarget(null);
      await loadWorkOrders();
    } catch (requestError) {
      showToast(requestError.message || "Unable to cancel work order.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Work Orders"
      />

      <PageActionBar
        addHref="/purchases/add"
        addLabel="Add Work Order"
        exportData={filteredWorkOrders}
        exportFileName="work-orders"
        printTitle="Work Orders"
        printDescription="Official work order register generated from the current filtered procurement records."
      />

      {isLoading ? (
        <LoadingState
          title="Loading work orders"
          description="Fetching work order records from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load work orders"
          description={error}
          actionLabel="Retry"
          onAction={loadWorkOrders}
        />
      ) : (
        <>
          <section className="mb-4 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by WO, vendor, invoice, approval, payment or status..."
                className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-[#7d90b2] focus:border-[#7c4cf3] lg:max-w-md"
              />

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
            </div>
          </section>

          <CompactRecordList
            records={filteredWorkOrders}
            getTitle={(workOrder) => workOrder.workOrderNumber}
            getSubtitle={(workOrder) =>
              `${workOrder.vendorName} | ${workOrder.invoiceNumber || "No invoice"}`
            }
            getMeta={(workOrder) => [
              workOrder.workOrderDate,
              `${workOrder.itemCount} items`,
              formatCurrency(workOrder.totalAmount),
            ]}
            getStatus={(workOrder) => workOrder.workOrderStatus}
            getHref={(workOrder) => `/purchases/view/${workOrder.id}`}
            getEditHref={(workOrder) => `/purchases/edit/${workOrder.id}`}
            onDelete={setCancelTarget}
            emptyTitle="No work orders found"
            emptyDescription="Try changing the search or filter."
          />

          <div className="hidden lg:block">
            <TableWrapper>
              <table className="min-w-[1180px] w-full text-sm">
                <thead className="bg-[#101a2b]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      WO Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Vendor / Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Workflow
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263754] bg-[#18253d]">
                  {filteredWorkOrders.map((workOrder) => (
                    <tr key={workOrder.id} className="hover:bg-[#1f2f4a]">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-white">
                          {workOrder.workOrderNumber}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {workOrder.itemCount} item lines
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#c8d4ec]">
                        <p className="font-medium text-white">
                          {workOrder.vendorName}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {workOrder.invoiceNumber || "No invoice"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[#c8d4ec]">
                        <p>WO: {workOrder.workOrderDate || "-"}</p>
                        <p className="text-xs text-[#8fa4c7]">
                          Expected: {workOrder.expectedDeliveryDate || "-"}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          Received: {workOrder.receivedDate || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <WorkOrderStatusBadge
                          status={workOrder.workOrderStatus}
                        />
                        <p className="mt-2 text-xs text-[#8fa4c7]">
                          Approval: {workOrder.approvalStatus}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          Payment: {workOrder.paymentStatus}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-white">
                        {formatCurrency(workOrder.totalAmount)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <ActionButtons
                          viewHref={`/purchases/view/${workOrder.id}`}
                          editHref={`/purchases/edit/${workOrder.id}`}
                          onDelete={() => setCancelTarget(workOrder)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrapper>
          </div>

          {filteredWorkOrders.length === 0 && (
            <EmptyState
              title="No work orders found"
              description="Try changing search/filter or add a new work order."
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel work order?"
        description={`This will mark ${
          cancelTarget?.workOrderNumber || "this work order"
        } as cancelled.`}
        confirmLabel="Cancel Work Order"
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </LayoutWrapper>
  );
}
