"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import ProfessionalPrintDocument from "@/components/common/ProfessionalPrintDocument";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { getDelivery } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapDeliveryFromApi } from "@/lib/deliveryMapper";

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

export default function ViewDeliveryPage() {
  const params = useParams();
  const deliveryId = params.id;
  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDelivery = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getDelivery(deliveryId, token);
      setDelivery(mapDeliveryFromApi(data));
    } catch (requestError) {
      setError(requestError.message || "Unable to load delivery.");
    } finally {
      setIsLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDelivery();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDelivery]);
  const deliveryPrintSections = useMemo(() => {
    if (!delivery) return null;

    return [
      {
        title: "Delivery Information",
        items: [
          { label: "Delivery Code", value: delivery.deliveryCode },
          { label: "Delivery Date", value: delivery.deliveryDate },
          { label: "Delivery Status", value: delivery.deliveryStatus },
          {
            label: "Acknowledgement",
            value: delivery.acknowledgementStatus,
          },
        ],
      },
      {
        title: "Asset & Receiver",
        items: [
          { label: "Asset Tag", value: delivery.assetTag },
          { label: "Asset Name", value: delivery.assetName },
          { label: "Receiver", value: delivery.receiverName },
          { label: "Department", value: delivery.departmentName },
          { label: "Delivered By", value: delivery.deliveredByName },
        ],
      },
      {
        title: "Handover Notes",
        items: [
          { label: "Accessories", value: delivery.accessories },
          { label: "Remarks", value: delivery.remarks },
          { label: "Created At", value: delivery.createdAt },
          { label: "Updated At", value: delivery.updatedAt },
        ],
      },
    ];
  }, [delivery]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Delivery Details"
        description="View department-wise equipment delivery information, receiver details and acknowledgement status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/deliveries" label="Deliveries" />

        {delivery && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/deliveries/edit/${delivery.id}`}
              prefetch={false}
              className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Edit Delivery
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Print Acknowledgement
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading delivery"
          description="Fetching delivery details from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load delivery"
          description={error}
          actionLabel="Retry"
          onAction={loadDelivery}
        />
      ) : (
        <>
        <section className="no-print rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {delivery.deliveryCode}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {delivery.assetName || delivery.assetTag}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {delivery.assetTag || "-"} issued to{" "}
                {delivery.departmentName || "-"}; received by{" "}
                {delivery.receiverName}
              </p>
            </div>

            <DeliveryStatusBadge status={delivery.deliveryStatus} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Delivery Code" value={delivery.deliveryCode} />
            <DetailItem label="Asset Tag" value={delivery.assetTag} />
            <DetailItem label="Asset / Material Name" value={delivery.assetName} />
            <DetailItem
              label="Receiver / Employee Name"
              value={delivery.receiverName}
            />
            <DetailItem label="Department" value={delivery.departmentName} />
            <DetailItem label="Delivered By" value={delivery.deliveredByName} />
            <DetailItem label="Delivery Date" value={delivery.deliveryDate} />
            <DetailItem
              label="Delivery Status"
              value={delivery.deliveryStatus}
            />
            <DetailItem
              label="Acknowledgement Status"
              value={delivery.acknowledgementStatus}
            />
            <DetailItem label="Created At" value={delivery.createdAt} />
            <DetailItem label="Updated At" value={delivery.updatedAt} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Accessories Included
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {delivery.accessories || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Remarks
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {delivery.remarks || "-"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Receiver Acknowledgement
              </p>
              <div className="mt-10 border-t border-gray-300 pt-2 text-sm text-gray-600">
                Signature / Date
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                IT Department Handover
              </p>
              <div className="mt-10 border-t border-gray-300 pt-2 text-sm text-gray-600">
                Signature / Date
              </div>
            </div>
          </div>
        </section>

        <ProfessionalPrintDocument
          title="Delivery Acknowledgement"
          description="Official equipment delivery acknowledgement generated from the selected delivery record."
          data={[delivery]}
          detailSections={deliveryPrintSections}
          reviewerNotes={[
            "Verify receiver name, department and asset tag before sign-off.",
            "Confirm all listed accessories were handed over physically.",
            "Receiver and IT department signatures are required for final acknowledgement.",
          ]}
          signOffLabels={[
            "Receiver Acknowledgement",
            "IT Department Handover",
            "Approved By",
          ]}
          fileName={`delivery-acknowledgement-${delivery.deliveryCode || delivery.id}`}
        />
        </>
      )}
    </LayoutWrapper>
  );
}
