export function mapVendorFromApi(vendor) {
  return {
    id: String(vendor.vendorId),
    vendorId: vendor.vendorId,
    vendorCode: vendor.vendorCode || "",
    vendorName: vendor.vendorName || "",
    contactPerson: vendor.contactPerson || "",
    email: vendor.contactEmail || "",
    phone: vendor.contactPhone || "",
    gstNumber: vendor.gstNumber || "",
    address: vendor.address || "",
    paymentTerms: vendor.paymentTerms || "",
    serviceCategory: vendor.serviceCategory || "",
    complianceStatus: vendor.complianceStatus || "Review Required",
    status: vendor.isActive ? "Active" : "Inactive",
    isActive: Boolean(vendor.isActive),
  };
}

export function mapVendorToCreateRequest(formData) {
  return {
    vendorCode: formData.vendorCode.trim(),
    vendorName: formData.vendorName.trim(),
    contactPerson: cleanOptional(formData.contactPerson),
    contactEmail: cleanOptional(formData.email),
    contactPhone: cleanOptional(formData.phone),
    gstNumber: cleanOptional(formData.gstNumber),
    address: cleanOptional(formData.address),
    paymentTerms: cleanOptional(formData.paymentTerms),
    serviceCategory: cleanOptional(formData.serviceCategory),
    complianceStatus: formData.complianceStatus || "Review Required",
  };
}

export function mapVendorToUpdateRequest(formData) {
  return {
    ...mapVendorToCreateRequest(formData),
    isActive: formData.status === "Active",
  };
}

export const vendorComplianceStatuses = [
  "Compliant",
  "Review Required",
  "Blocked",
];

function cleanOptional(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
