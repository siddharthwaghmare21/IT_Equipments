"use client";

import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";

const profile = {
  name: "IT Admin",
  email: "itadmin@company.com",
  phone: "+91 98765 12345",
  role: "IT Admin",
  department: "IT Department",
  employeeCode: "IT-001",
  location: "Main Office",
  lastLogin: "2026-03-05 10:30 AM",
  accountStatus: "Active",
};

const permissions = [
  {
    title: "Assets Management",
    description: "Add, view, edit and maintain IT asset records.",
    access: "Full Access",
  },
  {
    title: "Purchases Management",
    description: "Manage purchase orders, invoices and vendor purchases.",
    access: "Full Access",
  },
  {
    title: "Asset Assignments",
    description: "Assign assets to employees and track delivery status.",
    access: "Full Access",
  },
  {
    title: "Returns Management",
    description: "Record returned assets, condition and received details.",
    access: "Full Access",
  },
  {
    title: "Maintenance Management",
    description: "Track repair, service, vendor and maintenance status.",
    access: "Full Access",
  },
  {
    title: "Reports",
    description: "View, export CSV and print IT asset reports.",
    access: "Full Access",
  },
  {
    title: "Activity Logs",
    description: "View system audit logs and IT staff actions.",
    access: "Read Only",
  },
  {
    title: "Settings",
    description: "Manage organization and IT department settings.",
    access: "Full Access",
  },
];

const recentActivities = [
  {
    id: 1,
    action: "Added new asset record",
    module: "Assets",
    date: "2026-03-01",
    time: "10:15 AM",
  },
  {
    id: 2,
    action: "Assigned asset to employee",
    module: "Deliveries",
    date: "2026-03-02",
    time: "12:45 PM",
  },
  {
    id: 3,
    action: "Updated maintenance status",
    module: "Maintenance",
    date: "2026-03-04",
    time: "04:10 PM",
  },
  {
    id: 4,
    action: "Exported assets report",
    module: "Reports",
    date: "2026-03-05",
    time: "11:20 AM",
  },
];

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

function AccessBadge({ access }) {
  const accessStyles = {
    "Full Access": "bg-green-100 text-green-700 border-green-200",
    "Read Only": "bg-blue-100 text-blue-700 border-blue-200",
    Restricted: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        accessStyles[access] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {access}
    </span>
  );
}

function AccountStatusBadge({ status }) {
  const statusStyles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Blocked: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function ProfilePage() {
  return (
    <LayoutWrapper>
      <PageHeader
        title="IT Staff Profile"
        description="View logged-in IT department staff profile, role, access permissions and recent activities."
      />

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-xl font-bold text-white">
              IT
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {profile.role} • {profile.department}
              </p>

              <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          <AccountStatusBadge status={profile.accountStatus} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Employee Code" value={profile.employeeCode} />
          <DetailItem label="Role" value={profile.role} />
          <DetailItem label="Department" value={profile.department} />
          <DetailItem label="Location" value={profile.location} />
          <DetailItem label="Email Address" value={profile.email} />
          <DetailItem label="Phone Number" value={profile.phone} />
          <DetailItem label="Last Login" value={profile.lastLogin} />
          <DetailItem label="Account Status" value={profile.accountStatus} />
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assigned Role</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {profile.role}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Department</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            IT Department
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Access Level</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">Full Access</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Recent Activities</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {recentActivities.length}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            IT Staff Permissions
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            This website is only for IT department staff to save, manage and
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

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">
            Recent IT Staff Activities
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Latest sample activities performed by the logged-in IT staff user.
          </p>
        </div>

        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {activity.action}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Module: {activity.module}
                </p>
              </div>

              <div className="text-sm text-gray-500 sm:text-right">
                <p>{activity.date}</p>
                <p>{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </LayoutWrapper>
  );
}