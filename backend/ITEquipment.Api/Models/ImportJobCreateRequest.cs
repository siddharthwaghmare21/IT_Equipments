namespace ITEquipment.Api.Models;

public sealed record ImportJobCreateRequest(
    string ImportModule,
    string? SourceFileName,
    long? SourceFileSizeBytes,
    int? TotalRows,
    int? ValidRows,
    int? InvalidRows,
    string? Remarks);
