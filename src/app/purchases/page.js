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
    Draft: "bg-gray-100 text-gray-700 border-gray-200",
    Ordered: "bg-blue-100 text-blue-700 border-blue-200",
    Received: "bg-green-100 text-green-700 border-green-200",
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

      <PageActionBar addHref="/purchases/add" addLabel="Add Work Order" />

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
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Work Orders</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {workOrders.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Received</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  workOrders.filter(
                    (workOrder) => workOrder.workOrderStatus === "Received"
                  ).length
                }
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Pending Approval</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  workOrders.filter(
                    (workOrder) => workOrder.approvalStatus === "Pending"
                  ).length
                }
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Ordered</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {
                  workOrders.filter(
                    (workOrder) => workOrder.workOrderStatus === "Ordered"
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
                placeholder="Search by WO, vendor, invoice, approval, payment or status..."
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
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
            {receivingSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">{step.detail}</p>
                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {step.count}
                </p>
              </div>
            ))}
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    WO Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Vendor / Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Workflow
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredWorkOrders.map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {workOrder.workOrderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {workOrder.itemCount} item lines
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-900">
                        {workOrder.vendorName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {workOrder.invoiceNumber || "No invoice"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      <p>WO: {workOrder.workOrderDate || "-"}</p>
                      <p className="text-xs text-gray-500">
                        Expected: {workOrder.expectedDeliveryDate || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Received: {workOrder.receivedDate || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <WorkOrderStatusBadge status={workOrder.workOrderStatus} />
                      <p className="mt-2 text-xs text-gray-500">
                        Approval: {workOrder.approvalStatus}
                      </p>
                      <p className="text-xs text-gray-500">
                        Payment: {workOrder.paymentStatus}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
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
