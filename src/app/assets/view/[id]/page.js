"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import BackButton from "@/components/common/BackButton";

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
    purchaseRef: "PO-2024-0412",
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
    purchaseRef: "PO-2024-0620",
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

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
            Audit Trail
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Created By</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {asset.createdBy}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {asset.createdAt}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Updated By</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {asset.updatedBy}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Updated At</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {asset.updatedAt}
              </p>
            </div>
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
