using System.Text.Json;

namespace ITEquipment.Api.Models;

public sealed record BackupRestoreRequest(
    JsonElement Snapshot,
    string Confirmation);

public sealed record BackupRestoreResponse(
    int TablesProcessed,
    int RowsRestored,
    IReadOnlyDictionary<string, int> TableRowCounts,
    string Message);
