namespace ITEquipment.Api.Models;

public sealed record RoleDto(
    int RoleId,
    string RoleName,
    string RoleCode,
    string? Description,
    bool IsSystemRole,
    bool IsActive);
