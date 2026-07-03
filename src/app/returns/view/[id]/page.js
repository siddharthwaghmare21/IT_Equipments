"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import ProfessionalPrintDocument from "@/components/common/ProfessionalPrintDocument";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { getReturn } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapReturnFromApi } from "@/lib/returnMapper";

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

function ReturnStatusBadge({ status }) {
  const statusStyles = {
    Returned: "bg-green-100 text-green-700 border-green-200",
    Damaged: "bg-red-100 text-red-700 border-red-200",
    "Pending Inspection": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Under Review": "bg-blue-100 text-blue-700 border-blue-200",
    Rejected: "bg-gray-100 text-gray-700 border-gray-200",
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

export default function ViewReturnPage() {
  const params = useParams();
  const returnId = params.id;
  const [returnRecord, setReturnRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReturn = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getReturn(returnId, token);
      setReturnRecord(mapReturnFromApi(data));
    } catch (requestError) {
      setError(requestError.message || "Unable to load return.");
    } finally {
      setIsLoading(false);
    }
  }, [returnId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReturn();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReturn]);
  const returnPrintSections = useMemo(() => {
    if (!returnRecord) return null;

    return [
      {
        title: "Return Information",
        items: [
          { label: "Return Code", value: returnRecord.returnCode },
          { label: "Delivery Code", value: returnRecord.deliveryCode },
          { label: "Return Date", value: returnRecord.returnDate },
          { label: "Return Status", value: returnRecord.returnStatus },
        ],
      },
      {
        title: "Asset & Department",
        items: [
          { label: "Asset Tag", value: returnRecord.assetTag },
          { label: "Asset Name", value: returnRecord.assetName },
          { label: "Returned By", value: returnRecord.returnedByName },
          { label: "Department", value: returnRecord.departmentName },
          { label: "Return Condition", value: returnRecord.returnCondition },
        ],
      },
      {
        title: "Inspection & Receipt",
        items: [
          { label: "Received By", value: returnRecord.receivedByName },
          { label: "Received Location", value: returnRecord.receivedLocation },
          {
            label: "Acknowledgement",
            value: returnRecord.acknowledgementStatus,
          },
          { label: "Inspection Status", value: returnRecord.inspectionStatus },
          { label: "Inspection By", value: returnRecord.inspectionByName },
          { label: "Damage Decision", value: returnRecord.damageDecision },
        ],
      },
      {
        title: "Notes",
        items: [
          { label: "Remarks", value: returnRecord.remarks },
          { label: "Created At", value: returnRecord.createdAt },
          { label: "Updated At", value: returnRecord.updatedAt },
        ],
      },
    ];
  }, [returnRecord]);

  return (
    <LayoutWrapper>
      <PageHeader
        title="Return Details"
        description="View returned asset information, condition, received-by details and inspection status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/returns" label="Returns" />

        {returnRecord && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/returns/edit/${returnRecord.id}`}
              prefetch={false}
              className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Edit Return
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Print Receipt
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading return"
          description="Fetching return details from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load return"
          description={error}
          actionLabel="Retry"
          onAction={loadReturn}
        />
      ) : (
        <>
        <section className="no-print rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {returnRecord.returnCode}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {returnRecord.assetName || returnRecord.assetTag}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {returnRecord.assetTag || "-"} returned by{" "}
                {returnRecord.returnedByName}
              </p>
            </div>

            <ReturnStatusBadge status={returnRecord.returnStatus} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Return Code" value={returnRecord.returnCode} />
            <DetailItem label="Delivery Code" value={returnRecord.deliveryCode} />
            <DetailItem label="Asset Tag" value={returnRecord.assetTag} />
            <DetailItem label="Asset Name" value={returnRecord.assetName} />
            <DetailItem
              label="Returned By"
              value={returnRecord.returnedByName}
            />
            <DetailItem label="Department" value={returnRecord.departmentName} />
            <DetailItem label="Return Date" value={returnRecord.returnDate} />
            <DetailItem
              label="Return Condition"
              value={returnRecord.returnCondition}
            />
            <DetailItem
              label="Received By"
              value={returnRecord.receivedByName}
            />
            <DetailItem
              label="Received Location"
              value={returnRecord.receivedLocation}
            />
            <DetailItem
              label="Acknowledgement Status"
              value={returnRecord.acknowledgementStatus}
            />
            <DetailItem
              label="Inspection Status"
              value={returnRecord.inspectionStatus}
            />
            <DetailItem
              label="Inspection By"
              value={returnRecord.inspectionByName}
            />
            <DetailItem
              label="Damage Decision"
              value={returnRecord.damageDecision}
            />
            <DetailItem label="Status" value={returnRecord.returnStatus} />
            <DetailItem label="Created At" value={returnRecord.createdAt} />
            <DetailItem label="Updated At" value={returnRecord.updatedAt} />
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Remarks
            </p>
            <p className="mt-2 text-sm text-gray-700">
              {returnRecord.remarks || "-"}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Receiver Return Confirmation
              </p>
              <div className="mt-10 border-t border-gray-300 pt-2 text-sm text-gray-600">
                Signature / Date
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                IT Department Receipt
              </p>
              <div className="mt-10 border-t border-gray-300 pt-2 text-sm text-gray-600">
                Signature / Date
              </div>
            </div>
          </div>
        </section>

        <ProfessionalPrintDocument
          title="Return Receipt"
          description="Official asset return receipt generated from the selected return record."
          data={[returnRecord]}
          detailSections={returnPrintSections}
          reviewerNotes={[
            "Verify returned asset condition before accepting receipt.",
            "Confirm inspection status and damage decision before final closure.",
            "Returned-by and IT receipt signatures are required for audit records.",
          ]}
          signOffLabels={[
            "Receiver Return Confirmation",
            "IT Department Receipt",
            "Approved By",
          ]}
          fileName={`return-receipt-${returnRecord.returnCode || returnRecord.id}`}
        />
        </>
      )}
    </LayoutWrapper>
  );
}
