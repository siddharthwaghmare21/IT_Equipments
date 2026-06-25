namespace ITEquipment.Api.Models;

public sealed record DepartmentDto(
    int DepartmentId,
    string DepartmentCode,
    string DepartmentName,
    string? Description,
    bool IsActive);
