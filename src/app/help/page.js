"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const sopSteps = [
  {
    title: "Purchase",
    details: "Create Work Order record, attach invoice and update approval/payment status.",
  },
  {
    title: "Register Asset",
    details: "Register received equipment with serial number, warranty, QR reference and documents.",
  },
  {
    title: "Delivery",
    details: "Issue equipment to department, capture receiver name, acknowledgement and accessories.",
  },
  {
    title: "Return",
    details: "Receive equipment back, inspect condition and update return decision.",
  },
  {
    title: "Maintenance",
    details: "Create service record, track vendor, downtime, cost and final asset condition.",
  },
  {
    title: "Reports",
    details: "Review asset, purchase, delivery, return, warranty, maintenance and damaged reports.",
  },
];

const cleanupItems = [
  "Set TEMP_AUTH_BYPASS back to false",
  "Remove or hide Frontend Demo badges",
  "Replace sample arrays with API responses",
  "Connect import preview/validation to backend APIs",
  "Enable real PDF, Excel and backup jobs",
];

const shortcuts = [
  { keys: "Ctrl + K", action: "Open quick action command palette" },
  { keys: "Ctrl + F", action: "Use browser/page search" },
  { keys: "Ctrl + P", action: "Print delivery, return or report page" },
];

const frontendCompletion = [
  "Dashboard, reports, assets and workflow screens are frontend-ready",
  "Temporary login bypass is active for frontend review",
  "PDF, Excel, backup and email jobs are backend pending",
  "Report branding can be previewed from Settings",
];

const backendPreparation = [
  "Auth APIs: login, signup request, email OTP, approval workflow",
  "Master APIs: assets, departments, vendors and receiver tracking",
  "Workflow APIs: purchase, delivery, return, maintenance, damage review",
  "Report APIs: filters, PDF/Excel export, scheduled email, audit trail",
  "System APIs: backup, restore, role permissions, activity logs",
];

const namingStandards = [
  "Assets: AST-001 or IT-LAP-001 based on final asset tagging policy",
  "Deliveries: DLV-001",
  "Returns: RET-001",
  "Maintenance: MNT-001",
  "Purchases: WO-2026-001",
];

export default function HelpPage() {
  return (
    <LayoutWrapper>
      <PageHeader
        title="Help / SOP"
        description="Standard operating process for IT equipment management workflows."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sopSteps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
              {index + 1}
            </span>
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {step.details}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Support Rules</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            Use archive instead of permanent delete so audit history remains available.
          </p>
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            Upload invoices, service reports and acknowledgement proofs wherever available.
          </p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-yellow-900">
            Backend Cleanup Checklist
          </h2>
          <div className="mt-4 space-y-3">
            {cleanupItems.map((item) => (
              <p
                key={item}
                className="rounded-xl border border-yellow-200 bg-white/70 p-3 text-sm font-semibold text-yellow-900"
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <div className="mt-4 space-y-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.keys}
                className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"
              >
                <span className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white">
                  {shortcut.keys}
                </span>
                <p className="text-sm font-semibold text-gray-700">
                  {shortcut.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Frontend Completion Notes
          </h2>
          <div className="mt-4 space-y-3">
            {frontendCompletion.map((item) => (
              <p
                key={item}
                className="rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700"
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Backend Preparation
          </h2>
          <div className="mt-4 space-y-3">
            {backendPreparation.map((item) => (
              <p
                key={item}
                className="rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700"
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Naming Convention
          </h2>
          <div className="mt-4 space-y-3">
            {namingStandards.map((item) => (
              <p
                key={item}
                className="rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
