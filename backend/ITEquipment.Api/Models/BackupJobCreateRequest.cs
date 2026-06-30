namespace ITEquipment.Api.Models;

public sealed record BackupJobCreateRequest(
    string BackupType,
    string BackupScope,
    string? Remarks);
