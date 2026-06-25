namespace ITEquipment.Api.Models;

public sealed record WorkOrderUpdateRequest(
    string WorkOrderNumber,
    long VendorId,
    string? InvoiceNumber,
    DateOnly WorkOrderDate,
    DateOnly? ExpectedDeliveryDate,
    DateOnly? ReceivedDate,
    string ApprovalStatus,
    string PaymentStatus,
    string ReceivedStatus,
    string InvoiceStatus,
    string WorkOrderStatus,
    long? ApprovedBy,
    DateTimeOffset? ApprovedAt,
    string? Remarks,
    long? UpdatedBy,
    IReadOnlyList<WorkOrderItemRequest> Items);
