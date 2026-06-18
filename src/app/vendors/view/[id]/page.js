"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const vendors = [
  {
    id: "1",
    vendorCode: "VEN-001",
    vendorName: "Dell Technologies",
    contactPerson: "Amit Sharma",
    phone: "+91 98765 43210",
    email: "sales@dellvendor.com",
    city: "Pune",
    state: "Maharashtra",
    address: "Baner Road, Pune, Maharashtra",
    gstNumber: "27ABCDE1234F1Z5",
    category: "Laptop Supplier",
    status: "Active",
    remarks: "Primary supplier for Dell laptops and accessories.",
  },
  {
    id: "2",
    vendorCode: "VEN-002",
    vendorName: "HP World",
    contactPerson: "Rohit Patil",
    phone: "+91 99887 77665",
    email: "orders@hpworld.com",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Andheri East, Mumbai, Maharashtra",
    gstNumber: "27HPWLD5678K1Z8",
    category: "Laptop Supplier",
    status: "Active",
    remarks: "Preferred vendor for HP laptops and desktops.",
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

function VendorStatusBadge({ status }) {
  const statusStyles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Blacklisted: "bg-red-100 text-red-700 border-red-200",
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

export default function ViewVendorPage() {
  const params = useParams();
  const vendorId = params.id;

  const vendor = vendors.find((item) => item.id === vendorId) || vendors[0];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Vendor Details"
        description="View complete vendor contact, GST, address, category and status information."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/vendors"
          className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          ← Back to Vendors
        </Link>

        <Link
          href={`/vendors/edit/${vendor.id}`}
          className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Update Vendor
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {vendor.vendorCode}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {vendor.vendorName}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {vendor.category} • {vendor.city}
            </p>
          </div>

          <VendorStatusBadge status={vendor.status} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Vendor Code" value={vendor.vendorCode} />
          <DetailItem label="Vendor Name" value={vendor.vendorName} />
          <DetailItem label="Contact Person" value={vendor.contactPerson} />
          <DetailItem label="Phone Number" value={vendor.phone} />
          <DetailItem label="Email Address" value={vendor.email} />
          <DetailItem label="Category" value={vendor.category} />
          <DetailItem label="City" value={vendor.city} />
          <DetailItem label="State" value={vendor.state} />
          <DetailItem label="GST Number" value={vendor.gstNumber} />
          <DetailItem label="Status" value={vendor.status} />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Address
          </p>
          <p className="mt-2 text-sm text-gray-700">{vendor.address}</p>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Remarks
          </p>
          <p className="mt-2 text-sm text-gray-700">{vendor.remarks}</p>
        </div>
      </section>
    </LayoutWrapper>
  );
}