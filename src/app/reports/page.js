"use client";

import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const reportCards = [
  {
    title: "Assets Report",
    description:
      "View asset category-wise summary, status count and asset availability.",
    href: "/reports/assets",
    tag: "Assets",
  },
  {
    title: "Purchases Report",
    description:
      "Track purchase orders, vendor-wise purchase amount and invoice records.",
    href: "/reports/purchases",
    tag: "Purchases",
  },
  {
    title: "Delivery Report",
    description:
      "View employee-wise and department-wise equipment/material delivery records.",
    href: "/reports/deliveries",
    tag: "Deliveries",
  },
  {
    title: "Returns Report",
    description:
      "Track returned equipments/materials, return condition, returned by and received details.",
    href: "/reports/returns",
    tag: "Returns",
  },
  {
    title: "Warranty Report",
    description:
      "Track warranty expiry, expired assets and upcoming warranty alerts.",
    href: "/reports/warranty",
    tag: "Warranty",
  },
  {
    title: "Maintenance Report",
    description:
      "View asset repair, service status, vendor support and maintenance cost.",
    href: "/reports/maintenance",
    tag: "Maintenance",
  },
  {
    title: "Damaged Assets Report",
    description:
      "Monitor damaged, scrapped, repair-needed and unusable IT assets.",
    href: "/reports/damaged",
    tag: "Damaged",
  },
];

export default function ReportsPage() {
  return (
    <LayoutWrapper>
      <PageHeader
        title="Reports"
        description="View IT asset reports, purchase summaries, deliveries, returns, warranty, maintenance and damaged asset records."
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Reports</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">7</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Asset Reports</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">2</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Operational Reports</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">4</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Finance Reports</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">1</h2>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                  {report.tag}
                </span>

                <h2 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-black">
                  {report.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {report.description}
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 group-hover:bg-gray-900 group-hover:text-white">
                →
              </span>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700">
                Open Report
              </p>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">Report Note</h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          These reports are currently using sample frontend data. After SQL
          Server backend integration, all reports will show real-time asset,
          purchase, delivery, return, warranty and maintenance records.
        </p>
      </section>
    </LayoutWrapper>
  );
}