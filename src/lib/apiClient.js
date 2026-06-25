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
