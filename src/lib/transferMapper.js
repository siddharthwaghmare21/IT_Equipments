export const transferTypes = [
  "Department Transfer",
  "IT Collection",
  "Reassignment",
  "Repair Return",
  "Temporary Handover",
];

export const transferConditions = [
  "Good",
  "Working",
  "Needs Inspection",
  "Needs Repair",
  "Damaged",
];

export const transferAcknowledgements = ["Pending", "Acknowledged", "Rejected"];

export const transferStatuses = [
  "Pending",
  "Collected by IT",
  "Reassigned",
  "Completed",
  "Cancelled",
];

export const transferReasons = [
  "Internal movement",
  "Replacement",
  "Project need",
  "Receiver change",
  "Repair return",
  "Temporary setup",
];

export function mapTransferFromApi(transfer) {
  return {
    id: String(transfer.transferId),
    transferId: transfer.transferId,
    transferCode: transfer.transferCode || "",
    transferType: transfer.transferType || "Department Transfer",
    assetId: transfer.assetId ? String(transfer.assetId) : "",
    assetTag: transfer.assetTag || "",
    assetName: transfer.assetName || "",
    fromDepartmentId: transfer.fromDepartmentId
      ? String(transfer.fromDepartmentId)
      : "",
    fromDepartmentName: transfer.fromDepartmentName || "",
    toDepartmentId: transfer.toDepartmentId
      ? String(transfer.toDepartmentId)
      : "",
    toDepartmentName: transfer.toDepartmentName || "",
    currentReceiverName: transfer.currentReceiverName || "",
    newReceiverName: transfer.newReceiverName || "",
    transferReason: transfer.transferReason || "",
    accessories: transfer.accessories || "",
    conditionAtTransfer: transfer.conditionAtTransfer || "Good",
    collectionDate: transfer.collectionDate || "",
    collectedBy: transfer.collectedBy ? String(transfer.collectedBy) : "",
    collectedByName: transfer.collectedByName || "",
    issueDate: transfer.issueDate || "",
    handoverAcknowledgement: transfer.handoverAcknowledgement || "Pending",
    newAcknowledgement: transfer.newAcknowledgement || "Pending",
    transferStatus: transfer.transferStatus || "Pending",
    remarks: transfer.remarks || "",
    createdAt: transfer.createdAt || "",
    updatedAt: transfer.updatedAt || "",
  };
}

export function createTransferFormData(transfer = {}) {
  return {
    transferCode: transfer.transferCode || "",
    transferType: transfer.transferType || "Department Transfer",
    assetId: transfer.assetId || "",
    fromDepartmentId: transfer.fromDepartmentId || "",
    toDepartmentId: transfer.toDepartmentId || "",
    currentReceiverName: transfer.currentReceiverName || "",
    newReceiverName: transfer.newReceiverName || "",
    transferReason: transfer.transferReason || "Internal movement",
    accessories: transfer.accessories || "",
    conditionAtTransfer: transfer.conditionAtTransfer || "Good",
    collectionDate: transfer.collectionDate || "",
    collectedBy: transfer.collectedBy || "",
    issueDate: transfer.issueDate || "",
    handoverAcknowledgement: transfer.handoverAcknowledgement || "Pending",
    newAcknowledgement: transfer.newAcknowledgement || "Pending",
    transferStatus: transfer.transferStatus || "Pending",
    remarks: transfer.remarks || "",
  };
}

export function mapTransferToRequest(formData, userId = null) {
  return {
    transferCode: formData.transferCode.trim(),
    transferType: formData.transferType,
    assetId: Number(formData.assetId),
    fromDepartmentId: Number(formData.fromDepartmentId),
    toDepartmentId: Number(formData.toDepartmentId),
    currentReceiverName: cleanOptional(formData.currentReceiverName),
    newReceiverName: cleanOptional(formData.newReceiverName),
    transferReason: cleanOptional(formData.transferReason),
    accessories: cleanOptional(formData.accessories),
    conditionAtTransfer: formData.conditionAtTransfer,
    collectionDate: formData.collectionDate || null,
    collectedBy: toNullableNumber(formData.collectedBy),
    issueDate: formData.issueDate || null,
    handoverAcknowledgement: formData.handoverAcknowledgement,
    newAcknowledgement: formData.newAcknowledgement,
    transferStatus: formData.transferStatus,
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
