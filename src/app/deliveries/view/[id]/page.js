"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";

const deliveries = [
  {
    id: "1",
    deliveryCode: "DLV-001",
    assetTag: "AST-001",
    assetName: "Dell Latitude 5420",
    assignedTo: "Rahul Patil",
    department: "IT Department",
    assignedDate: "2026-01-15",
    expectedReturnDate: "2026-12-31",
    condition: "Good",
    status: "Assigned",
    remarks: "Laptop assigned for development work.",
  },
  {
    id: "2",
    deliveryCode: "DLV-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    assignedTo: "Sneha Jadhav",
    department: "Accounts",
    assignedDate: "2026-01-20",
    expectedReturnDate: "2026-12-31",
    condition: "New",
    status: "Assigned",
    remarks: "Printer assigned to accounts department.",
  },
  {
    id: "3",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    assignedTo: "Amit Shinde",
    department: "Admin",
    assignedDate: "2026-02-01",
    expectedReturnDate: "2026-08-01",
    condition: "Good",
    status: "Returned",
    remarks: "Keyboard returned in working condition.",
  },
  {
    id: "4",
    deliveryCode: "DLV-004",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    assignedTo: "Priya More",
    department: "HR",
    assignedDate: "2026-02-10",
    expectedReturnDate: "2026-09-10",
    condition: "Working",
    status: "Pending Return",
    remarks: "Return confirmation is pending.",
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

function DeliveryStatusBadge({ status }) {
  const statusStyles = {
    Assigned: "bg-blue-100 text-blue-700 border-blue-200",
    Returned: "bg-green-100 text-green-700 border-green-200",
    "Pending Return": "bg-yellow-100 text-yellow-700 border-yellow-200",
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

export default function ViewDeliveryPage() {
  const params = useParams();
  const deliveryId = params.id;

  const delivery =
    deliveries.find((item) => item.id === deliveryId) || deliveries[0];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Delivery Details"
        description="View asset assignment information, employee allocation, condition and return status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/deliveries" label="Deliveries" />

        <Link
          href={`/deliveries/edit/${delivery.id}`}
          prefetch={false}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Delivery
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {delivery.deliveryCode}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {delivery.assetName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {delivery.assetTag} • Assigned to {delivery.assignedTo}
            </p>
          </div>

          <DeliveryStatusBadge status={delivery.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Delivery Code" value={delivery.deliveryCode} />
          <DetailItem label="Asset Tag" value={delivery.assetTag} />
          <DetailItem label="Asset Name" value={delivery.assetName} />
          <DetailItem label="Assigned To" value={delivery.assignedTo} />
          <DetailItem label="Department" value={delivery.department} />
          <DetailItem label="Assigned Date" value={delivery.assignedDate} />
          <DetailItem
            label="Expected Return Date"
            value={delivery.expectedReturnDate}
          />
          <DetailItem label="Asset Condition" value={delivery.condition} />
          <DetailItem label="Status" value={delivery.status} />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">{delivery.remarks}</p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assignment Summary</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {delivery.assetName}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            This asset is assigned to {delivery.assignedTo} from{" "}
            {delivery.department}.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Return Status</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {delivery.status}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Return workflow and acknowledgement will be connected after backend
            integration.
          </p>
        </div>
      </section>
    </LayoutWrapper>
  );
}