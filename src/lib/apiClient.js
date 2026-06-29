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
    throw new ApiError(
      data?.message || data?.title || response.statusText || "Request failed.",
      response.status,
      data
    );
  }

  return data;
}

export function loginUser({ email, password }) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
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
