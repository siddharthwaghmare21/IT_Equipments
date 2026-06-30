using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class ExportImportBackupRepository(MySqlConnectionFactory connectionFactory)
{
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
