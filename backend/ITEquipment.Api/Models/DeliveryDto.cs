namespace ITEquipment.Api.Models;

public sealed record DeliveryDto(
    long DeliveryId,
    string DeliveryCode,
    long AssetId,
    string? AssetTag,
    string? AssetName,
    long DepartmentId,
    string? DepartmentName,
    string ReceiverName,
    DateOnly DeliveryDate,
    long? DeliveredBy,
    string? DeliveredByName,
    string? Accessories,
    string AcknowledgementStatus,
    string DeliveryStatus,
    string? Remarks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
