namespace ITEquipment.Api.Models;

public sealed record ImportJobDto(
    long ImportJobId,
    string ImportModule,
    string ImportStatus,
    long? RequestedBy,
    string? SourceFileName,
    long? SourceFileSizeBytes,
    int? TotalRows,
    int? ValidRows,
    int? InvalidRows,
    int? ImportedRows,
    string? ErrorMessage,
    string? Remarks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
