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
    deliveredTo: "Rahul Patil",
    department: "IT Department",
    issuedBy: "IT Admin",
    location: "Pune Office - IT Bay",
    accessoriesIncluded: "Charger, laptop bag",
    acknowledgementStatus: "Acknowledged",
    qrCode: "QR-DLV-001",
    returnStatus: "Not Due",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2026-01-15 10:30",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-15 10:30",
    deliveryDate: "2026-01-15",
    expectedReturnDate: "2026-12-31",
    condition: "Good",
    status: "Delivered",
    specifications: "Intel i5, 16GB RAM, 512GB SSD, Windows 11 Pro",
    description: "Laptop delivered for development work with charger and bag.",
    remarks: "Delivery completed successfully.",
  },
  {
    id: "2",
    deliveryCode: "DLV-002",
    assetTag: "AST-002",
    assetName: "HP LaserJet Printer",
    deliveredTo: "Sneha Jadhav",
    department: "Accounts",
    issuedBy: "IT Support",
    location: "Pune Office - Accounts",
    accessoriesIncluded: "Power cable, USB cable",
    acknowledgementStatus: "Acknowledged",
    qrCode: "QR-DLV-002",
    returnStatus: "Not Due",
    attachmentStatus: "Pending",
    createdBy: "IT Support",
    createdAt: "2026-01-20 11:15",
    updatedBy: "IT Support",
    updatedAt: "2026-01-20 11:15",
    deliveryDate: "2026-01-20",
    expectedReturnDate: "2026-12-31",
    condition: "New",
    status: "Delivered",
    specifications: "Laser printer, black and white, network printing support",
    description: "Printer delivered to accounts department for daily printing.",
    remarks: "Printer delivered with power cable.",
  },
  {
    id: "3",
    deliveryCode: "DLV-003",
    assetTag: "AST-003",
    assetName: "Logitech Keyboard",
    deliveredTo: "Amit Shinde",
    department: "Admin",
    issuedBy: "IT Support",
    location: "Admin Desk",
    accessoriesIncluded: "USB receiver",
    acknowledgementStatus: "Returned",
    qrCode: "QR-DLV-003",
    returnStatus: "Returned",
    attachmentStatus: "Uploaded",
    createdBy: "IT Support",
    createdAt: "2026-02-01 15:45",
    updatedBy: "IT Admin",
    updatedAt: "2026-02-10 16:20",
    deliveryDate: "2026-02-01",
    expectedReturnDate: "2026-08-01",
    condition: "Good",
    status: "Returned",
    specifications: "USB keyboard, standard layout",
    description: "Keyboard delivered to admin department.",
    remarks: "Keyboard returned in working condition.",
  },
  {
    id: "4",
    deliveryCode: "DLV-004",
    assetTag: "AST-004",
    assetName: "Cisco Router",
    deliveredTo: "Priya More",
    department: "HR",
    issuedBy: "IT Admin",
    location: "HR Network Rack",
    accessoriesIncluded: "Power adapter, patch cable",
    acknowledgementStatus: "Pending",
    qrCode: "QR-DLV-004",
    returnStatus: "Pending Return",
    attachmentStatus: "Pending",
    createdBy: "IT Admin",
    createdAt: "2026-02-10 12:10",
    updatedBy: "IT Admin",
    updatedAt: "2026-02-10 12:10",
    deliveryDate: "2026-02-10",
    expectedReturnDate: "2026-09-10",
    condition: "Working",
    status: "Pending Return",
    specifications: "Cisco router, gigabit ports, enterprise network support",
    description: "Router delivered for HR department network setup.",
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
    Delivered: "bg-blue-100 text-blue-700 border-blue-200",
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
        description="View department-wise equipment/material delivery information, receiver details, condition and return status."
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

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Print Acknowledgement
        </button>
      </div>

      <section className="print-area rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {delivery.deliveryCode}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {delivery.assetName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {delivery.assetTag} - Issued to {delivery.department}; received
              by {delivery.deliveredTo}
            </p>
          </div>

          <DeliveryStatusBadge status={delivery.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Delivery Code" value={delivery.deliveryCode} />
          <DetailItem label="Asset Tag" value={delivery.assetTag} />
          <DetailItem label="Asset / Material Name" value={delivery.assetName} />
          <DetailItem label="Receiver / Employee Name" value={delivery.deliveredTo} />
          <DetailItem label="Department" value={delivery.department} />
          <DetailItem label="Issued By" value={delivery.issuedBy} />
          <DetailItem label="Location" value={delivery.location} />
          <DetailItem label="Delivery Date" value={delivery.deliveryDate} />
          <DetailItem
            label="Expected Return Date"
            value={delivery.expectedReturnDate}
          />
          <DetailItem label="Asset Condition" value={delivery.condition} />
          <DetailItem label="Delivery Status" value={delivery.status} />
          <DetailItem
            label="Acknowledgement Status"
            value={delivery.acknowledgementStatus}
          />
          <DetailItem label="Return Status" value={delivery.returnStatus} />
          <DetailItem label="QR Code Reference" value={delivery.qrCode} />
          <DetailItem
            label="Attachment Status"
            value={delivery.attachmentStatus}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Specifications
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {delivery.specifications || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Accessories Included
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {delivery.accessoriesIncluded || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {delivery.description || "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">{delivery.remarks}</p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Audit Trail
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Created By</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {delivery.createdBy}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {delivery.createdAt}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Updated By</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {delivery.updatedBy}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Updated At</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {delivery.updatedAt}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Delivery Summary</p>
          <h3 className="mt-2 text-lg font-bold text-gray-900">
            {delivery.assetName}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            This equipment/material is issued to {delivery.department} and
            collected by {delivery.deliveredTo}.
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

      <section className="print-area mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Delivery Acknowledgement
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Receiver / Employee Name" value={delivery.deliveredTo} />
          <DetailItem label="Asset" value={delivery.assetName} />
          <DetailItem label="Delivery Date" value={delivery.deliveryDate} />
          <DetailItem label="Accessories" value={delivery.accessoriesIncluded} />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="border-t border-gray-300 pt-2 text-sm text-gray-600">
            Receiver Signature
          </div>
          <div className="border-t border-gray-300 pt-2 text-sm text-gray-600">
            IT Department Signature
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
