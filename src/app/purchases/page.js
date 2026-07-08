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
import { cancelWorkOrder, getWorkOrders } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  formatCurrency,
  mapWorkOrderFromApi,
  workOrderStatuses,
} from "@/lib/workOrderMapper";

const filters = ["All", ...workOrderStatuses];
const printColumns = [
  { key: "workOrderNumber", label: "WO Number" },
  { key: "vendorName", label: "Vendor" },
  { key: "invoiceNumber", label: "Invoice No." },
  { key: "workOrderDate", label: "WO Date" },
  { key: "expectedDeliveryDate", label: "Expected Delivery" },
  { key: "approvalStatus", label: "Approval" },
  { key: "paymentStatus", label: "Payment" },
  { key: "workOrderStatus", label: "Status" },
];

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
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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
      const matchesFilter =
        activeFilter === "All" || workOrder.workOrderStatus === activeFilter;

      return matchesFilter;
    });
  }, [workOrders, activeFilter]);

  const pagedWorkOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredWorkOrders.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredWorkOrders]);

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
        printColumns={printColumns}
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
              <table className="min-w-[1180px] w-full text-sm">
                <thead className="bg-[#101a2b]">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      WO Details
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Vendor / Invoice
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Workflow
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[#8fa4c7]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263754] bg-[#18253d]">
                  {pagedWorkOrders.map((workOrder) => (
                    <tr key={workOrder.id} className="hover:bg-[#1f2f4a]">
                      <td className="px-4 py-4 text-center">
                        <p className="text-sm font-semibold text-white">
                          {workOrder.workOrderNumber}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {workOrder.itemCount} item lines
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center text-sm text-[#c8d4ec]">
                        <p className="font-medium text-white">
                          {workOrder.vendorName}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {workOrder.invoiceNumber || "No invoice"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center text-sm text-[#c8d4ec]">
                        <p>WO: {workOrder.workOrderDate || "-"}</p>
                        <p className="text-xs text-[#8fa4c7]">
                          Expected: {workOrder.expectedDeliveryDate || "-"}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          Received: {workOrder.receivedDate || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-center">
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

                      <td className="px-4 py-4 text-center text-sm font-semibold text-white">
                        {formatCurrency(workOrder.totalAmount)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <ActionButtons
                            viewHref={`/purchases/view/${workOrder.id}`}
                            editHref={`/purchases/edit/${workOrder.id}`}
                            onDelete={() => setCancelTarget(workOrder)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrapper>
          </div>

          {filteredWorkOrders.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredWorkOrders.length}
              pageSize={10}
              onPageChange={setCurrentPage}
              itemLabel="work orders"
            />
          )}

          {filteredWorkOrders.length === 0 && (
            <EmptyState
              title="No work orders found"
              description="Try changing the filter or add a new work order."
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
