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
import { getReturns, rejectReturn } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import { mapReturnFromApi, returnStatuses } from "@/lib/returnMapper";

const filters = ["All", ...returnStatuses];
const printColumns = [
  { key: "returnCode", label: "Return Code" },
  { key: "deliveryCode", label: "Delivery" },
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "returnedByName", label: "Returned By" },
  { key: "departmentName", label: "Department" },
  { key: "returnCondition", label: "Condition" },
  { key: "returnStatus", label: "Status" },
];

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
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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
      const matchesFilter =
        activeFilter === "All" || returnItem.returnStatus === activeFilter;

      return matchesFilter;
    });
  }, [returnRecords, activeFilter]);

  const pagedReturnRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredReturnRecords.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredReturnRecords]);

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
      />

      <PageActionBar
        addHref="/returns/add"
        addLabel="Add Return"
        exportData={filteredReturnRecords}
        exportFileName="returns"
        printTitle="Returns"
        printColumns={printColumns}
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
              <table className="min-w-[1500px] w-full text-sm">
                <thead className="bg-[#101a2b] text-center">
                  <tr className="border-b border-[#263754]">
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Return Code
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Delivery
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Asset
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Returned By
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Department
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Return Date
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Condition
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Inspection
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Damage Decision
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-[#8fa4c7]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263754] bg-[#18253d]">
                  {pagedReturnRecords.map((returnItem) => (
                    <tr
                      key={returnItem.id}
                      className="hover:bg-[#1f2f4a]"
                    >
                      <td className="text-center px-4 py-4 font-semibold text-white">
                        {returnItem.returnCode}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {returnItem.deliveryCode || "-"}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        <p className="font-medium text-white">
                          {returnItem.assetTag}
                        </p>
                        <p className="text-xs text-[#8fa4c7]">
                          {returnItem.assetName || "-"}
                        </p>
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {returnItem.returnedByName}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {returnItem.departmentName || "-"}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {returnItem.returnDate}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {returnItem.returnCondition}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {returnItem.inspectionStatus}
                      </td>
                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {returnItem.damageDecision}
                      </td>
                      <td className="text-center px-4 py-4">
                        <ReturnStatusBadge status={returnItem.returnStatus} />
                      </td>
                      <td className="px-4 py-4 text-center">
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

          {filteredReturnRecords.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredReturnRecords.length}
              pageSize={10}
              onPageChange={setCurrentPage}
              itemLabel="returns"
            />
          )}

          {filteredReturnRecords.length === 0 && (
            <EmptyState
              title="No return records found"
              description="Try changing search/filter or add a new return."
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(rejectTarget)}
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
