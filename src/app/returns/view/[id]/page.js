"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const returnRecords = [
  {
    id: "1",
    returnCode: "RET-001",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    returnedBy: "Amit Shinde",
    department: "Admin",
    assignedDate: "2026-02-01",
    returnDate: "2026-08-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    status: "Returned",
    remarks: "Keyboard returned in good working condition.",
  },
  {
    id: "2",
    returnCode: "RET-002",
    deliveryCode: "DLV-005",
    assetTag: "AST-005",
    assetName: "Dell Mouse",
    returnedBy: "Priya More",
    department: "HR",
    assignedDate: "2026-01-10",
    returnDate: "2026-07-20",
    returnCondition: "Damaged",
    receivedBy: "IT Admin",
    status: "Damaged",
    remarks: "Mouse returned with physical damage. Repair decision pending.",
  },
  {
    id: "3",
    returnCode: "RET-003",
    deliveryCode: "DLV-006",
    assetTag: "AST-006",
    assetName: "HP Monitor",
    returnedBy: "Sneha Jadhav",
    department: "Accounts",
    assignedDate: "2026-03-05",
    returnDate: "2026-09-10",
    returnCondition: "Needs Inspection",
    receivedBy: "IT Support",
    status: "Pending Inspection",
    remarks: "Monitor received. Technical inspection is pending.",
  },
  {
    id: "4",
    returnCode: "RET-004",
    deliveryCode: "DLV-007",
    assetTag: "AST-007",
    assetName: "Lenovo Laptop",
    returnedBy: "Rahul Patil",
    department: "IT Department",
    assignedDate: "2026-02-15",
    returnDate: "2026-10-01",
    returnCondition: "Good",
    receivedBy: "IT Admin",
    status: "Returned",
    remarks: "Laptop returned with charger and bag.",
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

function ReturnStatusBadge({ status }) {
  const statusStyles = {
    Returned: "bg-green-100 text-green-700 border-green-200",
    Damaged: "bg-red-100 text-red-700 border-red-200",
    "Pending Inspection": "bg-yellow-100 text-yellow-700 border-yellow-200",
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

export default function ViewReturnPage() {
  const params = useParams();
  const returnId = params.id;

  const returnRecord =
    returnRecords.find((item) => item.id === returnId) || returnRecords[0];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Return Details"
        description="View returned asset information, return condition, received by details and inspection status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/returns" label="Returns" />

        <Link
          href={`/returns/edit/${returnRecord.id}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Return
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {returnRecord.returnCode}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {returnRecord.assetName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {returnRecord.assetTag} • Returned by {returnRecord.returnedBy}
            </p>
          </div>

          <ReturnStatusBadge status={returnRecord.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Return Code" value={returnRecord.returnCode} />
          <DetailItem label="Delivery Code" value={returnRecord.deliveryCode} />
          <DetailItem label="Asset Tag" value={returnRecord.assetTag} />
          <DetailItem label="Asset Name" value={returnRecord.assetName} />
          <DetailItem label="Returned By" value={returnRecord.returnedBy} />
          <DetailItem label="Department" value={returnRecord.department} />
          <DetailItem label="Assigned Date" value={returnRecord.assignedDate} />
          <DetailItem label="Return Date" value={returnRecord.returnDate} />
          <DetailItem
            label="Return Condition"
            value={returnRecord.returnCondition}
          />
          <DetailItem label="Received By" value={returnRecord.receivedBy} />
          <DetailItem label="Status" value={returnRecord.status} />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">{returnRecord.remarks}</p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Return Summary</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {returnRecord.assetName}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            This asset was returned by {returnRecord.returnedBy} from{" "}
            {returnRecord.department}.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inspection Status</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {returnRecord.status}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Inspection workflow, damage verification and final asset status will
            be connected after backend integration.
          </p>
        </div>
      </section>
    </LayoutWrapper>
  );
}