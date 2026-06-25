namespace ITEquipment.Api.Models;

public sealed record SuperAdminBootstrapRequest(
    string FullName,
    string Email,
    string Password,
    string? Phone,
    long? DepartmentId);
