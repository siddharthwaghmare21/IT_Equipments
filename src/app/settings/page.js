"use client";

import { useCallback, useEffect, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { ErrorState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import {
  createBackupJob,
  downloadBackupSnapshot,
  getBackupJobs,
  getEmailStatus,
  getReportBrandingSettings,
  restoreBackupSnapshot,
  updateReportBrandingSettings,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";
import { canUseBackupExport } from "@/lib/rbac";

const REPORT_BRANDING_KEY = "itReportBranding";
const reportBrandingFieldMap = {
  company_name: "companyName",
  company_email: "companyEmail",
  company_phone: "companyPhone",
  company_address: "companyAddress",
  report_logo_text: "reportLogoText",
  report_prepared_by: "reportPreparedBy",
  report_classification: "reportClassification",
};

const defaultSettings = {
  companyName: "IT Assets Management",
  companyEmail: "admin@company.com",
  companyPhone: "+91 98765 43210",
  companyAddress: "Main Office, Maharashtra, India",
  reportLogoText: "IT",
  reportPreparedBy: "IT Department",
  reportClassification: "Internal",

  adminName: "Admin",
  adminEmail: "itadmin@company.com",
  adminPhone: "+91 98765 12345",
  defaultRole: "Viewer",
  sessionTimeout: "30",
  passwordExpiryDays: "90",

  lowStockAlert: true,
  warrantyExpiryAlert: true,
  maintenanceAlert: true,
  deliveryAlert: true,
  emailNotifications: true,
  inAppNotifications: true,
  weeklySummary: true,

  csvExport: true,
  printReport: true,
  pdfExport: true,
  excelExport: true,

  loginSecurity: true,
  roleBasedAccess: true,
  requestApproval: true,
  activityLogs: true,
  deleteConfirmation: true,
  dataBackup: false,
  backupScope: "Full Database",
  backupFrequency: "Weekly",
  auditRetention: "365",
  assetTagPrefix: "IT",
  fiscalYearStart: "April",
  warrantyLeadDays: "30",
  assetLabelSize: "Standard",
  dateFormat: "DD-MM-YYYY",
  defaultReportView: "Summary",
};

function mapSettingsFromApi(apiSettings = []) {
  return apiSettings.reduce((mappedSettings, setting) => {
    const settingKey = setting.settingKey || setting.SettingKey;
    const settingValue = setting.settingValue ?? setting.SettingValue ?? "";
    const fieldName = reportBrandingFieldMap[settingKey];

    if (fieldName) {
      mappedSettings[fieldName] = settingValue;
    }

    return mappedSettings;
  }, {});
}

function mapReportBrandingToApi(settings) {
  return Object.entries(reportBrandingFieldMap).map(([settingKey, fieldName]) => ({
    settingKey,
    settingValue: settings[fieldName] || "",
  }));
}
const settingsTabs = [
  { label: "General", target: "settings-general" },
  { label: "Roles", target: "settings-roles" },
  { label: "Backup", target: "settings-backup" },
  { label: "Export", target: "settings-export" },
  { label: "Notifications", target: "settings-notifications" },
  { label: "Security", target: "settings-security" },
];

const sectionClassName =
  "scroll-mt-24 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-5 shadow-sm";
const inputClassName =
  "h-11 w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 text-sm text-white outline-none focus:border-[#7c3aed]";
const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState("General");
  const [backupJobs, setBackupJobs] = useState([]);
  const [isLoadingBackupJobs, setIsLoadingBackupJobs] = useState(true);
  const [backupJobsError, setBackupJobsError] = useState("");
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    isConfigured: false,
    message: "Checking SMTP email status.",
  });
  const [settings, setSettings] = useState(defaultSettings);

  const loadBackupJobs = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setBackupJobsError("Login session expired. Please login again.");
      setIsLoadingBackupJobs(false);
      return;
    }

    setIsLoadingBackupJobs(true);
    setBackupJobsError("");

    try {
      setBackupJobs(await getBackupJobs(token, 10));
    } catch (error) {
      setBackupJobsError(error.message || "Backup jobs could not be loaded.");
    } finally {
      setIsLoadingBackupJobs(false);
    }
  }, []);

  const loadEmailStatus = useCallback(async () => {
    const token = getSessionToken();

    if (!token) {
      setEmailStatus({
        isConfigured: false,
        message: "Login session required to check SMTP status.",
      });
      return;
    }

    try {
      setEmailStatus(await getEmailStatus(token));
    } catch (error) {
      setEmailStatus({
        isConfigured: false,
        message: error.message || "SMTP status could not be loaded.",
      });
    }
  }, []);

  const loadReportBranding = useCallback(async () => {
    try {
      const apiSettings = await getReportBrandingSettings();
      const mappedSettings = mapSettingsFromApi(apiSettings);

      setSettings((currentSettings) => ({
        ...currentSettings,
        ...mappedSettings,
      }));

      localStorage.setItem(REPORT_BRANDING_KEY, JSON.stringify(mappedSettings));
    } catch {
      const savedBranding = JSON.parse(
        localStorage.getItem(REPORT_BRANDING_KEY) || "null"
      );

      if (savedBranding) {
        setSettings((currentSettings) => ({
          ...currentSettings,
          ...savedBranding,
        }));
      }
    }
  }, []);

  useEffect(() => {
    const savedSession = readSession();
    setTimeout(() => {
      setCurrentUser(savedSession);
      setSettings((currentSettings) => ({
        ...currentSettings,
        ...(savedSession
          ? {
              adminName: savedSession.fullName || currentSettings.adminName,
              adminEmail: savedSession.email || currentSettings.adminEmail,
              adminPhone: savedSession.phone || currentSettings.adminPhone,
            }
          : {}),
      }));
    }, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBackupJobs();
      loadEmailStatus();
      loadReportBranding();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadBackupJobs, loadEmailStatus, loadReportBranding]);

  const canUseBackup = canUseBackupExport(currentUser);
  const canRestoreBackup = currentUser?.roleCode === "SUPER_ADMIN";

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const reportBranding = {
      companyName: settings.companyName,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      companyAddress: settings.companyAddress,
      reportLogoText: settings.reportLogoText,
      reportPreparedBy: settings.reportPreparedBy,
      reportClassification: settings.reportClassification,
    };
    localStorage.setItem(REPORT_BRANDING_KEY, JSON.stringify(reportBranding));

    try {
      await updateReportBrandingSettings(
        mapReportBrandingToApi(settings),
        getSessionToken()
      );
      showToast("Report branding saved to backend settings.");
    } catch (error) {
      showToast(
        error.message ||
          "Report branding was saved locally, but backend settings update failed.",
        "warning"
      );
    }
  }

  function handleReset() {
    setSettings({
      ...defaultSettings,
      ...(currentUser
        ? {
            adminName: currentUser.fullName || defaultSettings.adminName,
            adminEmail: currentUser.email || defaultSettings.adminEmail,
            adminPhone: currentUser.phone || defaultSettings.adminPhone,
          }
        : {}),
    });
    showToast("Settings form reset to default values.");
  }

  async function handleCreateBackupJob() {
    const token = getSessionToken();

    if (!token) {
      showToast("Login session expired. Backup tracking was not saved.", "warning");
      return;
    }

    try {
      await createBackupJob(
        {
          backupType: "Manual",
          backupScope: settings.backupScope,
          remarks: `Manual backup tracking requested from settings. Frequency: ${settings.backupFrequency}.`,
        },
        token
      );
      showToast("Backup tracking job created.");
      loadBackupJobs();
    } catch (error) {
      showToast(error.message || "Backup tracking job could not be created.", "warning");
    }
  }

  async function handleDownloadBackupSnapshot() {
    const token = getSessionToken();

    if (!token) {
      showToast("Login session expired. Backup download was not started.", "warning");
      return;
    }

    try {
      await createBackupJob(
        {
          backupType: "Manual",
          backupScope: settings.backupScope,
          remarks: `Manual ${settings.backupScope} JSON backup downloaded from settings.`,
        },
        token
      );
      const backupFile = await downloadBackupSnapshot(settings.backupScope, token);
      const url = URL.createObjectURL(backupFile.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = backupFile.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showToast("Backup JSON file downloaded.");
      loadBackupJobs();
    } catch (error) {
      showToast(error.message || "Backup file could not be downloaded.", "warning");
    }
  }

  async function handleRestoreBackupSnapshot() {
    const token = getSessionToken();

    if (!token || !canRestoreBackup) {
      showToast("Only Super Admin can restore a backup.", "warning");
      return;
    }

    if (!restoreFile) {
      showToast("Select an IT Equipment JSON backup file.", "warning");
      return;
    }

    if (restoreFile.size > 20 * 1024 * 1024) {
      showToast("Backup file must be 20 MB or smaller.", "warning");
      return;
    }

    if (restoreConfirmation !== "RESTORE BACKUP") {
      showToast("Type RESTORE BACKUP exactly to confirm.", "warning");
      return;
    }

    setIsRestoring(true);
    try {
      const snapshot = JSON.parse(await restoreFile.text());
      const result = await restoreBackupSnapshot(snapshot, restoreConfirmation, token);
      showToast(`${result.rowsRestored} rows restored successfully.`);
      setRestoreFile(null);
      setRestoreConfirmation("");
      loadBackupJobs();
    } catch (error) {
      showToast(error.message || "Backup restore failed.", "warning");
    } finally {
      setIsRestoring(false);
    }
  }

  function openSettingsSection(tab) {
    setActiveSettingsTab(tab.label);
    document.getElementById(tab.target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const connectedBackupItems = [
    "MySQL backup job tracking",
    "Controlled JSON snapshot download",
    "Super Admin controlled non-destructive restore",
    "Role-based backup access",
    "Activity log and report export tracking",
  ];

  const futureDeploymentItems = [
    "SMTP email delivery setup",
    "Physical PDF package generation",
    "Backup restore approval workflow",
    "Scheduled report email summary",
  ];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Settings"
        description="Manage company profile, backup controls, exports and system preferences."
      />

      <section className="mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => openSettingsSection(tab)}
              className={`h-10 whitespace-nowrap rounded-lg border px-4 text-sm font-semibold ${
                activeSettingsTab === tab.label
                  ? "border-[#7c3aed] bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white"
                  : "border-[#314666] bg-[#101a2b] text-[#c8d4ec] hover:bg-[#122038]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section
          id="settings-general"
          className={sectionClassName}
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">
              Company Information
            </h2>
            <p className="mt-1 text-sm text-[#8fa4c7]">
              Basic organization details used in reports and system records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClassName}>
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className={labelClassName}>
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>
                Company Phone
              </label>
              <input
                type="tel"
                name="companyPhone"
                value={settings.companyPhone}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>
                Company Address
              </label>
              <input
                type="text"
                name="companyAddress"
                value={settings.companyAddress}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#314666] bg-[#101a2b] p-4">
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">
                Report Branding
              </h3>
              <p className="mt-1 text-sm text-[#8fa4c7]">
                These values are stored in backend settings for organization
                records and future document templates.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className={labelClassName}>
                  Logo Text
                </label>
                <input
                  type="text"
                  name="reportLogoText"
                  value={settings.reportLogoText}
                  onChange={handleChange}
                  maxLength="4"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Prepared By
                </label>
                <input
                  type="text"
                  name="reportPreparedBy"
                  value={settings.reportPreparedBy}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>
                  Classification
                </label>
                <select
                  name="reportClassification"
                  value={settings.reportClassification}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="Internal">Internal</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section
          id="settings-backup"
          className={sectionClassName}
        >
          <h2 className="text-lg font-bold text-white">
            Database Backup
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#8fa4c7]">
            Backup job tracking and JSON snapshot download are connected to the
            backend and MySQL. Restore is restricted to Super Admin and requires
            an explicit confirmation phrase.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {connectedBackupItems.map((item) => (
              <p
                key={item}
                className="rounded-2xl border border-[#314666] bg-[#101a2b] p-3 text-sm font-semibold text-[#c8d4ec]"
              >
                {item}
              </p>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-slate-100">
                  Connected Backup Controls
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Records backup requests in MySQL and downloads a controlled
                  JSON backup snapshot. Restore inserts or updates backup rows
                  without deleting newer records that are absent from the file.
                </p>
                {!canUseBackup && (
                  <p className="mt-2 text-xs font-semibold text-yellow-800">
                    Backup controls are available only for roles with backup export permission.
                  </p>
                )}
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                <button
                  type="button"
                  onClick={handleCreateBackupJob}
                  disabled={!canUseBackup}
                  className="inline-flex min-h-10 w-full min-w-[170px] items-center justify-center whitespace-normal rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold leading-5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:w-auto"
                >
                  Create Backup Job
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupSnapshot}
                  disabled={!canUseBackup}
                  className="inline-flex min-h-10 w-full min-w-[160px] items-center justify-center whitespace-normal rounded-lg bg-slate-950 px-4 py-2 text-center text-sm font-semibold leading-5 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-indigo-600 dark:hover:bg-indigo-500 sm:w-auto"
                >
                  Download Backup
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-emerald-950">
                  Backup Scope
                </label>
                <select
                  name="backupScope"
                  value={settings.backupScope}
                  onChange={handleChange}
                  disabled={!canUseBackup}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="Full Database">Full Database</option>
                  <option value="Schema Only">Schema Only</option>
                  <option value="Data Only">Data Only</option>
                </select>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                Backup files are generated as JSON snapshots from approved
                tables only. Restore is non-destructive and Super Admin only.
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-950">Restore JSON Backup</h3>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Select a downloaded IT Equipment backup, then type RESTORE BACKUP.
                Matching records will be updated and missing records inserted.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => setRestoreFile(event.target.files?.[0] || null)}
                  disabled={!canRestoreBackup || isRestoring}
                  className="h-11 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
                <input
                  type="text"
                  value={restoreConfirmation}
                  onChange={(event) => setRestoreConfirmation(event.target.value)}
                  placeholder="Type RESTORE BACKUP"
                  disabled={!canRestoreBackup || isRestoring}
                  className="h-11 rounded-lg border border-amber-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-600 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>
              <button
                type="button"
                onClick={handleRestoreBackupSnapshot}
                disabled={!canRestoreBackup || isRestoring}
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isRestoring ? "Restoring..." : "Restore Backup"}
              </button>
              {!canRestoreBackup && (
                <p className="mt-2 text-xs font-semibold text-amber-900">
                  Restore is available only to the Super Admin.
                </p>
              )}
            </div>

            <div className="mt-4">
              {isLoadingBackupJobs ? (
                <LoadingState
                  title="Loading backup jobs"
                  description="Fetching backup tracking records."
                />
              ) : backupJobsError ? (
                <ErrorState
                  title="Backup jobs unavailable"
                  description={backupJobsError}
                  onRetry={loadBackupJobs}
                />
              ) : backupJobs.length === 0 ? (
                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  No backup tracking jobs are available yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                          Type
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                          Scope
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                          Status
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupJobs.map((job) => (
                        <tr
                          key={job.backupJobId}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-950 dark:text-slate-100">
                            {job.backupType}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {job.backupScope}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {job.backupStatus}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {job.createdAt
                              ? new Date(job.createdAt).toLocaleString("en-IN")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-yellow-200 bg-white/80 p-4">
            <h3 className="text-sm font-bold text-yellow-950">
              Future Deployment Controls
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {futureDeploymentItems.map((item) => (
                <p
                  key={item}
                  className="rounded-xl bg-yellow-50 p-3 text-sm font-semibold text-yellow-900"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section
          id="settings-roles"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">
              System Admin Details
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Main IT department contact details for asset management.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admin Name
              </label>
              <input
                type="text"
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                type="email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admin Phone
              </label>
              <input
                type="tel"
                name="adminPhone"
                value={settings.adminPhone}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Default New User Role
              </label>
              <select
                name="defaultRole"
                value={settings.defaultRole}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="Viewer">Viewer</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Session Timeout
              </label>
              <input
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                min="5"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password Expiry Days
              </label>
              <input
                type="number"
                name="passwordExpiryDays"
                value={settings.passwordExpiryDays}
                onChange={handleChange}
                min="30"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div
            id="settings-notifications"
            className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">
                Notification Settings
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Enable alerts for important asset activities.
              </p>
            </div>

            <div className="space-y-4">
              <SettingToggle
                title="Low Stock Alert"
                description="Notify when asset stock is low."
                name="lowStockAlert"
                checked={settings.lowStockAlert}
                onChange={handleChange}
              />

              <SettingToggle
                title="Warranty Expiry Alert"
                description="Notify before asset warranty expires."
                name="warrantyExpiryAlert"
                checked={settings.warrantyExpiryAlert}
                onChange={handleChange}
              />

              <SettingToggle
                title="Maintenance Alert"
                description="Notify for pending or in-progress maintenance."
                name="maintenanceAlert"
                checked={settings.maintenanceAlert}
                onChange={handleChange}
              />

              <SettingToggle
                title="Delivery Alert"
                description="Notify when asset is delivered or returned."
                name="deliveryAlert"
                checked={settings.deliveryAlert}
                onChange={handleChange}
              />

              <SettingToggle
                title="Email Notifications"
                description={
                  emailStatus.isConfigured
                    ? "SMTP is configured and ready for future OTP/email notifications."
                    : "SMTP is not configured. OTP email delivery requires company SMTP setup."
                }
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />

              <div
                className={`rounded-xl border p-4 text-sm leading-6 ${
                  emailStatus.isConfigured
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-yellow-200 bg-yellow-50 text-yellow-800"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-bold">SMTP Status</span>
                  <span className="w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
                    {emailStatus.isConfigured ? "Configured" : "Not Configured"}
                  </span>
                </div>
                <p className="mt-2">{emailStatus.message}</p>
              </div>

              <SettingToggle
                title="In-app Notifications"
                description="Show alerts in the header notification center."
                name="inAppNotifications"
                checked={settings.inAppNotifications}
                onChange={handleChange}
              />

              <SettingToggle
                title="Weekly Summary"
                description="Prepare weekly IT asset summary for admins and department users."
                name="weeklySummary"
                checked={settings.weeklySummary}
                onChange={handleChange}
              />
            </div>
          </div>

          <div
            id="settings-export"
            className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">
                Report Export Settings
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Manage report download and print options.
              </p>
            </div>

            <div className="space-y-4">
              <SettingToggle
                title="CSV Export"
                description="Allow reports to export CSV files."
                name="csvExport"
                checked={settings.csvExport}
                onChange={handleChange}
              />

              <SettingToggle
                title="Print Report"
                description="Allow reports to open browser print window."
                name="printReport"
                checked={settings.printReport}
                onChange={handleChange}
              />

              <SettingToggle
                title="PDF Export"
                description="Allow browser print/PDF export with backend tracking."
                name="pdfExport"
                checked={settings.pdfExport}
                onChange={handleChange}
              />

              <SettingToggle
                title="Excel Export"
                description="Allow reports to download Excel-compatible spreadsheet files."
                name="excelExport"
                checked={settings.excelExport}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section
          id="settings-security"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">
              Security Settings
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Control basic system safety and audit preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SettingToggle
              title="Login Security"
              description="Enable secure login checks for admin access."
              name="loginSecurity"
              checked={settings.loginSecurity}
              onChange={handleChange}
            />

            <SettingToggle
              title="Role Based Access"
              description="Control module access using user roles."
              name="roleBasedAccess"
              checked={settings.roleBasedAccess}
              onChange={handleChange}
            />

            <SettingToggle
              title="Access Request Approval"
              description="Require Super Admin approval before new users can login."
              name="requestApproval"
              checked={settings.requestApproval}
              onChange={handleChange}
            />

            <SettingToggle
              title="Activity Logs"
              description="Maintain audit history for system actions."
              name="activityLogs"
              checked={settings.activityLogs}
              onChange={handleChange}
            />

            <SettingToggle
              title="Delete Confirmation"
              description="Ask confirmation before delete actions."
              name="deleteConfirmation"
              checked={settings.deleteConfirmation}
              onChange={handleChange}
            />

            <SettingToggle
              title="Data Backup"
              description={
                canUseBackup
                  ? "Allowed for Super Admin, Admin and Employee. Backup tracking and JSON download are connected."
                  : "Viewer role cannot access backup controls."
              }
              name="dataBackup"
              checked={settings.dataBackup}
              onChange={handleChange}
              disabled={!canUseBackup}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Backup Frequency
              </label>
              <select
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Audit Retention Days
              </label>
              <input
                type="number"
                name="auditRetention"
                value={settings.auditRetention}
                onChange={handleChange}
                min="90"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">
              Frontend Preferences
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Configure previews used across forms, labels and reports.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Asset Tag Prefix
              </label>
              <input
                type="text"
                name="assetTagPrefix"
                value={settings.assetTagPrefix}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm uppercase text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Preview: {settings.assetTagPrefix || "IT"}-LAP-001
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Fiscal Year Start
              </label>
              <select
                name="fiscalYearStart"
                value={settings.fiscalYearStart}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="January">January</option>
                <option value="April">April</option>
                <option value="July">July</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Warranty Alert Lead Days
              </label>
              <input
                type="number"
                name="warrantyLeadDays"
                value={settings.warrantyLeadDays}
                onChange={handleChange}
                min="1"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Asset Label Size
              </label>
              <select
                name="assetLabelSize"
                value={settings.assetLabelSize}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="Compact">Compact</option>
                <option value="Standard">Standard</option>
                <option value="Large">Large</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date Format
              </label>
              <select
                name="dateFormat"
                value={settings.dateFormat}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM-DD-YYYY">MM-DD-YYYY</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Default Report View
              </label>
              <select
                name="defaultReportView"
                value={settings.defaultReportView}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="Summary">Summary</option>
                <option value="Detailed">Detailed</option>
                <option value="Audit">Audit</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Reset
          </button>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white hover:from-indigo-700 hover:to-violet-700"
          >
            Save Settings
          </button>
        </div>
      </form>
    </LayoutWrapper>
  );
}

function SettingToggle({
  title,
  description,
  name,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-[24px] border p-4 ${
        disabled
          ? "border-[#314666] bg-[#101a2b] opacity-70"
          : "border-[#314666] bg-[#101a2b] hover:bg-[#122038]"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-5 text-[#8fa4c7]">{description}</p>
      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-5 w-5 rounded border-slate-300 accent-indigo-600"
      />
    </label>
  );
}
