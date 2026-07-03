export const assetCategories = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Printer",
  "Network",
  "Keyboard",
  "Mouse",
  "Other",
];

export const assetConditions = [
  "New",
  "Good",
  "Working",
  "Needs Repair",
  "Damaged",
  "Retired",
];

export const assetLifecycleStatuses = [
  "In Stock",
  "In Use",
  "Under Maintenance",
  "Returned",
  "Archived",
  "Scrapped",
];

export const assetStatuses = [
  "Available",
  "Delivered",
  "Maintenance",
  "Damaged",
  "Archived",
  "Scrapped",
];

export function mapAssetFromApi(asset) {
  return {
    id: String(asset.assetId),
    assetId: asset.assetId,
    assetTag: asset.assetTag || "",
    assetName: asset.assetName || "",
    name: asset.assetName || "",
    category: asset.category || "",
    brand: asset.brand || "",
    model: asset.model || "",
    serialNumber: asset.serialNumber || "",
    workOrderRef: asset.workOrderRef || "",
    invoiceNumber: asset.invoiceNumber || "",
    purchaseDate: asset.purchaseDate || "",
    warrantyExpiry: asset.warrantyExpiry || "",
    custodianDepartmentId: asset.custodianDepartmentId || "",
    custodianDepartmentName: asset.custodianDepartmentName || "",
    currentDepartmentId: asset.currentDepartmentId || "",
    currentDepartmentName: asset.currentDepartmentName || "",
    currentReceiverName: asset.currentReceiverName || "",
    location: asset.location || "",
    assetCondition: asset.assetCondition || "New",
    condition: asset.assetCondition || "New",
    lifecycleStatus: asset.lifecycleStatus || "In Stock",
    assetStatus: asset.assetStatus || "Available",
    status: asset.assetStatus || "Available",
    specifications: asset.specifications || "",
    description: asset.description || "",
    remarks: asset.remarks || "",
    documentCount: asset.documentCount || 0,
    attachmentStatus: asset.attachmentStatus || "Pending",
    createdAt: asset.createdAt || "",
    updatedAt: asset.updatedAt || "",
  };
}

export function mapAssetToRequest(formData) {
  return {
    assetTag: formData.assetTag.trim(),
    assetName: formData.assetName.trim(),
    category: formData.category,
    brand: cleanOptional(formData.brand),
    model: cleanOptional(formData.model),
    serialNumber: formData.serialNumber.trim(),
    workOrderRef: cleanOptional(formData.workOrderRef),
    invoiceNumber: cleanOptional(formData.invoiceNumber),
    purchaseDate: cleanOptional(formData.purchaseDate),
    warrantyExpiry: cleanOptional(formData.warrantyExpiry),
    custodianDepartmentId: toNullableNumber(formData.custodianDepartmentId),
    currentDepartmentId: toNullableNumber(formData.currentDepartmentId),
    currentReceiverName: cleanOptional(formData.currentReceiverName),
    location: cleanOptional(formData.location),
    assetCondition: formData.assetCondition || "New",
    lifecycleStatus: formData.lifecycleStatus || "In Stock",
    assetStatus: formData.assetStatus || "Available",
    specifications: cleanOptional(formData.specifications),
    description: cleanOptional(formData.description),
    remarks: cleanOptional(formData.remarks),
  };
}

export function createAssetFormData(asset = {}) {
  return {
    assetTag: asset.assetTag || "",
    assetName: asset.assetName || "",
    category: asset.category || "",
    brand: asset.brand || "",
    model: asset.model || "",
    serialNumber: asset.serialNumber || "",
    workOrderRef: asset.workOrderRef || "",
    invoiceNumber: asset.invoiceNumber || "",
    purchaseDate: asset.purchaseDate || "",
    warrantyExpiry: asset.warrantyExpiry || "",
    custodianDepartmentId: asset.custodianDepartmentId || "",
    currentDepartmentId: asset.currentDepartmentId || "",
    currentReceiverName: asset.currentReceiverName || "",
    location: asset.location || "",
    assetCondition: asset.assetCondition || "New",
    lifecycleStatus: asset.lifecycleStatus || "In Stock",
    assetStatus: asset.assetStatus || "Available",
    specifications: asset.specifications || "",
    description: asset.description || "",
    remarks: asset.remarks || "",
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
