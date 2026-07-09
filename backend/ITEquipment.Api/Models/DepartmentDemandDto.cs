namespace ITEquipment.Api.Models;

public sealed record DepartmentDemandDto(
    long DemandId,
    long DepartmentId,
    string DepartmentName,
    string Location,
    int DemandCount,
    string Source,
    string? Remarks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
