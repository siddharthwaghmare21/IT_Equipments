namespace ITEquipment.Api.Models;

public sealed record DepartmentUpdateRequest(
    string DepartmentCode,
    string DepartmentName,
    string? DepartmentHead,
    string? ContactEmail,
    string? ContactPhone,
    string? Location,
    string? Description,
    bool IsActive);
