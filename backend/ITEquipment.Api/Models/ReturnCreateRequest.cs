namespace ITEquipment.Api.Models;

public sealed record ReturnCreateRequest(
    string ReturnCode,
    long? DeliveryId,
    long AssetId,
    long? DepartmentId,
    string ReturnedByName,
    DateOnly ReturnDate,
    string? ReturnCondition,
    long? ReceivedBy,
    string? ReceivedLocation,
    string? AcknowledgementStatus,
    string? InspectionStatus,
    long? InspectionBy,
    string? DamageDecision,
    string? ReturnStatus,
    string? Remarks,
    long? CreatedBy);
