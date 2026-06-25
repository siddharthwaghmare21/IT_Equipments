using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class DeliveryRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<DeliveryDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT d.delivery_id, d.delivery_code, d.asset_id, a.asset_tag, a.asset_name,
                   d.department_id, dept.department_name, d.receiver_name, d.delivery_date,
                   d.delivered_by, delivered.full_name AS delivered_by_name,
                   d.accessories, d.acknowledgement_status, d.delivery_status,
                   d.remarks, d.created_at, d.updated_at
            FROM deliveries d
            INNER JOIN assets a ON a.asset_id = d.asset_id
            INNER JOIN departments dept ON dept.department_id = d.department_id
            LEFT JOIN users delivered ON delivered.user_id = d.delivered_by
            ORDER BY d.updated_at DESC, d.delivery_code;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var deliveries = new List<DeliveryDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            deliveries.Add(ReadDelivery(reader));
        }

        return deliveries;
    }

    public async Task<DeliveryDto?> GetByIdAsync(long deliveryId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT d.delivery_id, d.delivery_code, d.asset_id, a.asset_tag, a.asset_name,
                   d.department_id, dept.department_name, d.receiver_name, d.delivery_date,
                   d.delivered_by, delivered.full_name AS delivered_by_name,
                   d.accessories, d.acknowledgement_status, d.delivery_status,
                   d.remarks, d.created_at, d.updated_at
            FROM deliveries d
            INNER JOIN assets a ON a.asset_id = d.asset_id
            INNER JOIN departments dept ON dept.department_id = d.department_id
            LEFT JOIN users delivered ON delivered.user_id = d.delivered_by
            WHERE d.delivery_id = @DeliveryId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DeliveryId", deliveryId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadDelivery(reader) : null;
    }

    public async Task<DeliveryDto> CreateAsync(
        DeliveryCreateRequest request,
        string acknowledgementStatus,
        string deliveryStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO deliveries (
                delivery_code, asset_id, department_id, receiver_name, delivery_date,
                delivered_by, accessories, acknowledgement_status, delivery_status,
                remarks, created_by
            )
            VALUES (
                @DeliveryCode, @AssetId, @DepartmentId, @ReceiverName, @DeliveryDate,
                @DeliveredBy, @Accessories, @AcknowledgementStatus, @DeliveryStatus,
                @Remarks, @CreatedBy
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        AddCreateParameters(command, request, acknowledgementStatus, deliveryStatus);

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        await ApplyAssetDeliveryStateAsync(
            connection,
            transaction,
            request.AssetId,
            request.DepartmentId,
            request.ReceiverName,
            deliveryStatus,
            request.Remarks,
            cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(newId, cancellationToken)
            ?? throw new InvalidOperationException("Delivery was created but could not be loaded.");
    }

    public async Task<DeliveryDto?> UpdateAsync(
        long deliveryId,
        DeliveryUpdateRequest request,
        string acknowledgementStatus,
        string deliveryStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE deliveries
            SET delivery_code = @DeliveryCode,
                asset_id = @AssetId,
                department_id = @DepartmentId,
                receiver_name = @ReceiverName,
                delivery_date = @DeliveryDate,
                delivered_by = @DeliveredBy,
                accessories = @Accessories,
                acknowledgement_status = @AcknowledgementStatus,
                delivery_status = @DeliveryStatus,
                remarks = @Remarks,
                updated_by = @UpdatedBy
            WHERE delivery_id = @DeliveryId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@DeliveryId", deliveryId);
        AddUpdateParameters(command, request, acknowledgementStatus, deliveryStatus);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        await ApplyAssetDeliveryStateAsync(
            connection,
            transaction,
            request.AssetId,
            request.DepartmentId,
            request.ReceiverName,
            deliveryStatus,
            request.Remarks,
            cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(deliveryId, cancellationToken);
    }

    public async Task<DeliveryDto?> CancelAsync(long deliveryId, string? remarks, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE deliveries
            SET delivery_status = 'Cancelled',
                remarks = COALESCE(@Remarks, remarks)
            WHERE delivery_id = @DeliveryId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@DeliveryId", deliveryId);
        command.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(deliveryId, cancellationToken);
    }

    private static async Task ApplyAssetDeliveryStateAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        long assetId,
        long departmentId,
        string receiverName,
        string deliveryStatus,
        string? remarks,
        CancellationToken cancellationToken)
    {
        if (!deliveryStatus.Equals("Delivered", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        const string updateAssetSql = """
            UPDATE assets
            SET current_department_id = @DepartmentId,
                current_receiver_name = @ReceiverName,
                lifecycle_status = 'In Use',
                asset_status = 'Delivered',
                remarks = COALESCE(@Remarks, remarks)
            WHERE asset_id = @AssetId;
            """;

        await using (var updateAssetCommand = new MySqlCommand(updateAssetSql, connection, transaction))
        {
            updateAssetCommand.Parameters.AddWithValue("@AssetId", assetId);
            updateAssetCommand.Parameters.AddWithValue("@DepartmentId", departmentId);
            updateAssetCommand.Parameters.AddWithValue("@ReceiverName", receiverName.Trim());
            updateAssetCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
            await updateAssetCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        const string historySql = """
            INSERT INTO asset_lifecycle_history (
                asset_id, event_type, from_department_id, to_department_id,
                receiver_name, event_status, event_notes
            )
            VALUES (
                @AssetId, 'Asset Delivered', NULL, @DepartmentId,
                @ReceiverName, 'Delivered', @Remarks
            );
            """;

        await using var historyCommand = new MySqlCommand(historySql, connection, transaction);
        historyCommand.Parameters.AddWithValue("@AssetId", assetId);
        historyCommand.Parameters.AddWithValue("@DepartmentId", departmentId);
        historyCommand.Parameters.AddWithValue("@ReceiverName", receiverName.Trim());
        historyCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
        await historyCommand.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void AddCreateParameters(
        MySqlCommand command,
        DeliveryCreateRequest request,
        string acknowledgementStatus,
        string deliveryStatus)
    {
        command.Parameters.AddWithValue("@DeliveryCode", request.DeliveryCode.Trim());
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@DepartmentId", request.DepartmentId);
        command.Parameters.AddWithValue("@ReceiverName", request.ReceiverName.Trim());
        command.Parameters.AddWithValue("@DeliveryDate", request.DeliveryDate.ToDateTime(TimeOnly.MinValue));
        command.Parameters.AddWithValue("@DeliveredBy", ToDbValue(request.DeliveredBy));
        command.Parameters.AddWithValue("@Accessories", ToDbValue(request.Accessories));
        command.Parameters.AddWithValue("@AcknowledgementStatus", acknowledgementStatus.Trim());
        command.Parameters.AddWithValue("@DeliveryStatus", deliveryStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@CreatedBy", ToDbValue(request.CreatedBy));
    }

    private static void AddUpdateParameters(
        MySqlCommand command,
        DeliveryUpdateRequest request,
        string acknowledgementStatus,
        string deliveryStatus)
    {
        command.Parameters.AddWithValue("@DeliveryCode", request.DeliveryCode.Trim());
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@DepartmentId", request.DepartmentId);
        command.Parameters.AddWithValue("@ReceiverName", request.ReceiverName.Trim());
        command.Parameters.AddWithValue("@DeliveryDate", request.DeliveryDate.ToDateTime(TimeOnly.MinValue));
        command.Parameters.AddWithValue("@DeliveredBy", ToDbValue(request.DeliveredBy));
        command.Parameters.AddWithValue("@Accessories", ToDbValue(request.Accessories));
        command.Parameters.AddWithValue("@AcknowledgementStatus", acknowledgementStatus.Trim());
        command.Parameters.AddWithValue("@DeliveryStatus", deliveryStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@UpdatedBy", ToDbValue(request.UpdatedBy));
    }

    private static DeliveryDto ReadDelivery(MySqlDataReader reader)
    {
        return new DeliveryDto(
            DeliveryId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("delivery_id"))),
            DeliveryCode: reader.GetString("delivery_code"),
            AssetId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("asset_id"))),
            AssetTag: GetNullableString(reader, "asset_tag"),
            AssetName: GetNullableString(reader, "asset_name"),
            DepartmentId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("department_id"))),
            DepartmentName: GetNullableString(reader, "department_name"),
            ReceiverName: reader.GetString("receiver_name"),
            DeliveryDate: DateOnly.FromDateTime(reader.GetDateTime("delivery_date")),
            DeliveredBy: GetNullableInt64(reader, "delivered_by"),
            DeliveredByName: GetNullableString(reader, "delivered_by_name"),
            Accessories: GetNullableString(reader, "accessories"),
            AcknowledgementStatus: reader.GetString("acknowledgement_status"),
            DeliveryStatus: reader.GetString("delivery_status"),
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
        return reader.IsDBNull(ordinal)
            ? null
            : Convert.ToInt64(reader.GetValue(ordinal));
    }

    private static DateTimeOffset GetDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        return new DateTimeOffset(DateTime.SpecifyKind(reader.GetDateTime(columnName), DateTimeKind.Local));
    }

    private static object ToDbValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value.Trim();
    }

    private static object ToDbValue(long? value)
    {
        return value.HasValue ? value.Value : DBNull.Value;
    }
}
