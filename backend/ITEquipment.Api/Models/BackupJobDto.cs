namespace ITEquipment.Api.Models;

public sealed record BackupJobDto(
    long BackupJobId,
    string BackupType,
    string BackupScope,
    string BackupStatus,
    long? RequestedBy,
    long? ApprovedBy,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    string? FileName,
    string? FilePath,
    long? FileSizeBytes,
    string? ChecksumSha256,
    string? ErrorMessage,
    string? Remarks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
