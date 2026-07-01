namespace ITEquipment.Api.Models;

public sealed record SystemSettingUpdateRequest(
    string SettingKey,
    string? SettingValue);
