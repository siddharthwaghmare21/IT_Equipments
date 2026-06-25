namespace ITEquipment.Api.Models;

public sealed record TransferCreateRequest(
    string TransferCode,
    string? TransferType,
    long AssetId,
    long? FromDepartmentId,
    long? ToDepartmentId,
    string? CurrentReceiverName,
    string? NewReceiverName,
    string? TransferReason,
    string? Accessories,
    string? ConditionAtTransfer,
    DateOnly? CollectionDate,
    long? CollectedBy,
    DateOnly? IssueDate,
    string? HandoverAcknowledgement,
    string? NewAcknowledgement,
    string? TransferStatus,
    string? Remarks,
    long? CreatedBy);
