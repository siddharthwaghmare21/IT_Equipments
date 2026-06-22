"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const maintenanceRecords = [
  {
    id: "1",
    maintenanceCode: "MNT-001",
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    issueType: "Battery Issue",
    reportedBy: "Rahul Patil",
    vendor: "Dell Service Center",
    serviceType: "Warranty Repair",
    priority: "High",
    serviceDate: "2026-03-10",
    expectedCompletion: "2026-03-15",
    completionDate: "",
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
    remarks:
      "Battery backup is very low. Laptop sent to Dell Service Center for battery diagnosis and replacement.",
  },
  {
    id: "2",
    maintenanceCode: "MNT-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    issueType: "Paper Jam",
    reportedBy: "Sneha Jadhav",
    vendor: "HP World",
    serviceType: "Corrective Repair",
    priority: "Medium",
    serviceDate: "2026-02-18",
    expectedCompletion: "2026-02-20",
    completionDate: "2026-02-20",
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
    remarks:
      "Printer roller cleaned and paper jam issue resolved. Printer is working properly.",
  },
  {
    id: "3",
    maintenanceCode: "MNT-003",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    issueType: "Network Drop",
    reportedBy: "Priya More",
    vendor: "Network Solutions",
    serviceType: "Inspection",
    priority: "High",
    serviceDate: "2026-03-05",
    expectedCompletion: "2026-03-12",
    completionDate: "",
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
    remarks:
      "Router frequently disconnects. Vendor inspection is pending.",
  },
  {
    id: "4",
    maintenanceCode: "MNT-004",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    issueType: "Display Problem",
    reportedBy: "Amit Shinde",
    vendor: "Lenovo Care",
    serviceType: "Replacement Review",
    priority: "Low",
    serviceDate: "2026-01-25",
    expectedCompletion: "2026-02-01",
    completionDate: "",
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
    remarks:
      "Display replacement request was cancelled after internal review.",
  },
];

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

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

export default function ViewMaintenancePage() {
  const params = useParams();
  const maintenanceId = params.id;

  const maintenanceRecord =
    maintenanceRecords.find((record) => record.id === maintenanceId) ||
    maintenanceRecords[0];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Maintenance Details"
        description="View asset repair, service issue, vendor, cost and maintenance status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/maintenance" label="Maintenance" />

        <Link
          href={`/maintenance/edit/${maintenanceRecord.id}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Maintenance
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {maintenanceRecord.maintenanceCode}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {maintenanceRecord.assetName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {maintenanceRecord.assetTag} | {maintenanceRecord.issueType}
            </p>
          </div>

          <MaintenanceStatusBadge status={maintenanceRecord.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem
            label="Maintenance Code"
            value={maintenanceRecord.maintenanceCode}
          />
          <DetailItem label="Asset Tag" value={maintenanceRecord.assetTag} />
          <DetailItem label="Asset Name" value={maintenanceRecord.assetName} />
          <DetailItem label="Issue Type" value={maintenanceRecord.issueType} />
          <DetailItem label="Reported By" value={maintenanceRecord.reportedBy} />
          <DetailItem
            label="Vendor / Technician"
            value={maintenanceRecord.vendor}
          />
          <DetailItem
            label="Service Type"
            value={maintenanceRecord.serviceType}
          />
          <DetailItem label="Priority" value={maintenanceRecord.priority} />
          <DetailItem
            label="Service Date"
            value={maintenanceRecord.serviceDate}
          />
          <DetailItem
            label="Expected Completion"
            value={maintenanceRecord.expectedCompletion}
          />
          <DetailItem
            label="Completion Date"
            value={maintenanceRecord.completionDate}
          />
          <DetailItem label="Cost" value={maintenanceRecord.cost} />
          <DetailItem
            label="Downtime Hours"
            value={maintenanceRecord.downtimeHours}
          />
          <DetailItem
            label="Warranty Claim"
            value={maintenanceRecord.warrantyClaim}
          />
          <DetailItem
            label="Approval Status"
            value={maintenanceRecord.approvalStatus}
          />
          <DetailItem
            label="Documents"
            value={maintenanceRecord.attachmentStatus}
          />
          <DetailItem
            label="Final Condition"
            value={maintenanceRecord.finalCondition}
          />
          <DetailItem label="Status" value={maintenanceRecord.status} />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">
            {maintenanceRecord.remarks}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Created By" value={maintenanceRecord.createdBy} />
          <DetailItem label="Created At" value={maintenanceRecord.createdAt} />
          <DetailItem label="Updated By" value={maintenanceRecord.updatedBy} />
          <DetailItem label="Updated At" value={maintenanceRecord.updatedAt} />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Maintenance Summary</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {maintenanceRecord.issueType}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {maintenanceRecord.assetName} is handled by{" "}
            {maintenanceRecord.vendor}.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Current Status</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {maintenanceRecord.status}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Maintenance workflow, service proof and final asset condition will be
            connected after backend integration.
          </p>
        </div>
      </section>
    </LayoutWrapper>
  );
}
