"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const importModules = [
  {
    title: "Assets",
    format: "assetTag, name, category, serialNumber, warrantyExpiry",
    status: "Template Ready",
  },
  {
    title: "Employees",
    format: "name, department, designation, email, phone, location",
    status: "Template Ready",
  },
  {
    title: "Vendors",
    format: "vendorName, contactPerson, gstNumber, paymentTerms",
    status: "Template Ready",
  },
  {
    title: "Purchases",
    format: "poNumber, vendorName, invoiceNumber, purchaseDate, amount",
    status: "Backend Pending",
  },
];

export default function ImportDataPage() {
  return (
    <LayoutWrapper>
      <PageHeader
        title="Import Data"
        description="Prepare bulk import files for assets, employees, vendors and purchase records."
      />

      <section className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm">
        File parsing and database upload will be connected with backend APIs.
        This page is ready as a frontend workflow placeholder.
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {importModules.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {item.title} Import
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Required columns: {item.format}
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                {item.status}
              </span>
            </div>

            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Upload CSV / Excel File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-gray-900"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Download Template
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Validate File
              </button>
            </div>
          </div>
        ))}
      </section>
    </LayoutWrapper>
  );
}
