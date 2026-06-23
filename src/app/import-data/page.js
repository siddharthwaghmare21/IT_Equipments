"use client";

import { useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { showToast } from "@/components/common/ToastHost";

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

const previewRows = [
  {
    assetTag: "IT-LAP-010",
    name: "Dell Latitude 7440",
    category: "Laptop",
    serialNumber: "DL7440-2231",
    status: "Valid",
  },
  {
    assetTag: "IT-MON-009",
    name: "Dell 24 Inch Monitor",
    category: "Monitor",
    serialNumber: "MON24-9921",
    status: "Valid",
  },
  {
    assetTag: "IT-PRN-004",
    name: "Canon Laser Printer",
    category: "Printer",
    serialNumber: "CAN-2201",
    status: "Review",
  },
];

export default function ImportDataPage() {
  const [selectedModule, setSelectedModule] = useState("Assets");
  const [showPreview, setShowPreview] = useState(false);

  function handleValidate(moduleName) {
    setSelectedModule(moduleName);
    setShowPreview(true);
    showToast(`${moduleName} file preview validated for frontend demo.`);
  }

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
                onChange={() => {
                  setSelectedModule(item.title);
                  setShowPreview(true);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-gray-900"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  showToast(`${item.title} template download will be connected later.`)
                }
                className="inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Download Template
              </button>
              <button
                type="button"
                onClick={() => handleValidate(item.title)}
                className="inline-flex justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Validate File
              </button>
            </div>
          </div>
        ))}
      </section>

      {showPreview && (
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedModule} Import Preview
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Sample preview only. Real parsing will run through backend API.
              </p>
            </div>
            <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800">
              Backend Required
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Asset Tag
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Serial Number
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.assetTag} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {row.assetTag}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.name}</td>
                    <td className="px-4 py-3 text-gray-700">{row.category}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              2 valid rows, 1 row needs review, 0 duplicates found.
            </p>
            <button
              type="button"
              disabled
              className="rounded-xl bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
            >
              Import to Database
            </button>
          </div>
        </section>
      )}
    </LayoutWrapper>
  );
}
