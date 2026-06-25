USE it_equipment_management_smkc;

SELECT expected.role_code AS missing_role_code
FROM (
  SELECT 'SUPER_ADMIN' AS role_code UNION ALL
  SELECT 'ADMIN' UNION ALL
  SELECT 'EMPLOYEE' UNION ALL
  SELECT 'VIEWER'
) expected
LEFT JOIN roles actual
  ON actual.role_code = expected.role_code
WHERE actual.role_id IS NULL;

SELECT expected.department_code AS missing_department_code
FROM (
  SELECT 'IT-DEPT' AS department_code UNION ALL
  SELECT 'IT-STORE' UNION ALL
  SELECT 'ACCOUNTS' UNION ALL
  SELECT 'ADMIN' UNION ALL
  SELECT 'HR' UNION ALL
  SELECT 'OPERATIONS'
) expected
LEFT JOIN departments actual
  ON actual.department_code = expected.department_code
WHERE actual.department_id IS NULL;

SELECT expected.setting_name AS missing_setting
FROM (
  SELECT 'company.company_name' AS setting_name UNION ALL
  SELECT 'company.company_email' UNION ALL
  SELECT 'company.company_phone' UNION ALL
  SELECT 'company.company_address' UNION ALL
  SELECT 'reports.report_logo_text' UNION ALL
  SELECT 'reports.report_prepared_by' UNION ALL
  SELECT 'reports.report_classification' UNION ALL
  SELECT 'assets.asset_tag_prefix' UNION ALL
  SELECT 'backup.backup_frequency' UNION ALL
  SELECT 'backup.backup_retention_days' UNION ALL
  SELECT 'backup.backup_storage_path' UNION ALL
  SELECT 'exports.default_export_format' UNION ALL
  SELECT 'exports.export_retention_days' UNION ALL
  SELECT 'imports.max_import_rows' UNION ALL
  SELECT 'security.request_approval_required'
) expected
LEFT JOIN system_settings actual
  ON CONCAT(actual.setting_group, '.', actual.setting_key) = expected.setting_name
WHERE actual.setting_id IS NULL;

SELECT
  role_id,
  role_name,
  role_code,
  is_system_role,
  is_active
FROM roles
ORDER BY role_id;

SELECT
  department_id,
  department_code,
  department_name,
  location,
  is_active
FROM departments
ORDER BY department_name;

SELECT
  setting_group,
  setting_key,
  setting_value,
  value_type,
  is_public
FROM system_settings
ORDER BY setting_group, setting_key;

SELECT
  module_name,
  action_name,
  entity_name,
  status,
  created_at
FROM activity_logs
ORDER BY activity_log_id DESC
LIMIT 10;

SELECT 'roles' AS table_name, COUNT(*) AS total_records FROM roles
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL
SELECT 'backup_jobs', COUNT(*) FROM backup_jobs
UNION ALL
SELECT 'export_jobs', COUNT(*) FROM export_jobs
UNION ALL
SELECT 'import_jobs', COUNT(*) FROM import_jobs;
