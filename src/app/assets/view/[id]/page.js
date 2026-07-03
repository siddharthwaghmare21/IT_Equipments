"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import BackButton from "@/components/common/BackButton";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { getAsset, getAssetHistory } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";

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

export default function ViewAssetPage() {
  const params = useParams();
  const assetId = params.id;

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAsset = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = getSessionToken();
      const [assetResponse, historyResponse] = await Promise.all([
        getAsset(assetId, token),
        getAssetHistory(assetId, token),
      ]);
      setAsset(mapAssetFromApi(assetResponse));
      setHistory(historyResponse);
    } catch (loadError) {
      setError(loadError.message || "Asset could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAsset();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadAsset]);

  const lifecycleSteps = useMemo(() => {
    if (!asset) return [];

    const steps = ["Purchased", "Registered"];
    if (asset.assetStatus === "Delivered") {
      steps.push("Delivered");
    } else if (asset.assetStatus === "Maintenance") {
      steps.push("Maintenance");
    } else if (asset.assetStatus === "Archived") {
      steps.push("Archived");
    } else {
      steps.push("Stored");
    }

    return [...steps, "Transfer", "Return", "Retire"];
  }, [asset]);

  function handlePrintLabel() {
    showToast("Print preview opened.");
    window.print();
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Asset Details"
        description="View complete information about this IT asset, specifications, delivery and warranty status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/assets" label="Assets" />

        <Link
          href={`/assets/edit/${assetId}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Asset
        </Link>
      </div>

      {isLoading && (
        <LoadingState
          title="Loading asset"
          description="Fetching asset details and lifecycle history from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Asset could not be loaded"
          description={error}
          onRetry={loadAsset}
        />
      )}

      {!isLoading && !error && asset && (
        <>
          <section className="print-area rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {asset.assetTag}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {asset.assetName}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {[asset.category, asset.brand, asset.model]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>

              <StatusBadge status={asset.assetStatus} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Asset Tag" value={asset.assetTag} />
              <DetailItem label="Asset Name" value={asset.assetName} />
              <DetailItem label="Category" value={asset.category} />
              <DetailItem label="Brand" value={asset.brand} />
              <DetailItem label="Model" value={asset.model} />
              <DetailItem label="Serial Number" value={asset.serialNumber} />
              <DetailItem label="Work Order Ref" value={asset.workOrderRef} />
              <DetailItem label="Invoice Number" value={asset.invoiceNumber} />
              <DetailItem label="Purchase Date" value={asset.purchaseDate} />
              <DetailItem label="Warranty Expiry" value={asset.warrantyExpiry} />
              <DetailItem label="Condition" value={asset.assetCondition} />
              <DetailItem label="Lifecycle Status" value={asset.lifecycleStatus} />
              <DetailItem
                label="Current Receiver"
                value={asset.currentReceiverName}
              />
              <DetailItem
                label="Current Department"
                value={asset.currentDepartmentName}
              />
              <DetailItem
                label="Custodian Department"
                value={asset.custodianDepartmentName}
              />
              <DetailItem label="Location" value={asset.location} />
              <DetailItem
                label="Document Status"
                value={`${asset.attachmentStatus} (${asset.documentCount})`}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Specifications
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {asset.specifications || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {asset.description || "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Remarks
              </p>
              <p className="mt-2 text-sm text-gray-700">
                {asset.remarks || "-"}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Asset Lifecycle Flow
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
                {lifecycleSteps.map((step, index) => (
                  <div
                    key={`${step}-${index}`}
                    className={`rounded-xl border p-3 ${
                      index <= 2
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase">
                      Step {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 xl:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Lifecycle History
                </p>

                <div className="mt-4 space-y-4">
                  {history.length === 0 && (
                    <p className="text-sm text-gray-600">
                      No lifecycle history found.
                    </p>
                  )}

                  {history.map((event) => (
                    <div key={event.historyId} className="flex gap-3">
                      <span className="mt-1 h-3 w-3 rounded-full bg-gray-900" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {event.eventType}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {[
                            event.fromDepartmentName &&
                              `From ${event.fromDepartmentName}`,
                            event.toDepartmentName &&
                              `To ${event.toDepartmentName}`,
                            event.receiverName &&
                              `Receiver ${event.receiverName}`,
                            event.eventStatus &&
                              `Status ${event.eventStatus}`,
                          ]
                            .filter(Boolean)
                            .join(" | ") || "-"}
                        </p>
                        {event.eventNotes && (
                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {event.eventNotes}
                          </p>
                        )}
                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {event.performedAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Asset Label
                </p>

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-center">
                  <p className="text-sm font-bold text-gray-900">
                    {asset.assetTag}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Print this page when a physical asset label is required.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePrintLabel}
                  className="no-print mt-4 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Print Label
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Document Preview
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {["Invoice", "Warranty Card", "Acknowledgement"].map(
                  (document) => (
                    <div
                      key={document}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {document}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        Preview will open here after physical file storage is
                        connected.
                      </p>
                      <button
                        type="button"
                        className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Preview
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="text-lg font-bold text-gray-900">
              Maintenance History
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Maintenance records will be connected from the Maintenance module.
            </p>
          </section>
        </>
      )}
    </LayoutWrapper>
  );
}
