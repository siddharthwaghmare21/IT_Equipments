"use client";

import { useEffect, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const SESSION_KEY = "itAssetUserSession";

const fallbackProfile = {
  fullName: "IT Admin",
  email: "itadmin@company.com",
  phone: "+91 98765 12345",
  department: "IT Department",
  role: "IT Admin",
  status: "Active",
  loginAt: "2026-03-05T10:30:00.000Z",
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

export default function ProfilePage() {
  const [profile, setProfile] = useState(fallbackProfile);

  useEffect(() => {
    const savedSession = JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );

    setTimeout(() => {
      setProfile(savedSession || fallbackProfile);
    }, 0);
  }, []);

  const accessAreas = [
    "Dashboard",
    "Assets",
    "Purchases",
    "Delivery",
    "Returns",
    "Maintenance",
    "Reports",
    "Activity Logs",
  ];

  return (
    <LayoutWrapper>
      <PageHeader
        title="Profile"
        description="View your account details, role, department and access summary."
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {profile.department || "IT Department"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{profile.email}</p>
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
          <DetailItem label="Authentication" value="Frontend Demo" />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Access Areas</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {accessAreas.map((area) => (
              <div
                key={area}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-sm font-semibold text-gray-800">{area}</p>
                <p className="mt-1 text-xs text-gray-500">Allowed by role</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Security Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Role Based Access</span>
              <span className="font-semibold text-green-700">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Activity Tracking</span>
              <span className="font-semibold text-green-700">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Password Policy</span>
              <span className="font-semibold text-green-700">Active</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm">
        Profile data currently comes from frontend session storage. Backend
        integration later will load this securely from authenticated API
        endpoints.
      </section>
    </LayoutWrapper>
  );
}
