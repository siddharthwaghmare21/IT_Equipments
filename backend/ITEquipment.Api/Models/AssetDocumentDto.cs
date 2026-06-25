namespace ITEquipment.Api.Models;

public sealed record AssetDocumentDto(
    long DocumentId,
    long AssetId,
    string DocumentType,
    string FileName,
    string? FilePath,
    long? FileSizeBytes,
    string? MimeType,
    long? UploadedBy,
    DateTimeOffset UploadedAt);
