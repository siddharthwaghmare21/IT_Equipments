"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";

const USERS_KEY = "itAssetUsers";
const SESSION_KEY = "itAssetUserSession";

const roles = ["Super Admin", "IT Admin", "IT Manager", "IT Support", "Viewer"];

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
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Blocked: "bg-red-100 text-red-700 border-red-200",
    Inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminUsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const savedSession = JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );

    setTimeout(() => {
      setUsers(savedUsers);
      setCurrentUser(savedSession);
    }, 0);
  }, []);

  const isSuperAdmin = currentUser?.role === "Super Admin";

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const blockedUsers = users.filter((user) => user.status === "Blocked").length;
  const superAdmins = users.filter((user) => user.role === "Super Admin").length;

  function updateUsersInStorage(updatedUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  }

  function handleRoleChange(userId, newRole) {
    if (!isSuperAdmin) {
      alert("Only Super Admin can change user roles.");
      return;
    }

    const selectedUser = users.find((user) => user.id === userId);

    if (!selectedUser) {
      alert("User not found.");
      return;
    }

    const confirmed = confirm(
      `Change ${selectedUser.fullName}'s role to ${newRole}?`
    );

    if (!confirmed) return;

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            role: newRole,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.fullName || "Super Admin",
          }
        : user
    );

    updateUsersInStorage(updatedUsers);

    alert("User role updated successfully.");
  }

  function toggleUserStatus(userId) {
    if (!isSuperAdmin) {
      alert("Only Super Admin can update user status.");
      return;
    }

    const selectedUser = users.find((user) => user.id === userId);

    if (!selectedUser) {
      alert("User not found.");
      return;
    }

    if (selectedUser.id === currentUser?.id) {
      alert("You cannot block your own account.");
      return;
    }

    const newStatus = selectedUser.status === "Active" ? "Blocked" : "Active";

    const confirmed = confirm(
      `${newStatus === "Blocked" ? "Block" : "Activate"} ${
        selectedUser.fullName
      }?`
    );

    if (!confirmed) return;

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.fullName || "Super Admin",
          }
        : user
    );

    updateUsersInStorage(updatedUsers);

    alert(`User ${newStatus.toLowerCase()} successfully.`);
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Admin Users Management"
        description="Manage approved IT staff users, roles and account status. This page is intended for Super Admin only."
      />

      {!isSuperAdmin && (
        <section className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm sm:p-5">
          You are not logged in as Super Admin. Role and status actions are
          disabled. Backend authentication will handle this securely later.
        </section>
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalUsers}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Users</p>
          <h2 className="mt-2 text-2xl font-bold text-green-700">
            {activeUsers}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Blocked Users</p>
          <h2 className="mt-2 text-2xl font-bold text-red-700">
            {blockedUsers}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Super Admins</p>
          <h2 className="mt-2 text-2xl font-bold text-purple-700">
            {superAdmins}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="All">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                User
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Contact
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Role
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Created At
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Manage Role
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-semibold text-gray-900">
                      {user.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {user.department || "IT Department"}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                    <p>{user.email}</p>
                    <p className="mt-1 text-xs text-gray-500">{user.phone}</p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        handleRoleChange(user.id, event.target.value)
                      }
                      disabled={!isSuperAdmin}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user.id)}
                      disabled={!isSuperAdmin}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 ${
                        user.status === "Active"
                          ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-700 text-white hover:bg-green-800"
                      }`}
                    >
                      {user.status === "Active" ? "Block" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>

      <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
        Note: This is frontend demo user management. Backend integration later
        will use secure database records, password hashing, OTP verification and
        server-side role permissions.
      </p>
    </LayoutWrapper>
  );
}
