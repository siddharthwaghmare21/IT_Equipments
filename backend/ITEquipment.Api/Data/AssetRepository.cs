using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class AssetRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<AssetDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT a.asset_id, a.asset_tag, a.asset_name, a.category, a.brand, a.model,
                   a.serial_number, a.work_order_ref, a.invoice_number, a.purchase_date,
                   a.warranty_expiry, a.custodian_department_id,
                   cust.department_name AS custodian_department_name,
                   a.current_department_id,
                   current_dept.department_name AS current_department_name,
                   a.current_receiver_name, a.location, a.asset_condition,
                   a.lifecycle_status, a.asset_status, a.qr_code, a.specifications,
                   a.description, a.remarks, a.created_at, a.updated_at,
                   COUNT(doc.document_id) AS document_count
            FROM assets a
            LEFT JOIN departments cust
                ON cust.department_id = a.custodian_department_id
            LEFT JOIN departments current_dept
                ON current_dept.department_id = a.current_department_id
            LEFT JOIN asset_documents doc
                ON doc.asset_id = a.asset_id
            WHERE a.asset_status <> 'Archived'
              AND a.lifecycle_status <> 'Archived'
            GROUP BY a.asset_id, a.asset_tag, a.asset_name, a.category, a.brand, a.model,
                     a.serial_number, a.work_order_ref, a.invoice_number, a.purchase_date,
                     a.warranty_expiry, a.custodian_department_id, cust.department_name,
                     a.current_department_id, current_dept.department_name,
                     a.current_receiver_name, a.location, a.asset_condition,
                     a.lifecycle_status, a.asset_status, a.qr_code, a.specifications,
                     a.description, a.remarks, a.created_at, a.updated_at
            ORDER BY a.updated_at DESC, a.asset_tag;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var assets = new List<AssetDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            assets.Add(ReadAsset(reader));
        }

        return assets;
    }

    public async Task<AssetDto?> GetByIdAsync(long assetId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT a.asset_id, a.asset_tag, a.asset_name, a.category, a.brand, a.model,
                   a.serial_number, a.work_order_ref, a.invoice_number, a.purchase_date,
                   a.warranty_expiry, a.custodian_department_id,
                   cust.department_name AS custodian_department_name,
                   a.current_department_id,
                   current_dept.department_name AS current_department_name,
                   a.current_receiver_name, a.location, a.asset_condition,
                   a.lifecycle_status, a.asset_status, a.qr_code, a.specifications,
                   a.description, a.remarks, a.created_at, a.updated_at,
                   COUNT(doc.document_id) AS document_count
            FROM assets a
            LEFT JOIN departments cust
                ON cust.department_id = a.custodian_department_id
            LEFT JOIN departments current_dept
                ON current_dept.department_id = a.current_department_id
            LEFT JOIN asset_documents doc
                ON doc.asset_id = a.asset_id
            WHERE a.asset_id = @AssetId
            GROUP BY a.asset_id, a.asset_tag, a.asset_name, a.category, a.brand, a.model,
                     a.serial_number, a.work_order_ref, a.invoice_number, a.purchase_date,
                     a.warranty_expiry, a.custodian_department_id, cust.department_name,
                     a.current_department_id, current_dept.department_name,
                     a.current_receiver_name, a.location, a.asset_condition,
                     a.lifecycle_status, a.asset_status, a.qr_code, a.specifications,
                     a.description, a.remarks, a.created_at, a.updated_at;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AssetId", assetId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadAsset(reader) : null;
    }

    public async Task<IReadOnlyList<AssetHistoryDto>> GetHistoryAsync(long assetId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT h.history_id, h.asset_id, h.event_type, h.from_department_id,
                   from_dept.department_name AS from_department_name,
                   h.to_department_id,
                   to_dept.department_name AS to_department_name,
                   h.receiver_name, h.event_status, h.event_notes, h.performed_at
            FROM asset_lifecycle_history h
            LEFT JOIN departments from_dept
                ON from_dept.department_id = h.from_department_id
            LEFT JOIN departments to_dept
                ON to_dept.department_id = h.to_department_id
            WHERE h.asset_id = @AssetId
            ORDER BY h.performed_at DESC, h.history_id DESC;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AssetId", assetId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var history = new List<AssetHistoryDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            history.Add(new AssetHistoryDto(
                HistoryId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("history_id"))),
                AssetId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("asset_id"))),
                EventType: reader.GetString("event_type"),
                FromDepartmentId: GetNullableInt64(reader, "from_department_id"),
                FromDepartmentName: GetNullableString(reader, "from_department_name"),
                ToDepartmentId: GetNullableInt64(reader, "to_department_id"),
                ToDepartmentName: GetNullableString(reader, "to_department_name"),
                ReceiverName: GetNullableString(reader, "receiver_name"),
                EventStatus: GetNullableString(reader, "event_status"),
                EventNotes: GetNullableString(reader, "event_notes"),
                PerformedAt: GetDateTimeOffset(reader, "performed_at")));
        }

        return history;
    }

    public async Task<AssetDto> CreateAsync(AssetCreateRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO assets (
                asset_tag, asset_name, category, brand, model, serial_number,
                work_order_ref, invoice_number, purchase_date, warranty_expiry,
                custodian_department_id, current_department_id, current_receiver_name,
                location, asset_condition, lifecycle_status, asset_status, qr_code,
                specifications, description, remarks
            )
            VALUES (
                @AssetTag, @AssetName, @Category, @Brand, @Model, @SerialNumber,
                @WorkOrderRef, @InvoiceNumber, @PurchaseDate, @WarrantyExpiry,
                @CustodianDepartmentId, @CurrentDepartmentId, @CurrentReceiverName,
                @Location, @AssetCondition, @LifecycleStatus, @AssetStatus, @QrCode,
                @Specifications, @Description, @Remarks
            );
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        AddEditableParameters(command, request, request.AssetCondition ?? "New", request.LifecycleStatus ?? "In Stock", request.AssetStatus ?? "Available");

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        await AddHistoryAsync(
            connection,
            transaction,
            newId,
            "Asset Registered",
            null,
            request.CurrentDepartmentId,
            request.CurrentReceiverName,
            request.AssetStatus ?? "Available",
            request.Remarks,
            cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        var asset = await GetByIdAsync(newId, cancellationToken);
        return asset ?? throw new InvalidOperationException("Asset was created but could not be loaded.");
    }

    public async Task<AssetDto?> UpdateAsync(long assetId, AssetUpdateRequest request, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE assets
            SET asset_tag = @AssetTag,
                asset_name = @AssetName,
                category = @Category,
                brand = @Brand,
                model = @Model,
                serial_number = @SerialNumber,
                work_order_ref = @WorkOrderRef,
                invoice_number = @InvoiceNumber,
                purchase_date = @PurchaseDate,
                warranty_expiry = @WarrantyExpiry,
                custodian_department_id = @CustodianDepartmentId,
                current_department_id = @CurrentDepartmentId,
                current_receiver_name = @CurrentReceiverName,
                location = @Location,
                asset_condition = @AssetCondition,
                lifecycle_status = @LifecycleStatus,
                asset_status = @AssetStatus,
                qr_code = @QrCode,
                specifications = @Specifications,
                description = @Description,
                remarks = @Remarks
            WHERE asset_id = @AssetId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@AssetId", assetId);
        AddEditableParameters(command, request, request.AssetCondition, request.LifecycleStatus, request.AssetStatus);

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(assetId, cancellationToken);
    }

    public async Task<AssetDto?> ArchiveAsync(long assetId, string? remarks, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE assets
            SET lifecycle_status = 'Archived',
                asset_status = 'Archived',
                remarks = COALESCE(@Remarks, remarks)
            WHERE asset_id = @AssetId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@AssetId", assetId);
        command.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        await AddHistoryAsync(
            connection,
            transaction,
            assetId,
            "Asset Archived",
            null,
            null,
            null,
            "Archived",
            remarks,
            cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(assetId, cancellationToken);
    }

    private static void AddEditableParameters(
        MySqlCommand command,
        AssetCreateRequest request,
        string assetCondition,
        string lifecycleStatus,
        string assetStatus)
    {
        command.Parameters.AddWithValue("@AssetTag", request.AssetTag.Trim());
        command.Parameters.AddWithValue("@AssetName", request.AssetName.Trim());
        command.Parameters.AddWithValue("@Category", request.Category.Trim());
        command.Parameters.AddWithValue("@Brand", ToDbValue(request.Brand));
        command.Parameters.AddWithValue("@Model", ToDbValue(request.Model));
        command.Parameters.AddWithValue("@SerialNumber", request.SerialNumber.Trim());
        command.Parameters.AddWithValue("@WorkOrderRef", ToDbValue(request.WorkOrderRef));
        command.Parameters.AddWithValue("@InvoiceNumber", ToDbValue(request.InvoiceNumber));
        command.Parameters.AddWithValue("@PurchaseDate", ToDbValue(request.PurchaseDate));
        command.Parameters.AddWithValue("@WarrantyExpiry", ToDbValue(request.WarrantyExpiry));
        command.Parameters.AddWithValue("@CustodianDepartmentId", ToDbValue(request.CustodianDepartmentId));
        command.Parameters.AddWithValue("@CurrentDepartmentId", ToDbValue(request.CurrentDepartmentId));
        command.Parameters.AddWithValue("@CurrentReceiverName", ToDbValue(request.CurrentReceiverName));
        command.Parameters.AddWithValue("@Location", ToDbValue(request.Location));
        command.Parameters.AddWithValue("@AssetCondition", assetCondition.Trim());
        command.Parameters.AddWithValue("@LifecycleStatus", lifecycleStatus.Trim());
        command.Parameters.AddWithValue("@AssetStatus", assetStatus.Trim());
        command.Parameters.AddWithValue("@QrCode", ToDbValue(request.QrCode));
        command.Parameters.AddWithValue("@Specifications", ToDbValue(request.Specifications));
        command.Parameters.AddWithValue("@Description", ToDbValue(request.Description));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
    }

    private static void AddEditableParameters(
        MySqlCommand command,
        AssetUpdateRequest request,
        string assetCondition,
        string lifecycleStatus,
        string assetStatus)
    {
        command.Parameters.AddWithValue("@AssetTag", request.AssetTag.Trim());
        command.Parameters.AddWithValue("@AssetName", request.AssetName.Trim());
        command.Parameters.AddWithValue("@Category", request.Category.Trim());
        command.Parameters.AddWithValue("@Brand", ToDbValue(request.Brand));
        command.Parameters.AddWithValue("@Model", ToDbValue(request.Model));
        command.Parameters.AddWithValue("@SerialNumber", request.SerialNumber.Trim());
        command.Parameters.AddWithValue("@WorkOrderRef", ToDbValue(request.WorkOrderRef));
        command.Parameters.AddWithValue("@InvoiceNumber", ToDbValue(request.InvoiceNumber));
        command.Parameters.AddWithValue("@PurchaseDate", ToDbValue(request.PurchaseDate));
        command.Parameters.AddWithValue("@WarrantyExpiry", ToDbValue(request.WarrantyExpiry));
        command.Parameters.AddWithValue("@CustodianDepartmentId", ToDbValue(request.CustodianDepartmentId));
        command.Parameters.AddWithValue("@CurrentDepartmentId", ToDbValue(request.CurrentDepartmentId));
        command.Parameters.AddWithValue("@CurrentReceiverName", ToDbValue(request.CurrentReceiverName));
        command.Parameters.AddWithValue("@Location", ToDbValue(request.Location));
        command.Parameters.AddWithValue("@AssetCondition", assetCondition.Trim());
        command.Parameters.AddWithValue("@LifecycleStatus", lifecycleStatus.Trim());
        command.Parameters.AddWithValue("@AssetStatus", assetStatus.Trim());
        command.Parameters.AddWithValue("@QrCode", ToDbValue(request.QrCode));
        command.Parameters.AddWithValue("@Specifications", ToDbValue(request.Specifications));
        command.Parameters.AddWithValue("@Description", ToDbValue(request.Description));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
    }

    private static async Task AddHistoryAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        long assetId,
        string eventType,
        long? fromDepartmentId,
        long? toDepartmentId,
        string? receiverName,
        string? eventStatus,
        string? eventNotes,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO asset_lifecycle_history (
                asset_id, event_type, from_department_id, to_department_id,
                receiver_name, event_status, event_notes
            )
            VALUES (
                @AssetId, @EventType, @FromDepartmentId, @ToDepartmentId,
                @ReceiverName, @EventStatus, @EventNotes
            );
            """;

        await using var command = new MySqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@AssetId", assetId);
        command.Parameters.AddWithValue("@EventType", eventType);
        command.Parameters.AddWithValue("@FromDepartmentId", ToDbValue(fromDepartmentId));
        command.Parameters.AddWithValue("@ToDepartmentId", ToDbValue(toDepartmentId));
        command.Parameters.AddWithValue("@ReceiverName", ToDbValue(receiverName));
        command.Parameters.AddWithValue("@EventStatus", ToDbValue(eventStatus));
        command.Parameters.AddWithValue("@EventNotes", ToDbValue(eventNotes));

        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static AssetDto ReadAsset(MySqlDataReader reader)
    {
        var documentCount = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("document_count")));

        return new AssetDto(
            AssetId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("asset_id"))),
            AssetTag: reader.GetString("asset_tag"),
            AssetName: reader.GetString("asset_name"),
            Category: reader.GetString("category"),
            Brand: GetNullableString(reader, "brand"),
            Model: GetNullableString(reader, "model"),
            SerialNumber: reader.GetString("serial_number"),
            WorkOrderRef: GetNullableString(reader, "work_order_ref"),
            InvoiceNumber: GetNullableString(reader, "invoice_number"),
            PurchaseDate: GetNullableDateOnly(reader, "purchase_date"),
            WarrantyExpiry: GetNullableDateOnly(reader, "warranty_expiry"),
            CustodianDepartmentId: GetNullableInt64(reader, "custodian_department_id"),
            CustodianDepartmentName: GetNullableString(reader, "custodian_department_name"),
            CurrentDepartmentId: GetNullableInt64(reader, "current_department_id"),
            CurrentDepartmentName: GetNullableString(reader, "current_department_name"),
            CurrentReceiverName: GetNullableString(reader, "current_receiver_name"),
            Location: GetNullableString(reader, "location"),
            AssetCondition: reader.GetString("asset_condition"),
            LifecycleStatus: reader.GetString("lifecycle_status"),
            AssetStatus: reader.GetString("asset_status"),
            QrCode: GetNullableString(reader, "qr_code"),
            Specifications: GetNullableString(reader, "specifications"),
            Description: GetNullableString(reader, "description"),
            Remarks: GetNullableString(reader, "remarks"),
            DocumentCount: documentCount,
            AttachmentStatus: documentCount > 0 ? "Uploaded" : "Pending",
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
