"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/StateBlock";
import { showToast } from "@/components/common/ToastHost";
import {
  approveUserAccess,
  getPendingUserAccessApprovals,
  rejectUserAccess,
} from "@/lib/apiClient";
import { getSessionToken, readSession } from "@/lib/authSession";

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Approved: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

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
        styles[role] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {role}
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

function mapApprovalRequestFromApi(request) {
  return {
    id: request.approvalRequestId || request.ApprovalRequestId,
    fullName:
      request.requestedUserName || request.RequestedUserName || "Pending User",
    email: request.requestedUserEmail || request.RequestedUserEmail || "-",
    phone: "-",
    department: "IT Department",
    requestedRole:
      request.requestedRoleName ||
      request.RequestedRoleName ||
      request.requestedRoleCode ||
      request.RequestedRoleCode ||
      "-",
    status: request.approvalStatus || request.ApprovalStatus || "Pending",
    requestedAt: request.createdAt || request.CreatedAt,
    reason:
      request.remarks ||
      request.Remarks ||
      request.entityName ||
      request.EntityName ||
      "User access approval requested.",
  };
}

export default function AdminRequestManagementPage() {
  const [requests, setRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [pendingDecision, setPendingDecision] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    const token = getSessionToken();
    const savedSession = readSession();

    setCurrentUser(savedSession);

    if (!token) {
      setError("Login session not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getPendingUserAccessApprovals(token);
      setRequests((data || []).map(mapApprovalRequestFromApi));
    } catch (requestError) {
      setError(requestError.message || "Unable to load access requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  const isSuperAdmin = currentUser?.role === "Super Admin";
  const canApproveAccess =
    currentUser?.role === "Super Admin" || currentUser?.role === "Admin";

  const filteredRequests = useMemo(() => {
    if (statusFilter === "All") return requests;

    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;
  const approvedRequests = requests.filter(
    (request) => request.status === "Approved"
  ).length;
  const rejectedRequests = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  function approveRequest(requestId) {
    if (!canApproveAccess) {
      showToast("Only Super Admin or Admin can approve access requests.", "error");
      return;
    }

    const selectedRequest = requests.find((request) => request.id === requestId);

    if (!selectedRequest) {
      showToast("Request not found.", "error");
      return;
    }

    if (selectedRequest.status !== "Pending") {
      showToast("Only pending requests can be approved.", "warning");
      return;
    }

    if (selectedRequest.requestedRole === "Super Admin" && !isSuperAdmin) {
      showToast(
        "Only an existing Super Admin can approve Super Admin requests.",
        "error"
      );
      return;
    }

    setPendingDecision({ type: "approve", request: selectedRequest });
  }

  async function confirmApproveRequest(selectedRequest) {
    const token = getSessionToken();
    const approvedByUserId = currentUser?.id;

    if (!token || !approvedByUserId) {
      showToast("Login session not found. Please login again.", "error");
      return;
    }

    try {
      await approveUserAccess(
        selectedRequest.id,
        {
          approvedByUserId,
          remarks: `Approved by ${currentUser?.fullName || "Admin"}.`,
        },
        token
      );
      showToast("Access request approved successfully.");
      setPendingDecision(null);
      await loadRequests();
    } catch (requestError) {
      showToast(requestError.message || "Unable to approve access request.", "error");
    }
  }

  function rejectRequest(requestId) {
    if (!canApproveAccess) {
      showToast("Only Super Admin or Admin can reject access requests.", "error");
      return;
    }

    const selectedRequest = requests.find((request) => request.id === requestId);

    if (!selectedRequest) {
      showToast("Request not found.", "error");
      return;
    }

    if (selectedRequest.status !== "Pending") {
      showToast("Only pending requests can be rejected.", "warning");
      return;
    }

    setPendingDecision({ type: "reject", request: selectedRequest });
  }

  async function confirmRejectRequest(selectedRequest) {
    const token = getSessionToken();
    const approvedByUserId = currentUser?.id;

    if (!token || !approvedByUserId) {
      showToast("Login session not found. Please login again.", "error");
      return;
    }

    try {
      await rejectUserAccess(
        selectedRequest.id,
        {
          approvedByUserId,
          remarks: `Rejected by ${currentUser?.fullName || "Admin"}.`,
        },
        token
      );
      showToast("Access request rejected.", "warning");
      setPendingDecision(null);
      await loadRequests();
    } catch (requestError) {
      showToast(requestError.message || "Unable to reject access request.", "error");
    }
  }

  async function confirmPendingDecision() {
    if (!pendingDecision) return;

    if (pendingDecision.type === "approve") {
      await confirmApproveRequest(pendingDecision.request);
      return;
    }

    await confirmRejectRequest(pendingDecision.request);
  }

  return (
    <LayoutWrapper>
      <PageHeader
        title="Admin Request Management"
        description="Review, approve or reject IT staff access requests. Super Admin can approve all roles; Admin can approve Admin, Employee and Viewer requests."
      />

      {!canApproveAccess && (
        <section className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800 shadow-sm sm:p-5">
          You are not logged in as Super Admin or Admin. Approval and rejection
          actions are disabled.
        </section>
      )}

      {isLoading ? (
        <LoadingState
          title="Loading access requests"
          description="Fetching pending user access approvals from backend."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load access requests"
          description={error}
          onRetry={loadRequests}
        />
      ) : (
        <>
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Requests</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalRequests}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-700">
            {pendingRequests}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Approved</p>
          <h2 className="mt-2 text-2xl font-bold text-green-700">
            {approvedRequests}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>
          <h2 className="mt-2 text-2xl font-bold text-red-700">
            {rejectedRequests}
          </h2>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Access Requests
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage pending IT department user account requests.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900 sm:w-52"
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
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
                Requested Role
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Requested At
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Reason
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8">
                  <EmptyState
                    title="No access requests found"
                    description="Try changing request status filter."
                  />
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-semibold text-gray-900">
                      {request.fullName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {request.department || "IT Department"}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                    <p>{request.email}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {request.phone}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <RoleBadge role={request.requestedRole} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusBadge status={request.status} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                    {formatDate(request.requestedAt)}
                  </td>

                  <td className="min-w-64 px-4 py-4 text-gray-700">
                    <p className="line-clamp-2">{request.reason}</p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    {request.status === "Pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => approveRequest(request.id)}
                          disabled={!canApproveAccess}
                          className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => rejectRequest(request.id)}
                          disabled={!canApproveAccess}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500">
                        Action completed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>

      <p className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
        Note: This page now reads pending access requests from backend approval
        records. Email OTP sending requires company SMTP configuration.
      </p>
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDecision)}
        title={
          pendingDecision?.type === "approve"
            ? "Approve access request?"
            : "Reject access request?"
        }
        description={
          pendingDecision?.type === "approve"
            ? `Approve ${
                pendingDecision?.request?.fullName || "this user"
              } as ${pendingDecision?.request?.requestedRole || ""}?`
            : `Reject access request of ${
                pendingDecision?.request?.fullName || "this user"
              }?`
        }
        confirmLabel={pendingDecision?.type === "approve" ? "Approve" : "Reject"}
        tone={pendingDecision?.type === "approve" ? "default" : "danger"}
        onCancel={() => setPendingDecision(null)}
        onConfirm={confirmPendingDecision}
      />
    </LayoutWrapper>
  );
}
