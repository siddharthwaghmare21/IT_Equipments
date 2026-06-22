"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const sopSteps = [
  {
    title: "Purchase",
    details: "Create purchase order record, attach invoice and update approval/payment status.",
  },
  {
    title: "Register Asset",
    details: "Register received equipment with serial number, warranty, QR reference and documents.",
  },
  {
    title: "Delivery",
    details: "Issue equipment to employee, capture acknowledgement and accessories.",
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
    </LayoutWrapper>
  );
}
