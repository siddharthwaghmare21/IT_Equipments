"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import TablePagination from "@/components/common/TablePagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { EmptyState, LoadingState } from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import { ApiError, getUsers, updateUserRole, updateUserStatus } from "@/lib/apiClient";
import { readSession } from "@/lib/authSession";

const roles = [
  { label: "Admin", code: "ADMIN" },
  { label: "Employee", code: "EMPLOYEE" },
  { label: "Viewer", code: "VIEWER" },
];

const statuses = ["Pending", "Active", "Rejected", "Suspended", "Inactive"];

function RoleBadge({ role }) {
  const styles = {
    "Super Admin": "border-violet-500/30 bg-violet-500/12 text-violet-200",
    Admin: "border-sky-500/30 bg-sky-500/12 text-sky-200",
    Employee: "border-[#314666] bg-[#101a2b] text-[#c8d4ec]",
    Viewer: "border-orange-500/30 bg-orange-500/12 text-orange-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[role] || "border-[#314666] bg-[#101a2b] text-[#c8d4ec]"
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "border-emerald-500/30 bg-emerald-500/12 text-emerald-200",
    Suspended: "border-rose-500/30 bg-rose-500/12 text-rose-200",
    Inactive: "border-amber-500/30 bg-amber-500/12 text-amber-200",
    Pending: "border-sky-500/30 bg-sky-500/12 text-sky-200",
    Rejected: "border-[#314666] bg-[#101a2b] text-[#c8d4ec]",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "border-[#314666] bg-[#101a2b] text-[#c8d4ec]"
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
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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

  const canManageUsers = ["SUPER_ADMIN", "ADMIN"].includes(currentUser?.roleCode);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "All" || user.roleCode === roleFilter;
      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const pagedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredUsers.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredUsers]);

  function replaceUser(updatedUser) {
    const normalized = normalizeUser(updatedUser);
    setUsers((previousUsers) =>
      previousUsers.map((user) => (user.id === normalized.id ? normalized : user))
    );
  }

  function handleRoleChange(userId, newRoleCode) {
    if (!canManageUsers) {
      showToast("Only Super Admin or Admin can change user roles.", "error");
      return;
    }

    const selectedUser = users.find((user) => user.id === userId);
    const selectedRole = roles.find((role) => role.code === newRoleCode);

    if (!selectedUser || !selectedRole) {
      showToast("User or role not found.", "error");
      return;
    }

    if (selectedUser.roleCode === "SUPER_ADMIN") {
      showToast("Super Admin role is protected and cannot be changed.", "warning");
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
    if (!canManageUsers) {
      showToast("Only Super Admin or Admin can update user status.", "error");
      return;
    }

    const selectedUser = users.find((user) => user.id === userId);

    if (!selectedUser) {
      showToast("User not found.", "error");
      return;
    }

    if (selectedUser.roleCode === "SUPER_ADMIN") {
      showToast("Super Admin account is protected and cannot be disabled.", "warning");
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
        description="Manage approved users, role mapping and account status."
      />

      {!canManageUsers && (
        <section className="mb-4 rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200 shadow-sm">
          You are not logged in as Super Admin or Admin. User management actions are
          disabled by backend authorization.
        </section>
      )}

      {errorMessage && (
        <section className="mb-4 rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-200 shadow-sm">
          {errorMessage}
        </section>
      )}

      <section className="mb-3 rounded-[22px] border border-[#2c3f63] bg-[#18253d] p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 text-sm text-white outline-none focus:border-[#7c3aed]"
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
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 text-sm text-white outline-none focus:border-[#7c3aed]"
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
        <>
        <TableWrapper>
          <table className="min-w-full text-sm">
            <thead className="bg-[#101a2b]">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">User</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">Contact</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">Role</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">Created At</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">Manage Role</th>
                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2c3f63] bg-[#18253d]">
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
                pagedUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-[#1f2f4a]">
                    <td className="text-center whitespace-nowrap px-4 py-4">
                      <p className="font-semibold text-white">{user.fullName}</p>
                      <p className="mt-1 text-xs text-[#8fa4c7]">{user.department}</p>
                    </td>

                    <td className="text-center whitespace-nowrap px-4 py-4 text-[#c8d4ec]">
                      <p>{user.email}</p>
                      <p className="mt-1 text-xs text-[#8fa4c7]">{user.phone || "-"}</p>
                    </td>

                    <td className="text-center whitespace-nowrap px-4 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="text-center whitespace-nowrap px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="text-center whitespace-nowrap px-4 py-4 text-[#c8d4ec]">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="text-center whitespace-nowrap px-4 py-4">
                      <select
                        value={user.roleCode}
                        onChange={(event) =>
                          handleRoleChange(user.id, event.target.value)
                        }
                        disabled={!canManageUsers || user.roleCode === "SUPER_ADMIN"}
                        className="h-10 rounded-2xl border border-[#314666] bg-[#101a2b] px-3 text-xs font-semibold text-white outline-none focus:border-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {roles.map((role) => (
                          <option key={role.code} value={role.code}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="text-center whitespace-nowrap px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user.id)}
                        disabled={!canManageUsers || user.roleCode === "SUPER_ADMIN" || user.id === currentUser?.id}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 ${
                          user.status === "Active"
                            ? "border border-rose-500/30 bg-rose-500/12 text-rose-100 hover:bg-rose-500/18"
                            : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20"
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
        {filteredUsers.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemLabel="users"
          />
        )}
        </>
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
