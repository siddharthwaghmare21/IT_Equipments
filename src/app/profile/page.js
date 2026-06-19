"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const SESSION_KEY = "itAssetUserSession";

function getInitials(name) {
  if (!name) return "IT";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

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

function RoleBadge({ role }) {
  const styles = {
    "Super Admin": "bg-purple-100 text-purple-700 border-purple-200",
    "IT Admin": "bg-blue-100 text-blue-700 border-blue-200",
    "IT Manager": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "IT Support": "bg-gray-100 text-gray-700 border-gray-200",
    Viewer: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[role] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {role || "IT Staff"}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Blocked: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Active"}
    </span>
  );
}

function AccessBadge({ access }) {
  const styles = {
    "Full Access": "bg-green-100 text-green-700 border-green-200",
    "Manage Access": "bg-blue-100 text-blue-700 border-blue-200",
    "Limited Access": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Read Only": "bg-orange-100 text-orange-700 border-orange-200",
    "No Access": "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[access] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {access}
    </span>
  );
}

function getPermissions(role) {
  const commonPermissions = [
    {
      title: "Assets Management",
      description: "View and manage IT asset records.",
      access:
        role === "Viewer"
          ? "Read Only"
          : role === "IT Support"
          ? "Limited Access"
          : "Full Access",
    },
    {
      title: "Purchases Management",
      description: "Manage purchase records, invoices and vendor purchases.",
      access:
        role === "Super Admin" || role === "IT Admin" || role === "IT Manager"
          ? "Full Access"
          : role === "Viewer"
          ? "Read Only"
          : "No Access",
    },
    {
      title: "Vendors Management",
      description: "Maintain vendor details and vendor related records.",
      access:
        role === "Super Admin" || role === "IT Admin" || role === "IT Manager"
          ? "Full Access"
          : role === "Viewer"
          ? "Read Only"
          : "No Access",
    },
    {
      title: "Asset Assignments",
      description: "Assign IT equipment to employees and manage deliveries.",
      access:
        role === "Viewer"
          ? "Read Only"
          : role === "IT Manager"
          ? "Manage Access"
          : "Full Access",
    },
    {
      title: "Returns Management",
      description: "Record returned assets and asset condition details.",
      access:
        role === "Viewer"
          ? "Read Only"
          : role === "IT Manager"
          ? "Manage Access"
          : "Full Access",
    },
    {
      title: "Maintenance Management",
      description: "Track repairs, service vendors and maintenance status.",
      access:
        role === "Viewer"
          ? "Read Only"
          : role === "IT Manager"
          ? "Manage Access"
          : "Full Access",
    },
    {
      title: "Reports",
      description: "View reports, export CSV and print reports.",
      access:
        role === "IT Support" || role === "Viewer" ? "Read Only" : "Full Access",
    },
    {
      title: "Activity Logs",
      description: "View IT staff actions and system audit records.",
      access:
        role === "Super Admin" || role === "IT Admin" || role === "IT Manager"
          ? "Read Only"
          : "No Access",
    },
    {
      title: "Settings",
      description: "Manage organization and IT department settings.",
      access:
        role === "Super Admin"
          ? "Full Access"
          : role === "IT Admin"
          ? "Limited Access"
          : "No Access",
    },
    {
      title: "Admin Request Management",
      description: "Approve or reject IT staff access requests.",
      access: role === "Super Admin" ? "Full Access" : "No Access",
    },
  ];

  return commonPermissions;
}

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedSession = JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );

    setCurrentUser(savedSession);
  }, []);

  const permissions = useMemo(
    () => getPermissions(currentUser?.role),
    [currentUser?.role]
  );

  const userRole = currentUser?.role || "IT Staff";
  const userStatus = currentUser?.status || "Active";

  return (
    <LayoutWrapper>
      <PageHeader
        title="IT Staff Profile"
        description="View logged-in IT department staff profile, role, account status and access permissions."
      />

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-xl font-bold text-white">
              {getInitials(currentUser?.fullName)}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentUser?.fullName || "IT Staff User"}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {userRole} • {currentUser?.department || "IT Department"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {currentUser?.email || "No email available"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <RoleBadge role={userRole} />
            <StatusBadge status={userStatus} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Full Name" value={currentUser?.fullName} />
          <DetailItem label="Role" value={userRole} />
          <DetailItem
            label="Department"
            value={currentUser?.department || "IT Department"}
          />
          <DetailItem label="Account Status" value={userStatus} />
          <DetailItem label="Email Address" value={currentUser?.email} />
          <DetailItem label="Phone Number" value={currentUser?.phone} />
          <DetailItem label="Last Login" value={formatDate(currentUser?.loginAt)} />
          <DetailItem label="System Access" value="IT Department Only" />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assigned Role</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">{userRole}</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Department</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            IT Department
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Account Status</p>
          <h2 className="mt-2 text-xl font-bold text-green-700">
            {userStatus}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Permission Groups</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {permissions.length}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            Role Based Permissions
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            This website is only for IT Department staff to save, manage and
            maintain IT assets and equipment data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {permissions.map((permission) => (
            <div
              key={permission.title}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {permission.title}
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {permission.description}
                  </p>
                </div>

                <AccessBadge access={permission.access} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm sm:p-5">
        Profile data is currently loaded from frontend session storage. Backend
        integration later will load verified user profile, role, permissions and
        login history from the database.
      </section>
    </LayoutWrapper>
  );
}