"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import pkg from "../../../package.json";
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

const websiteVersion = pkg.version || "1.0.0";

function buildMonthlyTrend(records, dateKeys) {
  const monthFormatter = new Intl.DateTimeFormat("en-IN", {
    month: "short",
  });
  const buckets = new Map();
  const today = new Date();

  for (let monthOffset = 5; monthOffset >= 0; monthOffset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, {
      label: monthFormatter.format(date),
      value: 0,
    });
  }

  records.forEach((record) => {
    const dateValue = dateKeys.map((key) => record[key]).find(Boolean);
    if (!dateValue) return;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.value += 1;
    }
  });

  return Array.from(buckets.values());
}

function DashboardIcon({ children, tone = "violet" }) {
  const tones = {
    violet: "bg-violet-100 text-violet-700",
    cyan: "bg-cyan-100 text-cyan-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function MiniIcon({ type }) {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-5 w-5",
  };

  const paths = {
    assets: (
      <>
        <path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z" />
        <path d="M4 12.5 12 17l8-4.5" />
        <path d="M4 17.5 12 22l8-4.5" />
      </>
    ),
    delivered: (
      <>
        <path d="M4 7h11v10H4z" />
        <path d="M15 10h3l2 3v4h-5z" />
        <path d="M7 17.5h.01" />
        <path d="M17 17.5h.01" />
      </>
    ),
    available: (
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    ),
    maintenance: (
      <>
        <path d="m14.7 6.3 3 3" />
        <path d="M5 19l4.5-1 8.2-8.2a2.1 2.1 0 0 0-3-3L6.5 15 5 19Z" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[type]}</svg>;
}

function DonutChart({ title, value, total, color = "#7c3aed", items = [] }) {
  const safeTotal = total || 1;
  const percent = Math.round((value / safeTotal) * 100);

  return (
    <div className="rounded-[24px] border border-[#edf0f8] bg-white p-5 shadow-[0_16px_40px_rgba(163,176,204,0.14)] dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-950">{title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {value} of {total} records
          </p>
        </div>
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${percent}%, #eceef5 ${percent}% 100%)`,
          }}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fafbff] dark:bg-slate-900">
            <span className="text-base font-bold text-slate-950">{percent}%</span>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-3 grid gap-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PieChartCard({ title, description, items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;
  const gradientStops = items
    .map((item) => {
      const start = offset;
      const size = total ? (item.value / total) * 100 : 0;
      offset += size;
      return `${item.color} ${start}% ${offset}%`;
    })
    .join(", ");
  const background = total ? `conic-gradient(${gradientStops})` : "#e2e8f0";

  return (
    <div className="rounded-[24px] border border-[#edf0f8] bg-white p-5 shadow-[0_16px_40px_rgba(163,176,204,0.14)] dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{ background }}
        >
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fafbff] text-center shadow-sm dark:bg-slate-900">
            <span className="text-xl font-bold text-slate-950">{total}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-bold text-slate-950">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-[#eceef5] dark:bg-slate-800">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${total ? Math.round((item.value / total) * 100) : 0}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChartCard({ title, description, points }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const chartPoints = points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 100 - (point.value / maxValue) * 80 - 10;
    return { ...point, x, y };
  });
  const polyline = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-[24px] border border-[#edf0f8] bg-white p-5 shadow-[0_16px_40px_rgba(163,176,204,0.14)] dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
          Monthly
        </span>
      </div>

      <div className="mt-4 rounded-[20px] bg-[#f8f9fe] p-4 dark:bg-slate-800">
        <svg
          aria-label={title}
          viewBox="0 0 100 100"
          className="h-44 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {[20, 40, 60, 80].map((line) => (
            <line
              key={line}
              x1="0"
              x2="100"
              y1={line}
              y2={line}
              stroke="#e5e9f4"
              strokeWidth="0.8"
            />
          ))}
          <polyline
            fill="none"
            points={polyline}
            stroke="#fb7185"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {chartPoints.map((point) => (
            <circle
              key={point.label}
              cx={point.x}
              cy={point.y}
              r="2.4"
              fill="#fff"
              stroke="#fb7185"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="mt-3 grid grid-cols-6 gap-2 text-center text-xs text-slate-500 dark:text-slate-300">
          {chartPoints.map((point) => (
            <div key={point.label}>
              <p className="font-bold text-slate-900 dark:text-slate-100">{point.value}</p>
              <p className="mt-1 truncate">{point.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
      tone: "violet",
      icon: "assets",
    },
    {
      title: "Delivered Assets",
      value: String(deliveredAssets),
      description: "Issued to departments",
      trend: `${percentWidth(deliveredAssets, assets.length)} allocation`,
      tone: "cyan",
      icon: "delivered",
    },
    {
      title: "Available Assets",
      value: String(availableAssets),
      description: "Ready for delivery",
      trend: `${availableAssets} assets available`,
      tone: "emerald",
      icon: "available",
    },
    {
      title: "Under Maintenance",
      value: String(maintenanceAssets || openMaintenance),
      description: "Repair or service active",
      trend: `${highPriorityMaintenance} high priority`,
      tone: "rose",
      icon: "maintenance",
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
  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);
  const utilizationPercent = assets.length
    ? Math.round((deliveredAssets / assets.length) * 100)
    : 0;
  const dashboardHealth =
    highPriorityMaintenance > 0 || maintenanceAssets > 0
      ? "Needs Review"
      : "Stable";
  const activityTrendBars = chartData.map((item) => ({
    ...item,
    height: `${Math.max(Math.round((item.value / maxChartValue) * 100), item.value ? 18 : 6)}%`,
  }));
  const assetStatusPie = [
    {
      label: "Delivered",
      value: deliveredAssets,
      color: "#7c3aed",
    },
    {
      label: "Available",
      value: availableAssets,
      color: "#14b8a6",
    },
    {
      label: "Maintenance",
      value: maintenanceAssets,
      color: "#fb7185",
    },
    {
      label: "Other",
      value: Math.max(
        assets.length - deliveredAssets - availableAssets - maintenanceAssets,
        0
      ),
      color: "#94a3b8",
    },
  ];
  const workflowPie = [
    {
      label: "Deliveries",
      value: deliveries.filter((delivery) => delivery.deliveryStatus === "Pending")
        .length,
      color: "#38bdf8",
    },
    {
      label: "Transfers",
      value: transfers.filter((transfer) => isOpenStatus(transfer.transferStatus))
        .length,
      color: "#8b5cf6",
    },
    {
      label: "Purchases",
      value: workOrders.filter(
        (workOrder) => workOrder.approvalStatus === "Pending"
      ).length,
      color: "#f97316",
    },
    {
      label: "Maintenance",
      value: openMaintenance,
      color: "#ef4444",
    },
  ];
  const maintenanceTrend = buildMonthlyTrend(maintenance, [
    "reportedDate",
    "scheduledDate",
    "createdAt",
  ]);

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

  const currentRole = currentUser?.role || "Employee";
  const visibleRoleActions =
    (roleActions[currentRole] || roleActions.Employee).filter((action) =>
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
      <div className="mb-5">
        <h1 className="text-[2rem] font-bold text-slate-900 dark:text-white">
          Overview
        </h1>
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
      <section className="overflow-hidden rounded-[30px] border border-[#2c3f63] bg-[#16233c]">
        <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => router.push(item.icon === "assets" ? "/assets" : "/dashboard")}
              className="group flex min-h-[132px] items-center gap-4 border-b border-[#2c3f63] px-5 py-4 text-left transition hover:bg-[#1b2a46] xl:border-b-0 xl:border-r xl:last:border-r-0"
            >
              <DashboardIcon tone={item.tone}>
                <MiniIcon type={item.icon} />
              </DashboardIcon>
              <span className="min-w-0 flex-1">
                <span className="block text-3xl font-black text-white">
                  {item.value}
                </span>
                <span className="mt-1 block text-sm font-semibold text-[#dce7ff]">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#8fa4c7]">
                  {item.trend}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_320px]">
        <div className="overflow-hidden rounded-[28px] border border-[#2c3f63] bg-[#16233c]">
          <div className="flex flex-col gap-2 border-b border-[#edf0f8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <div>
              <h2 className="text-[1.1rem] font-bold text-white">
                Asset Operations Trend
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Distribution from backend-connected asset records
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              Live Data
            </span>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_230px]">
            <div className="flex h-64 items-end gap-3 rounded-[24px] border border-[#2c3f63] bg-[#101a2b] px-4 py-5">
              {activityTrendBars.map((item) => (
                <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                  <div className="flex h-40 w-full items-end rounded-[18px] border border-dashed border-[#314666] bg-[#16233c] px-2 pb-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-emerald-400"
                      style={{ height: item.height }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white">{item.value}</p>
                    <p className="mt-1 truncate text-xs text-[#8fa4c7]">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-between rounded-[24px] bg-[linear-gradient(180deg,#6a3df0_0%,#0ea5e9_100%)] p-5 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">
                  Utilization
                </p>
                <div
                  className="mx-auto mt-4 grid h-28 w-28 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#ffffff ${utilizationPercent}%, rgba(255,255,255,.22) ${utilizationPercent}% 100%)`,
                  }}
                >
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-[#16233c]">
                    <span className="text-xl font-bold">{utilizationPercent}%</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/80">
                Delivered assets compared with total registered equipment.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#2c3f63] bg-[#101a2b] px-5 py-5">
          <div>
            <h2 className="text-[1.1rem] font-bold text-white">Workflow Queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open operational counts by module
            </p>
          </div>
          <div className="relative mt-5 grid gap-4 before:absolute before:left-5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[#314666]">
        {workflowSummary.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => router.push(item.href)}
                className="relative grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[22px] border border-transparent bg-transparent p-2 text-left transition hover:border-[#314666] hover:bg-[#16233c]"
          >
                <span className="z-10 grid h-10 w-10 place-items-center rounded-full border border-[#314666] bg-[#18253d] text-xs font-bold text-white">
                  {item.value}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-[#8fa4c7]">
                    {item.description}
                  </span>
                </span>
                <span className="text-lg font-black text-[#7c4cf3]">
              {item.value}
            </span>
          </button>
        ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <PieChartCard
          title="Asset Status Mix"
          description="Pie-style status split calculated from asset records"
          items={assetStatusPie}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <DonutChart
            title="Delivered Utilization"
            value={deliveredAssets}
            total={assets.length}
            color="#7c3aed"
            items={[
              { label: "Delivered", value: deliveredAssets, color: "#7c3aed" },
              { label: "Available", value: availableAssets, color: "#14b8a6" },
            ]}
          />
          <DonutChart
            title="Open Workflow Load"
            value={workflowPie.reduce((sum, item) => sum + item.value, 0)}
            total={
              deliveries.length + transfers.length + workOrders.length + maintenance.length
            }
            color="#0ea5e9"
            items={workflowPie}
          />
        </div>
      </section>

      <section className="mt-4">
        <LineChartCard
          title="Maintenance Activity Trend"
          description="Six-month maintenance activity based on maintenance record dates"
          points={maintenanceTrend}
        />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-[28px] border border-[#2c3f63] bg-[#16233c] p-5 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Role Based Actions
              </h2>
              <p className="mt-1 text-sm text-[#8fa4c7]">
                Quick actions available for your current backend role.
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#314666] bg-[#101a2b] px-3 py-1 text-xs font-bold text-[#dce7ff]">
              {currentRole}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {visibleRoleActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => router.push(action.href)}
                className="rounded-full border border-[#314666] bg-[#101a2b] px-5 py-3 text-left text-sm font-semibold text-white hover:border-[#7c4cf3]"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#2c3f63] pt-4">
            {(rolePermissionPreview[currentRole] || rolePermissionPreview.Employee).map((permission) => (
              <span
                key={permission}
                className="rounded-full bg-[#223451] px-3 py-2 text-xs font-semibold text-[#c8d4ec]"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#2c3f63] bg-[#101a2b] p-5">
          <h2 className="text-lg font-bold text-white">Due Dates</h2>
          <div className="relative mt-4 space-y-0 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[#314666]">
            {dueDates.map((item) => (
              <div
                key={`${item.date}-${item.title}`}
                className="relative ml-6 border-b border-[#2c3f63] py-3 last:border-b-0"
              >
                <span className="absolute -left-[31px] top-4 h-4 w-4 rounded-full border border-[#7c4cf3] bg-[#101a2b]" />
                <p className="text-xs font-bold text-[#8fa4c7]">{item.date}</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#8fa4c7]">{item.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-[28px] border border-[#2c3f63] bg-[#16233c]">
        <div className="border-b border-[#2c3f63] px-5 py-4">
        <h2 className="text-lg font-bold text-white">
          Data Quality Dashboard
        </h2>
        <p className="mt-1 text-sm text-[#8fa4c7]">
          Live record checks calculated from backend-connected module data.
        </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#2c3f63] md:grid-cols-4 md:divide-x md:divide-y-0">
          {dataQualityItems.map((item) => (
            <div
              key={item.label}
              className="p-5"
            >
              <p className="text-sm text-[#8fa4c7]">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-white">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#c8d4ec]">
                {item.status}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[28px] border border-[#2c3f63] bg-[#101a2b] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Report Shortcuts
            </h2>
            <p className="mt-1 text-sm text-[#8fa4c7]">
              Open management reports directly from dashboard review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="w-full rounded-2xl bg-[linear-gradient(90deg,#7c3aed_0%,#5b34f2_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(101,74,204,0.24)] hover:opacity-95 sm:w-auto"
          >
            All Reports
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-[24px] border border-[#2c3f63] md:grid-cols-5">
          {reportShortcuts.map((report) => (
            <button
              key={report.href}
              type="button"
              aria-label={`Open ${report.title}`}
              onClick={() => router.push(report.href)}
              className="border-b border-[#2c3f63] bg-[#16233c] p-4 text-left hover:bg-[#1b2a46] md:border-b-0 md:border-r md:last:border-r-0"
            >
              <p className="text-sm font-bold text-white">
                {report.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#8fa4c7]">
                {report.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="overflow-hidden rounded-[28px] border border-[#2c3f63] bg-[#16233c] xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="px-5 pt-5">
              <h2 className="text-lg font-bold text-white">
                Asset Summary
              </h2>
              <p className="text-sm text-[#8fa4c7]">
                Current equipment distribution
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/assets")}
              className="mx-5 mt-5 inline-flex w-auto justify-center rounded-full border border-[#314666] bg-[#101a2b] px-4 py-2 text-sm font-medium text-white hover:border-[#7c4cf3] sm:mt-5"
            >
              View Assets
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-y border-[#2c3f63] bg-[#101a2b] text-left">
                  <th className="px-5 py-3 font-semibold text-[#8fa4c7]">
                    Category
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#8fa4c7]">
                    Total
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#8fa4c7]">
                    Delivered
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#8fa4c7]">
                    Available
                  </th>
                  <th className="px-5 py-3 font-semibold text-[#8fa4c7]">
                    Maintenance
                  </th>
                </tr>
              </thead>

              <tbody>
                {assetSummary.map((row) => (
                  <tr key={row.category} className="border-b border-[#2c3f63] last:border-b-0">
                    <td className="px-5 py-3 font-medium text-white">
                      {row.category}
                    </td>
                    <td className="px-5 py-3 text-[#c8d4ec]">{row.total}</td>
                    <td className="px-5 py-3 text-[#c8d4ec]">
                      {row.delivered}
                    </td>
                    <td className="px-5 py-3 text-[#c8d4ec]">
                      {row.available}
                    </td>
                    <td className="px-5 py-3 text-[#c8d4ec]">
                      {row.maintenance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#2c3f63] bg-[#101a2b] p-5">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>

          <div className="mt-4 divide-y divide-[#2c3f63]">
            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.title}-${activity.meta}-${index}`}
                className="grid grid-cols-[34px_1fr] gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#223451] text-xs font-bold text-[#c8d4ec]">
                  {index + 1}
                </span>
                <span>
                <p className="text-sm font-semibold text-white">
                  {activity.title}
                </p>
                <p className="mt-1 text-xs text-[#8fa4c7]">{activity.meta}</p>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-[#2c3f63] bg-[#16233c] p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-white">
            Operational Alerts
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-0 overflow-hidden rounded-[24px] border border-[#2c3f63] md:grid-cols-3">
            {alerts.map((alert) => (
              <button
                key={alert.title}
                type="button"
                onClick={() => router.push(alert.href)}
                className="border-b border-[#2c3f63] bg-[#101a2b] p-4 text-left hover:bg-[#1b2a46] md:border-b-0 md:border-r md:last:border-r-0"
              >
                <p className="text-sm font-semibold text-white">
                  {alert.title}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#8fa4c7]">
                  {alert.detail}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#2c3f63] bg-[linear-gradient(180deg,#7c3aed_0%,#0ea5e9_100%)] p-5 text-white">
          <h2 className="text-base font-bold text-white">Website Version</h2>

          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-[18px] bg-white/12 px-4 py-3">
              <span className="text-white/80">Version</span>
              <span className="font-semibold text-white">{websiteVersion}</span>
            </div>
          </div>
        </div>
      </section>

        </>
      )}
    </LayoutWrapper>
  );
}
