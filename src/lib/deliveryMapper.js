export const acknowledgementStatuses = ["Pending", "Acknowledged", "Rejected"];

export const deliveryStatuses = ["Pending", "Delivered", "Cancelled"];

export function mapDeliveryFromApi(delivery) {
  return {
    id: String(delivery.deliveryId),
    deliveryId: delivery.deliveryId,
    deliveryCode: delivery.deliveryCode || "",
    assetId: delivery.assetId ? String(delivery.assetId) : "",
    assetTag: delivery.assetTag || "",
    assetName: delivery.assetName || "",
    departmentId: delivery.departmentId ? String(delivery.departmentId) : "",
    departmentName: delivery.departmentName || "",
    receiverName: delivery.receiverName || "",
    deliveryDate: delivery.deliveryDate || "",
    deliveredBy: delivery.deliveredBy ? String(delivery.deliveredBy) : "",
    deliveredByName: delivery.deliveredByName || "",
    accessories: delivery.accessories || "",
    acknowledgementStatus: delivery.acknowledgementStatus || "Pending",
    deliveryStatus: delivery.deliveryStatus || "Pending",
    remarks: delivery.remarks || "",
    createdAt: delivery.createdAt || "",
    updatedAt: delivery.updatedAt || "",
  };
}

export function createDeliveryFormData(delivery = {}) {
  return {
    deliveryCode: delivery.deliveryCode || "",
    assetId: delivery.assetId || "",
    departmentId: delivery.departmentId || "",
    receiverName: delivery.receiverName || "",
    deliveryDate: delivery.deliveryDate || "",
    deliveredBy: delivery.deliveredBy || "",
    accessories: delivery.accessories || "",
    acknowledgementStatus: delivery.acknowledgementStatus || "Pending",
    deliveryStatus: delivery.deliveryStatus || "Pending",
    remarks: delivery.remarks || "",
  };
}

export function mapDeliveryToRequest(formData, userId = null) {
  return {
    deliveryCode: formData.deliveryCode.trim(),
    assetId: Number(formData.assetId),
    departmentId: Number(formData.departmentId),
    receiverName: formData.receiverName.trim(),
    deliveryDate: formData.deliveryDate,
    deliveredBy: toNullableNumber(formData.deliveredBy),
    accessories: cleanOptional(formData.accessories),
    acknowledgementStatus: formData.acknowledgementStatus,
    deliveryStatus: formData.deliveryStatus,
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
