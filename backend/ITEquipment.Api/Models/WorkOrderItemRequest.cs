namespace ITEquipment.Api.Models;

public sealed record WorkOrderItemRequest(
    string ItemName,
    string Category,
    int Quantity,
    decimal UnitPrice,
    string? Warranty,
    string? Specifications,
    string? Description);
