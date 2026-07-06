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
    details: "Register received equipment with serial number, warranty, department, location and documents.",
  },
  {
    title: "Delivery",
    details: "Issue equipment to department, capture receiver name, acknowledgement and accessories.",
  },
  {
    title: "Transfer",
    details: "Move issued assets between departments, collect by IT when needed and record reassignment acknowledgement.",
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
    details: "Review asset, purchase, delivery, transfer, return, warranty, maintenance and damaged reports.",
  },
];

const shortcuts = [
  { keys: "Ctrl + K", action: "Open quick action command palette" },
  { keys: "Ctrl + F", action: "Use browser/page search" },
  { keys: "Ctrl + P", action: "Print delivery, return or report page" },
];

const namingStandards = [
  "Assets: AST-001 or IT-LAP-001 based on final asset tagging policy",
  "Deliveries: DLV-001",
  "Returns: RET-001",
  "Transfers: TRF-001",
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
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              {index + 1}
            </span>
            <h2 className="mt-3 text-base font-bold text-slate-950 dark:text-slate-100">
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {step.details}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">Support Rules</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Use controlled delete actions so audit history remains available.
          </p>
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Upload invoices, service reports and acknowledgement proofs wherever available.
          </p>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">
            Keyboard Shortcuts
          </h2>
          <div className="mt-4 space-y-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.keys}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white dark:bg-indigo-600">
                  {shortcut.keys}
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {shortcut.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">
            Naming Convention
          </h2>
          <div className="mt-4 space-y-3">
            {namingStandards.map((item) => (
              <p
                key={item}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
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
