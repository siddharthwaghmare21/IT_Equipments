using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class TransferRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<TransferDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT t.transfer_id, t.transfer_code, t.transfer_type, t.asset_id,
                   a.asset_tag, a.asset_name, t.from_department_id,
                   from_dept.department_name AS from_department_name,
                   t.to_department_id, to_dept.department_name AS to_department_name,
                   t.current_receiver_name, t.new_receiver_name, t.transfer_reason,
                   t.accessories, t.condition_at_transfer, t.collection_date,
                   t.collected_by, collected.full_name AS collected_by_name,
                   t.issue_date, t.handover_acknowledgement, t.new_acknowledgement,
                   t.transfer_status, t.remarks, t.created_at, t.updated_at
            FROM transfers t
            INNER JOIN assets a ON a.asset_id = t.asset_id
            LEFT JOIN departments from_dept ON from_dept.department_id = t.from_department_id
            LEFT JOIN departments to_dept ON to_dept.department_id = t.to_department_id
            LEFT JOIN users collected ON collected.user_id = t.collected_by
            ORDER BY t.updated_at DESC, t.transfer_code;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var transfers = new List<TransferDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            transfers.Add(ReadTransfer(reader));
        }

        return transfers;
    }

    public async Task<TransferDto?> GetByIdAsync(long transferId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT t.transfer_id, t.transfer_code, t.transfer_type, t.asset_id,
                   a.asset_tag, a.asset_name, t.from_department_id,
                   from_dept.department_name AS from_department_name,
                   t.to_department_id, to_dept.department_name AS to_department_name,
                   t.current_receiver_name, t.new_receiver_name, t.transfer_reason,
                   t.accessories, t.condition_at_transfer, t.collection_date,
                   t.collected_by, collected.full_name AS collected_by_name,
                   t.issue_date, t.handover_acknowledgement, t.new_acknowledgement,
                   t.transfer_status, t.remarks, t.created_at, t.updated_at
            FROM transfers t
            INNER JOIN assets a ON a.asset_id = t.asset_id
            LEFT JOIN departments from_dept ON from_dept.department_id = t.from_department_id
            LEFT JOIN departments to_dept ON to_dept.department_id = t.to_department_id
            LEFT JOIN users collected ON collected.user_id = t.collected_by
            WHERE t.transfer_id = @TransferId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@TransferId", transferId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadTransfer(reader) : null;
    }

    public async Task<TransferDto> CreateAsync(
        TransferCreateRequest request,
        string transferType,
        string conditionAtTransfer,
        string handoverAcknowledgement,
        string newAcknowledgement,
        string transferStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO transfers (
                transfer_code, transfer_type, asset_id, from_department_id,
                to_department_id, current_receiver_name, new_receiver_name,
                transfer_reason, accessories, condition_at_transfer, collection_date,
                collected_by, issue_date, handover_acknowledgement,
                new_acknowledgement, transfer_status, remarks, created_by
            )
            VALUES (
                @TransferCode, @TransferType, @AssetId, @FromDepartmentId,
                @ToDepartmentId, @CurrentReceiverName, @NewReceiverName,
                @TransferReason, @Accessories, @ConditionAtTransfer, @CollectionDate,
                @CollectedBy, @IssueDate, @HandoverAcknowledgement,
                @NewAcknowledgement, @TransferStatus, @Remarks, @CreatedBy
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        AddCreateParameters(command, request, transferType, conditionAtTransfer, handoverAcknowledgement, newAcknowledgement, transferStatus);

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        await ApplyAssetTransferStateAsync(connection, transaction, request, transferStatus, cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(newId, cancellationToken)
            ?? throw new InvalidOperationException("Transfer was created but could not be loaded.");
    }

    public async Task<TransferDto?> UpdateAsync(
        long transferId,
        TransferUpdateRequest request,
        string transferType,
        string conditionAtTransfer,
        string handoverAcknowledgement,
        string newAcknowledgement,
        string transferStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE transfers
            SET transfer_code = @TransferCode,
                transfer_type = @TransferType,
                asset_id = @AssetId,
                from_department_id = @FromDepartmentId,
                to_department_id = @ToDepartmentId,
                current_receiver_name = @CurrentReceiverName,
                new_receiver_name = @NewReceiverName,
                transfer_reason = @TransferReason,
                accessories = @Accessories,
                condition_at_transfer = @ConditionAtTransfer,
                collection_date = @CollectionDate,
                collected_by = @CollectedBy,
                issue_date = @IssueDate,
                handover_acknowledgement = @HandoverAcknowledgement,
                new_acknowledgement = @NewAcknowledgement,
                transfer_status = @TransferStatus,
                remarks = @Remarks,
                updated_by = @UpdatedBy
            WHERE transfer_id = @TransferId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@TransferId", transferId);
        AddUpdateParameters(command, request, transferType, conditionAtTransfer, handoverAcknowledgement, newAcknowledgement, transferStatus);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        await ApplyAssetTransferStateAsync(connection, transaction, request, transferStatus, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(transferId, cancellationToken);
    }

    public async Task<TransferDto?> CancelAsync(long transferId, string? remarks, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE transfers
            SET transfer_status = 'Cancelled',
                remarks = COALESCE(@Remarks, remarks)
            WHERE transfer_id = @TransferId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@TransferId", transferId);
        command.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(transferId, cancellationToken);
    }

    private static async Task ApplyAssetTransferStateAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        TransferCreateRequest request,
        string transferStatus,
        CancellationToken cancellationToken)
    {
        await ApplyAssetTransferStateAsync(
            connection,
            transaction,
            request.AssetId,
            request.FromDepartmentId,
            request.ToDepartmentId,
            request.NewReceiverName,
            request.Remarks,
            transferStatus,
            cancellationToken);
    }

    private static async Task ApplyAssetTransferStateAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        TransferUpdateRequest request,
        string transferStatus,
        CancellationToken cancellationToken)
    {
        await ApplyAssetTransferStateAsync(
            connection,
            transaction,
            request.AssetId,
            request.FromDepartmentId,
            request.ToDepartmentId,
            request.NewReceiverName,
            request.Remarks,
            transferStatus,
            cancellationToken);
    }

    private static async Task ApplyAssetTransferStateAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        long assetId,
        long? fromDepartmentId,
        long? toDepartmentId,
        string? newReceiverName,
        string? remarks,
        string transferStatus,
        CancellationToken cancellationToken)
    {
        var shouldUpdateAsset = transferStatus.Equals("Collected by IT", StringComparison.OrdinalIgnoreCase) ||
            transferStatus.Equals("Reassigned", StringComparison.OrdinalIgnoreCase) ||
            transferStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase);

        if (!shouldUpdateAsset)
        {
            return;
        }

        var assetStatus = transferStatus.Equals("Collected by IT", StringComparison.OrdinalIgnoreCase)
            ? "Available"
            : "Delivered";
        var lifecycleStatus = transferStatus.Equals("Collected by IT", StringComparison.OrdinalIgnoreCase)
            ? "Returned"
            : "In Use";

        const string updateAssetSql = """
            UPDATE assets
            SET current_department_id = @ToDepartmentId,
                current_receiver_name = @NewReceiverName,
                lifecycle_status = @LifecycleStatus,
                asset_status = @AssetStatus,
                remarks = COALESCE(@Remarks, remarks)
            WHERE asset_id = @AssetId;
            """;

        await using (var updateAssetCommand = new MySqlCommand(updateAssetSql, connection, transaction))
        {
            updateAssetCommand.Parameters.AddWithValue("@AssetId", assetId);
            updateAssetCommand.Parameters.AddWithValue("@ToDepartmentId", ToDbValue(toDepartmentId));
            updateAssetCommand.Parameters.AddWithValue("@NewReceiverName", ToDbValue(newReceiverName));
            updateAssetCommand.Parameters.AddWithValue("@LifecycleStatus", lifecycleStatus);
            updateAssetCommand.Parameters.AddWithValue("@AssetStatus", assetStatus);
            updateAssetCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
            await updateAssetCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        const string historySql = """
            INSERT INTO asset_lifecycle_history (
                asset_id, event_type, from_department_id, to_department_id,
                receiver_name, event_status, event_notes
            )
            VALUES (
                @AssetId, 'Asset Transfer', @FromDepartmentId, @ToDepartmentId,
                @NewReceiverName, @TransferStatus, @Remarks
            );
            """;

        await using var historyCommand = new MySqlCommand(historySql, connection, transaction);
        historyCommand.Parameters.AddWithValue("@AssetId", assetId);
        historyCommand.Parameters.AddWithValue("@FromDepartmentId", ToDbValue(fromDepartmentId));
        historyCommand.Parameters.AddWithValue("@ToDepartmentId", ToDbValue(toDepartmentId));
        historyCommand.Parameters.AddWithValue("@NewReceiverName", ToDbValue(newReceiverName));
        historyCommand.Parameters.AddWithValue("@TransferStatus", transferStatus);
        historyCommand.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));
        await historyCommand.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void AddCreateParameters(
        MySqlCommand command,
        TransferCreateRequest request,
        string transferType,
        string conditionAtTransfer,
        string handoverAcknowledgement,
        string newAcknowledgement,
        string transferStatus)
    {
        command.Parameters.AddWithValue("@TransferCode", request.TransferCode.Trim());
        command.Parameters.AddWithValue("@TransferType", transferType.Trim());
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@FromDepartmentId", ToDbValue(request.FromDepartmentId));
        command.Parameters.AddWithValue("@ToDepartmentId", ToDbValue(request.ToDepartmentId));
        command.Parameters.AddWithValue("@CurrentReceiverName", ToDbValue(request.CurrentReceiverName));
        command.Parameters.AddWithValue("@NewReceiverName", ToDbValue(request.NewReceiverName));
        command.Parameters.AddWithValue("@TransferReason", ToDbValue(request.TransferReason));
        command.Parameters.AddWithValue("@Accessories", ToDbValue(request.Accessories));
        command.Parameters.AddWithValue("@ConditionAtTransfer", conditionAtTransfer.Trim());
        command.Parameters.AddWithValue("@CollectionDate", ToDbValue(request.CollectionDate));
        command.Parameters.AddWithValue("@CollectedBy", ToDbValue(request.CollectedBy));
        command.Parameters.AddWithValue("@IssueDate", ToDbValue(request.IssueDate));
        command.Parameters.AddWithValue("@HandoverAcknowledgement", handoverAcknowledgement.Trim());
        command.Parameters.AddWithValue("@NewAcknowledgement", newAcknowledgement.Trim());
        command.Parameters.AddWithValue("@TransferStatus", transferStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@CreatedBy", ToDbValue(request.CreatedBy));
    }

    private static void AddUpdateParameters(
        MySqlCommand command,
        TransferUpdateRequest request,
        string transferType,
        string conditionAtTransfer,
        string handoverAcknowledgement,
        string newAcknowledgement,
        string transferStatus)
    {
        command.Parameters.AddWithValue("@TransferCode", request.TransferCode.Trim());
        command.Parameters.AddWithValue("@TransferType", transferType.Trim());
        command.Parameters.AddWithValue("@AssetId", request.AssetId);
        command.Parameters.AddWithValue("@FromDepartmentId", ToDbValue(request.FromDepartmentId));
        command.Parameters.AddWithValue("@ToDepartmentId", ToDbValue(request.ToDepartmentId));
        command.Parameters.AddWithValue("@CurrentReceiverName", ToDbValue(request.CurrentReceiverName));
        command.Parameters.AddWithValue("@NewReceiverName", ToDbValue(request.NewReceiverName));
        command.Parameters.AddWithValue("@TransferReason", ToDbValue(request.TransferReason));
        command.Parameters.AddWithValue("@Accessories", ToDbValue(request.Accessories));
        command.Parameters.AddWithValue("@ConditionAtTransfer", conditionAtTransfer.Trim());
        command.Parameters.AddWithValue("@CollectionDate", ToDbValue(request.CollectionDate));
        command.Parameters.AddWithValue("@CollectedBy", ToDbValue(request.CollectedBy));
        command.Parameters.AddWithValue("@IssueDate", ToDbValue(request.IssueDate));
        command.Parameters.AddWithValue("@HandoverAcknowledgement", handoverAcknowledgement.Trim());
        command.Parameters.AddWithValue("@NewAcknowledgement", newAcknowledgement.Trim());
        command.Parameters.AddWithValue("@TransferStatus", transferStatus.Trim());
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
        command.Parameters.AddWithValue("@UpdatedBy", ToDbValue(request.UpdatedBy));
    }

    private static TransferDto ReadTransfer(MySqlDataReader reader)
    {
        return new TransferDto(
            TransferId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("transfer_id"))),
            TransferCode: reader.GetString("transfer_code"),
            TransferType: reader.GetString("transfer_type"),
            AssetId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("asset_id"))),
            AssetTag: GetNullableString(reader, "asset_tag"),
            AssetName: GetNullableString(reader, "asset_name"),
            FromDepartmentId: GetNullableInt64(reader, "from_department_id"),
            FromDepartmentName: GetNullableString(reader, "from_department_name"),
            ToDepartmentId: GetNullableInt64(reader, "to_department_id"),
            ToDepartmentName: GetNullableString(reader, "to_department_name"),
            CurrentReceiverName: GetNullableString(reader, "current_receiver_name"),
            NewReceiverName: GetNullableString(reader, "new_receiver_name"),
            TransferReason: GetNullableString(reader, "transfer_reason"),
            Accessories: GetNullableString(reader, "accessories"),
            ConditionAtTransfer: reader.GetString("condition_at_transfer"),
            CollectionDate: GetNullableDateOnly(reader, "collection_date"),
            CollectedBy: GetNullableInt64(reader, "collected_by"),
            CollectedByName: GetNullableString(reader, "collected_by_name"),
            IssueDate: GetNullableDateOnly(reader, "issue_date"),
            HandoverAcknowledgement: reader.GetString("handover_acknowledgement"),
            NewAcknowledgement: reader.GetString("new_acknowledgement"),
            TransferStatus: reader.GetString("transfer_status"),
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

    private static DateOnly? GetNullableDateOnly(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal)
            ? null
            : DateOnly.FromDateTime(reader.GetDateTime(ordinal));
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

    private static object ToDbValue(DateOnly? value)
    {
        return value.HasValue ? value.Value.ToDateTime(TimeOnly.MinValue) : DBNull.Value;
    }
}
