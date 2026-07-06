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
import { getReturns, rejectReturn } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapReturnFromApi, returnStatuses } from "@/lib/returnMapper";

const filters = ["All", ...returnStatuses];

function ReturnStatusBadge({ status }) {
  const statusStyles = {
    Returned: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Damaged: "bg-red-100 text-red-700 border-red-200",
    "Pending Inspection": "bg-amber-100 text-amber-700 border-amber-200",
    "Under Review": "bg-sky-100 text-sky-700 border-sky-200",
    Rejected: "bg-slate-100 text-slate-700 border-slate-200",
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

export default function ReturnsPage() {
  const [returnRecords, setReturnRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReturns = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getReturns(token);
      setReturnRecords((data || []).map(mapReturnFromApi));
    } catch (requestError) {
      setError(requestError.message || "Unable to load returns.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReturns();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReturns]);

  const filteredReturnRecords = useMemo(() => {
    return returnRecords.filter((returnItem) => {
      const searchText = `
        ${returnItem.returnCode}
        ${returnItem.deliveryCode}
        ${returnItem.assetTag}
        ${returnItem.assetName}
        ${returnItem.returnedByName}
        ${returnItem.departmentName}
        ${returnItem.returnCondition}
        ${returnItem.receivedByName}
        ${returnItem.receivedLocation}
        ${returnItem.acknowledgementStatus}
        ${returnItem.inspectionStatus}
        ${returnItem.inspectionByName}
        ${returnItem.damageDecision}
        ${returnItem.returnStatus}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || returnItem.returnStatus === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [returnRecords, search, activeFilter]);

  async function confirmReject() {
    const token = getSessionToken();

    if (!token || !rejectTarget) {
      return;
    }

    try {
      await rejectReturn(rejectTarget.returnId, token);
      showToast("Return rejected successfully.");
      setRejectTarget(null);
      await loadReturns();
    } catch (requestError) {
      showToast(requestError.message || "Unable to reject return.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Returns"
        description="Manage returned IT assets, return condition, received-by details and inspection status."
      />

      <PageActionBar
        addHref="/returns/add"
        addLabel="Add Return"
        exportData={filteredReturnRecords}
        exportFileName="returns"
        printTitle="Returns"
        printDescription="Official return register generated from the current filtered return records."
      />

      {isLoading ? (
        <LoadingState
          title="Loading returns"
          description="Fetching return records from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load returns"
          description={error}
          actionLabel="Retry"
          onAction={loadReturns}
        />
      ) : (
        <>
          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by return code, asset tag, returned by, inspection, location or status..."
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
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <CompactRecordList
            records={filteredReturnRecords}
            titleKey="returnCode"
            subtitleKey="assetName"
            meta={[
              { label: "Returned By", key: "returnedByName" },
              { label: "Return Date", key: "returnDate" },
              { label: "Condition", key: "returnCondition" },
              { label: "Inspection", key: "inspectionStatus" },
            ]}
            statusRender={(returnItem) => (
              <ReturnStatusBadge status={returnItem.returnStatus} />
            )}
            viewHref={(returnItem) => `/returns/view/${returnItem.id}`}
            editHref={(returnItem) => `/returns/edit/${returnItem.id}`}
            onArchive={setRejectTarget}
            archiveLabel="Reject"
            emptyTitle="No return records found"
            emptyDescription="Try changing receiver, asset, inspection or status filters."
          />

          <div className="hidden md:block">
            <TableWrapper>
              <table className="min-w-[1500px] w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Return Code
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Delivery
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Asset
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Returned By
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Department
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Return Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Condition
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Inspection
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Damage Decision
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReturnRecords.map((returnItem) => (
                    <tr
                      key={returnItem.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        {returnItem.returnCode}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {returnItem.deliveryCode || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        <p className="font-medium text-slate-950">
                          {returnItem.assetTag}
                        </p>
                        <p className="text-xs text-slate-500">
                          {returnItem.assetName || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {returnItem.returnedByName}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {returnItem.departmentName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {returnItem.returnDate}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {returnItem.returnCondition}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {returnItem.inspectionStatus}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {returnItem.damageDecision}
                      </td>
                      <td className="px-4 py-4">
                        <ReturnStatusBadge status={returnItem.returnStatus} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <ActionButtons
                          viewHref={`/returns/view/${returnItem.id}`}
                          editHref={`/returns/edit/${returnItem.id}`}
                          onDelete={() => setRejectTarget(returnItem)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrapper>
          </div>

          {filteredReturnRecords.length === 0 && (
            <EmptyState
              title="No return records found"
              description="Try changing search/filter or add a new return."
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject return?"
        description={`This will mark ${
          rejectTarget?.returnCode || "this return"
        } as rejected.`}
        confirmLabel="Reject Return"
        onCancel={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </LayoutWrapper>
  );
}
