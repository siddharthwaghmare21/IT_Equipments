"use client";

import { useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "IT Assets Management",
    companyEmail: "admin@company.com",
    companyPhone: "+91 98765 43210",
    companyAddress: "Main Office, Maharashtra, India",

    adminName: "IT Admin",
    adminEmail: "itadmin@company.com",
    adminPhone: "+91 98765 12345",

    lowStockAlert: true,
    warrantyExpiryAlert: true,
    maintenanceAlert: true,
    deliveryAlert: true,

    csvExport: true,
    printReport: true,
    pdfExport: false,
    excelExport: false,

    loginSecurity: true,
    activityLogs: true,
    deleteConfirmation: true,
    dataBackup: false,
  });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    console.log("System Settings:", settings);

    alert("Settings saved successfully. Backend will be connected later.");
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Settings"
        description="Manage company details, admin information, notifications, report export options and system security settings."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              IT Admin Details
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
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
                description="Will be added later using PDF package."
                name="pdfExport"
                checked={settings.pdfExport}
                onChange={handleChange}
                disabled
              />

              <SettingToggle
                title="Excel Export"
                description="Will be added after backend/database integration."
                name="excelExport"
                checked={settings.excelExport}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
              description="Automatic backup will be connected after backend integration."
              name="dataBackup"
              checked={settings.dataBackup}
              onChange={handleChange}
              disabled
            />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              alert("Settings reset action will be connected later.")
            }
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