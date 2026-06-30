namespace ITEquipment.Api.Models;

public sealed record ExportJobCreateRequest(
    string ExportType,
    string ExportModule,
    int? RowCount,
    string? Remarks);
