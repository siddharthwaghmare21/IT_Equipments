using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class MaintenanceRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<MaintenanceDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT m.maintenance_id, m.maintenance_code, m.asset_id, a.asset_tag, a.asset_name,
                   m.issue_type, m.reported_by_name, m.vendor_id, v.vendor_name, m.service_type,
                   m.priority, m.service_date, m.expected_completion_date, m.completion_date,
                   m.downtime_hours, m.warranty_claim, m.approval_status, m.maintenance_cost,
                   m.maintenance_status, m.remarks, m.created_at, m.updated_at
            FROM maintenance_records m
            INNER JOIN assets a ON a.asset_id = m.asset_id
            LEFT JOIN vendors v ON v.vendor_id = m.vendor_id
            ORDER BY m.updated_at DESC, m.maintenance_code;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var records = new List<MaintenanceDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            records.Add(ReadMaintenance(reader));
        }

        return records;
    }

    public async Task<MaintenanceDto?> GetByIdAsync(long maintenanceId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT m.maintenance_id, m.maintenance_code, m.asset_id, a.asset_tag, a.asset_name,
                   m.issue_type, m.reported_by_name, m.vendor_id, v.vendor_name, m.service_type,
                   m.priority, m.service_date, m.expected_completion_date, m.completion_date,
                   m.downtime_hours, m.warranty_claim, m.approval_status, m.maintenance_cost,
                   m.maintenance_status, m.remarks, m.created_at, m.updated_at
            FROM maintenance_records m
            INNER JOIN assets a ON a.asset_id = m.asset_id
            LEFT JOIN vendors v ON v.vendor_id = m.vendor_id
            WHERE m.maintenance_id = @MaintenanceId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@MaintenanceId", maintenanceId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadMaintenance(reader) : null;
    }

    public async Task<MaintenanceDto> CreateAsync(
        MaintenanceCreateRequest request,
        string priority,
        string approvalStatus,
        string maintenanceStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO maintenance_records (
                maintenance_code, asset_id, issue_type, reported_by_name, vendor_id,
                service_type, priority, service_date, expected_completion_date, completion_date,
                downtime_hours, warranty_claim, approval_status, maintenance_cost,
                maintenance_status, remarks, created_by
            )
            VALUES (
                @MaintenanceCode, @AssetId, @IssueType, @ReportedByName, @VendorId,
                @ServiceType, @Priority, @ServiceDate, @ExpectedCompletionDate, @CompletionDate,
                @DowntimeHours, @WarrantyClaim, @ApprovalStatus, @MaintenanceCost,
                @MaintenanceStatus, @Remarks, @CreatedBy
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection, transaction);
        AddCreateParameters(command, request, priority, approvalStatus, maintenanceStatus);

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        await ApplyAssetMaintenanceStateAsync(connection, transaction, request.AssetId, maintenanceStatus, request.Remarks, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(newId, cancellationToken)
            ?? throw new InvalidOperationException("Maintenance record was created but could not be loaded.");
    }

    public async Task<MaintenanceDto?> UpdateAsync(
        long maintenanceId,
        MaintenanceUpdateRequest request,
        string priority,
        string approvalStatus,
        string maintenanceStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE maintenance_records
            SET maintenance_code = @MaintenanceCode,
                asset_id = @AssetId,
                issue_type = @IssueType,
                reported_by_name = @ReportedByName,
                vendor_id = @VendorId,
                service_type = @ServiceType,
                priority = @Priority,
                service_date = @ServiceDate,
                expected_completion_date = @ExpectedCompletionDate,
                completion_date = @CompletionDate,
                downtime_hours = @DowntimeHours,
                warranty_claim = @WarrantyClaim,
                approval_status = @ApprovalStatus,
                maintenance_cost = @MaintenanceCost,
                maintenance_status = @MaintenanceStatus,
                remarks = @Remarks,
                updated_by = @UpdatedBy
            WHERE maintenance_id = @MaintenanceId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@MaintenanceId", maintenanceId);
        AddUpdateParameters(command, request, priority, approvalStatus, maintenanceStatus);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        await ApplyAssetMaintenanceStateAsync(connection, transaction, request.AssetId, maintenanceStatus, request.Remarks, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(maintenanceId, cancellationToken);
    }

    public async Task<MaintenanceDto?> CancelAsync(long maintenanceId, string? remarks, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE maintenance_records
            SET maintenance_status = 'Cancelled',
                remarks = COALESCE(@Remarks, remarks)
            WHERE maintenance_id = @MaintenanceId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@MaintenanceId", maintenanceId);
        command.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(maintenanceId, cancellationToken);
    }

    private static async Task ApplyAssetMaintenanceStateAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        long assetId,
        string maintenanceStatus,
        string? remarks,
        CancellationToken cancellationToken)
    {
        if (maintenanceStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase) ||
            maintenanceStatus.Equals("Pending", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var lifecycleStatus = maintenanceStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase)
            ? "Returned"
            : "Under Maintenance";
        var assetStatus = maintenanceStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase)
            ? "Available"
            : "Maintenance";

        const string assetSql = """
            UPDATE assets
            SET lifecycle_status = @LifecycleStatus,
                asset_status = @AssetStatus,
                asset_condition = CASE WHEN @AssetStatus = 'Maintenance' THEN 'Needs Repair' ELSE asset_condition END,
                remarks = COALESCE(@Remarks, remarks)
            WHERE asset_id = @AssetId;
            """;

        await using (var assetCommand = new MySqlCommand(assetSql, connection, transaction))
        {
            assetCommand.Parameters.AddWithValue("@AssetId", assetId);
            assetCommand.Parameters.AddWithValue("@LifecycleStatus", lifecycleStatus);
            assetCommand.Parameters.AddWithValue("@AssetStatus", assetStatus);
            assetCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
            await assetCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        const string historySql = """
            INSERT INTO asset_lifecycle_history (
                asset_id, event_type, event_status, event_notes
            )
            VALUES (
                @AssetId, 'Asset Maintenance', @MaintenanceStatus, @Remarks
            );
            """;

        await using var historyCommand = new MySqlCommand(historySql, connection, transaction);
        historyCommand.Parameters.AddWithValue("@AssetId", assetId);
        historyCommand.Parameters.AddWithValue("@MaintenanceStatus", maintenanceStatus);
        historyCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
        await historyCommand.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void AddCreateParameters(MySqlCommand command, MaintenanceCreateRequest request, string priority, string approvalStatus, string maintenanceStatus)
    {
        command.Parameters.AddWithValue("@MaintenanceCode", request.MaintenanceCode.Trim());
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@IssueType", request.IssueType.Trim());
        command.Parameters.AddWithValue("@ReportedByName", ToDbValue(request.ReportedByName));
        command.Parameters.AddWithValue("@VendorId", ToDbValue(request.VendorId));
        command.Parameters.AddWithValue("@ServiceType", ToDbValue(request.ServiceType));
        command.Parameters.AddWithValue("@Priority", priority.Trim());
        command.Parameters.AddWithValue("@ServiceDate", ToDbValue(request.ServiceDate));
        command.Parameters.AddWithValue("@ExpectedCompletionDate", ToDbValue(request.ExpectedCompletionDate));
        command.Parameters.AddWithValue("@CompletionDate", ToDbValue(request.CompletionDate));
        command.Parameters.AddWithValue("@DowntimeHours", request.DowntimeHours ?? 0);
        command.Parameters.AddWithValue("@WarrantyClaim", request.WarrantyClaim);
        command.Parameters.AddWithValue("@ApprovalStatus", approvalStatus.Trim());
        command.Parameters.AddWithValue("@MaintenanceCost", request.MaintenanceCost ?? 0);
        command.Parameters.AddWithValue("@MaintenanceStatus", maintenanceStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@CreatedBy", ToDbValue(request.CreatedBy));
    }

    private static void AddUpdateParameters(MySqlCommand command, MaintenanceUpdateRequest request, string priority, string approvalStatus, string maintenanceStatus)
    {
        command.Parameters.AddWithValue("@MaintenanceCode", request.MaintenanceCode.Trim());
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@IssueType", request.IssueType.Trim());
        command.Parameters.AddWithValue("@ReportedByName", ToDbValue(request.ReportedByName));
        command.Parameters.AddWithValue("@VendorId", ToDbValue(request.VendorId));
        command.Parameters.AddWithValue("@ServiceType", ToDbValue(request.ServiceType));
        command.Parameters.AddWithValue("@Priority", priority.Trim());
        command.Parameters.AddWithValue("@ServiceDate", ToDbValue(request.ServiceDate));
        command.Parameters.AddWithValue("@ExpectedCompletionDate", ToDbValue(request.ExpectedCompletionDate));
        command.Parameters.AddWithValue("@CompletionDate", ToDbValue(request.CompletionDate));
        command.Parameters.AddWithValue("@DowntimeHours", request.DowntimeHours);
        command.Parameters.AddWithValue("@WarrantyClaim", request.WarrantyClaim);
        command.Parameters.AddWithValue("@ApprovalStatus", approvalStatus.Trim());
        command.Parameters.AddWithValue("@MaintenanceCost", request.MaintenanceCost);
        command.Parameters.AddWithValue("@MaintenanceStatus", maintenanceStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@UpdatedBy", ToDbValue(request.UpdatedBy));
    }

    private static MaintenanceDto ReadMaintenance(MySqlDataReader reader)
    {
        return new MaintenanceDto(
            MaintenanceId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("maintenance_id"))),
            MaintenanceCode: reader.GetString("maintenance_code"),
            AssetId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("asset_id"))),
            AssetTag: GetNullableString(reader, "asset_tag"),
            AssetName: GetNullableString(reader, "asset_name"),
            IssueType: reader.GetString("issue_type"),
            ReportedByName: GetNullableString(reader, "reported_by_name"),
            VendorId: GetNullableInt64(reader, "vendor_id"),
            VendorName: GetNullableString(reader, "vendor_name"),
            ServiceType: GetNullableString(reader, "service_type"),
            Priority: reader.GetString("priority"),
            ServiceDate: GetNullableDateOnly(reader, "service_date"),
            ExpectedCompletionDate: GetNullableDateOnly(reader, "expected_completion_date"),
            CompletionDate: GetNullableDateOnly(reader, "completion_date"),
            DowntimeHours: reader.GetDecimal("downtime_hours"),
            WarrantyClaim: reader.GetBoolean("warranty_claim"),
            ApprovalStatus: reader.GetString("approval_status"),
            MaintenanceCost: reader.GetDecimal("maintenance_cost"),
            MaintenanceStatus: reader.GetString("maintenance_status"),
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

    private static DateOnly? GetNullableDateOnly(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? null : DateOnly.FromDateTime(reader.GetDateTime(ordinal));
    }

    private static DateTimeOffset GetDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        return new DateTimeOffset(DateTime.SpecifyKind(reader.GetDateTime(columnName), DateTimeKind.Local));
    }

    private static object ToDbValue(string? value) => string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    private static object ToDbValue(long? value) => value.HasValue ? value.Value : DBNull.Value;
    private static object ToDbValue(DateOnly? value) => value.HasValue ? value.Value.ToDateTime(TimeOnly.MinValue) : DBNull.Value;
}
