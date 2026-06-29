export const approvalStatuses = ["Pending", "Approved", "Rejected"];

export const paymentStatuses = ["Pending", "Partial", "Paid", "Not Required"];

export const receivedStatuses = [
  "Pending",
  "Partially Received",
  "Fully Received",
];

export const invoiceStatuses = ["Pending", "Uploaded", "Not Required"];

export const workOrderStatuses = ["Draft", "Ordered", "Received", "Cancelled"];

export function formatCurrency(amount) {
  return `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function mapWorkOrderFromApi(workOrder) {
  return {
    id: String(workOrder.workOrderId),
    workOrderId: workOrder.workOrderId,
    workOrderNumber: workOrder.workOrderNumber || "",
    vendorId: workOrder.vendorId ? String(workOrder.vendorId) : "",
    vendorName: workOrder.vendorName || "-",
    invoiceNumber: workOrder.invoiceNumber || "",
    workOrderDate: workOrder.workOrderDate || "",
    expectedDeliveryDate: workOrder.expectedDeliveryDate || "",
    receivedDate: workOrder.receivedDate || "",
    totalAmount: Number(workOrder.totalAmount || 0),
    approvalStatus: workOrder.approvalStatus || "Pending",
    paymentStatus: workOrder.paymentStatus || "Pending",
    receivedStatus: workOrder.receivedStatus || "Pending",
    invoiceStatus: workOrder.invoiceStatus || "Pending",
    workOrderStatus: workOrder.workOrderStatus || "Draft",
    approvedBy: workOrder.approvedBy || "",
    approvedAt: workOrder.approvedAt || "",
    remarks: workOrder.remarks || "",
    itemCount: Number(workOrder.itemCount || workOrder.items?.length || 0),
    items: (workOrder.items || []).map(mapWorkOrderItemFromApi),
    createdAt: workOrder.createdAt || "",
    updatedAt: workOrder.updatedAt || "",
  };
}

export function mapWorkOrderItemFromApi(item) {
  return {
    workOrderItemId: item.workOrderItemId,
    itemName: item.itemName || "",
    category: item.category || "",
    quantity: String(item.quantity || 1),
    unitPrice: String(item.unitPrice || 0),
    totalAmount: Number(item.totalAmount || 0),
    warranty: item.warranty || "",
    specifications: item.specifications || "",
    description: item.description || "",
  };
}

export function createEmptyWorkOrderItem() {
  return {
    itemName: "",
    category: "",
    quantity: "1",
    unitPrice: "0",
    warranty: "",
    specifications: "",
    description: "",
  };
}

export function createWorkOrderFormData(workOrder = null) {
  if (!workOrder) {
    return {
      workOrderNumber: "",
      vendorId: "",
      invoiceNumber: "",
      workOrderDate: "",
      expectedDeliveryDate: "",
      receivedDate: "",
      approvalStatus: "Pending",
      paymentStatus: "Pending",
      receivedStatus: "Pending",
      invoiceStatus: "Pending",
      workOrderStatus: "Draft",
      remarks: "",
      items: [createEmptyWorkOrderItem()],
    };
  }

  return {
    workOrderNumber: workOrder.workOrderNumber,
    vendorId: workOrder.vendorId,
    invoiceNumber: workOrder.invoiceNumber,
    workOrderDate: workOrder.workOrderDate,
    expectedDeliveryDate: workOrder.expectedDeliveryDate,
    receivedDate: workOrder.receivedDate,
    approvalStatus: workOrder.approvalStatus,
    paymentStatus: workOrder.paymentStatus,
    receivedStatus: workOrder.receivedStatus,
    invoiceStatus: workOrder.invoiceStatus,
    workOrderStatus: workOrder.workOrderStatus,
    remarks: workOrder.remarks,
    items: workOrder.items.length ? workOrder.items : [createEmptyWorkOrderItem()],
  };
}

export function mapWorkOrderToRequest(formData, userId = null) {
  return {
    workOrderNumber: formData.workOrderNumber.trim(),
    vendorId: Number(formData.vendorId),
    invoiceNumber: formData.invoiceNumber.trim() || null,
    workOrderDate: formData.workOrderDate,
    expectedDeliveryDate: formData.expectedDeliveryDate || null,
    receivedDate: formData.receivedDate || null,
    approvalStatus: formData.approvalStatus,
    paymentStatus: formData.paymentStatus,
    receivedStatus: formData.receivedStatus,
    invoiceStatus: formData.invoiceStatus,
    workOrderStatus: formData.workOrderStatus,
    approvedBy: null,
    approvedAt: null,
    remarks: formData.remarks.trim() || null,
    createdBy: userId,
    updatedBy: userId,
    items: formData.items.map((item) => ({
      itemName: item.itemName.trim(),
      category: item.category.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      warranty: item.warranty.trim() || null,
      specifications: item.specifications.trim() || null,
      description: item.description.trim() || null,
    })),
  };
}
