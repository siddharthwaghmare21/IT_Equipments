"use client";

import { useMemo, useState } from "react";
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
    group: "Assets",
  },
  {
    title: "Purchases Report",
    description:
      "Track purchase orders, vendor-wise purchase amount and invoice records.",
    href: "/reports/purchases",
    tag: "Purchases",
    group: "Finance",
  },
  {
    title: "Delivery Report",
    description:
      "View employee-wise and department-wise equipment/material delivery records.",
    href: "/reports/deliveries",
    tag: "Deliveries",
    group: "Operations",
  },
  {
    title: "Returns Report",
    description:
      "Track returned equipments/materials, return condition, returned by and received details.",
    href: "/reports/returns",
    tag: "Returns",
    group: "Operations",
  },
  {
    title: "Warranty Report",
    description:
      "Track warranty expiry, expired assets and upcoming warranty alerts.",
    href: "/reports/warranty",
    tag: "Warranty",
    group: "Assets",
  },
  {
    title: "Maintenance Report",
    description:
      "View asset repair, service status, vendor support and maintenance cost.",
    href: "/reports/maintenance",
    tag: "Maintenance",
    group: "Operations",
  },
  {
    title: "Damaged Assets Report",
    description:
      "Monitor damaged, scrapped, repair-needed and unusable IT assets.",
    href: "/reports/damaged",
    tag: "Damaged",
    group: "Assets",
  },
];

const recentExports = [
  {
    name: "Asset Summary CSV",
    module: "Assets",
    date: "2026-06-20",
    status: "Downloaded",
  },
  {
    name: "Warranty Review",
    module: "Warranty",
    date: "2026-06-18",
    status: "Preview",
  },
  {
    name: "Maintenance Cost",
    module: "Maintenance",
    date: "2026-06-15",
    status: "Pending Backend",
  },
];

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("All");

  const filteredReports = useMemo(() => {
    return reportCards.filter((report) => {
      const matchesSearch = `${report.title} ${report.description} ${report.tag}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesGroup = activeGroup === "All" || report.group === activeGroup;

      return matchesSearch && matchesGroup;
    });
  }, [search, activeGroup]);

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

      <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Recent Exports</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {recentExports.map((item) => (
              <div
                key={`${item.name}-${item.date}`}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.module} | {item.date}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-yellow-900">
            Backend Export Queue
          </h2>
          <p className="mt-2 text-sm leading-6 text-yellow-800">
            PDF export, Excel export, scheduled reports and email summary will
            be connected after backend APIs and database are ready.
          </p>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Report Builder Preview
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              Prepare filters before backend export jobs
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              These controls are frontend-ready. Backend integration will use
              the same choices for PDF, Excel and scheduled report generation.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-2xl xl:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports..."
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            />
            <select
              value={activeGroup}
              onChange={(event) => setActiveGroup(event.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            >
              <option value="All">All Groups</option>
              <option value="Assets">Assets</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
            </select>
            <select
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              defaultValue="Summary"
            >
              <option value="Summary">Summary View</option>
              <option value="Detailed">Detailed View</option>
              <option value="Audit">Audit View</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {["PDF Export", "Excel Export", "Scheduled Email"].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <p className="text-sm font-semibold text-gray-900">{item}</p>
              <p className="mt-1 text-xs text-gray-500">
                Backend connection pending
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredReports.map((report) => (
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
                Open
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
          These reports are currently using sample frontend data. After MySQL
          backend integration, all reports will show real-time asset,
          purchase, delivery, return, warranty and maintenance records.
        </p>
      </section>
    </LayoutWrapper>
  );
}
