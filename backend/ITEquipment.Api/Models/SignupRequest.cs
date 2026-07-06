namespace ITEquipment.Api.Models;

public sealed record SignupRequest(
    string FullName,
    string Email,
    string Password,
    string? Phone,
    long? DepartmentId,
    string RequestedRoleCode,
    string? Remarks);
