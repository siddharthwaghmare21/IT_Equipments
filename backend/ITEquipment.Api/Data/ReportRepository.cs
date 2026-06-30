using ITEquipment.Api.Models;
using MySqlConnector;

namespace ITEquipment.Api.Data;

public sealed class ReportRepository(MySqlConnectionFactory connectionFactory)
{
    private static readonly IReadOnlyDictionary<string, string> ReportQueries =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["overview"] = """
                SELECT 'assets' AS metricKey, 'Assets' AS metricLabel, COUNT(*) AS metricValue FROM assets
                UNION ALL
                SELECT 'purchases', 'Purchases', COUNT(*) FROM work_orders
                UNION ALL
                SELECT 'deliveries', 'Deliveries', COUNT(*) FROM deliveries
                UNION ALL
                SELECT 'transfers', 'Transfers', COUNT(*) FROM transfers
                UNION ALL
                SELECT 'returns', 'Returns', COUNT(*) FROM returns
                UNION ALL
                SELECT 'maintenance', 'Maintenance', COUNT(*) FROM maintenance_records
                UNION ALL
                SELECT 'damaged', 'Damaged Assets', COUNT(*) FROM assets
                    WHERE asset_condition = 'Damaged' OR asset_status = 'Damaged'
                UNION ALL
                SELECT 'warrantyExpiring', 'Warranty Expiring In 30 Days', COUNT(*) FROM assets
                    WHERE warranty_expiry IS NOT NULL
                      AND warranty_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
                """,
            ["assets"] = """
                SELECT a.asset_id AS id,
                       a.asset_tag AS assetTag,
                       a.asset_name AS assetName,
                       a.category,
                       a.brand,
                       current_department.department_name AS department,
                       a.current_receiver_name AS assignedTo,
                       custodian_department.department_name AS custodianDepartment,
                       a.work_order_ref AS purchaseRef,
                       a.purchase_date AS purchaseDate,
                       a.warranty_expiry AS warrantyExpiry,
                       a.lifecycle_status AS lifecycleStatus,
                       a.asset_condition AS assetCondition,
                       a.qr_code AS qrCode,
                       CASE WHEN COUNT(doc.document_id) > 0 THEN 'Uploaded' ELSE 'Pending' END AS attachmentStatus,
                       CASE WHEN a.asset_status = 'Delivered' THEN 'Assigned' ELSE a.asset_status END AS status
                FROM assets a
                LEFT JOIN departments current_department
                    ON current_department.department_id = a.current_department_id
                LEFT JOIN departments custodian_department
                    ON custodian_department.department_id = a.custodian_department_id
                LEFT JOIN asset_documents doc
                    ON doc.asset_id = a.asset_id
                GROUP BY a.asset_id, a.asset_tag, a.asset_name, a.category, a.brand,
                         current_department.department_name, a.current_receiver_name,
                         custodian_department.department_name, a.work_order_ref,
                         a.purchase_date, a.warranty_expiry, a.lifecycle_status,
                         a.asset_condition, a.qr_code, a.asset_status
                ORDER BY a.updated_at DESC, a.asset_tag;
                """,
            ["purchases"] = """
                SELECT wo.work_order_id AS id,
                       wo.work_order_number AS workOrderNumber,
                       v.vendor_name AS vendorName,
                       wo.invoice_number AS invoiceNumber,
                       wo.work_order_date AS workOrderDate,
                       wo.expected_delivery_date AS expectedDeliveryDate,
                       wo.received_date AS receivedDate,
                       wo.total_amount AS totalAmount,
                       wo.approval_status AS approvalStatus,
                       wo.payment_status AS paymentStatus,
                       wo.received_status AS receivedStatus,
                       wo.invoice_status AS invoiceStatus,
                       wo.work_order_status AS status,
                       COUNT(item.work_order_item_id) AS itemCount
                FROM work_orders wo
                INNER JOIN vendors v ON v.vendor_id = wo.vendor_id
                LEFT JOIN work_order_items item ON item.work_order_id = wo.work_order_id
                GROUP BY wo.work_order_id, wo.work_order_number, v.vendor_name,
                         wo.invoice_number, wo.work_order_date, wo.expected_delivery_date,
                         wo.received_date, wo.total_amount, wo.approval_status,
                         wo.payment_status, wo.received_status, wo.invoice_status,
                         wo.work_order_status
                ORDER BY wo.work_order_date DESC, wo.work_order_number;
                """,
            ["deliveries"] = """
                SELECT d.delivery_id AS id,
                       d.delivery_code AS deliveryCode,
                       a.asset_tag AS assetTag,
                       a.asset_name AS assetName,
                       department.department_name AS department,
                       d.receiver_name AS receiverName,
                       d.delivery_date AS deliveryDate,
                       d.accessories,
                       d.acknowledgement_status AS acknowledgementStatus,
                       d.delivery_status AS status
                FROM deliveries d
                INNER JOIN assets a ON a.asset_id = d.asset_id
                INNER JOIN departments department ON department.department_id = d.department_id
                ORDER BY d.delivery_date DESC, d.delivery_code;
                """,
            ["transfers"] = """
                SELECT t.transfer_id AS id,
                       t.transfer_code AS transferCode,
                       t.transfer_type AS transferType,
                       a.asset_tag AS assetTag,
                       a.asset_name AS assetName,
                       from_department.department_name AS fromDepartment,
                       to_department.department_name AS toDepartment,
                       t.current_receiver_name AS currentReceiverName,
                       t.new_receiver_name AS newReceiverName,
                       t.transfer_reason AS transferReason,
                       t.condition_at_transfer AS conditionAtTransfer,
                       t.collection_date AS collectionDate,
                       t.issue_date AS issueDate,
                       t.handover_acknowledgement AS handoverAcknowledgement,
                       t.new_acknowledgement AS newAcknowledgement,
                       t.transfer_status AS status
                FROM transfers t
                INNER JOIN assets a ON a.asset_id = t.asset_id
                LEFT JOIN departments from_department
                    ON from_department.department_id = t.from_department_id
                LEFT JOIN departments to_department
                    ON to_department.department_id = t.to_department_id
                ORDER BY COALESCE(t.issue_date, t.collection_date, DATE(t.updated_at)) DESC, t.transfer_code;
                """,
            ["returns"] = """
                SELECT r.return_id AS id,
                       r.return_code AS returnCode,
                       a.asset_tag AS assetTag,
                       a.asset_name AS assetName,
                       department.department_name AS department,
                       r.returned_by_name AS returnedByName,
                       r.return_date AS returnDate,
                       r.return_condition AS returnCondition,
                       r.received_location AS receivedLocation,
                       r.acknowledgement_status AS acknowledgementStatus,
                       r.inspection_status AS inspectionStatus,
                       r.damage_decision AS damageDecision,
                       r.return_status AS status
                FROM returns r
                INNER JOIN assets a ON a.asset_id = r.asset_id
                LEFT JOIN departments department ON department.department_id = r.department_id
                ORDER BY r.return_date DESC, r.return_code;
                """,
            ["maintenance"] = """
                SELECT m.maintenance_id AS id,
                       m.maintenance_code AS maintenanceCode,
                       a.asset_tag AS assetTag,
                       a.asset_name AS assetName,
                       m.issue_type AS issueType,
                       m.reported_by_name AS reportedByName,
                       v.vendor_name AS vendorName,
                       m.service_type AS serviceType,
                       m.priority,
                       m.service_date AS serviceDate,
                       m.expected_completion_date AS expectedCompletionDate,
                       m.completion_date AS completionDate,
                       m.downtime_hours AS downtimeHours,
                       m.warranty_claim AS warrantyClaim,
                       m.approval_status AS approvalStatus,
                       m.maintenance_cost AS maintenanceCost,
                       m.maintenance_status AS status
                FROM maintenance_records m
                INNER JOIN assets a ON a.asset_id = m.asset_id
                LEFT JOIN vendors v ON v.vendor_id = m.vendor_id
                ORDER BY COALESCE(m.service_date, DATE(m.updated_at)) DESC, m.maintenance_code;
                """,
            ["warranty"] = """
                SELECT a.asset_id AS id,
                       a.asset_tag AS assetTag,
                       a.asset_name AS assetName,
                       a.category,
                       a.brand,
                       current_department.department_name AS department,
                       a.purchase_date AS purchaseDate,
                       a.warranty_expiry AS warrantyExpiry,
                       DATEDIFF(a.warranty_expiry, CURDATE()) AS daysRemaining,
                       CASE
                           WHEN a.warranty_expiry < CURDATE() THEN 'Expired'
                           WHEN a.warranty_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring Soon'
                           ELSE 'Active'
                       END AS warrantyStatus,
                       a.asset_status AS status
                FROM assets a
                LEFT JOIN departments current_department
                    ON current_department.department_id = a.current_department_id
                WHERE a.warranty_expiry IS NOT NULL
                ORDER BY a.warranty_expiry ASC, a.asset_tag;
                """,
            ["damaged"] = """
                SELECT a.asset_id AS id,
                       a.asset_tag AS assetTag,
                       a.asset_name AS assetName,
                       a.category,
                       a.brand,
                       current_department.department_name AS department,
                       a.current_receiver_name AS assignedTo,
                       a.asset_condition AS assetCondition,
                       a.asset_status AS status,
                       latest_return.return_condition AS lastReturnCondition,
                       latest_return.damage_decision AS damageDecision,
                       latest_return.inspection_status AS inspectionStatus,
                       latest_maintenance.maintenance_status AS maintenanceStatus,
                       latest_maintenance.priority AS maintenancePriority
                FROM assets a
                LEFT JOIN departments current_department
                    ON current_department.department_id = a.current_department_id
                LEFT JOIN returns latest_return
                    ON latest_return.return_id = (
                        SELECT r.return_id
                        FROM returns r
                        WHERE r.asset_id = a.asset_id
                        ORDER BY r.return_date DESC, r.return_id DESC
                        LIMIT 1
                    )
                LEFT JOIN maintenance_records latest_maintenance
                    ON latest_maintenance.maintenance_id = (
                        SELECT m.maintenance_id
                        FROM maintenance_records m
                        WHERE m.asset_id = a.asset_id
                        ORDER BY COALESCE(m.service_date, DATE(m.updated_at)) DESC, m.maintenance_id DESC
                        LIMIT 1
                    )
                WHERE a.asset_condition IN ('Damaged', 'Needs Repair')
                   OR a.asset_status = 'Damaged'
                   OR latest_return.return_condition = 'Damaged'
                   OR latest_return.damage_decision IN ('Repair Required', 'Write-off Required')
                ORDER BY a.updated_at DESC, a.asset_tag;
                """
        };

    public IReadOnlyList<string> GetAvailableReportTypes() => ReportQueries.Keys.OrderBy(type => type).ToArray();

    public async Task<ReportDataResponse?> GetReportAsync(string reportType, CancellationToken cancellationToken)
    {
        if (!ReportQueries.TryGetValue(reportType, out var sql))
        {
            return null;
        }

        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await using var command = new MySqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var records = new List<IReadOnlyDictionary<string, object?>>();
        while (await reader.ReadAsync(cancellationToken))
        {
            records.Add(ReadRecord(reader));
        }

        return new ReportDataResponse(
            ReportType: reportType,
            GeneratedAtUtc: DateTimeOffset.UtcNow,
            TotalRecords: records.Count,
            Records: records);
    }

    private static IReadOnlyDictionary<string, object?> ReadRecord(MySqlDataReader reader)
    {
        var record = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);

        for (var index = 0; index < reader.FieldCount; index++)
        {
            var name = reader.GetName(index);
            var value = reader.IsDBNull(index) ? null : NormalizeValue(reader.GetValue(index));
            record[name] = value;
        }

        return record;
    }

    private static object? NormalizeValue(object value)
    {
        return value switch
        {
            DateTime dateTime when dateTime.TimeOfDay == TimeSpan.Zero => dateTime.ToString("yyyy-MM-dd"),
            DateTime dateTime => new DateTimeOffset(DateTime.SpecifyKind(dateTime, DateTimeKind.Local)),
            ulong unsignedValue => Convert.ToInt64(unsignedValue),
            uint unsignedValue => Convert.ToInt64(unsignedValue),
            ushort unsignedValue => Convert.ToInt32(unsignedValue),
            sbyte signedValue => Convert.ToInt32(signedValue),
            byte byteValue => Convert.ToInt32(byteValue),
            _ => value
        };
    }
}
