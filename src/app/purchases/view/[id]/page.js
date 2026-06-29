"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import TableWrapper from "@/components/common/TableWrapper";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { getWorkOrder } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { formatCurrency, mapWorkOrderFromApi } from "@/lib/workOrderMapper";

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

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

export default function ViewPurchasePage() {
  const params = useParams();
  const workOrderId = params.id;
  const [workOrder, setWorkOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkOrder = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getWorkOrder(workOrderId, token);
      setWorkOrder(mapWorkOrderFromApi(data));
    } catch (requestError) {
      setError(requestError.message || "Unable to load work order.");
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorkOrder();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkOrder]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Work Order Details"
        description="View complete work order, vendor invoice, item, specification and cost information."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/purchases" label="Work Orders" />

        {workOrder && (
          <Link
            href={`/purchases/edit/${workOrder.id}`}
            className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Edit Work Order
          </Link>
        )}
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading work order"
          description="Fetching work order details from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load work order"
          description={error}
          actionLabel="Retry"
          onAction={loadWorkOrder}
        />
      ) : (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {workOrder.workOrderNumber}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {workOrder.vendorName}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Invoice: {workOrder.invoiceNumber || "-"}
              </p>
            </div>

            <WorkOrderStatusBadge status={workOrder.workOrderStatus} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="WO Number" value={workOrder.workOrderNumber} />
            <DetailItem label="Vendor Name" value={workOrder.vendorName} />
            <DetailItem label="Invoice Number" value={workOrder.invoiceNumber} />
            <DetailItem label="Work Order Date" value={workOrder.workOrderDate} />
            <DetailItem
              label="Expected Delivery"
              value={workOrder.expectedDeliveryDate}
            />
            <DetailItem label="Received Date" value={workOrder.receivedDate} />
            <DetailItem label="Status" value={workOrder.workOrderStatus} />
            <DetailItem
              label="Approval Status"
              value={workOrder.approvalStatus}
            />
            <DetailItem label="Payment Status" value={workOrder.paymentStatus} />
            <DetailItem
              label="Received Status"
              value={workOrder.receivedStatus}
            />
            <DetailItem label="Invoice Status" value={workOrder.invoiceStatus} />
            <DetailItem
              label="Total Amount"
              value={formatCurrency(workOrder.totalAmount)}
            />
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Remarks
            </p>
            <p className="mt-2 text-sm text-gray-700">
              {workOrder.remarks || "-"}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Item Details
            </h3>

            <TableWrapper>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Warranty
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {workOrder.items.map((item, index) => (
                  <tr key={`${item.itemName}-${index}`}>
                    <td className="px-4 py-4 text-sm">
                      <p className="font-semibold text-gray-900">
                        {item.itemName}
                      </p>
                      <p className="mt-1 max-w-md text-xs text-gray-500">
                        {item.specifications || item.description || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {item.category}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {item.warranty || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrapper>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Created At" value={workOrder.createdAt} />
            <DetailItem label="Updated At" value={workOrder.updatedAt} />
            <DetailItem label="Approved By" value={workOrder.approvedBy} />
            <DetailItem label="Approved At" value={workOrder.approvedAt} />
          </div>
        </section>
      )}
    </LayoutWrapper>
  );
}
