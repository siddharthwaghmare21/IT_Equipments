const DEFAULT_API_BASE_URL = "http://localhost:5168";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const token = options.token;
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  const contentType = response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("itAssetUserSession");
      if (!["/login", "/admin-setup", "/admin-request-access"].includes(window.location.pathname)) {
        window.location.assign("/login");
      }
    }

    throw new ApiError(
      data?.message || data?.title || response.statusText || "Request failed.",
      response.status,
      data
    );
  }

  return data;
}

export async function apiFileRequest(path, options = {}) {
  const token = options.token;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("itAssetUserSession");
      if (!["/login", "/admin-setup", "/admin-request-access"].includes(window.location.pathname)) {
        window.location.assign("/login");
      }
    }

    const contentType = response.headers.get("content-type") || "";
    const errorData = contentType.includes("application/json")
      ? await response.json()
      : null;

    throw new ApiError(
      errorData?.message || errorData?.title || response.statusText || "Download failed.",
      response.status,
      errorData
    );
  }

  return {
    blob: await response.blob(),
    fileName:
      response.headers
        .get("content-disposition")
        ?.match(/filename="?([^";]+)"?/i)?.[1] || "download.json",
  };
}

export function loginUser({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function requestEmailOtp({ email, purpose }) {
  return apiRequest("/api/auth/email-otp/request", {
    method: "POST",
    body: { email, purpose },
  });
}

export function verifyEmailOtp({ email, purpose, otpCode }) {
  return apiRequest("/api/auth/email-otp/verify", {
    method: "POST",
    body: { email, purpose, otpCode },
  });
}

export function getBootstrapStatus() {
  return apiRequest("/api/auth/bootstrap-status");
}

export function bootstrapSuperAdmin(setupKey, superAdmin) {
  return apiRequest("/api/auth/bootstrap-super-admin", {
    method: "POST",
    headers: { "X-Setup-Key": setupKey },
    body: superAdmin,
  });
}

export function createSignupRequest(request) {
  return apiRequest("/api/auth/signup-request", {
    method: "POST",
    body: request,
  });
}

export function getUsers(token) {
  return apiRequest("/api/users", { token });
}

export function updateUserRole(userId, roleCode, token) {
  return apiRequest(`/api/users/${userId}/role`, {
    method: "PATCH",
    token,
    body: { roleCode },
  });
}

export function updateUserStatus(userId, accountStatus, token) {
  return apiRequest(`/api/users/${userId}/status`, {
    method: "PATCH",
    token,
    body: { accountStatus },
  });
}

export function getDepartments(token) {
  return apiRequest("/api/departments", { token });
}

export function getDepartment(departmentId, token) {
  return apiRequest(`/api/departments/${departmentId}`, { token });
}

export function createDepartment(department, token) {
  return apiRequest("/api/departments", {
    method: "POST",
    token,
    body: department,
  });
}

export function updateDepartment(departmentId, department, token) {
  return apiRequest(`/api/departments/${departmentId}`, {
    method: "PUT",
    token,
    body: department,
  });
}

export function archiveDepartment(departmentId, token) {
  return apiRequest(`/api/departments/${departmentId}`, {
    method: "DELETE",
    token,
  });
}

export function getVendors(token) {
  return apiRequest("/api/vendors", { token });
}

export function getVendor(vendorId, token) {
  return apiRequest(`/api/vendors/${vendorId}`, { token });
}

export function createVendor(vendor, token) {
  return apiRequest("/api/vendors", {
    method: "POST",
    token,
    body: vendor,
  });
}

export function updateVendor(vendorId, vendor, token) {
  return apiRequest(`/api/vendors/${vendorId}`, {
    method: "PUT",
    token,
    body: vendor,
  });
}

export function archiveVendor(vendorId, token) {
  return apiRequest(`/api/vendors/${vendorId}`, {
    method: "DELETE",
    token,
  });
}

export function getAssets(token) {
  return apiRequest("/api/assets", { token });
}

export function getAsset(assetId, token) {
  return apiRequest(`/api/assets/${assetId}`, { token });
}

export function getAssetHistory(assetId, token) {
  return apiRequest(`/api/assets/${assetId}/history`, { token });
}

export function createAsset(asset, token) {
  return apiRequest("/api/assets", {
    method: "POST",
    token,
    body: asset,
  });
}

export function updateAsset(assetId, asset, token) {
  return apiRequest(`/api/assets/${assetId}`, {
    method: "PUT",
    token,
    body: asset,
  });
}

export function archiveAsset(assetId, remarks, token) {
  return apiRequest(`/api/assets/${assetId}/archive`, {
    method: "POST",
    token,
    body: { remarks },
  });
}

export function getWorkOrders(token) {
  return apiRequest("/api/work-orders", { token });
}

export function getWorkOrder(workOrderId, token) {
  return apiRequest(`/api/work-orders/${workOrderId}`, { token });
}

export function createWorkOrder(workOrder, token) {
  return apiRequest("/api/work-orders", {
    method: "POST",
    token,
    body: workOrder,
  });
}

export function updateWorkOrder(workOrderId, workOrder, token) {
  return apiRequest(`/api/work-orders/${workOrderId}`, {
    method: "PUT",
    token,
    body: workOrder,
  });
}

export function cancelWorkOrder(workOrderId, token) {
  return apiRequest(`/api/work-orders/${workOrderId}`, {
    method: "DELETE",
    token,
  });
}

export function getDeliveries(token) {
  return apiRequest("/api/deliveries", { token });
}

export function getDelivery(deliveryId, token) {
  return apiRequest(`/api/deliveries/${deliveryId}`, { token });
}

export function createDelivery(delivery, token) {
  return apiRequest("/api/deliveries", {
    method: "POST",
    token,
    body: delivery,
  });
}

export function updateDelivery(deliveryId, delivery, token) {
  return apiRequest(`/api/deliveries/${deliveryId}`, {
    method: "PUT",
    token,
    body: delivery,
  });
}

export function cancelDelivery(deliveryId, token) {
  return apiRequest(`/api/deliveries/${deliveryId}`, {
    method: "DELETE",
    token,
  });
}

export function getReturns(token) {
  return apiRequest("/api/returns", { token });
}

export function getReturn(returnId, token) {
  return apiRequest(`/api/returns/${returnId}`, { token });
}

export function createReturn(returnRecord, token) {
  return apiRequest("/api/returns", {
    method: "POST",
    token,
    body: returnRecord,
  });
}

export function updateReturn(returnId, returnRecord, token) {
  return apiRequest(`/api/returns/${returnId}`, {
    method: "PUT",
    token,
    body: returnRecord,
  });
}

export function rejectReturn(returnId, token) {
  return apiRequest(`/api/returns/${returnId}`, {
    method: "DELETE",
    token,
  });
}

export function getMaintenanceRecords(token) {
  return apiRequest("/api/maintenance", { token });
}

export function getMaintenanceRecord(maintenanceId, token) {
  return apiRequest(`/api/maintenance/${maintenanceId}`, { token });
}

export function createMaintenanceRecord(maintenanceRecord, token) {
  return apiRequest("/api/maintenance", {
    method: "POST",
    token,
    body: maintenanceRecord,
  });
}

export function updateMaintenanceRecord(maintenanceId, maintenanceRecord, token) {
  return apiRequest(`/api/maintenance/${maintenanceId}`, {
    method: "PUT",
    token,
    body: maintenanceRecord,
  });
}

export function cancelMaintenanceRecord(maintenanceId, token) {
  return apiRequest(`/api/maintenance/${maintenanceId}`, {
    method: "DELETE",
    token,
  });
}

export function getTransfers(token) {
  return apiRequest("/api/transfers", { token });
}

export function getTransfer(transferId, token) {
  return apiRequest(`/api/transfers/${transferId}`, { token });
}

export function createTransfer(transfer, token) {
  return apiRequest("/api/transfers", {
    method: "POST",
    token,
    body: transfer,
  });
}

export function updateTransfer(transferId, transfer, token) {
  return apiRequest(`/api/transfers/${transferId}`, {
    method: "PUT",
    token,
    body: transfer,
  });
}

export function cancelTransfer(transferId, token) {
  return apiRequest(`/api/transfers/${transferId}`, {
    method: "DELETE",
    token,
  });
}

export function getActivityLogs(token, limit = 100) {
  return apiRequest(`/api/activity-logs?limit=${encodeURIComponent(limit)}`, {
    token,
  });
}

export function getPendingUserAccessApprovals(token) {
  return apiRequest("/api/approvals/user-access/pending", { token });
}

export function getEmailStatus(token) {
  return apiRequest("/api/security/email-status", { token });
}

export function getReportBrandingSettings() {
  return apiRequest("/api/settings/report-branding");
}

export function updateReportBrandingSettings(settings, token) {
  return apiRequest("/api/settings/report-branding", {
    method: "PUT",
    token,
    body: settings,
  });
}

export function getReportData(reportType, token) {
  return apiRequest(`/api/reports/${encodeURIComponent(reportType)}`, {
    token,
  });
}

export function getExportJobs(token, limit = 100) {
  return apiRequest(`/api/export-jobs?limit=${encodeURIComponent(limit)}`, {
    token,
  });
}

export function createExportJob(exportJob, token) {
  return apiRequest("/api/export-jobs", {
    method: "POST",
    token,
    body: exportJob,
  });
}

export function getImportJobs(token, limit = 100) {
  return apiRequest(`/api/import-jobs?limit=${encodeURIComponent(limit)}`, {
    token,
  });
}

export function createImportJob(importJob, token) {
  return apiRequest("/api/import-jobs", {
    method: "POST",
    token,
    body: importJob,
  });
}

export function getBackupJobs(token, limit = 100) {
  return apiRequest(`/api/backup-jobs?limit=${encodeURIComponent(limit)}`, {
    token,
  });
}

export function createBackupJob(backupJob, token) {
  return apiRequest("/api/backup-jobs", {
    method: "POST",
    token,
    body: backupJob,
  });
}

export function downloadBackupSnapshot(scope, token) {
  return apiFileRequest(
    `/api/backups/download?scope=${encodeURIComponent(scope)}`,
    { token }
  );
}

export function approveUserAccess(approvalRequestId, decision, token) {
  return apiRequest(`/api/approvals/user-access/${approvalRequestId}/approve`, {
    method: "POST",
    token,
    body: decision,
  });
}

export function rejectUserAccess(approvalRequestId, decision, token) {
  return apiRequest(`/api/approvals/user-access/${approvalRequestId}/reject`, {
    method: "POST",
    token,
    body: decision,
  });
}
