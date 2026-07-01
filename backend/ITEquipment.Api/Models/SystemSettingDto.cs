namespace ITEquipment.Api.Models;

public sealed record SystemSettingDto(
    long SettingId,
    string SettingGroup,
    string SettingKey,
    string? SettingValue,
    string ValueType,
    string? Description,
    bool IsPublic,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
