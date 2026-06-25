namespace ITEquipment.Api.Models;

public sealed record AssetHistoryDto(
    long HistoryId,
    long AssetId,
    string EventType,
    long? FromDepartmentId,
    string? FromDepartmentName,
    long? ToDepartmentId,
    string? ToDepartmentName,
    string? ReceiverName,
    string? EventStatus,
    string? EventNotes,
    DateTimeOffset PerformedAt);
