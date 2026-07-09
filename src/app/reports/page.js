"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { getExportJobs } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";

const reports = [
  {
    title: "Assets Report",
    href: "/reports/assets",
    type: "Inventory",
    group: "Assets",
    output: "Table / PDF / Excel",
    owner: "IT Department",
    columns: "Asset tag, name, category, brand, department, custodian",
  },
  {
    title: "Purchases Report",
    href: "/reports/purchases",
    type: "Procurement",
    group: "Finance",
    output: "Table / PDF / Excel",
    owner: "Purchase Team",
    columns: "WO number, vendor, invoice, dates, items, total",
  },
  {
    title: "Delivery Report",
    href: "/reports/deliveries",
    type: "Operations",
    group: "Operations",
    output: "Table / PDF / Excel",
    owner: "IT Store",
    columns: "Delivery code, asset, receiver, department, status",
  },
  {
    title: "Returns Report",
    href: "/reports/returns",
    type: "Operations",
    group: "Operations",
    output: "Table / PDF / Excel",
    owner: "IT Store",
    columns: "Return code, asset, returned by, condition, status",
  },
  {
    title: "Transfers Report",
    href: "/reports/transfers",
    type: "Operations",
    group: "Operations",
    output: "Table / PDF / Excel",
    owner: "IT Department",
    columns: "Transfer code, asset, source, destination, receiver",
  },
  {
    title: "Warranty Report",
    href: "/reports/warranty",
    type: "Compliance",
    group: "Assets",
    output: "Table / PDF / Excel",
    owner: "IT Department",
    columns: "Asset tag, vendor, warranty date, expiry status",
  },
  {
    title: "Maintenance Report",
    href: "/reports/maintenance",
    type: "Service",
    group: "Operations",
    output: "Table / PDF / Excel",
    owner: "Maintenance Team",
    columns: "Ticket, asset, vendor, cost, status, repair date",
  },
  {
    title: "Damaged Assets Report",
    href: "/reports/damaged",
    type: "Risk",
    group: "Assets",
    output: "Table / PDF / Excel",
    owner: "IT Department",
    columns: "Asset tag, condition, decision, department, status",
  },
];

const reportTypes = [
  {
    name: "Inventory",
    purpose: "Assets, warranty and damaged asset tracking",
    countLabel: "3 reports",
  },
  {
    name: "Operations",
    purpose: "Delivery, transfer, return and maintenance movement",
    countLabel: "4 reports",
  },
  {
    name: "Procurement",
    purpose: "Work orders, vendor invoices and purchase records",
    countLabel: "1 report",
  },
  {
    name: "Compliance",
    purpose: "Expiry, risk and audit-ready exports",
    countLabel: "PDF ready",
  },
];

const savedReportViews = [
  {
    name: "Monthly Asset Review",
    report: "Assets Report",
    filter: "All departments",
    format: "A4 Portrait",
  },
  {
    name: "Warranty Expiry Review",
    report: "Warranty Report",
    filter: "Expiring and expired",
    format: "Excel + PDF",
  },
  {
    name: "Maintenance Follow-up",
    report: "Maintenance Report",
    filter: "Pending service",
    format: "CSV",
  },
];

const panelClassName =
  "rounded-[26px] border border-[#2c3f63] bg-[#18253d] shadow-sm";
const tableHeadClassName =
  "border-b border-[#314666] bg-[#101a2b] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-[#9fb3d7]";
const tableCellClassName =
  "border-b border-[#2c3f63] px-4 py-3 text-center text-sm text-[#dce7fb]";
const inputClassName =
  "h-11 rounded-2xl border border-[#314666] bg-[#101a2b] px-4 text-sm text-white outline-none focus:border-[#7c3aed]";

function statusText(value) {
  if (!value) {
    return "-";
  }

  return String(value).replaceAll("_", " ");
}

export default function ReportsPage() {
  const [activeGroup, setActiveGroup] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [recentExports, setRecentExports] = useState([]);
  const [exportHistoryStatus, setExportHistoryStatus] = useState("Loading");

  const loadRecentExports = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setExportHistoryStatus("Login Required");
      return;
    }

    try {
      const exportJobs = await getExportJobs(token, 5);
      setRecentExports(exportJobs || []);
      setExportHistoryStatus("Connected");
    } catch {
      setExportHistoryStatus("Unavailable");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecentExports();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadRecentExports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesGroup = activeGroup === "All" || report.group === activeGroup;
      const matchesType = activeType === "All" || report.type === activeType;

      return matchesGroup && matchesType;
    });
  }, [activeGroup, activeType]);

  return (
    <LayoutWrapper>
      <PageHeader title="Reports" />

      <section className={`${panelClassName} p-4`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Report Console</h2>
            <p className="mt-1 text-sm text-[#9fb3d7]">
              Backend-connected reports, export history and saved report views.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
            <select
              value={activeGroup}
              onChange={(event) => setActiveGroup(event.target.value)}
              className={inputClassName}
            >
              <option value="All">All Groups</option>
              <option value="Assets">Assets</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
            </select>
            <select
              value={activeType}
              onChange={(event) => setActiveType(event.target.value)}
              className={inputClassName}
            >
              <option value="All">All Types</option>
              <option value="Inventory">Inventory</option>
              <option value="Operations">Operations</option>
              <option value="Procurement">Procurement</option>
              <option value="Compliance">Compliance</option>
              <option value="Service">Service</option>
              <option value="Risk">Risk</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-4">
        {reportTypes.map((type) => (
          <div
            key={type.name}
            className="rounded-[22px] border border-[#2c3f63] bg-[#101a2b] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">{type.name}</h3>
              <span className="rounded-full bg-[#243756] px-3 py-1 text-xs font-bold text-[#c8d4ec]">
                {type.countLabel}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#9fb3d7]">
              {type.purpose}
            </p>
          </div>
        ))}
      </section>

      <section className={`${panelClassName} mt-5 overflow-hidden`}>
        <div className="border-b border-[#314666] px-5 py-4">
          <h2 className="text-lg font-bold text-white">Available Reports</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full">
            <thead>
              <tr>
                <th className={tableHeadClassName}>Report Name</th>
                <th className={tableHeadClassName}>Type</th>
                <th className={tableHeadClassName}>Group</th>
                <th className={tableHeadClassName}>Key Data</th>
                <th className={tableHeadClassName}>Output</th>
                <th className={tableHeadClassName}>Owner</th>
                <th className={tableHeadClassName}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.href} className="hover:bg-[#1d2d49]">
                  <td className={`${tableCellClassName} font-bold text-white`}>
                    {report.title}
                  </td>
                  <td className={tableCellClassName}>{report.type}</td>
                  <td className={tableCellClassName}>{report.group}</td>
                  <td className={`${tableCellClassName} max-w-sm`}>
                    {report.columns}
                  </td>
                  <td className={tableCellClassName}>{report.output}</td>
                  <td className={tableCellClassName}>{report.owner}</td>
                  <td className={tableCellClassName}>
                    <Link
                      href={report.href}
                      className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#7c3aed] px-4 text-sm font-bold text-white hover:bg-[#6d28d9]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className={`${panelClassName} overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-[#314666] px-5 py-4">
            <h2 className="text-lg font-bold text-white">Recent Exports</h2>
            <span className="rounded-full bg-[#243756] px-3 py-1 text-xs font-bold text-[#c8d4ec]">
              {exportHistoryStatus}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead>
                <tr>
                  <th className={tableHeadClassName}>Module</th>
                  <th className={tableHeadClassName}>Export Type</th>
                  <th className={tableHeadClassName}>Rows</th>
                  <th className={tableHeadClassName}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentExports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm font-semibold text-[#9fb3d7]"
                    >
                      No backend export tracking jobs are available yet.
                    </td>
                  </tr>
                ) : (
                  recentExports.map((item) => (
                    <tr key={item.exportJobId} className="hover:bg-[#1d2d49]">
                      <td className={tableCellClassName}>
                        {statusText(item.exportModule)}
                      </td>
                      <td className={tableCellClassName}>
                        {statusText(item.exportType)}
                      </td>
                      <td className={tableCellClassName}>
                        {item.rowCount ?? 0}
                      </td>
                      <td className={`${tableCellClassName} font-bold`}>
                        {statusText(item.exportStatus)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${panelClassName} p-5`}>
          <h2 className="text-lg font-bold text-white">Saved Report Views</h2>
          <div className="mt-4 divide-y divide-[#314666] overflow-hidden rounded-[22px] border border-[#314666]">
            {savedReportViews.map((view) => (
              <div
                key={view.name}
                className="grid grid-cols-1 gap-2 bg-[#101a2b] px-4 py-3 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-sm font-bold text-white">{view.name}</p>
                  <p className="mt-1 text-xs font-semibold text-[#9fb3d7]">
                    {view.report} | {view.filter}
                  </p>
                </div>
                <span className="self-center rounded-full bg-[#243756] px-3 py-1 text-xs font-bold text-[#c8d4ec]">
                  {view.format}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
