"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";

const SESSION_KEY = "itAssetUserSession";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser] = useState(() => {
    if (typeof window === "undefined") {
      return {
        fullName: "Frontend Review User",
        role: "Super Admin",
      };
    }

    const savedSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

    return (
      savedSession || {
        fullName: "Frontend Review User",
        role: "Super Admin",
      }
    );
  });
  const [previewRole, setPreviewRole] = useState(currentUser?.role || "Super Admin");

  const stats = [
    {
      title: "Total Assets",
      value: "248",
      description: "Registered IT equipment",
      trend: "12 added this month",
    },
    {
      title: "Delivered Assets",
      value: "156",
      description: "Issued to employees",
      trend: "63% allocation",
    },
    {
      title: "Available Assets",
      value: "64",
      description: "Ready for delivery",
      trend: "24 laptops available",
    },
    {
      title: "Under Maintenance",
      value: "18",
      description: "Repair or service active",
      trend: "4 high priority",
    },
  ];

  const assetSummary = [
    {
      category: "Laptops",
      total: "95",
      delivered: "72",
      available: "23",
      maintenance: "6",
    },
    {
      category: "Desktops",
      total: "48",
      delivered: "35",
      available: "13",
      maintenance: "2",
    },
    {
      category: "Monitors",
      total: "61",
      delivered: "38",
      available: "23",
      maintenance: "4",
    },
    {
      category: "Printers",
      total: "14",
      delivered: "6",
      available: "8",
      maintenance: "3",
    },
  ];

  const chartData = [
    { label: "Assets", value: 248, width: "100%" },
    { label: "Delivered", value: 156, width: "63%" },
    { label: "Available", value: 64, width: "26%" },
    { label: "Maintenance", value: 18, width: "8%" },
  ];

  const lowStockItems = [
    { item: "USB Keyboard", stock: "4", minimum: "10" },
    { item: "Wireless Mouse", stock: "6", minimum: "15" },
    { item: "HDMI Cable", stock: "3", minimum: "8" },
  ];

  const workflowSummary = [
    {
      title: "Pending Deliveries",
      value: "9",
      description: "Approved but not issued",
      href: "/deliveries",
    },
    {
      title: "Return Inspections",
      value: "5",
      description: "Awaiting condition check",
      href: "/returns",
    },
    {
      title: "Purchase Approvals",
      value: "3",
      description: "Pending procurement review",
      href: "/purchases",
    },
    {
      title: "Vendor Reviews",
      value: "2",
      description: "Compliance needs attention",
      href: "/vendors",
    },
  ];

  const alerts = [
    {
      title: "Warranty Expiring Soon",
      detail: "3 assets need warranty review",
      href: "/reports/warranty",
    },
    {
      title: "High Priority Maintenance",
      detail: "4 repair records require follow-up",
      href: "/maintenance",
    },
    {
      title: "Damaged Asset Decisions",
      detail: "2 inspection decisions pending",
      href: "/reports/damaged",
    },
  ];

  const recentActivities = [
    {
      title: "Laptop delivered to Rahul Patil",
      meta: "Delivery | Today 10:30 AM",
    },
    {
      title: "Purchase PO-2026-004 submitted",
      meta: "Purchases | Pending approval",
    },
    {
      title: "HP LaserJet maintenance completed",
      meta: "Maintenance | Service report attached",
    },
    {
      title: "Dell Mouse marked damaged",
      meta: "Damaged Assets | Repair approved",
    },
  ];

  const roleActions = {
    "Super Admin": [
      { label: "Review Access Requests", href: "/admin-request-management" },
      { label: "Manage Users", href: "/admin-user-management" },
      { label: "Open Backup Settings", href: "/settings" },
    ],
    Admin: [
      { label: "Approve Requests", href: "/admin-request-management" },
      { label: "Asset Workflow", href: "/assets" },
      { label: "Reports", href: "/reports" },
    ],
    Employee: [
      { label: "Add Asset", href: "/assets/add" },
      { label: "Create Delivery", href: "/deliveries/delivery" },
      { label: "Maintenance", href: "/maintenance" },
    ],
    Viewer: [
      { label: "Asset Reports", href: "/reports/assets" },
      { label: "Warranty Reports", href: "/reports/warranty" },
      { label: "Activity Logs", href: "/activity-logs" },
    ],
  };

  const dueDates = [
    { date: "2026-06-24", title: "Warranty review", meta: "3 assets" },
    { date: "2026-06-26", title: "Expected return", meta: "DLV-004" },
    { date: "2026-06-29", title: "Maintenance follow-up", meta: "MNT-001" },
    { date: "2026-07-01", title: "Stock audit", meta: "IT Store" },
  ];

  const visibleRoleActions =
    roleActions[previewRole] || roleActions.Employee;
  const dataQualityItems = [
    { label: "Missing Serial Numbers", value: "2", status: "Review" },
    { label: "Missing Warranty Dates", value: "5", status: "Action Needed" },
    { label: "Pending Documents", value: "7", status: "Follow-up" },
    { label: "Duplicate Asset Tags", value: "0", status: "Clean" },
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
            {recentActivities.map((activity) => (
              <div
                key={activity.title}
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
    </LayoutWrapper>
  );
}
