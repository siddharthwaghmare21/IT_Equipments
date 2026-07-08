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
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <div className="overflow-hidden rounded-[24px] border border-[#2c3f63] bg-[#18253d]">
          <div className="border-b border-[#2c3f63] px-4 py-3">
            <h2 className="text-lg font-bold text-white">Standard Workflow</h2>
            <p className="mt-1 text-sm text-[#8fa4c7]">
              Follow this order while maintaining equipment records.
            </p>
          </div>

          <div className="relative px-4 py-2 before:absolute before:left-9 before:top-6 before:h-[calc(100%-48px)] before:w-px before:bg-[#314666]">
            {sopSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative grid grid-cols-[44px_1fr] gap-3 border-b border-[#2c3f63] py-3 last:border-b-0"
              >
                <span className="z-10 grid h-9 w-9 place-items-center rounded-full border border-[#7c4cf3] bg-[#101a2b] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#b8c7e6]">
                    {step.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="overflow-hidden rounded-[24px] border border-[#2c3f63] bg-[#101a2b]">
          <div className="border-b border-[#2c3f63] px-4 py-3">
            <h2 className="text-lg font-bold text-white">Quick Reference</h2>
          </div>

          <div className="divide-y divide-[#2c3f63]">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.keys}
                className="grid grid-cols-[100px_1fr] gap-3 px-4 py-3"
              >
                <span className="rounded-lg bg-[#7c4cf3] px-3 py-1.5 text-center text-xs font-bold text-white">
                  {shortcut.keys}
                </span>
                <p className="text-sm font-semibold text-[#c8d4ec]">
                  {shortcut.action}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-4 overflow-hidden rounded-[24px] border border-[#2c3f63] bg-[#18253d]">
        <div className="grid grid-cols-1 divide-y divide-[#2c3f63] lg:grid-cols-[260px_1fr] lg:divide-x lg:divide-y-0">
          <div className="px-4 py-3">
            <h2 className="text-lg font-bold text-white">Support Rules</h2>
            <p className="mt-1 text-sm text-[#8fa4c7]">Operational guidance</p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-[#2c3f63] md:grid-cols-2 md:divide-x md:divide-y-0">
            <p className="p-4 text-sm leading-6 text-[#b8c7e6]">
              Use controlled delete actions so audit history remains available.
            </p>
            <p className="p-4 text-sm leading-6 text-[#b8c7e6]">
              Upload invoices, service reports and acknowledgement proofs wherever available.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-[24px] border border-[#2c3f63] bg-[#101a2b]">
        <div className="border-b border-[#2c3f63] px-4 py-3">
          <h2 className="text-lg font-bold text-white">Naming Convention</h2>
        </div>
        <div className="divide-y divide-[#2c3f63]">
          {namingStandards.map((item) => (
            <p key={item} className="px-4 py-3 text-sm font-semibold text-[#c8d4ec]">
              {item}
            </p>
          ))}
        </div>
      </section>
    </LayoutWrapper>
  );
}
