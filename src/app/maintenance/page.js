"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PageActionBar from "@/components/common/PageActionBar";
import CompactRecordList from "@/components/common/CompactRecordList";
import { EmptyState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";

const maintenanceRecords = [
  {
    id: "1",
    maintenanceCode: "MNT-001",
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    issueType: "Battery Issue",
    reportedBy: "Rahul Patil",
    vendor: "Dell Service Center",
    serviceDate: "2026-03-10",
    expectedCompletion: "2026-03-15",
    completionDate: "",
    serviceType: "Warranty Repair",
    priority: "High",
    downtimeHours: "48",
    warrantyClaim: "Yes",
    approvalStatus: "Approved",
    attachmentStatus: "Service Request",
    finalCondition: "Under Repair",
    createdBy: "IT Admin",
    createdAt: "2026-03-10 10:25 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-03-11 02:30 PM",
    cost: "INR 4,500",
    status: "In Progress",
  },
  {
    id: "2",
    maintenanceCode: "MNT-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    issueType: "Paper Jam",
    reportedBy: "Sneha Jadhav",
    vendor: "HP World",
    serviceDate: "2026-02-18",
    expectedCompletion: "2026-02-20",
    completionDate: "2026-02-20",
    serviceType: "Corrective Repair",
    priority: "Medium",
    downtimeHours: "8",
    warrantyClaim: "No",
    approvalStatus: "Approved",
    attachmentStatus: "Invoice + Service Report",
    finalCondition: "Working",
    createdBy: "IT Admin",
    createdAt: "2026-02-18 09:45 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-02-20 04:10 PM",
    cost: "INR 1,200",
    status: "Completed",
  },
  {
    id: "3",
    maintenanceCode: "MNT-003",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    issueType: "Network Drop",
    reportedBy: "Priya More",
    vendor: "Network Solutions",
    serviceDate: "2026-03-05",
    expectedCompletion: "2026-03-12",
    completionDate: "",
    serviceType: "Inspection",
    priority: "High",
    downtimeHours: "24",
    warrantyClaim: "No",
    approvalStatus: "Pending",
    attachmentStatus: "Pending",
    finalCondition: "Pending Inspection",
    createdBy: "IT Admin",
    createdAt: "2026-03-05 11:20 AM",
    updatedBy: "IT Admin",
    updatedAt: "2026-03-05 11:20 AM",
    cost: "INR 2,800",
    status: "Pending",
  },
  {
    id: "4",
    maintenanceCode: "MNT-004",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    issueType: "Display Problem",
    reportedBy: "Amit Shinde",
    vendor: "Lenovo Care",
    serviceDate: "2026-01-25",
    expectedCompletion: "2026-02-01",
    completionDate: "",
    serviceType: "Replacement Review",
    priority: "Low",
    downtimeHours: "0",
    warrantyClaim: "No",
    approvalStatus: "Rejected",
    attachmentStatus: "Review Note",
    finalCondition: "Cancelled",
    createdBy: "IT Admin",
    createdAt: "2026-01-25 03:00 PM",
    updatedBy: "IT Manager",
    updatedAt: "2026-01-28 05:15 PM",
    cost: "INR 6,000",
    status: "Cancelled",
  },
];

const filters = ["All", "Pending", "In Progress", "Completed", "Cancelled"];

function MaintenanceStatusBadge({ status }) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [archiveRecord, setArchiveRecord] = useState(null);

  const filteredMaintenanceRecords = useMemo(() => {
    return maintenanceRecords.filter((record) => {
      const searchText = `
        ${record.maintenanceCode}
        ${record.assetTag}
        ${record.assetName}
        ${record.issueType}
        ${record.reportedBy}
        ${record.vendor}
        ${record.serviceType}
        ${record.priority}
        ${record.warrantyClaim}
        ${record.approvalStatus}
        ${record.finalCondition}
        ${record.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || record.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const slaIndicators = [
    {
      label: "High Priority Open",
      value: maintenanceRecords.filter(
        (record) =>
          record.priority === "High" &&
          record.status !== "Completed" &&
          record.status !== "Cancelled"
      ).length,
      detail: "Needs same-day follow-up",
    },
    {
      label: "Approval Pending",
      value: maintenanceRecords.filter(
        (record) => record.approvalStatus === "Pending"
      ).length,
      detail: "Waiting for admin decision",
    },
    {
      label: "Warranty Claims",
      value: maintenanceRecords.filter(
        (record) => record.warrantyClaim === "Yes"
      ).length,
      detail: "Track with vendor service desk",
    },
    {
      label: "Downtime Hours",
      value: maintenanceRecords.reduce(
        (total, record) => total + Number(record.downtimeHours || 0),
        0
      ),
      detail: "Total reported downtime",
    },
  ];

  function handleArchive(record) {
    setArchiveRecord(record);
  }

  function confirmArchive() {
    showToast("Maintenance archive action added. Backend will be connected later.");
    setArchiveRecord(null);
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Maintenance"
        description="Manage asset repair, servicing, issue tracking, vendor support and maintenance status."
      />

      <PageActionBar addHref="/maintenance/add" addLabel="Add Maintenance" />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Records</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {maintenanceRecords.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              maintenanceRecords.filter((record) => record.status === "Pending")
                .length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              maintenanceRecords.filter(
                (record) => record.status === "In Progress"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {
              maintenanceRecords.filter(
                (record) => record.status === "Completed"
              ).length
            }
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by code, asset, issue, vendor, priority, warranty or status..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 lg:max-w-md"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                  activeFilter === filter
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              SLA Indicators
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900">
              Maintenance response health
            </h2>
          </div>
          <span className="inline-flex w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
            Frontend preview
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {slaIndicators.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <p className="text-sm font-semibold text-gray-900">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <CompactRecordList
        records={filteredMaintenanceRecords}
        titleKey="maintenanceCode"
        subtitleKey="assetName"
        meta={[
          { label: "Issue", key: "issueType" },
          { label: "Priority", key: "priority" },
          { label: "Vendor", key: "vendor" },
          { label: "Cost", key: "cost" },
        ]}
        statusRender={(record) => <MaintenanceStatusBadge status={record.status} />}
        viewHref={(record) => `/maintenance/view/${record.id}`}
        editHref={(record) => `/maintenance/edit/${record.id}`}
        onArchive={handleArchive}
        emptyTitle="No maintenance records found"
        emptyDescription="Try changing asset, issue, priority or status filters."
      />

      <div className="hidden md:block">
      <TableWrapper>
        <table className="min-w-[1650px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Maintenance Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Tag
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Asset Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Issue Type
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Reported By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Vendor / Technician
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Service Type
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Priority
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Service Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Expected Completion
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Cost
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Warranty
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Approval
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredMaintenanceRecords.map((record) => (
              <tr
                key={record.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {record.maintenanceCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.assetTag}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.assetName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.issueType}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.reportedBy}
                </td>

                <td className="px-4 py-4 text-gray-700">{record.vendor}</td>

                <td className="px-4 py-4 text-gray-700">
                  {record.serviceType}
                </td>

                <td className="px-4 py-4 text-gray-700">{record.priority}</td>

                <td className="px-4 py-4 text-gray-700">
                  {record.serviceDate}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.expectedCompletion}
                </td>

                <td className="px-4 py-4 text-gray-700">{record.cost}</td>

                <td className="px-4 py-4 text-gray-700">
                  {record.warrantyClaim}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {record.approvalStatus}
                </td>

                <td className="px-4 py-4">
                  <MaintenanceStatusBadge status={record.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/maintenance/view/${record.id}`}
                    updateHref={`/maintenance/edit/${record.id}`}
                    onDelete={() => handleArchive(record)}
                    deleteLabel="Archive"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMaintenanceRecords.length === 0 && (
          <div className="p-6">
            <EmptyState
              title="No maintenance records found"
              description="Try changing asset, issue, priority or status filters."
            />
          </div>
        )}
      </TableWrapper>
      </div>

      <ConfirmDialog
        isOpen={Boolean(archiveRecord)}
        title="Archive maintenance record?"
        description={`Maintenance record ${
          archiveRecord?.maintenanceCode || ""
        } will be archived after backend integration.`}
        confirmLabel="Archive"
        onCancel={() => setArchiveRecord(null)}
        onConfirm={confirmArchive}
      />
    </LayoutWrapper>
  );
}
