namespace ITEquipment.Api.Models;

public sealed record RoleDto(
    long RoleId,
    string RoleName,
    string RoleCode,
    string? Description,
    bool IsSystemRole,
    bool IsActive);
