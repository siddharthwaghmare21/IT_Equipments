"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { EmptyState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { ApiError, getUsers, updateUserRole, updateUserStatus } from "@/lib/apiClient";
import { readSession } from "@/lib/authSession";

const roles = [
  { label: "Super Admin", code: "SUPER_ADMIN" },
  { label: "Admin", code: "ADMIN" },
  { label: "Employee", code: "EMPLOYEE" },
  { label: "Viewer", code: "VIEWER" },
];

const statuses = ["Pending", "Active", "Rejected", "Suspended", "Inactive"];

function RoleBadge({ role }) {
  const styles = {
    "Super Admin": "bg-purple-100 text-purple-700 border-purple-200",
    Admin: "bg-blue-100 text-blue-700 border-blue-200",
    Employee: "bg-gray-100 text-gray-700 border-gray-200",
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
    Suspended: "bg-red-100 text-red-700 border-red-200",
    Inactive: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Pending: "bg-blue-100 text-blue-700 border-blue-200",
    Rejected: "bg-gray-100 text-gray-700 border-gray-200",
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

function normalizeUser(user) {
  return {
    id: user.userId,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.roleName,
    roleCode: user.roleCode,
    department: user.departmentName || "IT Department",
    status: user.accountStatus,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default function AdminUsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [currentUser] = useState(() => readSession());
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      if (!currentUser?.token) {
        setErrorMessage("Login session expired. Please login again.");
        setIsLoading(false);
        return;
      }

      try {
        const apiUsers = await getUsers(currentUser.token);
        if (isMounted) {
          setUsers(apiUsers.map(normalizeUser));
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof ApiError
              ? error.message
              : "Unable to load users from backend."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const isSuperAdmin = currentUser?.roleCode === "SUPER_ADMIN";

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search);

      const matchesRole = roleFilter === "All" || user.roleCode === roleFilter;
      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "Active").length;
  const suspendedUsers = users.filter((user) => user.status === "Suspended").length;
  const superAdmins = users.filter((user) => user.roleCode === "SUPER_ADMIN").length;

  function replaceUser(updatedUser) {
    const normalized = normalizeUser(updatedUser);
    setUsers((previousUsers) =>
      previousUsers.map((user) => (user.id === normalized.id ? normalized : user))
    );
  }

  function handleRoleChange(userId, newRoleCode) {
    if (!isSuperAdmin) {
      showToast("Only Super Admin can change user roles.", "error");
      return;
    }

    const selectedUser = users.find((user) => user.id === userId);
    const selectedRole = roles.find((role) => role.code === newRoleCode);

    if (!selectedUser || !selectedRole) {
      showToast("User or role not found.", "error");
      return;
    }

    setPendingAction({
      type: "role",
      userId,
      fullName: selectedUser.fullName,
      nextRole: selectedRole.label,
      nextRoleCode: selectedRole.code,
    });
  }

  function toggleUserStatus(userId) {
    if (!isSuperAdmin) {
      showToast("Only Super Admin can update user status.", "error");
      return;
    }

    const selectedUser = users.find((user) => user.id === userId);

    if (!selectedUser) {
      showToast("User not found.", "error");
      return;
    }

    if (selectedUser.id === currentUser?.id) {
      showToast("You cannot suspend your own account.", "warning");
      return;
    }

    const nextStatus =
      selectedUser.status === "Active" ? "Suspended" : "Active";

    setPendingAction({
      type: "status",
      userId,
      fullName: selectedUser.fullName,
      nextStatus,
    });
  }

  async function confirmPendingAction() {
    if (!pendingAction || !currentUser?.token) return;

    try {
      const updatedUser =
        pendingAction.type === "role"
          ? await updateUserRole(
              pendingAction.userId,
              pendingAction.nextRoleCode,
              currentUser.token
            )
          : await updateUserStatus(
              pendingAction.userId,
              pendingAction.nextStatus,
              currentUser.token
            );

      replaceUser(updatedUser);
      showToast(
        pendingAction.type === "role"
          ? "User role updated successfully."
          : `User ${pendingAction.nextStatus.toLowerCase()} successfully.`
      );
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "User update failed.",
        "error"
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Admin Users Management"
        description="Manage approved IT staff users, roles and account status. Super Admin access is required."
      />

      {!isSuperAdmin && (
        <section className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm sm:p-5">
          You are not logged in as Super Admin. User management actions are
          disabled by backend authorization.
        </section>
      )}

      {errorMessage && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 shadow-sm sm:p-5">
          {errorMessage}
        </section>
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">{totalUsers}</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Users</p>
          <h2 className="mt-2 text-2xl font-bold text-green-700">{activeUsers}</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Suspended Users</p>
          <h2 className="mt-2 text-2xl font-bold text-red-700">{suspendedUsers}</h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Super Admins</p>
          <h2 className="mt-2 text-2xl font-bold text-purple-700">{superAdmins}</h2>
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
              <option key={role.code} value={role.code}>
                {role.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
          >
            <option value="All">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <LoadingState
          title="Loading users"
          description="Fetching user records from backend."
        />
      ) : (
        <TableWrapper>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">User</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">Role</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">Created At</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">Manage Role</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8">
                    <EmptyState
                      title="No users found"
                      description="Try changing name, email, role or status filters."
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="font-semibold text-gray-900">{user.fullName}</p>
                      <p className="mt-1 text-xs text-gray-500">{user.department}</p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                      <p>{user.email}</p>
                      <p className="mt-1 text-xs text-gray-500">{user.phone || "-"}</p>
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
                        value={user.roleCode}
                        onChange={(event) =>
                          handleRoleChange(user.id, event.target.value)
                        }
                        disabled={!isSuperAdmin}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold outline-none focus:border-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        {roles.map((role) => (
                          <option key={role.code} value={role.code}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user.id)}
                        disabled={!isSuperAdmin || user.id === currentUser?.id}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 ${
                          user.status === "Active"
                            ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-700 text-white hover:bg-green-800"
                        }`}
                      >
                        {user.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
      )}

      <p className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">
        User records, role changes and account status updates are now connected
        to backend APIs with Super Admin authorization.
      </p>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={
          pendingAction?.type === "role"
            ? "Change user role?"
            : "Change user status?"
        }
        description={
          pendingAction?.type === "role"
            ? `Change ${pendingAction?.fullName || "this user"} role to ${
                pendingAction?.nextRole || ""
              }?`
            : `${pendingAction?.nextStatus || "Update"} ${
                pendingAction?.fullName || "this user"
              }?`
        }
        confirmLabel="Confirm"
        tone="default"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </LayoutWrapper>
  );
}
