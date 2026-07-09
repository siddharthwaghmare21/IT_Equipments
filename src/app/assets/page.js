"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
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
import { archiveAsset, getAssets } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";
import {
  assetConditions,
  assetStatuses,
  mapAssetFromApi,
} from "@/lib/assetMapper";

const activeListStatuses = assetStatuses.filter(
  (status) => status !== "Archived" && status !== "Scrapped"
);
const filters = ["All", ...activeListStatuses];
const printColumns = [
  { key: "assetTag", label: "Asset Tag" },
  { key: "assetName", label: "Asset Name" },
  { key: "category", label: "Category" },
  { key: "serialNumber", label: "Serial No." },
  { key: "currentDepartmentName", label: "Department" },
  { key: "currentReceiverName", label: "Receiver" },
  { key: "lifecycleStatus", label: "Lifecycle" },
  { key: "assetStatus", label: "Status" },
];

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState("");

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAssets(getSessionToken());
      setAssets(
        response
          .map(mapAssetFromApi)
          .filter(
            (asset) =>
              asset.assetStatus !== "Archived" &&
              asset.lifecycleStatus !== "Archived"
          )
      );
    } catch (loadError) {
      setError(loadError.message || "Assets could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAssets();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadAssets]);

  const categoryOptions = useMemo(() => {
    return ["All", ...new Set(assets.map((asset) => asset.category).filter(Boolean))];
  }, [assets]);

  const departmentOptions = useMemo(() => {
    return [
      "All",
      ...new Set(
        assets
          .map((asset) => asset.currentDepartmentName || asset.custodianDepartmentName)
          .filter(Boolean)
      ),
    ];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesFilter =
        activeFilter === "All" || asset.assetStatus === activeFilter;
      const matchesCategory =
        categoryFilter === "All" || asset.category === categoryFilter;
      const assetDepartment =
        asset.currentDepartmentName || asset.custodianDepartmentName;
      const matchesDepartment =
        departmentFilter === "All" || assetDepartment === departmentFilter;
      const matchesCondition =
        conditionFilter === "All" || asset.assetCondition === conditionFilter;

      return (
        matchesFilter &&
        matchesCategory &&
        matchesDepartment &&
        matchesCondition
      );
    });
  }, [assets, activeFilter, categoryFilter, departmentFilter, conditionFilter]);

  const pagedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredAssets.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredAssets]);

  async function confirmArchive() {
    if (!archiveTarget) return;

    setIsArchiving(true);

    try {
      await archiveAsset(
        archiveTarget.assetId,
        `Deleted from assets page: ${archiveTarget.assetTag}`,
        getSessionToken()
      );
      showToast(`Asset ${archiveTarget.assetTag} deleted successfully.`);
      setArchiveTarget(null);
      await loadAssets();
    } catch (archiveError) {
      showToast(archiveError.message || "Asset could not be deleted.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Assets"
      />

      <PageActionBar
        addHref="/assets/add"
        addLabel="Add Asset"
        exportData={filteredAssets}
        exportFileName="assets"
        printTitle="Assets"
        printColumns={printColumns}
        printDescription="Official asset register generated from the current filtered asset records."
      />

      <section className="mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] p-3 shadow-[0_12px_28px_rgba(6,12,24,0.12)]">
        <div className="flex flex-col gap-3">
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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-[#7c4cf3]"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(event) => {
                setDepartmentFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-[#7c4cf3]"
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department === "All" ? "All Departments" : department}
                </option>
              ))}
            </select>

            <select
              value={conditionFilter}
              onChange={(event) => {
                setConditionFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-[#7c4cf3]"
            >
              <option value="All">All Conditions</option>
              {assetConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {isLoading && (
        <LoadingState
          title="Loading assets"
          description="Fetching asset records from backend."
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Assets could not be loaded"
          description={error}
          onRetry={loadAssets}
        />
      )}

      {!isLoading && !error && (
        <>


          <div>
            <TableWrapper>
              <table className="min-w-[1500px] w-full text-sm">
                <thead className="bg-[#101a2b] text-center">
                  <tr className="border-b border-slate-200">
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Asset Tag
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Asset Name
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Category
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Serial No.
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Department
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Receiver
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Lifecycle
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Warranty
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Documents
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-[#8fa4c7]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#263754] bg-[#18253d]">
                  {pagedAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-[#1f2f4a]"
                    >
                      <td className="text-center px-4 py-4 font-semibold text-white">
                        {asset.assetTag}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.assetName}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.category}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.serialNumber}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.currentDepartmentName ||
                          asset.custodianDepartmentName ||
                          "-"}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.currentReceiverName || "-"}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.lifecycleStatus}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.warrantyExpiry || "-"}
                      </td>

                      <td className="text-center px-4 py-4 text-[#c8d4ec]">
                        {asset.attachmentStatus}
                      </td>

                      <td className="text-center px-4 py-4">
                        <StatusBadge status={asset.assetStatus} />
                      </td>

                      <td className="text-center px-4 py-4">
                        <ActionButtons
                          viewHref={`/assets/view/${asset.id}`}
                          updateHref={`/assets/edit/${asset.id}`}
                          onDelete={() => setArchiveTarget(asset)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAssets.length === 0 && (
                <div className="p-6">
                  <EmptyState
                    title="No assets found"
                    description="Try changing search, status, category, department or condition filters."
                  />
                </div>
              )}
              {filteredAssets.length > 0 && (
                <TablePagination
                  currentPage={currentPage}
                  totalItems={filteredAssets.length}
                  pageSize={10}
                  onPageChange={setCurrentPage}
                  itemLabel="assets"
                />
              )}
            </TableWrapper>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        title="Delete asset?"
        description={`Asset ${
          archiveTarget?.assetTag || ""
        } will be removed from active asset lists. Lifecycle history will remain available for audit and reports.`}
        confirmLabel={isArchiving ? "Deleting..." : "Delete"}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
