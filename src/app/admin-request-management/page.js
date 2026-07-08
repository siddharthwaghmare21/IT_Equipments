"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LayoutWrapper from "@/components/common/LayoutWrapper";
import PageHeader from "@/components/common/PageHeader";
import TableWrapper from "@/components/common/TableWrapper";
import TablePagination from "@/components/common/TablePagination";
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
    Pending: "border-amber-500/30 bg-amber-500/12 text-amber-200",
    Approved: "border-emerald-500/30 bg-emerald-500/12 text-emerald-200",
    Rejected: "border-rose-500/30 bg-rose-500/12 text-rose-200",
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
  const [currentPage, setCurrentPage] = useState(1);
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

  const pagedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return filteredRequests.slice(startIndex, startIndex + 10);
  }, [currentPage, filteredRequests]);

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
        description="Review pending access requests and complete approval decisions."
      />

      {!canApproveAccess && (
        <section className="mb-4 rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200 shadow-sm">
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
      <section className="mb-4 rounded-[26px] border border-[#2c3f63] bg-[#18253d] p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Access Requests
            </h2>
            <p className="mt-1 text-sm text-[#8fa4c7]">
              Showing {filteredRequests.length} filtered requests.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-11 w-full rounded-2xl border border-[#314666] bg-[#101a2b] px-4 text-sm text-white outline-none focus:border-[#7c3aed] sm:w-52"
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </section>

      <TableWrapper>
        <table className="min-w-full text-sm">
          <thead className="bg-[#101a2b]">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
                User
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
                Contact
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
                Requested Role
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
                Requested At
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
                Reason
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#8fa4c7]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#2c3f63] bg-[#18253d]">
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
              pagedRequests.map((request) => (
                <tr key={request.id} className="transition hover:bg-[#1f2f4a]">
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-semibold text-white">
                      {request.fullName}
                    </p>
                    <p className="mt-1 text-xs text-[#8fa4c7]">
                      {request.department || "IT Department"}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-[#c8d4ec]">
                    <p>{request.email}</p>
                    <p className="mt-1 text-xs text-[#8fa4c7]">
                      {request.phone}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <RoleBadge role={request.requestedRole} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusBadge status={request.status} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-[#c8d4ec]">
                    {formatDate(request.requestedAt)}
                  </td>

                  <td className="min-w-64 px-4 py-4 text-[#c8d4ec]">
                    <p className="line-clamp-2">{request.reason}</p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    {request.status === "Pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => approveRequest(request.id)}
                          disabled={!canApproveAccess}
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-[#314666] disabled:bg-[#101a2b] disabled:text-[#6d7f9b]"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => rejectRequest(request.id)}
                          disabled={!canApproveAccess}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/12 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:border-[#314666] disabled:bg-[#101a2b] disabled:text-[#6d7f9b]"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-[#8fa4c7]">
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
      {filteredRequests.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredRequests.length}
          pageSize={10}
          onPageChange={setCurrentPage}
          itemLabel="requests"
        />
      )}
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
