using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class WorkOrderRepository(MySqlConnectionFactory connectionFactory)
{
    public async Task<IReadOnlyList<WorkOrderDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT wo.work_order_id, wo.work_order_number, wo.vendor_id, v.vendor_name,
                   wo.invoice_number, wo.work_order_date, wo.expected_delivery_date,
                   wo.received_date, wo.total_amount, wo.approval_status,
                   wo.payment_status, wo.received_status, wo.invoice_status,
                   wo.work_order_status, wo.approved_by, wo.approved_at, wo.remarks,
                   COUNT(item.work_order_item_id) AS item_count,
                   wo.created_at, wo.updated_at
            FROM work_orders wo
            INNER JOIN vendors v ON v.vendor_id = wo.vendor_id
            LEFT JOIN work_order_items item ON item.work_order_id = wo.work_order_id
            GROUP BY wo.work_order_id, wo.work_order_number, wo.vendor_id, v.vendor_name,
                     wo.invoice_number, wo.work_order_date, wo.expected_delivery_date,
                     wo.received_date, wo.total_amount, wo.approval_status,
                     wo.payment_status, wo.received_status, wo.invoice_status,
                     wo.work_order_status, wo.approved_by, wo.approved_at, wo.remarks,
                     wo.created_at, wo.updated_at
            ORDER BY wo.updated_at DESC, wo.work_order_number;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var workOrders = new List<WorkOrderDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            workOrders.Add(ReadWorkOrder(reader, Array.Empty<WorkOrderItemDto>()));
        }

        return workOrders;
    }

    public async Task<WorkOrderDto?> GetByIdAsync(long workOrderId, CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT wo.work_order_id, wo.work_order_number, wo.vendor_id, v.vendor_name,
                   wo.invoice_number, wo.work_order_date, wo.expected_delivery_date,
                   wo.received_date, wo.total_amount, wo.approval_status,
                   wo.payment_status, wo.received_status, wo.invoice_status,
                   wo.work_order_status, wo.approved_by, wo.approved_at, wo.remarks,
                   COUNT(item.work_order_item_id) AS item_count,
                   wo.created_at, wo.updated_at
            FROM work_orders wo
            INNER JOIN vendors v ON v.vendor_id = wo.vendor_id
            LEFT JOIN work_order_items item ON item.work_order_id = wo.work_order_id
            WHERE wo.work_order_id = @WorkOrderId
            GROUP BY wo.work_order_id, wo.work_order_number, wo.vendor_id, v.vendor_name,
                     wo.invoice_number, wo.work_order_date, wo.expected_delivery_date,
                     wo.received_date, wo.total_amount, wo.approval_status,
                     wo.payment_status, wo.received_status, wo.invoice_status,
                     wo.work_order_status, wo.approved_by, wo.approved_at, wo.remarks,
                     wo.created_at, wo.updated_at;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@WorkOrderId", workOrderId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var baseWorkOrder = ReadWorkOrder(reader, Array.Empty<WorkOrderItemDto>());
        await reader.DisposeAsync();

        var items = await GetItemsAsync(connection, workOrderId, cancellationToken);
        return baseWorkOrder with { Items = items, ItemCount = items.Count };
    }

    public async Task<WorkOrderDto> CreateAsync(
        WorkOrderCreateRequest request,
        string approvalStatus,
        string paymentStatus,
        string receivedStatus,
        string invoiceStatus,
        string workOrderStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO work_orders (
                work_order_number, vendor_id, invoice_number, work_order_date,
                expected_delivery_date, received_date, total_amount, approval_status,
                payment_status, received_status, invoice_status, work_order_status,
                approved_by, approved_at, remarks, created_by
            )
            VALUES (
                @WorkOrderNumber, @VendorId, @InvoiceNumber, @WorkOrderDate,
                @ExpectedDeliveryDate, @ReceivedDate, @TotalAmount, @ApprovalStatus,
                @PaymentStatus, @ReceivedStatus, @InvoiceStatus, @WorkOrderStatus,
                @ApprovedBy, @ApprovedAt, @Remarks, @CreatedBy
            );
            SELECT LAST_INSERT_ID();
            """;

        var totalAmount = CalculateTotalAmount(request.Items);

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        AddWorkOrderParameters(command, request, totalAmount, approvalStatus, paymentStatus, receivedStatus, invoiceStatus, workOrderStatus);
        command.Parameters.AddWithValue("@CreatedBy", ToDbValue(request.CreatedBy));

        var newId = Convert.ToInt64(await command.ExecuteScalarAsync(cancellationToken));
        await ReplaceItemsAsync(connection, transaction, newId, request.Items, cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return await GetByIdAsync(newId, cancellationToken)
            ?? throw new InvalidOperationException("Work Order was created but could not be loaded.");
    }

    public async Task<WorkOrderDto?> UpdateAsync(
        long workOrderId,
        WorkOrderUpdateRequest request,
        string approvalStatus,
        string paymentStatus,
        string receivedStatus,
        string invoiceStatus,
        string workOrderStatus,
        CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE work_orders
            SET work_order_number = @WorkOrderNumber,
                vendor_id = @VendorId,
                invoice_number = @InvoiceNumber,
                work_order_date = @WorkOrderDate,
                expected_delivery_date = @ExpectedDeliveryDate,
                received_date = @ReceivedDate,
                total_amount = @TotalAmount,
                approval_status = @ApprovalStatus,
                payment_status = @PaymentStatus,
                received_status = @ReceivedStatus,
                invoice_status = @InvoiceStatus,
                work_order_status = @WorkOrderStatus,
                approved_by = @ApprovedBy,
                approved_at = @ApprovedAt,
                remarks = @Remarks,
                updated_by = @UpdatedBy
            WHERE work_order_id = @WorkOrderId;
            """;

        var totalAmount = CalculateTotalAmount(request.Items);

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@WorkOrderId", workOrderId);
        AddWorkOrderParameters(command, request, totalAmount, approvalStatus, paymentStatus, receivedStatus, invoiceStatus, workOrderStatus);
        command.Parameters.AddWithValue("@UpdatedBy", ToDbValue(request.UpdatedBy));

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        if (affectedRows == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        await ReplaceItemsAsync(connection, transaction, workOrderId, request.Items, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await GetByIdAsync(workOrderId, cancellationToken);
    }

    public async Task<WorkOrderDto?> CancelAsync(long workOrderId, string? remarks, CancellationToken cancellationToken)
    {
        const string sql = """
            UPDATE work_orders
            SET work_order_status = 'Cancelled',
                remarks = COALESCE(@Remarks, remarks)
            WHERE work_order_id = @WorkOrderId;
            """;

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@WorkOrderId", workOrderId);
        command.Parameters.AddWithValue("@Remarks", ToDbValue(remarks));

        var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
        return affectedRows == 0 ? null : await GetByIdAsync(workOrderId, cancellationToken);
    }

    private static async Task<IReadOnlyList<WorkOrderItemDto>> GetItemsAsync(
        MySqlConnection connection,
        long workOrderId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT work_order_item_id, work_order_id, item_name, category,
                   quantity, unit_price, total_amount, warranty,
                   specifications, description
            FROM work_order_items
            WHERE work_order_id = @WorkOrderId
            ORDER BY work_order_item_id;
            """;

        await using var command = new MySqlCommand(sql, connection);
        command.Parameters.AddWithValue("@WorkOrderId", workOrderId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<WorkOrderItemDto>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new WorkOrderItemDto(
                WorkOrderItemId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("work_order_item_id"))),
                WorkOrderId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("work_order_id"))),
                ItemName: reader.GetString("item_name"),
                Category: reader.GetString("category"),
                Quantity: Convert.ToInt32(reader.GetValue(reader.GetOrdinal("quantity"))),
                UnitPrice: reader.GetDecimal("unit_price"),
                TotalAmount: reader.GetDecimal("total_amount"),
                Warranty: GetNullableString(reader, "warranty"),
                Specifications: GetNullableString(reader, "specifications"),
                Description: GetNullableString(reader, "description")));
        }

        return items;
    }

    private static async Task ReplaceItemsAsync(
        MySqlConnection connection,
        MySqlTransaction transaction,
        long workOrderId,
        IReadOnlyList<WorkOrderItemRequest> items,
        CancellationToken cancellationToken)
    {
        const string deleteSql = "DELETE FROM work_order_items WHERE work_order_id = @WorkOrderId;";
        await using (var deleteCommand = new MySqlCommand(deleteSql, connection, transaction))
        {
            deleteCommand.Parameters.AddWithValue("@WorkOrderId", workOrderId);
            await deleteCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        const string insertSql = """
            INSERT INTO work_order_items (
                work_order_id, item_name, category, quantity,
                unit_price, total_amount, warranty, specifications, description
            )
            VALUES (
                @WorkOrderId, @ItemName, @Category, @Quantity,
                @UnitPrice, @TotalAmount, @Warranty, @Specifications, @Description
            );
            """;

        foreach (var item in items)
        {
            var totalAmount = item.Quantity * item.UnitPrice;
            await using var insertCommand = new MySqlCommand(insertSql, connection, transaction);
            insertCommand.Parameters.AddWithValue("@WorkOrderId", workOrderId);
            insertCommand.Parameters.AddWithValue("@ItemName", item.ItemName.Trim());
            insertCommand.Parameters.AddWithValue("@Category", item.Category.Trim());
            insertCommand.Parameters.AddWithValue("@Quantity", item.Quantity);
            insertCommand.Parameters.AddWithValue("@UnitPrice", item.UnitPrice);
            insertCommand.Parameters.AddWithValue("@TotalAmount", totalAmount);
            insertCommand.Parameters.AddWithValue("@Warranty", ToDbValue(item.Warranty));
            insertCommand.Parameters.AddWithValue("@Specifications", ToDbValue(item.Specifications));
            insertCommand.Parameters.AddWithValue("@Description", ToDbValue(item.Description));
            await insertCommand.ExecuteNonQueryAsync(cancellationToken);
        }
    }

    private static void AddWorkOrderParameters(
        MySqlCommand command,
        WorkOrderCreateRequest request,
        decimal totalAmount,
        string approvalStatus,
        string paymentStatus,
        string receivedStatus,
        string invoiceStatus,
        string workOrderStatus)
    {
        command.Parameters.AddWithValue("@WorkOrderNumber", request.WorkOrderNumber.Trim());
        command.Parameters.AddWithValue("@VendorId", request.VendorId);
        command.Parameters.AddWithValue("@InvoiceNumber", ToDbValue(request.InvoiceNumber));
        command.Parameters.AddWithValue("@WorkOrderDate", request.WorkOrderDate.ToDateTime(TimeOnly.MinValue));
        command.Parameters.AddWithValue("@ExpectedDeliveryDate", ToDbValue(request.ExpectedDeliveryDate));
        command.Parameters.AddWithValue("@ReceivedDate", ToDbValue(request.ReceivedDate));
        command.Parameters.AddWithValue("@TotalAmount", totalAmount);
        command.Parameters.AddWithValue("@ApprovalStatus", approvalStatus.Trim());
        command.Parameters.AddWithValue("@PaymentStatus", paymentStatus.Trim());
        command.Parameters.AddWithValue("@ReceivedStatus", receivedStatus.Trim());
        command.Parameters.AddWithValue("@InvoiceStatus", invoiceStatus.Trim());
        command.Parameters.AddWithValue("@WorkOrderStatus", workOrderStatus.Trim());
        command.Parameters.AddWithValue("@ApprovedBy", ToDbValue(request.ApprovedBy));
        command.Parameters.AddWithValue("@ApprovedAt", ToDbValue(request.ApprovedAt));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
    }

    private static void AddWorkOrderParameters(
        MySqlCommand command,
        WorkOrderUpdateRequest request,
        decimal totalAmount,
        string approvalStatus,
        string paymentStatus,
        string receivedStatus,
        string invoiceStatus,
        string workOrderStatus)
    {
        command.Parameters.AddWithValue("@WorkOrderNumber", request.WorkOrderNumber.Trim());
        command.Parameters.AddWithValue("@VendorId", request.VendorId);
        command.Parameters.AddWithValue("@InvoiceNumber", ToDbValue(request.InvoiceNumber));
        command.Parameters.AddWithValue("@WorkOrderDate", request.WorkOrderDate.ToDateTime(TimeOnly.MinValue));
        command.Parameters.AddWithValue("@ExpectedDeliveryDate", ToDbValue(request.ExpectedDeliveryDate));
        command.Parameters.AddWithValue("@ReceivedDate", ToDbValue(request.ReceivedDate));
        command.Parameters.AddWithValue("@TotalAmount", totalAmount);
        command.Parameters.AddWithValue("@ApprovalStatus", approvalStatus.Trim());
        command.Parameters.AddWithValue("@PaymentStatus", paymentStatus.Trim());
        command.Parameters.AddWithValue("@ReceivedStatus", receivedStatus.Trim());
        command.Parameters.AddWithValue("@InvoiceStatus", invoiceStatus.Trim());
        command.Parameters.AddWithValue("@WorkOrderStatus", workOrderStatus.Trim());
        command.Parameters.AddWithValue("@ApprovedBy", ToDbValue(request.ApprovedBy));
        command.Parameters.AddWithValue("@ApprovedAt", ToDbValue(request.ApprovedAt));
        command.Parameters.AddWithValue("@Remarks", ToDbValue(request.Remarks));
    }

    private static WorkOrderDto ReadWorkOrder(MySqlDataReader reader, IReadOnlyList<WorkOrderItemDto> items)
    {
        var itemCount = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("item_count")));

        return new WorkOrderDto(
            WorkOrderId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("work_order_id"))),
            WorkOrderNumber: reader.GetString("work_order_number"),
            VendorId: Convert.ToInt64(reader.GetValue(reader.GetOrdinal("vendor_id"))),
            VendorName: GetNullableString(reader, "vendor_name"),
            InvoiceNumber: GetNullableString(reader, "invoice_number"),
            WorkOrderDate: DateOnly.FromDateTime(reader.GetDateTime("work_order_date")),
            ExpectedDeliveryDate: GetNullableDateOnly(reader, "expected_delivery_date"),
            ReceivedDate: GetNullableDateOnly(reader, "received_date"),
            TotalAmount: reader.GetDecimal("total_amount"),
            ApprovalStatus: reader.GetString("approval_status"),
            PaymentStatus: reader.GetString("payment_status"),
            ReceivedStatus: reader.GetString("received_status"),
            InvoiceStatus: reader.GetString("invoice_status"),
            WorkOrderStatus: reader.GetString("work_order_status"),
            ApprovedBy: GetNullableInt64(reader, "approved_by"),
            ApprovedAt: GetNullableDateTimeOffset(reader, "approved_at"),
            Remarks: GetNullableString(reader, "remarks"),
            ItemCount: itemCount,
            Items: items,
            CreatedAt: GetDateTimeOffset(reader, "created_at"),
            UpdatedAt: GetDateTimeOffset(reader, "updated_at"));
    }

    private static decimal CalculateTotalAmount(IReadOnlyList<WorkOrderItemRequest> items)
    {
        return items.Sum(item => item.Quantity * item.UnitPrice);
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

    private static DateTimeOffset? GetNullableDateTimeOffset(MySqlDataReader reader, string columnName)
    {
        var ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal)
            ? null
            : new DateTimeOffset(DateTime.SpecifyKind(reader.GetDateTime(ordinal), DateTimeKind.Local));
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

    private static object ToDbValue(DateTimeOffset? value)
    {
        return value.HasValue ? value.Value.LocalDateTime : DBNull.Value;
    }
}
