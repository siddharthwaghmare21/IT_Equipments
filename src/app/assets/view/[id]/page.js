"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import BackButton from "@/components/common/BackButton";
import { showToast } from "@/components/common/ToastHost";

const assets = [
  {
    id: "1",
    assetTag: "IT-LAP-001",
    name: "Dell Latitude 5420",
    category: "Laptop",
    brand: "Dell",
    model: "Latitude 5420",
    serialNumber: "DL5420-9821",
    purchaseDate: "2024-04-12",
    purchaseRef: "WO-2024-0412",
    warrantyExpiry: "2027-04-12",
    deliveredTo: "Rahul Patil",
    department: "IT Department",
    location: "Main Office",
    custodianDepartment: "IT Department",
    status: "Delivered",
    condition: "Good",
    lifecycleStatus: "In Use",
    qrCode: "QR-IT-LAP-001",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2024-04-12 10:00",
    updatedBy: "IT Admin",
    updatedAt: "2026-01-15 10:30",
    specifications: "Intel i5, 16GB RAM, 512GB SSD, Windows 11 Pro",
    description: "Laptop used for software development and office work.",
    remarks: "Delivered for software development work.",
  },
  {
    id: "2",
    assetTag: "IT-LAP-002",
    name: "HP EliteBook 840",
    category: "Laptop",
    brand: "HP",
    model: "EliteBook 840",
    serialNumber: "HP840-4421",
    purchaseDate: "2024-06-20",
    purchaseRef: "WO-2024-0620",
    warrantyExpiry: "2027-06-20",
    deliveredTo: "-",
    department: "-",
    location: "Store Room",
    custodianDepartment: "IT Store",
    status: "Available",
    condition: "New",
    lifecycleStatus: "In Stock",
    qrCode: "QR-IT-LAP-002",
    attachmentStatus: "Uploaded",
    createdBy: "IT Admin",
    createdAt: "2024-06-20 11:00",
    updatedBy: "IT Admin",
    updatedAt: "2024-06-20 11:00",
    specifications: "Intel i7, 16GB RAM, 512GB SSD, Windows 11 Pro",
    description: "Laptop available in store room for future delivery.",
    remarks: "Ready for delivery.",
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

export default function ViewAssetPage() {
  const params = useParams();
  const assetId = params.id;

  const asset = assets.find((item) => item.id === assetId) || assets[0];
  const auditTimeline = [
    {
      title: "Asset Registered",
      detail: `${asset.createdBy} created this asset record.`,
      time: asset.createdAt,
    },
    {
      title: "Purchase Linked",
      detail: `${asset.purchaseRef} attached with warranty expiry ${asset.warrantyExpiry}.`,
      time: asset.purchaseDate,
    },
    {
      title: asset.status === "Delivered" ? "Asset Delivered" : "Stock Ready",
      detail:
        asset.status === "Delivered"
          ? `Issued to ${asset.deliveredTo} in ${asset.department}.`
          : `Available at ${asset.location} for future delivery.`,
      time: asset.updatedAt,
    },
    {
      title: "Last Updated",
      detail: `${asset.updatedBy} updated lifecycle status to ${asset.lifecycleStatus}.`,
      time: asset.updatedAt,
    },
  ];
  const lifecycleSteps = [
    "Purchased",
    "Registered",
    asset.status === "Delivered" ? "Delivered" : "Stored",
    "Transfer",
    "Maintenance",
    "Retire",
  ];
  const transferHistory = [
    {
      code: "TRF-001",
      type: "Department Transfer",
      fromDepartment: "IT Department",
      toDepartment: "Accounts",
      receiver: "Sneha Jadhav",
      status: "Completed",
      date: "2026-06-12",
      condition: "Good",
    },
    {
      code: "TRF-003",
      type: "Reassignment",
      fromDepartment: "IT Store",
      toDepartment: "HR",
      receiver: "Priya More",
      status: "Reassigned",
      date: "2026-06-16",
      condition: "Working",
    },
  ];

  function handlePrintLabel() {
    showToast("Print preview opened.");
    window.print();
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Asset Details"
        description="View complete information about this IT asset, specifications, delivery and warranty status."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href="/assets" label="Assets" />

        <Link
          href={`/assets/edit/${asset.id}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Edit Asset
        </Link>
      </div>

      <section className="print-area rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {asset.assetTag}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {asset.name}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {asset.category} - {asset.brand} - {asset.model}
            </p>
          </div>

          <StatusBadge status={asset.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Asset Tag" value={asset.assetTag} />
          <DetailItem label="Asset Name" value={asset.name} />
          <DetailItem label="Category" value={asset.category} />
          <DetailItem label="Brand" value={asset.brand} />
          <DetailItem label="Model" value={asset.model} />
          <DetailItem label="Serial Number" value={asset.serialNumber} />
          <DetailItem label="Purchase Reference" value={asset.purchaseRef} />
          <DetailItem label="Purchase Date" value={asset.purchaseDate} />
          <DetailItem label="Warranty Expiry" value={asset.warrantyExpiry} />
          <DetailItem label="Condition" value={asset.condition} />
          <DetailItem label="Lifecycle Status" value={asset.lifecycleStatus} />
          <DetailItem label="Delivered To" value={asset.deliveredTo} />
          <DetailItem label="Department" value={asset.department} />
          <DetailItem
            label="Custodian Department"
            value={asset.custodianDepartment}
          />
          <DetailItem label="Location" value={asset.location} />
          <DetailItem label="QR Code Reference" value={asset.qrCode} />
          <DetailItem
            label="Attachment Status"
            value={asset.attachmentStatus}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Specifications
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {asset.specifications || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {asset.description || "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">{asset.remarks || "-"}</p>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Asset Lifecycle Flow
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
            {lifecycleSteps.map((step, index) => (
              <div
                key={step}
                className={`rounded-xl border p-3 ${
                  index <= 2
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                <p className="text-xs font-bold uppercase">Step {index + 1}</p>
                <p className="mt-1 text-sm font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Transfer History
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Department movement, IT collection and reassignment records for
                this asset.
              </p>
            </div>

            <Link
              href="/transfers"
              className="inline-flex w-fit justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Open Transfers
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {transferHistory.map((transfer) => (
              <div
                key={transfer.code}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {transfer.code} | {transfer.type}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {transfer.fromDepartment} to {transfer.toDepartment}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">
                      Receiver: {transfer.receiver} | Condition:{" "}
                      {transfer.condition}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                      {transfer.date}
                    </span>
                    <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {transfer.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 xl:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Audit Timeline
            </p>

            <div className="mt-4 space-y-4">
              {auditTimeline.map((event) => (
                <div key={`${event.title}-${event.time}`} className="flex gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-gray-900" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {event.detail}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              QR / Barcode Label
            </p>

            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center">
              <div className="mx-auto grid h-36 w-36 grid-cols-4 gap-1 rounded-lg bg-gray-900 p-2">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    className={`rounded-sm ${
                      [1, 2, 4, 7, 8, 11, 13, 14].includes(index)
                        ? "bg-white"
                        : "bg-gray-900"
                    }`}
                  />
                ))}
              </div>

              <p className="mt-3 text-sm font-bold text-gray-900">
                {asset.assetTag}
              </p>
              <p className="mt-1 text-xs text-gray-500">{asset.qrCode}</p>
            </div>

            <button
              type="button"
              onClick={handlePrintLabel}
              className="no-print mt-4 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Print Label
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Document Preview
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {["Invoice", "Warranty Card", "Acknowledgement"].map((document) => (
              <div
                key={document}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {document}
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Preview will open here after backend document storage is
                  connected.
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Preview
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-gray-900">
          Maintenance History
        </h3>

        <p className="mt-2 text-sm text-gray-600">
          No maintenance records available yet. Backend records will be
          connected later.
        </p>
      </section>
    </LayoutWrapper>
  );
}
