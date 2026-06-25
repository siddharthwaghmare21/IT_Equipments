namespace ITEquipment.Api.Models;

public sealed record UserDto(
    long UserId,
    long RoleId,
    string RoleCode,
    string RoleName,
    long? DepartmentId,
    string? DepartmentName,
    string FullName,
    string Email,
    string? Phone,
    string AccountStatus,
    bool EmailVerified,
    DateTimeOffset? LastLoginAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
