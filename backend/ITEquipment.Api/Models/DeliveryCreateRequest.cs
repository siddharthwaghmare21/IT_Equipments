namespace ITEquipment.Api.Models;

public sealed record DeliveryCreateRequest(
    string DeliveryCode,
    long AssetId,
    long DepartmentId,
    string ReceiverName,
    DateOnly DeliveryDate,
    long? DeliveredBy,
    string? Accessories,
    string? AcknowledgementStatus,
    string? DeliveryStatus,
    string? Remarks,
    long? CreatedBy);
