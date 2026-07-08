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
    <div className="rounded-2xl border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#8fa4c7]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">
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
      />

      {!hasSession && (
        <div className="mb-6">
          <ErrorState
            title="Login session not found"
            description="Please login again to view authenticated profile details."
          />
        </div>
      )}

      <section className="rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-5 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
        <div className="flex flex-col gap-4 border-b border-[#2c3f63] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#8fa4c7]">
              {profile.department || "IT Department"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm text-[#b8c7e6]">{profile.email}</p>
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
        <div className="rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)] lg:col-span-2">
          <h2 className="text-lg font-bold text-white">Access Areas</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {accessAreas.map((area) => (
              <div
                key={area}
                className="rounded-2xl border border-[#314666] bg-[#101a2b] p-3"
              >
                <p className="text-sm font-semibold text-white">{area}</p>
                <p className="mt-1 text-xs text-[#8fa4c7]">Allowed by role</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-4 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
          <h2 className="text-lg font-bold text-white">Security Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            {securityItems.map((item) => (
              <div key={item.label} className="flex justify-between rounded-2xl border border-[#314666] bg-[#101a2b] px-3 py-2">
                <span className="text-[#b8c7e6]">{item.label}</span>
                <span className="font-semibold text-green-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
