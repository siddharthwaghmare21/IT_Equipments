"use client";

import { useEffect, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/StateBlock";
import { readSession } from "@/lib/authSession";

const fallbackProfile = {
  fullName: "-",
  email: "-",
  phone: "-",
  department: "-",
  role: "-",
  status: "-",
  loginAt: "",
};

function formatDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value || "-"}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [hasSession, setHasSession] = useState(true);

  useEffect(() => {
    const savedSession = readSession();

    setTimeout(() => {
      setProfile(savedSession || fallbackProfile);
      setHasSession(Boolean(savedSession));
    }, 0);
  }, []);

  const accessAreasByRole = {
    "Super Admin": [
      "Dashboard",
      "Assets",
      "Purchases",
      "Delivery",
      "Returns",
      "Maintenance",
      "Reports",
      "Activity Logs",
      "Admin Requests",
      "Settings",
    ],
    Admin: [
      "Dashboard",
      "Assets",
      "Purchases",
      "Delivery",
      "Returns",
      "Maintenance",
      "Reports",
      "Activity Logs",
    ],
    Employee: [
      "Dashboard",
      "Assets",
      "Purchases",
      "Delivery",
      "Returns",
      "Maintenance",
      "Reports",
    ],
    Viewer: ["Dashboard", "Assets", "Reports", "Activity Logs"],
  };

  const accessAreas = accessAreasByRole[profile.role] || ["Dashboard"];

  const securityItems = [
    { label: "Role Based Access", value: "Enabled" },
    { label: "Activity Tracking", value: "Enabled" },
    { label: "Password Policy", value: "Active" },
  ];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Profile"
        description="View your account details, role, department and access summary."
      />

      {!hasSession && (
        <div className="mb-6">
          <ErrorState
            title="Login session not found"
            description="Please login again to view authenticated profile details."
          />
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {profile.department || "IT Department"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{profile.email}</p>
          </div>

          <span className="inline-flex w-fit rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {profile.status || "Active"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Full Name" value={profile.fullName} />
          <DetailItem label="Email" value={profile.email} />
          <DetailItem label="Phone" value={profile.phone} />
          <DetailItem label="Role" value={profile.role} />
          <DetailItem label="Department" value={profile.department} />
          <DetailItem label="Account Status" value={profile.status} />
          <DetailItem label="Last Login" value={formatDate(profile.loginAt)} />
          <DetailItem label="User ID" value={profile.id || "-"} />
          <DetailItem label="Role Code" value={profile.roleCode || "-"} />
          <DetailItem label="Authentication" value="JWT session" />
          <DetailItem label="Session Status" value={hasSession ? "Active" : "Missing"} />
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">Access Areas</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {accessAreas.map((area) => (
              <div
                key={area}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{area}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Allowed by role</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">Security Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            {securityItems.map((item) => (
              <div key={item.label} className="flex justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                <span className="font-semibold text-green-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
