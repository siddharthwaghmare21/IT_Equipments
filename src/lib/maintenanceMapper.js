export const maintenancePriorities = ["Low", "Medium", "High", "Critical"];

export const maintenanceApprovalStatuses = ["Pending", "Approved", "Rejected"];

export const maintenanceStatuses = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

export const serviceTypes = [
  "Corrective Repair",
  "Preventive Service",
  "Warranty Repair",
  "Inspection",
  "Replacement Review",
  "Other",
];

export const issueTypes = [
  "Battery Issue",
  "Display Problem",
  "Keyboard Issue",
  "Network Drop",
  "Paper Jam",
  "Software Issue",
  "Hardware Failure",
  "General Service",
  "Other",
];

export function formatMaintenanceCurrency(amount) {
  return `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function mapMaintenanceFromApi(record) {
  return {
    id: String(record.maintenanceId),
    maintenanceId: record.maintenanceId,
    maintenanceCode: record.maintenanceCode || "",
    assetId: record.assetId ? String(record.assetId) : "",
    assetTag: record.assetTag || "",
    assetName: record.assetName || "",
    issueType: record.issueType || "",
    reportedByName: record.reportedByName || "",
    vendorId: record.vendorId ? String(record.vendorId) : "",
    vendorName: record.vendorName || "",
    serviceType: record.serviceType || "",
    priority: record.priority || "Medium",
    serviceDate: record.serviceDate || "",
    expectedCompletionDate: record.expectedCompletionDate || "",
    completionDate: record.completionDate || "",
    downtimeHours: String(record.downtimeHours || 0),
    warrantyClaim: Boolean(record.warrantyClaim),
    approvalStatus: record.approvalStatus || "Pending",
    maintenanceCost: String(record.maintenanceCost || 0),
    maintenanceStatus: record.maintenanceStatus || "Pending",
    remarks: record.remarks || "",
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
  };
}

export function createMaintenanceFormData(record = {}) {
  return {
    maintenanceCode: record.maintenanceCode || "",
    assetId: record.assetId || "",
    issueType: record.issueType || "",
    reportedByName: record.reportedByName || "",
    vendorId: record.vendorId || "",
    serviceType: record.serviceType || "Corrective Repair",
    priority: record.priority || "Medium",
    serviceDate: record.serviceDate || "",
    expectedCompletionDate: record.expectedCompletionDate || "",
    completionDate: record.completionDate || "",
    downtimeHours: record.downtimeHours || "0",
    warrantyClaim: record.warrantyClaim ? "Yes" : "No",
    approvalStatus: record.approvalStatus || "Pending",
    maintenanceCost: record.maintenanceCost || "0",
    maintenanceStatus: record.maintenanceStatus || "Pending",
    remarks: record.remarks || "",
  };
}

export function mapMaintenanceToRequest(formData, userId = null) {
  return {
    maintenanceCode: formData.maintenanceCode.trim(),
    assetId: Number(formData.assetId),
    issueType: formData.issueType.trim(),
    reportedByName: cleanOptional(formData.reportedByName),
    vendorId: toNullableNumber(formData.vendorId),
    serviceType: cleanOptional(formData.serviceType),
    priority: formData.priority,
    serviceDate: formData.serviceDate || null,
    expectedCompletionDate: formData.expectedCompletionDate || null,
    completionDate: formData.completionDate || null,
    downtimeHours: Number(formData.downtimeHours || 0),
    warrantyClaim: formData.warrantyClaim === "Yes",
    approvalStatus: formData.approvalStatus,
    maintenanceCost: Number(formData.maintenanceCost || 0),
    maintenanceStatus: formData.maintenanceStatus,
    remarks: cleanOptional(formData.remarks),
    createdBy: userId,
    updatedBy: userId,
  };
}

function cleanOptional(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}
