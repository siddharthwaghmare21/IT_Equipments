using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class ReturnRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<ReturnDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT r.return_id, r.return_code, r.delivery_id, d.delivery_code,
                   r.asset_id, a.asset_tag, a.asset_name, r.department_id,
                   dept.department_name, r.returned_by_name, r.return_date,
                   r.return_condition, r.received_by, received.full_name AS received_by_name,
                   r.received_location, r.acknowledgement_status, r.inspection_status,
                   r.inspection_by, inspector.full_name AS inspection_by_name,
                   r.damage_decision, r.return_status, r.remarks, r.created_at, r.updated_at
            FROM returns r
            LEFT JOIN deliveries d ON d.delivery_id = r.delivery_id
            INNER JOIN assets a ON a.asset_id = r.asset_id
            LEFT JOIN departments dept ON dept.department_id = r.department_id
            LEFT JOIN users received ON received.user_id = r.received_by
            LEFT JOIN users inspector ON inspector.user_id = r.inspection_by
            ORDER BY r.updated_at DESC, r.return_code;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var returns = new List<ReturnDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            returns.Add(ReadReturn(reader));
        }

        return returns;
    }

    public async Task<ReturnDto?> GetByIdAsync(long returnId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT r.return_id, r.return_code, r.delivery_id, d.delivery_code,
                   r.asset_id, a.asset_tag, a.asset_name, r.department_id,
                   dept.department_name, r.returned_by_name, r.return_date,
                   r.return_condition, r.received_by, received.full_name AS received_by_name,
                   r.received_location, r.acknowledgement_status, r.inspection_status,
                   r.inspection_by, inspector.full_name AS inspection_by_name,
                   r.damage_decision, r.return_status, r.remarks, r.created_at, r.updated_at
            FROM returns r
            LEFT JOIN deliveries d ON d.delivery_id = r.delivery_id
            INNER JOIN assets a ON a.asset_id = r.asset_id
            LEFT JOIN departments dept ON dept.department_id = r.department_id
            LEFT JOIN users received ON received.user_id = r.received_by
            LEFT JOIN users inspector ON inspector.user_id = r.inspection_by
            WHERE r.return_id = @ReturnId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ReturnId", returnId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadReturn(reader) : null;
    }

    public async Task<ReturnDto> CreateAsync(
        ReturnCreateRequest request,
        string returnCondition,
        string acknowledgementStatus,
        string inspectionStatus,
        string damageDecision,
        string returnStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO returns (
                return_code, delivery_id, asset_id, department_id, returned_by_name,
                return_date, return_condition, received_by, received_location,
                acknowledgement_status, inspection_status, inspection_by, damage_decision,
                return_status, remarks, created_by
            )
            VALUES (
                @ReturnCode, @DeliveryId, @AssetId, @DepartmentId, @ReturnedByName,
                @ReturnDate, @ReturnCondition, @ReceivedBy, @ReceivedLocation,
                @AcknowledgementStatus, @InspectionStatus, @InspectionBy, @DamageDecision,
                @ReturnStatus, @Remarks, @CreatedBy
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection, transaction);
        AddCreateParameters(command, request, returnCondition, acknowledgementStatus, inspectionStatus, damageDecision, returnStatus);

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        await ApplyAssetReturnStateAsync(connection, transaction, request.AssetId, request.DepartmentId, request.ReturnedByName, returnCondition, returnStatus, request.Remarks, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(newId, cancellationToken)
            ?? throw new InvalidOperationException("Return was created but could not be loaded.");
    }

    public async Task<ReturnDto?> UpdateAsync(
        long returnId,
        ReturnUpdateRequest request,
        string returnCondition,
        string acknowledgementStatus,
        string inspectionStatus,
        string damageDecision,
        string returnStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE returns
            SET return_code = @ReturnCode,
                delivery_id = @DeliveryId,
                asset_id = @AssetId,
                department_id = @DepartmentId,
                returned_by_name = @ReturnedByName,
                return_date = @ReturnDate,
                return_condition = @ReturnCondition,
                received_by = @ReceivedBy,
                received_location = @ReceivedLocation,
                acknowledgement_status = @AcknowledgementStatus,
                inspection_status = @InspectionStatus,
                inspection_by = @InspectionBy,
                damage_decision = @DamageDecision,
                return_status = @ReturnStatus,
                remarks = @Remarks,
                updated_by = @UpdatedBy
            WHERE return_id = @ReturnId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@ReturnId", returnId);
        AddUpdateParameters(command, request, returnCondition, acknowledgementStatus, inspectionStatus, damageDecision, returnStatus);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        await ApplyAssetReturnStateAsync(connection, transaction, request.AssetId, request.DepartmentId, request.ReturnedByName, returnCondition, returnStatus, request.Remarks, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(returnId, cancellationToken);
    }

    public async Task<ReturnDto?> RejectAsync(long returnId, string? remarks, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE returns
            SET return_status = 'Rejected',
                remarks = COALESCE(@Remarks, remarks)
            WHERE return_id = @ReturnId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@ReturnId", returnId);
        command.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(returnId, cancellationToken);
    }

    private static async Task ApplyAssetReturnStateAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        long assetId,
        long? departmentId,
        string returnedByName,
        string returnCondition,
        string returnStatus,
        string? remarks,
        CancellationToken cancellationToken)
    {
        var assetStatus = returnStatus.Equals("Damaged", StringComparison.OrdinalIgnoreCase) ||
            returnCondition.Equals("Damaged", StringComparison.OrdinalIgnoreCase)
            ? "Damaged"
            : "Available";
        var lifecycleStatus = assetStatus == "Damaged" ? "Returned" : "Returned";

        const string assetSql = """
            UPDATE assets
            SET current_department_id = NULL,
                current_receiver_name = NULL,
                asset_condition = @ReturnCondition,
                lifecycle_status = @LifecycleStatus,
                asset_status = @AssetStatus,
                remarks = COALESCE(@Remarks, remarks)
            WHERE asset_id = @AssetId;
            """;

        await using (var assetCommand = new MySqlCommand(assetSql, connection, transaction))
        {
            assetCommand.Parameters.AddWithValue("@AssetId", assetId);
            assetCommand.Parameters.AddWithValue("@ReturnCondition", MapAssetCondition(returnCondition));
            assetCommand.Parameters.AddWithValue("@LifecycleStatus", lifecycleStatus);
            assetCommand.Parameters.AddWithValue("@AssetStatus", assetStatus);
            assetCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
            await assetCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        const string historySql = """
            INSERT INTO asset_lifecycle_history (
                asset_id, event_type, from_department_id, to_department_id,
                receiver_name, event_status, event_notes
            )
            VALUES (
                @AssetId, 'Asset Returned', @DepartmentId, NULL,
                @ReturnedByName, @ReturnStatus, @Remarks
            );
            """;

        await using var historyCommand = new MySqlCommand(historySql, connection, transaction);
        historyCommand.Parameters.AddWithValue("@AssetId", assetId);
        historyCommand.Parameters.AddWithValue("@DepartmentId", ToDbValue(departmentId));
        historyCommand.Parameters.AddWithValue("@ReturnedByName", returnedByName.Trim());
        historyCommand.Parameters.AddWithValue("@ReturnStatus", returnStatus);
        historyCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
        await historyCommand.ExecuteNonQueryAsync(cancellationToken);
    }

    private static string MapAssetCondition(string returnCondition)
    {
        return returnCondition.Equals("Missing Accessories", StringComparison.OrdinalIgnoreCase)
            ? "Needs Repair"
            : returnCondition;
    }

    private static void AddCreateParameters(MySqlCommand command, ReturnCreateRequest request, string returnCondition, string acknowledgementStatus, string inspectionStatus, string damageDecision, string returnStatus)
    {
        command.Parameters.AddWithValue("@ReturnCode", request.ReturnCode.Trim());
        command.Parameters.AddWithValue("@DeliveryId", ToDbValue(request.DeliveryId));
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@DepartmentId", ToDbValue(request.DepartmentId));
        command.Parameters.AddWithValue("@ReturnedByName", request.ReturnedByName.Trim());
        command.Parameters.AddWithValue("@ReturnDate", request.ReturnDate.ToDateTime(TimeOnly.MinValue));
        command.Parameters.AddWithValue("@ReturnCondition", returnCondition.Trim());
        command.Parameters.AddWithValue("@ReceivedBy", ToDbValue(request.ReceivedBy));
        command.Parameters.AddWithValue("@ReceivedLocation", ToDbValue(request.ReceivedLocation));
        command.Parameters.AddWithValue("@AcknowledgementStatus", acknowledgementStatus.Trim());
        command.Parameters.AddWithValue("@InspectionStatus", inspectionStatus.Trim());
        command.Parameters.AddWithValue("@InspectionBy", ToDbValue(request.InspectionBy));
        command.Parameters.AddWithValue("@DamageDecision", damageDecision.Trim());
        command.Parameters.AddWithValue("@ReturnStatus", returnStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@CreatedBy", ToDbValue(request.CreatedBy));
    }

    private static void AddUpdateParameters(MySqlCommand command, ReturnUpdateRequest request, string returnCondition, string acknowledgementStatus, string inspectionStatus, string damageDecision, string returnStatus)
    {
        command.Parameters.AddWithValue("@ReturnCode", request.ReturnCode.Trim());
        command.Parameters.AddWithValue("@DeliveryId", ToDbValue(request.DeliveryId));
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@DepartmentId", ToDbValue(request.DepartmentId));
        command.Parameters.AddWithValue("@ReturnedByName", request.ReturnedByName.Trim());
        command.Parameters.AddWithValue("@ReturnDate", request.ReturnDate.ToDateTime(TimeOnly.MinValue));
        command.Parameters.AddWithValue("@ReturnCondition", returnCondition.Trim());
        command.Parameters.AddWithValue("@ReceivedBy", ToDbValue(request.ReceivedBy));
        command.Parameters.AddWithValue("@ReceivedLocation", ToDbValue(request.ReceivedLocation));
        command.Parameters.AddWithValue("@AcknowledgementStatus", acknowledgementStatus.Trim());
        command.Parameters.AddWithValue("@InspectionStatus", inspectionStatus.Trim());
        command.Parameters.AddWithValue("@InspectionBy", ToDbValue(request.InspectionBy));
        command.Parameters.AddWithValue("@DamageDecision", damageDecision.Trim());
        command.Parameters.AddWithValue("@ReturnStatus", returnStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@UpdatedBy", ToDbValue(request.UpdatedBy));
    }

    private static ReturnDto ReadReturn(MySqlDataReader reader)
    {
        return new ReturnDto(
            ReturnId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("return_id"))),
            ReturnCode: reader.GetString("return_code"),
            DeliveryId: GetNullableInt64(reader, "delivery_id"),
            DeliveryCode: GetNullableString(reader, "delivery_code"),
            AssetId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("asset_id"))),
            AssetTag: GetNullableString(reader, "asset_tag"),
            AssetName: GetNullableString(reader, "asset_name"),
            DepartmentId: GetNullableInt64(reader, "department_id"),
            DepartmentName: GetNullableString(reader, "department_name"),
            ReturnedByName: reader.GetString("returned_by_name"),
            ReturnDate: DateOnly.FromDateTime(reader.GetDateTime("return_date")),
            ReturnCondition: reader.GetString("return_condition"),
            ReceivedBy: GetNullableInt64(reader, "received_by"),
            ReceivedByName: GetNullableString(reader, "received_by_name"),
            ReceivedLocation: GetNullableString(reader, "received_location"),
            AcknowledgementStatus: reader.GetString("acknowledgement_status"),
            InspectionStatus: reader.GetString("inspection_status"),
            InspectionBy: GetNullableInt64(reader, "inspection_by"),
            InspectionByName: GetNullableString(reader, "inspection_by_name"),
            DamageDecision: reader.GetString("damage_decision"),
            ReturnStatus: reader.GetString("return_status"),
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

    private static DateTimeOffset GetDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        return new DateTimeOffset(DateTime.SpecifyKind(reader.GetDateTime(columnName), DateTimeKind.Local));
    }

    private static object ToDbValue(string? value) => string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    private static object ToDbValue(long? value) => value.HasValue ? value.Value : DBNull.Value;
}
