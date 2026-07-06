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
    Employee: "bg-slate-100 text-slate-700 border-slate-200",
    Viewer: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[role] || "border-slate-200 bg-slate-100 text-slate-700"
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
    Rejected: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-slate-200 bg-slate-100 text-slate-700"
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
        <section className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm">
          You are not logged in as Super Admin. User management actions are
          disabled by backend authorization.
        </section>
      )}

      {errorMessage && (
        <section className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 shadow-sm">
          {errorMessage}
        </section>
      )}

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email or phone..."
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">User</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Contact</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Role</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Created At</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Manage Role</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
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
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="font-semibold text-slate-950 dark:text-slate-100">{user.fullName}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.department}</p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-700 dark:text-slate-300">
                      <p>{user.email}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.phone || "-"}</p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-slate-700 dark:text-slate-300">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <select
                        value={user.roleCode}
                        onChange={(event) =>
                          handleRoleChange(user.id, event.target.value)
                        }
                        disabled={!isSuperAdmin}
                        className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 ${
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
