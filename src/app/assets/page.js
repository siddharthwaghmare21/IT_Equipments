"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
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
import { archiveAsset, getAssets } from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { canUseBackupExport, canUseWriteActions } from "@/lib/rbac";
import {
  assetConditions,
  assetStatuses,
  mapAssetFromApi,
} from "@/lib/assetMapper";

const filters = ["All", ...assetStatuses];

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState("");
  const currentUser = readSession();
  const canExportSelected = canUseBackupExport(currentUser);
  const canCreateSelectedWorkflow = canUseWriteActions(currentUser);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAssets(getSessionToken());
      setAssets(response.map(mapAssetFromApi));
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
      const searchText = `
        ${asset.assetTag}
        ${asset.assetName}
        ${asset.category}
        ${asset.brand}
        ${asset.model}
        ${asset.serialNumber}
        ${asset.currentDepartmentName}
        ${asset.custodianDepartmentName}
        ${asset.currentReceiverName}
        ${asset.location}
        ${asset.lifecycleStatus}
        ${asset.workOrderRef}
        ${asset.invoiceNumber}
        ${asset.warrantyExpiry}
        ${asset.assetCondition}
        ${asset.attachmentStatus}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
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
        matchesSearch &&
        matchesFilter &&
        matchesCategory &&
        matchesDepartment &&
        matchesCondition
      );
    });
  }, [assets, search, activeFilter, categoryFilter, departmentFilter, conditionFilter]);

  function toggleAssetSelection(assetId) {
    setSelectedAssets((previousAssets) =>
      previousAssets.includes(assetId)
        ? previousAssets.filter((id) => id !== assetId)
        : [...previousAssets, assetId]
    );
  }

  function clearSelectedAssets() {
    setSelectedAssets([]);
  }

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
      setSelectedAssets((previousAssets) =>
        previousAssets.filter((id) => id !== archiveTarget.id)
      );
      await loadAssets();
    } catch (archiveError) {
      showToast(archiveError.message || "Asset could not be deleted.");
    } finally {
      setIsArchiving(false);
    }
  }

  function applyQuickView(view) {
    if (view === "available-laptops") {
      setSearch("");
      setActiveFilter("Available");
      setCategoryFilter("Laptop");
      setDepartmentFilter("All");
      setConditionFilter("All");
    }

    if (view === "maintenance") {
      setSearch("");
      setActiveFilter("Maintenance");
      setCategoryFilter("All");
      setDepartmentFilter("All");
      setConditionFilter("Needs Repair");
    }

    if (view === "pending-documents") {
      setSearch("");
      setActiveFilter("All");
      setCategoryFilter("All");
      setDepartmentFilter("All");
      setConditionFilter("All");
    }
  }

  const availableCount = assets.filter(
    (asset) => asset.assetStatus === "Available"
  ).length;
  const deliveredCount = assets.filter(
    (asset) => asset.assetStatus === "Delivered"
  ).length;
  const maintenanceCount = assets.filter(
    (asset) => asset.assetStatus === "Maintenance"
  ).length;
  const archivedCount = assets.filter(
    (asset) => asset.assetStatus === "Archived"
  ).length;

  return (
    <LayoutWrapper>
      <PageHeader
        title="Assets"
        description="Manage all IT equipment, assignment status, serial numbers and locations."
      />

      <PageActionBar
        addHref="/assets/add"
        addLabel="Add Asset"
        exportData={filteredAssets}
        exportFileName="assets"
        printTitle="Assets"
        printDescription="Official asset register generated from the current filtered asset records."
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {assets.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Available</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {availableCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Delivered</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {deliveredCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Maintenance</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {maintenanceCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Archived</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {archivedCount}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by asset tag, name, serial number, department, work order ref or location..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickView("available-laptops")}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Available Laptops
            </button>
            <button
              type="button"
              onClick={() => applyQuickView("maintenance")}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Repair Queue
            </button>
            <button
              type="button"
              onClick={() => applyQuickView("pending-documents")}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Pending Documents
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department === "All" ? "All Departments" : department}
                </option>
              ))}
            </select>

            <select
              value={conditionFilter}
              onChange={(event) => setConditionFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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

      {activeFilter === "Archived" && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Archive View
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                Read-only asset records for audit trail
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Archived assets stay available for audit, reports and lifecycle
                history.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
              Backend connected
            </span>
          </div>
        </section>
      )}

      {selectedAssets.length > 0 && (
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-gray-900">
              {selectedAssets.length} assets selected
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {canExportSelected && (
                <button
                  type="button"
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Export Selected
                </button>
              )}
              {canCreateSelectedWorkflow && (
                <button
                  type="button"
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Create Maintenance
                </button>
              )}
              <button
                type="button"
                onClick={clearSelectedAssets}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        </section>
      )}

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
          <CompactRecordList
            records={filteredAssets}
            titleKey="assetTag"
            subtitleKey="assetName"
            meta={[
              { label: "Category", key: "category" },
              { label: "Location", key: "location" },
              { label: "Department", key: "currentDepartmentName" },
              { label: "Warranty", key: "warrantyExpiry" },
            ]}
            statusRender={(asset) => <StatusBadge status={asset.assetStatus} />}
            viewHref={(asset) => `/assets/view/${asset.id}`}
            editHref={(asset) => `/assets/edit/${asset.id}`}
            onArchive={setArchiveTarget}
            emptyTitle="No assets found"
            emptyDescription="Try changing search, status, category, department or condition filters."
          />

          <div className="hidden md:block">
            <TableWrapper>
              <table className="min-w-[1500px] w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Select
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Asset Tag
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Asset Name
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Serial No.
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Department
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Receiver
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Lifecycle
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Warranty
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Documents
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => toggleAssetSelection(asset.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                          aria-label={`Select ${asset.assetTag}`}
                        />
                      </td>

                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {asset.assetTag}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.assetName}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.category}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.serialNumber}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.currentDepartmentName ||
                          asset.custodianDepartmentName ||
                          "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.currentReceiverName || "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.lifecycleStatus}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.warrantyExpiry || "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {asset.attachmentStatus}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={asset.assetStatus} />
                      </td>

                      <td className="px-4 py-4">
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
