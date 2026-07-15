using ITEquipment.Api.Models;
using MySqlConnector;
using System.Text.Json;

namespace ITEquipment.Api.Data;

public sealed class ExportImportBackupRepository(MySqlConnectionFactory connectionFactory)
{
    private static readonly string[] BackupTables =
    [
        "roles",
        "departments",
        "users",
        "vendors",
        "system_settings",
        "activity_logs",
        "assets",
        "asset_documents",
        "asset_lifecycle_history",
        "work_orders",
        "work_order_items",
        "work_order_documents",
        "deliveries",
        "transfers",
        "returns",
        "maintenance_records",
        "approval_requests",
        "notifications",
        "backup_jobs",
        "export_jobs",
        "import_jobs",
        "email_otp_requests"
    ];

    public async Task<IReadOnlyList<ExportJobDto>> GetExportJobsAsync(int limit, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT export_job_id, export_type, export_module, export_status,
                   requested_by, file_name, file_size_bytes, row_count,
                   started_at, completed_at, error_message, remarks,
                   created_at, updated_at
            FROM export_jobs
            ORDER BY created_at DESC, export_job_id DESC
            LIMIT @Limit;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Limit", Math.Clamp(limit, 1, 500));
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var jobs = new List<ExportJobDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            jobs.Add(ReadExportJob(reader));
        }

        return jobs;
    }

    public async Task<ExportJobDto> CreateExportJobAsync(
        ExportJobCreateRequest request,
        long? requestedBy,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO export_jobs (
                export_type, export_module, export_status, requested_by,
                row_count, started_at, completed_at, remarks
            )
            VALUES (
                @ExportType, @ExportModule, 'Completed', @RequestedBy,
                @RowCount, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @Remarks
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ExportType", request.ExportType.Trim());
        command.Parameters.AddWithValue("@ExportModule", request.ExportModule.Trim());
        command.Parameters.AddWithValue("@RequestedBy", ToDbValue(requestedBy));
        command.Parameters.AddWithValue("@RowCount", ToDbValue(request.RowCount));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        return await GetExportJobByIdAsync(connection, newId, cancellationToken)
            ?? throw new InvalidOperationException("Export job was created but could not be loaded.");
    }

    public async Task<IReadOnlyList<ImportJobDto>> GetImportJobsAsync(int limit, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT import_job_id, import_module, import_status, requested_by,
                   source_file_name, source_file_size_bytes, total_rows,
                   valid_rows, invalid_rows, imported_rows, error_message,
                   remarks, created_at, updated_at
            FROM import_jobs
            ORDER BY created_at DESC, import_job_id DESC
            LIMIT @Limit;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Limit", Math.Clamp(limit, 1, 500));
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var jobs = new List<ImportJobDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            jobs.Add(ReadImportJob(reader));
        }

        return jobs;
    }

    public async Task<ImportJobDto> CreateImportJobAsync(
        ImportJobCreateRequest request,
        long? requestedBy,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO import_jobs (
                import_module, import_status, requested_by, source_file_name,
                source_file_size_bytes, total_rows, valid_rows, invalid_rows,
                imported_rows, started_at, completed_at, remarks
            )
            VALUES (
                @ImportModule, 'Ready', @RequestedBy, @SourceFileName,
                @SourceFileSizeBytes, @TotalRows, @ValidRows, @InvalidRows,
                0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @Remarks
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ImportModule", request.ImportModule.Trim());
        command.Parameters.AddWithValue("@RequestedBy", ToDbValue(requestedBy));
        command.Parameters.AddWithValue("@SourceFileName", ToDbValue(request.SourceFileName));
        command.Parameters.AddWithValue("@SourceFileSizeBytes", ToDbValue(request.SourceFileSizeBytes));
        command.Parameters.AddWithValue("@TotalRows", ToDbValue(request.TotalRows));
        command.Parameters.AddWithValue("@ValidRows", ToDbValue(request.ValidRows));
        command.Parameters.AddWithValue("@InvalidRows", ToDbValue(request.InvalidRows));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        return await GetImportJobByIdAsync(connection, newId, cancellationToken)
            ?? throw new InvalidOperationException("Import job was created but could not be loaded.");
    }

    public async Task<IReadOnlyList<BackupJobDto>> GetBackupJobsAsync(int limit, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT backup_job_id, backup_type, backup_scope, backup_status,
                   requested_by, approved_by, started_at, completed_at,
                   file_name, file_path, file_size_bytes, checksum_sha256,
                   error_message, remarks, created_at, updated_at
            FROM backup_jobs
            ORDER BY created_at DESC, backup_job_id DESC
            LIMIT @Limit;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Limit", Math.Clamp(limit, 1, 500));
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var jobs = new List<BackupJobDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            jobs.Add(ReadBackupJob(reader));
        }

        return jobs;
    }

    public async Task<BackupJobDto> CreateBackupJobAsync(
        BackupJobCreateRequest request,
        long? requestedBy,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO backup_jobs (
                backup_type, backup_scope, backup_status, requested_by,
                started_at, completed_at, remarks
            )
            VALUES (
                @BackupType, @BackupScope, 'Completed', @RequestedBy,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, @Remarks
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@BackupType", request.BackupType.Trim());
        command.Parameters.AddWithValue("@BackupScope", request.BackupScope.Trim());
        command.Parameters.AddWithValue("@RequestedBy", ToDbValue(requestedBy));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        return await GetBackupJobByIdAsync(connection, newId, cancellationToken)
            ?? throw new InvalidOperationException("Backup job was created but could not be loaded.");
    }

    public async Task<Dictionary<string, object>> CreateBackupSnapshotAsync(
        string backupScope,
        string requestedBy,
        CancellationToken cancellationToken)
    {
        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        var includeSchema = backupScope.Equals("Full Database", StringComparison.OrdinalIgnoreCase) ||
            backupScope.Equals("Schema Only", StringComparison.OrdinalIgnoreCase);
        var includeData = backupScope.Equals("Full Database", StringComparison.OrdinalIgnoreCase) ||
            backupScope.Equals("Data Only", StringComparison.OrdinalIgnoreCase);

        var snapshot = new Dictionary<string, object>
        {
            ["backupFormat"] = "ITEquipment.JsonBackup.v1",
            ["backupScope"] = backupScope,
            ["generatedAtUtc"] = DateTimeOffset.UtcNow,
            ["requestedBy"] = requestedBy,
            ["tables"] = new Dictionary<string, object>()
        };

        var tables = (Dictionary<string, object>)snapshot["tables"];
        foreach (var tableName in BackupTables)
        {
            var tableSnapshot = new Dictionary<string, object>();

            if (includeSchema)
            {
                tableSnapshot["columns"] = await GetTableColumnsAsync(
                    connection,
                    tableName,
                    cancellationToken);
            }

            if (includeData)
            {
                tableSnapshot["rows"] = await GetTableRowsAsync(
                    connection,
                    tableName,
                    cancellationToken);
            }

            tables[tableName] = tableSnapshot;
        }

        return snapshot;
    }

    public async Task<BackupRestoreResponse> RestoreBackupSnapshotAsync(
        JsonElement snapshot,
        CancellationToken cancellationToken)
    {
        if (snapshot.ValueKind != JsonValueKind.Object ||
            !snapshot.TryGetProperty("backupFormat", out var formatElement) ||
            !string.Equals(formatElement.GetString(), "ITEquipment.JsonBackup.v1", StringComparison.Ordinal) ||
            !snapshot.TryGetProperty("tables", out var tablesElement) ||
            tablesElement.ValueKind != JsonValueKind.Object)
        {
            throw new InvalidOperationException("Invalid or unsupported IT Equipment backup file.");
        }

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        var restoredCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        try
        {
            foreach (var tableName in BackupTables)
            {
                if (!tablesElement.TryGetProperty(tableName, out var tableElement) ||
                    !tableElement.TryGetProperty("rows", out var rowsElement) ||
                    rowsElement.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                var restoredRows = 0;
                foreach (var rowElement in rowsElement.EnumerateArray())
                {
                    if (rowElement.ValueKind != JsonValueKind.Object)
                    {
                        throw new InvalidOperationException($"Backup table '{tableName}' contains an invalid row.");
                    }

                    await UpsertBackupRowAsync(
                        connection,
                        transaction,
                        tableName,
                        rowElement,
                        cancellationToken);
                    restoredRows++;
                }

                restoredCounts[tableName] = restoredRows;
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(CancellationToken.None);
            throw;
        }

        return new BackupRestoreResponse(
            TablesProcessed: restoredCounts.Count,
            RowsRestored: restoredCounts.Values.Sum(),
            TableRowCounts: restoredCounts,
            Message: "Backup restored successfully. Existing records not present in the backup were preserved.");
    }

    private static async Task UpsertBackupRowAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        string tableName,
        JsonElement rowElement,
        CancellationToken cancellationToken)
    {
        var properties = rowElement.EnumerateObject().ToArray();
        if (properties.Length == 0)
        {
            return;
        }

        var columns = properties.Select(property => $"`{property.Name.Replace("`", "``")}`").ToArray();
        var parameters = properties.Select((_, index) => $"@Value{index}").ToArray();
        var updates = columns.Select((column, index) => $"{column} = {parameters[index]}").ToArray();
        var sql = $"INSERT INTO `{tableName}` ({string.Join(", ", columns)}) " +
            $"VALUES ({string.Join(", ", parameters)}) " +
            $"ON DUPLICATE KEY UPDATE {string.Join(", ", updates)};";

        await using var command = new MySqlCommand(sql, connection, transaction);
        for (var index = 0; index < properties.Length; index++)
        {
            command.Parameters.AddWithValue(parameters[index], ToDatabaseValue(properties[index].Value));
        }

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static object ToDatabaseValue(JsonElement value)
    {
        return value.ValueKind switch
        {
            JsonValueKind.Null or JsonValueKind.Undefined => DBNull.Value,
            JsonValueKind.String => value.GetString() ?? string.Empty,
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Number when value.TryGetInt64(out var integer) => integer,
            JsonValueKind.Number when value.TryGetDecimal(out var number) => number,
            JsonValueKind.Number => value.GetDouble(),
            _ => value.GetRawText()
        };
    }

    private static async Task<ExportJobDto?> GetExportJobByIdAsync(
        MySqlConnection connection,
        long exportJobId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT export_job_id, export_type, export_module, export_status,
                   requested_by, file_name, file_size_bytes, row_count,
                   started_at, completed_at, error_message, remarks,
                   created_at, updated_at
            FROM export_jobs
            WHERE export_job_id = @ExportJobId;
            """;

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ExportJobId", exportJobId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadExportJob(reader) : null;
    }

    private static async Task<ImportJobDto?> GetImportJobByIdAsync(
        MySqlConnection connection,
        long importJobId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT import_job_id, import_module, import_status, requested_by,
                   source_file_name, source_file_size_bytes, total_rows,
                   valid_rows, invalid_rows, imported_rows, error_message,
                   remarks, created_at, updated_at
            FROM import_jobs
            WHERE import_job_id = @ImportJobId;
            """;

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ImportJobId", importJobId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadImportJob(reader) : null;
    }

    private static async Task<BackupJobDto?> GetBackupJobByIdAsync(
        MySqlConnection connection,
        long backupJobId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT backup_job_id, backup_type, backup_scope, backup_status,
                   requested_by, approved_by, started_at, completed_at,
                   file_name, file_path, file_size_bytes, checksum_sha256,
                   error_message, remarks, created_at, updated_at
            FROM backup_jobs
            WHERE backup_job_id = @BackupJobId;
            """;

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@BackupJobId", backupJobId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadBackupJob(reader) : null;
    }

    private static ExportJobDto ReadExportJob(MySqlDataReader reader)
    {
        return new ExportJobDto(
            ExportJobId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("export_job_id"))),
            ExportType: reader.GetString("export_type"),
            ExportModule: reader.GetString("export_module"),
            ExportStatus: reader.GetString("export_status"),
            RequestedBy: GetNullableInt64(reader, "requested_by"),
            FileName: GetNullableString(reader, "file_name"),
            FileSizeBytes: GetNullableInt64(reader, "file_size_bytes"),
            RowCount: GetNullableInt32(reader, "row_count"),
            StartedAt: GetNullableDateTimeOffset(reader, "started_at"),
            CompletedAt: GetNullableDateTimeOffset(reader, "completed_at"),
            ErrorMessage: GetNullableString(reader, "error_message"),
            Remarks: GetNullableString(reader, "remarks"),
            CreatedAt: GetDateTimeOffset(reader, "created_at"),
            UpdatedAt: GetDateTimeOffset(reader, "updated_at"));
    }

    private static ImportJobDto ReadImportJob(MySqlDataReader reader)
    {
        return new ImportJobDto(
            ImportJobId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("import_job_id"))),
            ImportModule: reader.GetString("import_module"),
            ImportStatus: reader.GetString("import_status"),
            RequestedBy: GetNullableInt64(reader, "requested_by"),
            SourceFileName: GetNullableString(reader, "source_file_name"),
            SourceFileSizeBytes: GetNullableInt64(reader, "source_file_size_bytes"),
            TotalRows: GetNullableInt32(reader, "total_rows"),
            ValidRows: GetNullableInt32(reader, "valid_rows"),
            InvalidRows: GetNullableInt32(reader, "invalid_rows"),
            ImportedRows: GetNullableInt32(reader, "imported_rows"),
            ErrorMessage: GetNullableString(reader, "error_message"),
            Remarks: GetNullableString(reader, "remarks"),
            CreatedAt: GetDateTimeOffset(reader, "created_at"),
            UpdatedAt: GetDateTimeOffset(reader, "updated_at"));
    }

    private static BackupJobDto ReadBackupJob(MySqlDataReader reader)
    {
        return new BackupJobDto(
            BackupJobId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("backup_job_id"))),
            BackupType: reader.GetString("backup_type"),
            BackupScope: reader.GetString("backup_scope"),
            BackupStatus: reader.GetString("backup_status"),
            RequestedBy: GetNullableInt64(reader, "requested_by"),
            ApprovedBy: GetNullableInt64(reader, "approved_by"),
            StartedAt: GetNullableDateTimeOffset(reader, "started_at"),
            CompletedAt: GetNullableDateTimeOffset(reader, "completed_at"),
            FileName: GetNullableString(reader, "file_name"),
            FilePath: GetNullableString(reader, "file_path"),
            FileSizeBytes: GetNullableInt64(reader, "file_size_bytes"),
            ChecksumSha256: GetNullableString(reader, "checksum_sha256"),
            ErrorMessage: GetNullableString(reader, "error_message"),
            Remarks: GetNullableString(reader, "remarks"),
            CreatedAt: GetDateTimeOffset(reader, "created_at"),
            UpdatedAt: GetDateTimeOffset(reader, "updated_at"));
    }

    private static async Task<IReadOnlyList<Dictionary<string, object?>>> GetTableColumnsAsync(
        MySqlConnection connection,
        string tableName,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT column_name, column_type, is_nullable, column_key, column_default, extra
            FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = @TableName
            ORDER BY ordinal_position;
            """;

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@TableName", tableName);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var columns = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync(cancellationToken))
        {
            columns.Add(new Dictionary<string, object?>
            {
                ["name"] = reader.GetString("column_name"),
                ["type"] = reader.GetString("column_type"),
                ["nullable"] = reader.GetString("is_nullable"),
                ["key"] = reader.GetString("column_key"),
                ["default"] = GetNullableString(reader, "column_default"),
                ["extra"] = reader.GetString("extra")
            });
        }

        return columns;
    }

    private static async Task<IReadOnlyList<Dictionary<string, object?>>> GetTableRowsAsync(
        MySqlConnection connection,
        string tableName,
        CancellationToken cancellationToken)
    {
        await using var command = new MySqlCommand($"SELECT * FROM `{tableName}`;", connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var rows = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync(cancellationToken))
        {
            var row = new Dictionary<string, object?>();
            for (var index = 0; index < reader.FieldCount; index += 1)
            {
                row[reader.GetName(index)] = reader.IsDBNull(index) ? null : reader.GetValue(index);
            }

            rows.Add(row);
        }

        return rows;
    }

    private static string? GetNullableString(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }

    private static long? GetNullableInt64(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : Convert.ToInt64(reader.GetValue(ordinal));
    }

    private static int? GetNullableInt32(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : Convert.ToInt32(reader.GetValue(ordinal));
    }

    private static DateTimeOffset GetDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        return new DateTimeOffset(DateTime.SpecifyKind(reader.GetDateTime(columnName), DateTimeKind.Local));
    }

    private static DateTimeOffset? GetNullableDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : GetDateTimeOffset(reader, columnName);
    }

    private static object ToDbValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    }

    private static object ToDbValue(long? value)
    {
        return value.HasValue ? value.Value : DBNull.Value;
    }

    private static object ToDbValue(int? value)
    {
        return value.HasValue ? value.Value : DBNull.Value;
    }
}
