namespace ITEquipment.Api.Models;

public sealed record MaintenanceCreateRequest(
    string MaintenanceCode,
    long AssetId,
    string IssueType,
    string? ReportedByName,
    long? VendorId,
    string? ServiceType,
    string? Priority,
    DateOnly? ServiceDate,
    DateOnly? ExpectedCompletionDate,
    DateOnly? CompletionDate,
    decimal? DowntimeHours,
    bool WarrantyClaim,
    string? ApprovalStatus,
    decimal? MaintenanceCost,
    string? MaintenanceStatus,
    string? Remarks,
    long? CreatedBy);
