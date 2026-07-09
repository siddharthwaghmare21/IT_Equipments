namespace ITEquipment.Api.Models;

public sealed record DepartmentDemandUpsertRequest(
    long DepartmentId,
    int DemandCount,
    string? Source,
    string? Remarks);
