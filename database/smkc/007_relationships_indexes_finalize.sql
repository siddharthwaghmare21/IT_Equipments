USE it_equipment_management_smkc;

DELIMITER $$

CREATE PROCEDURE add_index_if_missing(
  IN p_table_name VARCHAR(128),
  IN p_index_name VARCHAR(128),
  IN p_index_columns TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name
  ) THEN
    SET @add_index_sql = CONCAT(
      'ALTER TABLE `',
      p_table_name,
      '` ADD INDEX `',
      p_index_name,
      '` (',
      p_index_columns,
      ')'
    );

    PREPARE add_index_statement FROM @add_index_sql;
    EXECUTE add_index_statement;
    DEALLOCATE PREPARE add_index_statement;
  END IF;
END$$

DELIMITER ;

CALL add_index_if_missing('assets', 'idx_assets_custodian_department', '`custodian_department_id`');
CALL add_index_if_missing('assets', 'idx_assets_updated_at', '`updated_at`');
CALL add_index_if_missing('assets', 'idx_assets_status_category', '`asset_status`, `category`');

CALL add_index_if_missing('work_orders', 'idx_work_orders_approval_status', '`approval_status`');
CALL add_index_if_missing('work_orders', 'idx_work_orders_payment_status', '`payment_status`');
CALL add_index_if_missing('work_orders', 'idx_work_orders_received_status', '`received_status`');
CALL add_index_if_missing('work_orders', 'idx_work_orders_invoice_status', '`invoice_status`');
CALL add_index_if_missing('work_orders', 'idx_work_orders_updated_at', '`updated_at`');

CALL add_index_if_missing('deliveries', 'idx_deliveries_status', '`delivery_status`');
CALL add_index_if_missing('deliveries', 'idx_deliveries_acknowledgement', '`acknowledgement_status`');
CALL add_index_if_missing('deliveries', 'idx_deliveries_updated_at', '`updated_at`');

CALL add_index_if_missing('transfers', 'idx_transfers_collection_date', '`collection_date`');
CALL add_index_if_missing('transfers', 'idx_transfers_issue_date', '`issue_date`');
CALL add_index_if_missing('transfers', 'idx_transfers_updated_at', '`updated_at`');

CALL add_index_if_missing('returns', 'idx_returns_delivery_id', '`delivery_id`');
CALL add_index_if_missing('returns', 'idx_returns_status', '`return_status`');
CALL add_index_if_missing('returns', 'idx_returns_inspection_status', '`inspection_status`');
CALL add_index_if_missing('returns', 'idx_returns_updated_at', '`updated_at`');

CALL add_index_if_missing('maintenance_records', 'idx_maintenance_service_date', '`service_date`');
CALL add_index_if_missing('maintenance_records', 'idx_maintenance_completion_date', '`completion_date`');
CALL add_index_if_missing('maintenance_records', 'idx_maintenance_approval_status', '`approval_status`');
CALL add_index_if_missing('maintenance_records', 'idx_maintenance_updated_at', '`updated_at`');

CALL add_index_if_missing('approval_requests', 'idx_approval_requests_created_at', '`created_at`');
CALL add_index_if_missing('approval_requests', 'idx_approval_requests_approved_by', '`approved_by`');

CALL add_index_if_missing('notifications', 'idx_notifications_type', '`notification_type`');
CALL add_index_if_missing('notifications', 'idx_notifications_related_entity', '`related_entity_name`, `related_entity_id`');

DROP PROCEDURE add_index_if_missing;

INSERT INTO activity_logs (
  module_name,
  action_name,
  entity_name,
  description,
  status
)
VALUES (
  'Database',
  'Relationships and indexes finalized',
  'schema',
  'Relationship/index finalization script was executed.',
  'Success'
);

SELECT expected.table_name AS missing_table
FROM (
  SELECT 'roles' AS table_name UNION ALL
  SELECT 'departments' UNION ALL
  SELECT 'users' UNION ALL
  SELECT 'vendors' UNION ALL
  SELECT 'system_settings' UNION ALL
  SELECT 'activity_logs' UNION ALL
  SELECT 'assets' UNION ALL
  SELECT 'asset_documents' UNION ALL
  SELECT 'asset_lifecycle_history' UNION ALL
  SELECT 'work_orders' UNION ALL
  SELECT 'work_order_items' UNION ALL
  SELECT 'work_order_documents' UNION ALL
  SELECT 'deliveries' UNION ALL
  SELECT 'transfers' UNION ALL
  SELECT 'returns' UNION ALL
  SELECT 'maintenance_records' UNION ALL
  SELECT 'approval_requests' UNION ALL
  SELECT 'notifications' UNION ALL
  SELECT 'backup_jobs' UNION ALL
  SELECT 'export_jobs' UNION ALL
  SELECT 'import_jobs'
) expected
LEFT JOIN information_schema.tables actual
  ON actual.table_schema = DATABASE()
  AND actual.table_name = expected.table_name
WHERE actual.table_name IS NULL;

SELECT
  COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_type = 'BASE TABLE';

SELECT
  table_name,
  COUNT(*) AS foreign_key_count
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
  AND referenced_table_name IS NOT NULL
GROUP BY table_name
ORDER BY table_name;

SELECT
  table_name,
  index_name,
  GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ', ') AS indexed_columns
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND index_name <> 'PRIMARY'
GROUP BY table_name, index_name
ORDER BY table_name, index_name;
