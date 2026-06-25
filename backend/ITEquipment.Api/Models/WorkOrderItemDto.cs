namespace ITEquipment.Api.Models;

public sealed record WorkOrderItemDto(
    long WorkOrderItemId,
    long WorkOrderId,
    string ItemName,
    string Category,
    int Quantity,
    decimal UnitPrice,
    decimal TotalAmount,
    string? Warranty,
    string? Specifications,
    string? Description);
