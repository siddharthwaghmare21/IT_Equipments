export const returnConditions = [
  "Good",
  "Working",
  "Needs Inspection",
  "Needs Repair",
  "Damaged",
  "Missing Accessories",
];

export const returnAcknowledgementStatuses = [
  "Pending",
  "Acknowledged",
  "Rejected",
];

export const inspectionStatuses = ["Pending", "Completed", "Damage Review"];

export const damageDecisions = [
  "Pending",
  "No Damage",
  "Repair Required",
  "Write-off Required",
];

export const returnStatuses = [
  "Returned",
  "Damaged",
  "Pending Inspection",
  "Under Review",
  "Rejected",
];

export function mapReturnFromApi(returnRecord) {
  return {
    id: String(returnRecord.returnId),
    returnId: returnRecord.returnId,
    returnCode: returnRecord.returnCode || "",
    deliveryId: returnRecord.deliveryId ? String(returnRecord.deliveryId) : "",
    deliveryCode: returnRecord.deliveryCode || "",
    assetId: returnRecord.assetId ? String(returnRecord.assetId) : "",
    assetTag: returnRecord.assetTag || "",
    assetName: returnRecord.assetName || "",
    departmentId: returnRecord.departmentId
      ? String(returnRecord.departmentId)
      : "",
    departmentName: returnRecord.departmentName || "",
    returnedByName: returnRecord.returnedByName || "",
    returnDate: returnRecord.returnDate || "",
    returnCondition: returnRecord.returnCondition || "Good",
    receivedBy: returnRecord.receivedBy ? String(returnRecord.receivedBy) : "",
    receivedByName: returnRecord.receivedByName || "",
    receivedLocation: returnRecord.receivedLocation || "",
    acknowledgementStatus: returnRecord.acknowledgementStatus || "Pending",
    inspectionStatus: returnRecord.inspectionStatus || "Pending",
    inspectionBy: returnRecord.inspectionBy
      ? String(returnRecord.inspectionBy)
      : "",
    inspectionByName: returnRecord.inspectionByName || "",
    damageDecision: returnRecord.damageDecision || "Pending",
    returnStatus: returnRecord.returnStatus || "Returned",
    remarks: returnRecord.remarks || "",
    createdAt: returnRecord.createdAt || "",
    updatedAt: returnRecord.updatedAt || "",
  };
}

export function createReturnFormData(returnRecord = {}) {
  return {
    returnCode: returnRecord.returnCode || "",
    deliveryId: returnRecord.deliveryId || "",
    assetId: returnRecord.assetId || "",
    departmentId: returnRecord.departmentId || "",
    returnedByName: returnRecord.returnedByName || "",
    returnDate: returnRecord.returnDate || "",
    returnCondition: returnRecord.returnCondition || "Good",
    receivedBy: returnRecord.receivedBy || "",
    receivedLocation: returnRecord.receivedLocation || "",
    acknowledgementStatus: returnRecord.acknowledgementStatus || "Pending",
    inspectionStatus: returnRecord.inspectionStatus || "Pending",
    inspectionBy: returnRecord.inspectionBy || "",
    damageDecision: returnRecord.damageDecision || "Pending",
    returnStatus: returnRecord.returnStatus || "Returned",
    remarks: returnRecord.remarks || "",
  };
}

export function mapReturnToRequest(formData, userId = null) {
  return {
    returnCode: formData.returnCode.trim(),
    deliveryId: toNullableNumber(formData.deliveryId),
    assetId: Number(formData.assetId),
    departmentId: toNullableNumber(formData.departmentId),
    returnedByName: formData.returnedByName.trim(),
    returnDate: formData.returnDate,
    returnCondition: formData.returnCondition,
    receivedBy: toNullableNumber(formData.receivedBy),
    receivedLocation: cleanOptional(formData.receivedLocation),
    acknowledgementStatus: formData.acknowledgementStatus,
    inspectionStatus: formData.inspectionStatus,
    inspectionBy: toNullableNumber(formData.inspectionBy),
    damageDecision: formData.damageDecision,
    returnStatus: formData.returnStatus,
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
