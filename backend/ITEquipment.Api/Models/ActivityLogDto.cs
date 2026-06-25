namespace ITEquipment.Api.Models;

public sealed record ActivityLogDto(
    long ActivityLogId,
    long? UserId,
    string? UserFullName,
    string? UserRoleName,
    string ModuleName,
    string ActionName,
    string? EntityName,
    long? EntityId,
    string Description,
    string? IpAddress,
    string? UserAgent,
    string Status,
    DateTimeOffset CreatedAt);
