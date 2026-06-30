namespace ITEquipment.Api.Models;

public sealed record ReportDataResponse(
    string ReportType,
    DateTimeOffset GeneratedAtUtc,
    int TotalRecords,
    IReadOnlyList<IReadOnlyDictionary<string, object?>> Records);
