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
    requiredColumns: ["assetTag", "name", "category", "serialNumber", "warrantyExpiry"],
    sampleRow: ["IT-LAP-010", "Dell Latitude 7440", "Laptop", "DL7440-2231", "2027-03-31"],
    status: "Tracking Connected",
  },
  {
    title: "Vendors",
    requiredColumns: ["vendorName", "contactPerson", "gstNumber", "paymentTerms"],
    sampleRow: ["ABC Computers", "Rahul Sharma", "27ABCDE1234F1Z5", "30 Days"],
    status: "Tracking Connected",
  },
  {
    title: "Purchases",
    requiredColumns: ["workOrderNumber", "vendorName", "invoiceNumber", "purchaseDate", "amount"],
    sampleRow: ["WO-2026-001", "ABC Computers", "INV-1001", "2026-06-30", "125000"],
    status: "Tracking Connected",
  },
  {
    title: "Transfers",
    requiredColumns: ["transferCode", "assetTag", "fromDepartment", "toDepartment", "newReceiver", "status"],
    sampleRow: ["TR-2026-001", "IT-LAP-010", "IT", "Accounts", "Amit Patil", "Pending"],
    status: "Tracking Connected",
  },
  {
    title: "Returns",
    requiredColumns: ["returnCode", "assetTag", "returnedBy", "returnDate", "condition", "status"],
    sampleRow: ["RT-2026-001", "IT-LAP-010", "Amit Patil", "2026-06-30", "Good", "Received"],
    status: "Tracking Connected",
  },
  {
    title: "Maintenance",
    requiredColumns: ["maintenanceCode", "assetTag", "issueType", "vendorName", "priority", "status"],
    sampleRow: ["MT-2026-001", "IT-LAP-010", "Battery Issue", "ABC Computers", "High", "Open"],
    status: "Tracking Connected",
  },
];

const emptyValidationSummary = {
  headers: [],
  missingColumns: [],
  totalRows: 0,
  validRows: 0,
  invalidRows: 0,
};

function getModuleConfig(moduleName) {
  return importModules.find((item) => item.title === moduleName) || importModules[0];
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function parseCsvText(csvText) {
  const rows = [];
  let currentValue = "";
  let currentRow = [];
  let isQuoted = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && isQuoted && nextChar === '"') {
      currentValue += '"';
      index += 1;
    } else if (char === '"') {
      isQuoted = !isQuoted;
    } else if (char === "," && !isQuoted) {
      currentRow.push(currentValue.trim());
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !isQuoted) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentValue.trim());
      if (currentRow.some((value) => value !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  currentRow.push(currentValue.trim());
  if (currentRow.some((value) => value !== "")) {
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0].map((header) => header.trim());
  const dataRows = rows.slice(1).map((row) =>
    headers.reduce((record, header, index) => {
      record[header] = row[index]?.trim() || "";
      return record;
    }, {})
  );

  return { headers, rows: dataRows };
}

function validateRows(moduleName, headers, rows) {
  const moduleConfig = getModuleConfig(moduleName);
  const normalizedHeaders = new Set(headers.map((header) => header.toLowerCase()));
  const missingColumns = moduleConfig.requiredColumns.filter(
    (column) => !normalizedHeaders.has(column.toLowerCase())
  );

  const headerLookup = headers.reduce((lookup, header) => {
    lookup[header.toLowerCase()] = header;
    return lookup;
  }, {});

  const previewRows = rows.map((row, index) => {
    const emptyRequiredColumns = moduleConfig.requiredColumns.filter((column) => {
      const realHeader = headerLookup[column.toLowerCase()];
      return !realHeader || !row[realHeader]?.trim();
    });
    const rowStatus =
      missingColumns.length === 0 && emptyRequiredColumns.length === 0 ? "Valid" : "Review";

    return {
      rowNumber: index + 2,
      values: row,
      status: rowStatus,
      message:
        rowStatus === "Valid"
          ? "Ready"
          : [...missingColumns, ...emptyRequiredColumns].join(", ") || "Needs review",
    };
  });

  return {
    previewRows,
    summary: {
      headers,
      missingColumns,
      totalRows: previewRows.length,
      validRows: previewRows.filter((row) => row.status === "Valid").length,
      invalidRows: previewRows.filter((row) => row.status !== "Valid").length,
    },
  };
}

export default function ImportDataPage() {
  const [selectedModule, setSelectedModule] = useState("Assets");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [validationSummary, setValidationSummary] = useState(emptyValidationSummary);
  const [fileMessage, setFileMessage] = useState("");
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

  function downloadTemplate(moduleName) {
    const moduleConfig = getModuleConfig(moduleName);
    const csvRows = [moduleConfig.requiredColumns, moduleConfig.sampleRow]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n");
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${moduleName.toLowerCase()}-import-template.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast(`${moduleName} CSV template downloaded.`);
  }

  function handleFileChange(event, moduleName) {
    const file = event.target.files?.[0] || null;
    setSelectedModule(moduleName);
    setSelectedFile(file);
    setShowPreview(true);
    setPreviewRows([]);
    setValidationSummary(emptyValidationSummary);
    setFileMessage("");

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileMessage("Currently CSV files are parsed in browser. Excel parsing is reserved for the controlled import step.");
      showToast("Please upload CSV for validation preview.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsvText(String(reader.result || ""));
        const validated = validateRows(moduleName, parsed.headers, parsed.rows);
        setPreviewRows(validated.previewRows);
        setValidationSummary(validated.summary);
        setFileMessage(
          validated.summary.totalRows === 0
            ? "No data rows found after the header row."
            : `${validated.summary.totalRows} rows checked from CSV file.`
        );
      } catch (error) {
        setFileMessage(error.message || "CSV file could not be parsed.");
        showToast("CSV file could not be parsed.", "warning");
      }
    };
    reader.onerror = () => {
      setFileMessage("Selected file could not be read.");
      showToast("Selected file could not be read.", "warning");
    };
    reader.readAsText(file);
  }

  async function handleValidate(moduleName) {
    setSelectedModule(moduleName);
    setShowPreview(true);
    if (selectedModule !== moduleName || !selectedFile || validationSummary.totalRows === 0) {
      showToast("Select a CSV file with data rows before tracking validation.", "warning");
      return;
    }

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
          totalRows: validationSummary.totalRows,
          validRows: validationSummary.validRows,
          invalidRows: validationSummary.invalidRows,
          remarks:
            validationSummary.missingColumns.length > 0
              ? `Missing required columns: ${validationSummary.missingColumns.join(", ")}`
              : "Frontend CSV validation recorded. Actual database import remains controlled.",
        },
        token
      );
      showToast(`${moduleName} import validation tracked.`);
      loadImportJobs();
    } catch (error) {
      showToast(error.message || "Import tracking could not be saved.", "warning");
    }
  }

  const selectedModuleConfig = getModuleConfig(selectedModule);
  const previewHeaders = selectedModuleConfig.requiredColumns;
  const headerLookup = validationSummary.headers.reduce((lookup, header) => {
    lookup[header.toLowerCase()] = header;
    return lookup;
  }, {});

  return (
    <LayoutWrapper>
      <PageHeader
        title="Import Data"
        description="Prepare bulk import files for assets, departments, vendors, work orders and transfer records."
      />

      <section className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm">
        Import job tracking is connected to backend APIs. CSV template download
        and browser-side validation are active. Direct database import remains
        locked until approved data loading and final testing.
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
                  Required columns: {item.requiredColumns.join(", ")}
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
                onChange={(event) => handleFileChange(event, item.title)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white focus:border-gray-900"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadTemplate(item.title)}
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
                CSV validation preview with backend tracking. Database import is still locked.
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              CSV Validation Active
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Total Rows
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {validationSummary.totalRows}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase text-emerald-700">
                Valid Rows
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {validationSummary.validRows}
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase text-red-700">
                Review Rows
              </p>
              <p className="mt-1 text-2xl font-bold text-red-900">
                {validationSummary.invalidRows}
              </p>
            </div>
          </div>

          {(fileMessage || validationSummary.missingColumns.length > 0) && (
            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
              {fileMessage && <p>{fileMessage}</p>}
              {validationSummary.missingColumns.length > 0 && (
                <p>
                  Missing required columns:{" "}
                  {validationSummary.missingColumns.join(", ")}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Row</th>
                  {previewHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 font-semibold text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewRows.length === 0 ? (
                  <tr className="border-b border-gray-100">
                    <td
                      colSpan={previewHeaders.length + 3}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Select a CSV file to preview validation results.
                    </td>
                  </tr>
                ) : (
                  previewRows.slice(0, 20).map((row) => (
                    <tr
                      key={`${selectedModule}-${row.rowNumber}`}
                      className="border-b border-gray-100"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {row.rowNumber}
                      </td>
                      {previewHeaders.map((header) => {
                        const realHeader = headerLookup[header.toLowerCase()];

                        return (
                          <td key={header} className="px-4 py-3 text-gray-700">
                            {realHeader ? row.values[realHeader] || "-" : "-"}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            row.status === "Valid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-yellow-50 text-yellow-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {previewRows.length > 20 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing first 20 rows only. Full row counts are used for validation
              tracking.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              Validation tracking saves file name, row counts and review count to
              backend.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleValidate(selectedModule)}
                disabled={validationSummary.totalRows === 0}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-600"
              >
                Track Validation
              </button>
              <button
                type="button"
                disabled
                className="rounded-xl bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
              >
                Import to Database
              </button>
            </div>
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
