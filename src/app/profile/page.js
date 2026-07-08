"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/StateBlock";
import { readSession } from "@/lib/authSession";

const PROFILE_PHOTO_KEY = "itProfilePhoto";

const fallbackProfile = {
  fullName: "-",
  email: "-",
  phone: "-",
  department: "-",
  role: "-",
  status: "-",
  loginAt: "",
};

const avatarPresets = [
  {
    id: "initials",
    label: "Initials",
    background: "from-[#7c3aed] to-[#4f46e5]",
  },
  {
    id: "violet",
    label: "Violet",
    background: "from-[#9333ea] to-[#7c3aed]",
  },
  {
    id: "ocean",
    label: "Ocean",
    background: "from-[#0ea5e9] to-[#2563eb]",
  },
  {
    id: "emerald",
    label: "Emerald",
    background: "from-[#10b981] to-[#0f766e]",
  },
];

function formatDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getInitials(fullName) {
  return String(fullName || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function buildInitialAvatar(initials, colorA, colorB) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#g)" />
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="180" font-weight="700">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function DetailRow({ label, value }) {
  return (
    <div className="grid gap-2 border-b border-[#2c3f63] py-3 sm:grid-cols-[160px_1fr]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
        {label}
      </p>
      <p className="text-sm font-medium text-white">{value || "-"}</p>
    </div>
  );
}

export default function ProfilePage() {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(fallbackProfile);
  const [hasSession, setHasSession] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const savedSession = readSession();
    const savedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY) || "";

    setTimeout(() => {
      setProfile(savedSession || fallbackProfile);
      setHasSession(Boolean(savedSession));
      setPhotoUrl(savedPhoto);
    }, 0);
  }, []);

  const initials = useMemo(() => getInitials(profile.fullName), [profile.fullName]);

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
    { label: "Authentication", value: "JWT session" },
    { label: "Role Based Access", value: "Enabled" },
    { label: "Activity Tracking", value: "Enabled" },
    { label: "Session Status", value: hasSession ? "Active" : "Missing" },
  ];

  function applyPresetAvatar(presetId) {
    const presetMap = {
      initials: buildInitialAvatar(initials, "#7c3aed", "#4f46e5"),
      violet: buildInitialAvatar(initials, "#9333ea", "#7c3aed"),
      ocean: buildInitialAvatar(initials, "#0ea5e9", "#2563eb"),
      emerald: buildInitialAvatar(initials, "#10b981", "#0f766e"),
    };

    const nextPhoto = presetMap[presetId];
    localStorage.setItem(PROFILE_PHOTO_KEY, nextPhoto);
    setPhotoUrl(nextPhoto);
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      localStorage.setItem(PROFILE_PHOTO_KEY, result);
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    localStorage.removeItem(PROFILE_PHOTO_KEY);
    setPhotoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader title="Profile" />

      {!hasSession && (
        <div className="mb-6">
          <ErrorState
            title="Login session not found"
            description="Please login again to view authenticated profile details."
          />
        </div>
      )}

      <section className="rounded-[30px] border border-[#2c3f63] bg-[#18253d] p-6 shadow-[0_18px_38px_rgba(6,12,24,0.14)]">
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#314666] bg-[#101a2b] p-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt="Profile"
                    width={160}
                    height={160}
                    unoptimized
                    className="h-40 w-40 rounded-[32px] border border-[#314666] object-cover shadow-[0_18px_36px_rgba(0,0,0,0.25)]"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-[32px] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-5xl font-bold text-white shadow-[0_18px_36px_rgba(78,66,226,0.32)]">
                    {initials}
                  </div>
                )}
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#8fa4c7]">
                {profile.department || "IT Department"}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                {profile.fullName}
              </h2>
              <p className="mt-2 text-sm text-[#b8c7e6]">{profile.email}</p>

              <div className="mt-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/12 px-4 py-1.5 text-xs font-semibold text-emerald-200">
                {profile.status || "Active"}
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#314666] bg-[#18253d] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Profile Photo</h3>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-xl border border-rose-500/30 bg-rose-500/12 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/18"
                >
                  Delete
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] px-4 py-2 text-sm font-semibold text-white"
                >
                  Upload Photo
                </button>
                {avatarPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPresetAvatar(preset.id)}
                    className="rounded-2xl border border-[#314666] bg-[#101a2b] px-4 py-2 text-sm font-semibold text-[#c8d4ec] hover:bg-[#122038]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-[#8fa4c7]">
                Upload your own image, use initials avatar, or quickly switch to a preset profile style.
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#314666] bg-[#101a2b] p-5">
              <div className="flex flex-col gap-2 border-b border-[#2c3f63] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fa4c7]">
                    Account Overview
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    Main profile information
                  </h3>
                </div>
                <p className="text-sm text-[#8fa4c7]">
                  Last login: <span className="font-semibold text-white">{formatDate(profile.loginAt)}</span>
                </p>
              </div>

              <div className="mt-2">
                <DetailRow label="Full Name" value={profile.fullName} />
                <DetailRow label="Email" value={profile.email} />
                <DetailRow label="Phone" value={profile.phone} />
                <DetailRow label="Department" value={profile.department} />
                <DetailRow label="Role" value={profile.role} />
                <DetailRow label="Role Code" value={profile.roleCode || "-"} />
                <DetailRow label="User ID" value={profile.id || "-"} />
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[28px] border border-[#314666] bg-[#101a2b] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fa4c7]">
                  Access Areas
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Allowed modules by current role
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {accessAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-[#314666] bg-[#18253d] px-4 py-2 text-sm font-semibold text-[#c8d4ec]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#314666] bg-[#101a2b] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fa4c7]">
                  Security
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Session and control summary
                </h3>

                <div className="mt-4 space-y-3">
                  {securityItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#314666] bg-[#18253d] px-4 py-3"
                    >
                      <span className="text-sm text-[#b8c7e6]">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
