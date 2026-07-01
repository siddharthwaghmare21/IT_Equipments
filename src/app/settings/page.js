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

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState("General");
  const [backupJobs, setBackupJobs] = useState([]);
  const [isLoadingBackupJobs, setIsLoadingBackupJobs] = useState(true);
  const [backupJobsError, setBackupJobsError] = useState("");
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
        description="Manage company details, admin information, notifications, report export options and system security settings."
      />

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => openSettingsSection(tab)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold ${
                activeSettingsTab === tab.label
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section
          id="settings-general"
          className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Company Information
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Basic organization details used in reports and system records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company Phone
              </label>
              <input
                type="tel"
                name="companyPhone"
                value={settings.companyPhone}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company Address
              </label>
              <input
                type="text"
                name="companyAddress"
                value={settings.companyAddress}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Report Branding
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                These values are stored in backend settings and used in report
                headers.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Logo Text
                </label>
                <input
                  type="text"
                  name="reportLogoText"
                  value={settings.reportLogoText}
                  onChange={handleChange}
                  maxLength="4"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Prepared By
                </label>
                <input
                  type="text"
                  name="reportPreparedBy"
                  value={settings.reportPreparedBy}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Classification
                </label>
                <select
                  name="reportClassification"
                  value={settings.reportClassification}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
          className="scroll-mt-24 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:p-6"
        >
          <h2 className="text-lg font-bold text-emerald-950">
            Database Backup
          </h2>
          <p className="mt-1 text-sm leading-6 text-emerald-900">
            Backup job tracking and JSON snapshot download are connected to the
            backend and MySQL. Restore execution stays locked until an approved
            maintenance process is defined.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {connectedBackupItems.map((item) => (
              <p
                key={item}
                className="rounded-xl border border-emerald-200 bg-white/80 p-3 text-sm font-semibold text-emerald-900"
              >
                {item}
              </p>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/85 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Connected Backup Controls
                </h3>
                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  Records backup requests in MySQL and downloads a controlled
                  JSON backup snapshot. Restore execution remains locked for a
                  separately approved maintenance step.
                </p>
                {!canUseBackup && (
                  <p className="mt-2 text-xs font-semibold text-yellow-800">
                    Backup controls are available only for roles with backup
                    export permission.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCreateBackupJob}
                  disabled={!canUseBackup}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                >
                  Create Backup Job
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupSnapshot}
                  disabled={!canUseBackup}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
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
                  className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-700 disabled:bg-gray-100"
                >
                  <option value="Full Database">Full Database</option>
                  <option value="Schema Only">Schema Only</option>
                  <option value="Data Only">Data Only</option>
                </select>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                Backup files are generated as JSON snapshots from approved
                tables only. Restore/import from backup is intentionally not
                enabled yet.
              </div>
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
                <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900">
                  No backup tracking jobs are available yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-emerald-50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-emerald-900">
                          Type
                        </th>
                        <th className="px-4 py-3 font-semibold text-emerald-900">
                          Scope
                        </th>
                        <th className="px-4 py-3 font-semibold text-emerald-900">
                          Status
                        </th>
                        <th className="px-4 py-3 font-semibold text-emerald-900">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupJobs.map((job) => (
                        <tr
                          key={job.backupJobId}
                          className="border-b border-emerald-100"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {job.backupType}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {job.backupScope}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {job.backupStatus}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
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
          className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              System Admin Details
            </h2>
            <p className="mt-1 text-sm text-gray-600">
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div
            id="settings-notifications"
            className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Notification Settings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
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
            className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Report Export Settings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
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
          className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Security Settings
            </h2>
            <p className="mt-1 text-sm text-gray-600">
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Frontend Preferences
            </h2>
            <p className="mt-1 text-sm text-gray-600">
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-gray-900"
              />
              <p className="mt-2 text-xs text-gray-500">
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
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
            className="inline-flex justify-center rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Reset
          </button>

          <button
            type="submit"
            className="inline-flex justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
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
      className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${
        disabled
          ? "border-gray-200 bg-gray-50 opacity-70"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm leading-5 text-gray-600">{description}</p>
      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-5 w-5 rounded border-gray-300 accent-gray-900"
      />
    </label>
  );
}
