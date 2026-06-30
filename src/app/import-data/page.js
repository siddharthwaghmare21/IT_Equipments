"use client";

import { useCallback, useEffect, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { createImportJob, getImportJobs } from "@/lib/apiClient";
import { getSessionToken } from "@/lib/authSession";

const importModules = [
  {
    title: "Assets",
    format: "assetTag, name, category, serialNumber, warrantyExpiry",
    status: "Tracking Connected",
  },
  {
    title: "Vendors",
    format: "vendorName, contactPerson, gstNumber, paymentTerms",
    status: "Tracking Connected",
  },
  {
    title: "Purchases",
    format: "workOrderNumber, vendorName, invoiceNumber, purchaseDate, amount",
    status: "Tracking Connected",
  },
  {
    title: "Transfers",
    format: "transferCode, assetTag, fromDepartment, toDepartment, newReceiver, status",
    status: "Tracking Connected",
  },
  {
    title: "Returns",
    format: "returnCode, assetTag, returnedBy, returnDate, condition, status",
    status: "Tracking Connected",
  },
  {
    title: "Maintenance",
    format: "maintenanceCode, assetTag, issueType, vendorName, priority, status",
    status: "Tracking Connected",
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [importJobs, setImportJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const loadImportJobs = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setJobsError("Login session expired. Please login again.");
      setIsLoadingJobs(false);
      return;
    }

    setIsLoadingJobs(true);
    setJobsError("");

    try {
      setImportJobs(await getImportJobs(token, 10));
    } catch (error) {
      setJobsError(error.message || "Import jobs could not be loaded.");
    } finally {
      setIsLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadImportJobs();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadImportJobs]);

  async function handleValidate(moduleName) {
    setSelectedModule(moduleName);
    setShowPreview(true);
    const token = getSessionToken();

    if (!token) {
      showToast("Login session expired. Import tracking was not saved.", "warning");
      return;
    }

    try {
      const fileName = selectedFile?.name || `${moduleName.toLowerCase()}-template.csv`;
      const fileSize = selectedFile?.size || 0;
      await createImportJob(
        {
          importModule: moduleName,
          sourceFileName: fileName,
          sourceFileSizeBytes: fileSize,
          totalRows: previewRows.length,
          validRows: previewRows.filter((row) => row.status === "Valid").length,
          invalidRows: previewRows.filter((row) => row.status !== "Valid").length,
          remarks: "Frontend preview validation recorded. Actual database import remains controlled.",
        },
        token
      );
      showToast(`${moduleName} import validation tracked.`);
      loadImportJobs();
    } catch (error) {
      showToast(error.message || "Import tracking could not be saved.", "warning");
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Import Data"
        description="Prepare bulk import files for assets, departments, vendors, work orders and transfer records."
      />

      <section className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm">
        Import job tracking is connected to backend APIs. File parsing,
        template download and direct database import will be added in the next
        Phase 7 substep after tracking is verified.
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
                onChange={(event) => {
                  setSelectedModule(item.title);
                  setSelectedFile(event.target.files?.[0] || null);
                  setShowPreview(true);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-gray-900"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  showToast(`${item.title} template download is planned in Phase 7.`)
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
                Preview format only. Real parsing will run through backend import APIs.
              </p>
            </div>
            <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-800">
              Phase 7 Required
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
              Preview result only. Real row validation will run after import APIs are connected.
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

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Recent Import Jobs
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Backend import tracking history from MySQL.
            </p>
          </div>
          <button
            type="button"
            onClick={loadImportJobs}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4">
          {isLoadingJobs ? (
            <LoadingState
              title="Loading import jobs"
              description="Fetching recent import tracking records."
            />
          ) : jobsError ? (
            <ErrorState
              title="Import jobs unavailable"
              description={jobsError}
              onRetry={loadImportJobs}
            />
          ) : importJobs.length === 0 ? (
            <p className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
              No import tracking jobs are available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Module</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">File</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Rows</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Valid</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Invalid</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importJobs.map((job) => (
                    <tr key={job.importJobId} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {job.importModule}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {job.sourceFileName || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {job.totalRows ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {job.validRows ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {job.invalidRows ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {job.importStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </LayoutWrapper>
  );
}
