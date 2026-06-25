namespace ITEquipment.Api.Models;

public sealed record AssetDocumentCreateRequest(
    string DocumentType,
    string FileName,
    string? FilePath,
    long? FileSizeBytes,
    string? MimeType,
    long? UploadedBy);
