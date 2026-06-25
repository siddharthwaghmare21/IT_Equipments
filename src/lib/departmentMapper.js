export function mapDepartmentFromApi(department) {
  return {
    id: String(department.departmentId),
    departmentId: department.departmentId,
    departmentCode: department.departmentCode || "",
    departmentName: department.departmentName || "",
    headOfDepartment: department.departmentHead || "",
    email: department.contactEmail || "",
    phone: department.contactPhone || "",
    location: department.location || "",
    description: department.description || "",
    status: department.isActive ? "Active" : "Inactive",
    isActive: Boolean(department.isActive),
  };
}

export function mapDepartmentToCreateRequest(formData) {
  return {
    departmentCode: formData.departmentCode.trim(),
    departmentName: formData.departmentName.trim(),
    departmentHead: cleanOptional(formData.headOfDepartment),
    contactEmail: cleanOptional(formData.email),
    contactPhone: cleanOptional(formData.phone),
    location: cleanOptional(formData.location),
    description: cleanOptional(formData.description),
  };
}

export function mapDepartmentToUpdateRequest(formData) {
  return {
    ...mapDepartmentToCreateRequest(formData),
    isActive: formData.status === "Active",
  };
}

function cleanOptional(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
