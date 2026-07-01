"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import {
  getActivityLogs,
  getAssets,
  getDeliveries,
  getMaintenanceRecords,
  getPendingUserAccessApprovals,
  getReturns,
  getTransfers,
  getVendors,
  getWorkOrders,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { mapAssetFromApi } from "@/lib/assetMapper";
import { mapDeliveryFromApi } from "@/lib/deliveryMapper";
import { mapMaintenanceFromApi } from "@/lib/maintenanceMapper";
import { mapReturnFromApi } from "@/lib/returnMapper";
import { mapTransferFromApi } from "@/lib/transferMapper";
import { mapVendorFromApi } from "@/lib/vendorMapper";
import { mapWorkOrderFromApi } from "@/lib/workOrderMapper";
import { canAccessPath } from "@/lib/rbac";

const emptyDashboardRecords = {
  assets: [],
  workOrders: [],
  deliveries: [],
  transfers: [],
  returns: [],
  maintenance: [],
  vendors: [],
  activityLogs: [],
  accessRequests: [],
};

function percentWidth(value, total) {
  if (!total) return "0%";
  return `${Math.min(Math.round((value / total) * 100), 100)}%`;
}

function isOpenStatus(status) {
  return !["Completed", "Cancelled", "Rejected", "Returned"].includes(status);
}

function isWarrantyExpiringSoon(asset) {
  if (!asset.warrantyExpiry) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const warrantyDate = new Date(asset.warrantyExpiry);
  const daysLeft = (warrantyDate - today) / (1000 * 60 * 60 * 24);

  return daysLeft >= 0 && daysLeft <= 30;
}

function buildAssetSummary(assets) {
  const summary = new Map();

  assets.forEach((asset) => {
    const category = asset.category || "Other";
    const current = summary.get(category) || {
      category,
      total: 0,
      delivered: 0,
      available: 0,
      maintenance: 0,
    };

    current.total += 1;
    if (asset.assetStatus === "Delivered" || asset.lifecycleStatus === "In Use") {
      current.delivered += 1;
    }
    if (asset.assetStatus === "Available") {
      current.available += 1;
    }
    if (
      asset.assetStatus === "Maintenance" ||
      asset.lifecycleStatus === "Under Maintenance"
    ) {
      current.maintenance += 1;
    }

    summary.set(category, current);
  });

  return Array.from(summary.values()).sort((first, second) =>
    first.category.localeCompare(second.category)
  );
}

function formatActivityDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser] = useState(() => {
    if (typeof window === "undefined") {
      return {
        fullName: "Frontend Review User",
        role: "Super Admin",
      };
    }

    const savedSession = readSession();

    return (
      savedSession || {
        fullName: "Frontend Review User",
        role: "Super Admin",
      }
    );
  });
  const [previewRole, setPreviewRole] = useState(currentUser?.role || "Super Admin");
  const [dashboardRecords, setDashboardRecords] = useState(emptyDashboardRecords);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    const token = getSessionToken();
    const session = readSession();

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const coreRequests = await Promise.all([
        getAssets(token),
        getWorkOrders(token),
        getDeliveries(token),
        getTransfers(token),
        getReturns(token),
        getMaintenanceRecords(token),
        getVendors(token),
      ]);
      const [assets, workOrders, deliveries, transfers, returns, maintenance, vendors] =
        coreRequests;

      const canLoadAdminWidgets =
        session?.roleCode === "SUPER_ADMIN" || session?.roleCode === "ADMIN";
      const [activityLogResult, accessRequestResult] = canLoadAdminWidgets
        ? await Promise.allSettled([
            getActivityLogs(token, 5),
            getPendingUserAccessApprovals(token),
          ])
        : [{ status: "fulfilled", value: [] }, { status: "fulfilled", value: [] }];

      setDashboardRecords({
        assets: (assets || []).map(mapAssetFromApi),
        workOrders: (workOrders || []).map(mapWorkOrderFromApi),
        deliveries: (deliveries || []).map(mapDeliveryFromApi),
        transfers: (transfers || []).map(mapTransferFromApi),
        returns: (returns || []).map(mapReturnFromApi),
        maintenance: (maintenance || []).map(mapMaintenanceFromApi),
        vendors: (vendors || []).map(mapVendorFromApi),
        activityLogs:
          activityLogResult.status === "fulfilled" ? activityLogResult.value || [] : [],
        accessRequests:
          accessRequestResult.status === "fulfilled"
            ? accessRequestResult.value || []
            : [],
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to load dashboard records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const {
    assets,
    workOrders,
    deliveries,
    transfers,
    returns,
    maintenance,
    vendors,
    activityLogs,
    accessRequests,
  } = dashboardRecords;

  const deliveredAssets = assets.filter(
    (asset) => asset.assetStatus === "Delivered" || asset.lifecycleStatus === "In Use"
  ).length;
  const availableAssets = assets.filter(
    (asset) => asset.assetStatus === "Available"
  ).length;
  const maintenanceAssets = assets.filter(
    (asset) =>
      asset.assetStatus === "Maintenance" ||
      asset.lifecycleStatus === "Under Maintenance"
  ).length;
  const openMaintenance = maintenance.filter((record) =>
    isOpenStatus(record.maintenanceStatus)
  ).length;
  const highPriorityMaintenance = maintenance.filter(
    (record) =>
      ["High", "Critical"].includes(record.priority) &&
      isOpenStatus(record.maintenanceStatus)
  ).length;

  const stats = [
    {
      title: "Total Assets",
      value: String(assets.length),
      description: "Registered IT equipment",
      trend: `${assets.filter((asset) => asset.createdAt).length} records synced`,
    },
    {
      title: "Delivered Assets",
      value: String(deliveredAssets),
      description: "Issued to departments",
      trend: `${percentWidth(deliveredAssets, assets.length)} allocation`,
    },
    {
      title: "Available Assets",
      value: String(availableAssets),
      description: "Ready for delivery",
      trend: `${availableAssets} assets available`,
    },
    {
      title: "Under Maintenance",
      value: String(maintenanceAssets || openMaintenance),
      description: "Repair or service active",
      trend: `${highPriorityMaintenance} high priority`,
    },
  ];

  const assetSummary = buildAssetSummary(assets);

  const chartData = [
    { label: "Assets", value: assets.length, width: assets.length ? "100%" : "0%" },
    {
      label: "Delivered",
      value: deliveredAssets,
      width: percentWidth(deliveredAssets, assets.length),
    },
    {
      label: "Available",
      value: availableAssets,
      width: percentWidth(availableAssets, assets.length),
    },
    {
      label: "Maintenance",
      value: maintenanceAssets || openMaintenance,
      width: percentWidth(maintenanceAssets || openMaintenance, assets.length),
    },
  ];

  const lowStockItems = [
    {
      item: "Inventory Thresholds",
      stock: "Phase 7",
      minimum: "Import/Export",
    },
  ];

  const workflowSummary = [
    {
      title: "Pending Deliveries",
      value: String(
        deliveries.filter((delivery) => delivery.deliveryStatus === "Pending").length
      ),
      description: "Not yet delivered",
      href: "/deliveries",
    },
    {
      title: "Pending Transfers",
      value: String(
        transfers.filter((transfer) => isOpenStatus(transfer.transferStatus)).length
      ),
      description: "Movement or reassignment open",
      href: "/transfers",
    },
    {
      title: "Purchase Approvals",
      value: String(
        workOrders.filter((workOrder) => workOrder.approvalStatus === "Pending")
          .length
      ),
      description: "Pending procurement review",
      href: "/purchases",
    },
    {
      title: "Vendor Reviews",
      value: String(
        vendors.filter((vendor) => vendor.complianceStatus === "Review Required")
          .length
      ),
      description: "Compliance needs attention",
      href: "/vendors",
    },
  ];

  const alerts = [
    {
      title: "Warranty Expiring Soon",
      detail: `${assets.filter(isWarrantyExpiringSoon).length} assets need warranty review`,
      href: "/reports/warranty",
    },
    {
      title: "High Priority Maintenance",
      detail: `${highPriorityMaintenance} repair records require follow-up`,
      href: "/maintenance",
    },
    {
      title: "Damaged Asset Decisions",
      detail: `${
        returns.filter((record) => record.damageDecision === "Pending").length
      } inspection decisions pending`,
      href: "/reports/damaged",
    },
  ];

  const recentActivities = activityLogs.map((activity) => ({
    title: activity.actionName || activity.ActionName || "System activity",
    meta: `${activity.moduleName || activity.ModuleName || "System"} | ${formatActivityDate(
      activity.createdAt || activity.CreatedAt
    )}`,
  }));

  const roleActions = {
    "Super Admin": [
      { label: "Review Access Requests", href: "/admin-request-management" },
      { label: "Manage Users", href: "/admin-user-management" },
      { label: "Open Backup Settings", href: "/settings" },
    ],
    Admin: [
      { label: "Approve Requests", href: "/admin-request-management" },
      { label: "Asset Workflow", href: "/assets" },
      { label: "Transfers", href: "/transfers" },
    ],
    Employee: [
      { label: "Add Asset", href: "/assets/add" },
      { label: "Create Delivery", href: "/deliveries/delivery" },
      { label: "Create Transfer", href: "/transfers/add" },
    ],
    Viewer: [
      { label: "Asset Reports", href: "/reports/assets" },
      { label: "Warranty Reports", href: "/reports/warranty" },
      { label: "Activity Logs", href: "/activity-logs" },
    ],
  };

  const dueDates = [
    ...assets
      .filter(isWarrantyExpiringSoon)
      .slice(0, 4)
      .map((asset) => ({
        date: asset.warrantyExpiry,
        title: "Warranty review",
        meta: asset.assetTag || asset.assetName,
      })),
  ];

  const visibleRoleActions =
    (roleActions[previewRole] || roleActions.Employee).filter((action) =>
      canAccessPath(currentUser, action.href)
    );
  const dataQualityItems = [
    {
      label: "Missing Serial Numbers",
      value: String(assets.filter((asset) => !asset.serialNumber).length),
      status: "Review",
    },
    {
      label: "Missing Warranty Dates",
      value: String(assets.filter((asset) => !asset.warrantyExpiry).length),
      status: "Action Needed",
    },
    {
      label: "Pending Documents",
      value: String(
        assets.filter((asset) => asset.attachmentStatus === "Pending").length
      ),
      status: "Follow-up",
    },
    {
      label: "Pending Access Requests",
      value: String(accessRequests.length),
      status: accessRequests.length ? "Review" : "Clean",
    },
  ];
  const reportShortcuts = [
    {
      title: "Assets Report",
      description: "Asset status and category summary",
      href: "/reports/assets",
    },
    {
      title: "Warranty Report",
      description: "Expiry and support follow-up",
      href: "/reports/warranty",
    },
    {
      title: "Maintenance Report",
      description: "Repair SLA and vendor summary",
      href: "/reports/maintenance",
    },
    {
      title: "Transfers Report",
      description: "Movement and reassignment summary",
      href: "/reports/transfers",
    },
    {
      title: "Damaged Assets Report",
      description: "Inspection and decision status",
      href: "/reports/damaged",
    },
  ];
  const rolePermissionPreview = {
    "Super Admin": [
      "Full access",
      "User approval",
      "Role management",
      "Backup and export control",
    ],
    Admin: [
      "Most module access",
      "Request approvals",
      "Asset workflow control",
      "Backup access",
    ],
    Employee: [
      "Add/update workflow records",
      "Delivery and maintenance approvals",
      "Reports access",
      "Backup access",
    ],
    Viewer: [
      "Read-only reports",
      "No approval rights",
      "No edit actions",
      "No backup access",
    ],
  };

  return (
    <LayoutWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of IT assets, equipment delivery and maintenance activity.
        </p>
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading dashboard"
          description="Fetching operational summary from backend modules."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load dashboard"
          description={error}
          onRetry={loadDashboard}
        />
      ) : (
        <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{item.title}</p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {item.value}
            </h2>

            <p className="mt-2 text-xs text-gray-500">{item.description}</p>
            <p className="mt-3 text-xs font-semibold text-gray-700">
              {item.trend}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workflowSummary.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => router.push(item.href)}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-gray-300 hover:bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-500">{item.title}</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {item.value}
            </h2>
            <p className="mt-2 text-xs text-gray-500">{item.description}</p>
          </button>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Role Based Actions
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Preview quick actions before backend permissions are connected.
              </p>
            </div>
            <select
              value={previewRole}
              onChange={(event) => setPreviewRole(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 sm:w-48"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {visibleRoleActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => router.push(action.href)}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-800 hover:bg-white"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {rolePermissionPreview[previewRole].map((permission) => (
              <div
                key={permission}
                className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700"
              >
                {permission}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Due Dates</h2>
          <div className="mt-4 space-y-3">
            {dueDates.map((item) => (
              <div
                key={`${item.date}-${item.title}`}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-xs font-bold text-gray-500">{item.date}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">{item.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Data Quality Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Frontend checks that will become backend validation rules later.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          {dataQualityItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-600">
                {item.status}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Report Shortcuts
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Open management reports directly from dashboard review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
          >
            All Reports
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {reportShortcuts.map((report) => (
            <button
              key={report.href}
              type="button"
              aria-label={`Open ${report.title}`}
              onClick={() => router.push(report.href)}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-left hover:bg-white"
            >
              <p className="text-sm font-bold text-gray-900">
                {report.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                {report.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Asset Summary
              </h2>
              <p className="text-sm text-gray-500">
                Current equipment distribution
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/assets")}
              className="inline-flex w-full justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
            >
              View Assets
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Delivered
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Available
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Maintenance
                  </th>
                </tr>
              </thead>

              <tbody>
                {assetSummary.map((row) => (
                  <tr key={row.category} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.category}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.total}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.delivered}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.available}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.maintenance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>

          <div className="mt-4 space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.title}-${activity.meta}-${index}`}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-sm font-semibold text-gray-800">
                  {activity.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">{activity.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">
            Operational Alerts
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {alerts.map((alert) => (
              <button
                key={alert.title}
                type="button"
                onClick={() => router.push(alert.href)}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-left hover:border-gray-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {alert.title}
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {alert.detail}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">System Readiness</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Frontend Build</span>
              <span className="font-semibold text-green-700">Passing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Backend</span>
              <span className="font-semibold text-yellow-700">Pending</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database</span>
              <span className="font-semibold text-yellow-700">MySQL Pending</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">
            Asset Distribution Chart
          </h2>

          <div className="mt-5 space-y-4">
            {chartData.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-gray-900"
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Low Stock Alerts</h2>

          <div className="mt-4 space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.item}
                className="rounded-xl border border-red-100 bg-red-50 p-3"
              >
                <p className="text-sm font-semibold text-red-800">
                  {item.item}
                </p>
                <p className="mt-1 text-xs text-red-700">
                  Stock {item.stock} / Minimum {item.minimum}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
      )}
    </LayoutWrapper>
  );
}
