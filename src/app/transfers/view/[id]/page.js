"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { getTransfer } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapTransferFromApi } from "@/lib/transferMapper";

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

function TransferStatusBadge({ status }) {
  const styles = {
    Pending: "border-yellow-200 bg-yellow-100 text-yellow-700",
    "Collected by IT": "border-blue-200 bg-blue-100 text-blue-700",
    Reassigned: "border-indigo-200 bg-indigo-100 text-indigo-700",
    Completed: "border-green-200 bg-green-100 text-green-700",
    Cancelled: "border-red-200 bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function ViewTransferPage() {
  const params = useParams();
  const transferId = params.id;
  const [transfer, setTransfer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransfer = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getTransfer(transferId, token);
      setTransfer(mapTransferFromApi(data));
    } catch (requestError) {
      setError(requestError.message || "Unable to load transfer.");
    } finally {
      setIsLoading(false);
    }
  }, [transferId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadTransfer();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTransfer]);

  const timeline = useMemo(() => {
    if (!transfer) {
      return [];
    }

    return [
      {
        title: "Transfer Request Created",
        detail: `${transfer.transferCode} created for ${
          transfer.assetTag || "selected asset"
        }.`,
        time: transfer.createdAt,
      },
      {
        title: "Movement Planned",
        detail: `${transfer.fromDepartmentName || "-"} to ${
          transfer.toDepartmentName || "-"
        }. Reason: ${transfer.transferReason || "-"}.`,
        time: transfer.createdAt,
      },
      {
        title: "IT Collection",
        detail: transfer.collectionDate
          ? `${transfer.collectedByName || "IT team"} collected asset on ${
              transfer.collectionDate
            }.`
          : "Collection not recorded for this transfer.",
        time: transfer.collectionDate || "-",
      },
      {
        title: "Reassignment",
        detail: transfer.issueDate
          ? `Issued to ${transfer.toDepartmentName || "-"}; received by ${
              transfer.newReceiverName || "-"
            }.`
          : "Reassignment issue date is pending.",
        time: transfer.issueDate || "-",
      },
    ];
  }, [transfer]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Transfer Details"
        description="View department movement, IT collection, receiver acknowledgement and reassignment trail."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/transfers" label="Transfers" />

        {transfer && (
          <Link
            href={`/transfers/edit/${transfer.id}`}
            className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Edit Transfer
          </Link>
        )}
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading transfer"
          description="Fetching transfer details from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load transfer"
          description={error}
          actionLabel="Retry"
          onAction={loadTransfer}
        />
      ) : (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {transfer.transferCode}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {transfer.assetName || transfer.assetTag}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {transfer.assetTag || "-"} | {transfer.transferType}
              </p>
            </div>

            <TransferStatusBadge status={transfer.transferStatus} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Transfer Type" value={transfer.transferType} />
            <DetailItem label="Asset Tag" value={transfer.assetTag} />
            <DetailItem label="Asset Name" value={transfer.assetName} />
            <DetailItem
              label="From Department"
              value={transfer.fromDepartmentName}
            />
            <DetailItem
              label="To Department"
              value={transfer.toDepartmentName}
            />
            <DetailItem
              label="Current Receiver"
              value={transfer.currentReceiverName}
            />
            <DetailItem label="New Receiver" value={transfer.newReceiverName} />
            <DetailItem label="Reason" value={transfer.transferReason} />
            <DetailItem label="Accessories" value={transfer.accessories} />
            <DetailItem
              label="Condition"
              value={transfer.conditionAtTransfer}
            />
            <DetailItem
              label="Collection Date"
              value={transfer.collectionDate}
            />
            <DetailItem label="Collected By" value={transfer.collectedByName} />
            <DetailItem label="Issue Date" value={transfer.issueDate} />
            <DetailItem
              label="Handover Acknowledgement"
              value={transfer.handoverAcknowledgement}
            />
            <DetailItem
              label="New Acknowledgement"
              value={transfer.newAcknowledgement}
            />
            <DetailItem label="Created At" value={transfer.createdAt} />
            <DetailItem label="Updated At" value={transfer.updatedAt} />
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Remarks
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {transfer.remarks || "-"}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Transfer Timeline
            </p>

            <div className="mt-4 space-y-4">
              {timeline.map((event) => (
                <div key={`${event.title}-${event.time}`} className="flex gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-gray-900" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {event.detail}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </LayoutWrapper>
  );
}
