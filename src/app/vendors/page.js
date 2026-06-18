"use client";

import { useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ActionButtons from "@/components/common/ActionButtons";

const vendors = [
  {
    id: 1,
    vendorCode: "VEN-001",
    vendorName: "Dell Technologies",
    contactPerson: "Amit Sharma",
    phone: "+91 98765 43210",
    email: "sales@dellvendor.com",
    city: "Pune",
    category: "Laptop Supplier",
    status: "Active",
  },
  {
    id: 2,
    vendorCode: "VEN-002",
    vendorName: "HP World",
    contactPerson: "Rohit Patil",
    phone: "+91 99887 77665",
    email: "orders@hpworld.com",
    city: "Mumbai",
    category: "Laptop Supplier",
    status: "Active",
  },
  {
    id: 3,
    vendorCode: "VEN-003",
    vendorName: "Canon India",
    contactPerson: "Sneha Kulkarni",
    phone: "+91 91234 56789",
    email: "support@canonvendor.com",
    city: "Bengaluru",
    category: "Printer Supplier",
    status: "Active",
  },
  {
    id: 4,
    vendorCode: "VEN-004",
    vendorName: "Network Solutions",
    contactPerson: "Kiran Jadhav",
    phone: "+91 90123 45678",
    email: "network@solutions.com",
    city: "Nashik",
    category: "Network Equipment",
    status: "Inactive",
  },
];

const filters = ["All", "Active", "Inactive", "Blacklisted"];

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

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const searchText = `
        ${vendor.vendorCode}
        ${vendor.vendorName}
        ${vendor.contactPerson}
        ${vendor.phone}
        ${vendor.email}
        ${vendor.city}
        ${vendor.category}
        ${vendor.status}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || vendor.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function handleDelete(vendor) {
    const confirmed = confirm(
      `Are you sure you want to delete ${vendor.vendorName}?`
    );

    if (confirmed) {
      alert("Vendor delete action added. Backend will be connected later.");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Vendors"
        description="Manage IT equipment suppliers, contact details, vendor status and purchase sources."
        buttonText="Add Vendor"
        buttonHref="/vendors/add"
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Vendors</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {vendors.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Vendors</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {vendors.filter((vendor) => vendor.status === "Active").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Vendors</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {vendors.filter((vendor) => vendor.status === "Inactive").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Blacklisted</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {vendors.filter((vendor) => vendor.status === "Blacklisted").length}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by vendor code, name, contact person, phone, city or category..."
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

      <TableWrapper>
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Vendor Code
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Vendor Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Contact Person
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Phone
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                City
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Category
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
            {filteredVendors.map((vendor) => (
              <tr
                key={vendor.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {vendor.vendorCode}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {vendor.vendorName}
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {vendor.contactPerson}
                </td>

                <td className="px-4 py-4 text-gray-700">{vendor.phone}</td>

                <td className="px-4 py-4 text-gray-700">{vendor.email}</td>

                <td className="px-4 py-4 text-gray-700">{vendor.city}</td>

                <td className="px-4 py-4 text-gray-700">
                  {vendor.category}
                </td>

                <td className="px-4 py-4">
                  <VendorStatusBadge status={vendor.status} />
                </td>

                <td className="px-4 py-4">
                  <ActionButtons
                    viewHref={`/vendors/view/${vendor.id}`}
                    updateHref={`/vendors/edit/${vendor.id}`}
                    onDelete={() => handleDelete(vendor)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVendors.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            No vendors found.
          </div>
        )}
      </TableWrapper>
    </LayoutWrapper>
  );
}