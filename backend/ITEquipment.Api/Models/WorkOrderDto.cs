namespace ITEquipment.Api.Models;

public sealed record WorkOrderDto(
    long WorkOrderId,
    string WorkOrderNumber,
    long VendorId,
    string? VendorName,
    string? InvoiceNumber,
    DateOnly WorkOrderDate,
    DateOnly? ExpectedDeliveryDate,
    DateOnly? ReceivedDate,
    decimal TotalAmount,
    string ApprovalStatus,
    string PaymentStatus,
    string ReceivedStatus,
    string InvoiceStatus,
    string WorkOrderStatus,
    long? ApprovedBy,
    DateTimeOffset? ApprovedAt,
    string? Remarks,
    int ItemCount,
    IReadOnlyList<WorkOrderItemDto> Items,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
