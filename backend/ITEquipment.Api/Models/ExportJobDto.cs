namespace ITEquipment.Api.Models;

public sealed record ExportJobDto(
    long ExportJobId,
    string ExportType,
    string ExportModule,
    string ExportStatus,
    long? RequestedBy,
    string? FileName,
    long? FileSizeBytes,
    int? RowCount,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    string? ErrorMessage,
    string? Remarks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
