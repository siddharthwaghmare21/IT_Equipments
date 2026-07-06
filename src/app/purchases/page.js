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

  const receivingSteps = [
    {
      title: "WO Created",
      detail: "Work order and vendor reference captured",
      count: workOrders.length,
    },
    {
      title: "Approved",
      detail: "Approval completed before receiving",
      count: workOrders.filter(
        (workOrder) => workOrder.approvalStatus === "Approved"
      ).length,
    },
    {
      title: "Received",
      detail: "Items physically received by IT/stores team",
      count: workOrders.filter(
        (workOrder) => workOrder.workOrderStatus === "Received"
      ).length,
    },
    {
      title: "Asset Registration",
      detail: "Received items can be registered as assets next",
      count: workOrders.filter(
        (workOrder) => workOrder.receivedStatus === "Fully Received"
      ).length,
    },
  ];

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
        description="Track work orders, vendor invoices, received items and pending procurement."
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
          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by WO, vendor, invoice, approval, payment or status..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white lg:max-w-md"
              />

              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold ${
                      activeFilter === filter
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Procurement Lifecycle
                </h2>
                <p className="text-sm text-slate-500">
                  Work order movement from creation to asset registration.
                </p>
              </div>
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {filteredWorkOrders.length} visible
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            {receivingSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-950">
                    {step.title}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {step.detail}
                </p>
                <p className="mt-3 text-xl font-bold text-slate-950">
                  {step.count}
                </p>
              </div>
            ))}
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
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      WO Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vendor / Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Workflow
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredWorkOrders.map((workOrder) => (
                    <tr key={workOrder.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-950">
                          {workOrder.workOrderNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          {workOrder.itemCount} item lines
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        <p className="font-medium text-slate-950">
                          {workOrder.vendorName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {workOrder.invoiceNumber || "No invoice"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        <p>WO: {workOrder.workOrderDate || "-"}</p>
                        <p className="text-xs text-slate-500">
                          Expected: {workOrder.expectedDeliveryDate || "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Received: {workOrder.receivedDate || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <WorkOrderStatusBadge
                          status={workOrder.workOrderStatus}
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Approval: {workOrder.approvalStatus}
                        </p>
                        <p className="text-xs text-slate-500">
                          Payment: {workOrder.paymentStatus}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-950">
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
        open={Boolean(cancelTarget)}
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
