-- IT Equipment Management - SMKC seed data
-- Run this script after 002_base_schema.sql.
-- Super Admin user will be created after backend password hashing is ready.

USE it_equipment_management_smkc;

INSERT IGNORE INTO roles (role_name, role_code, description, is_system_role, is_active)
VALUES
  ('Super Admin', 'SUPER_ADMIN', 'Full access, user approval, role management, settings, backup and export control.', TRUE, TRUE),
  ('Admin', 'ADMIN', 'Most module access, request approvals and asset workflow control.', TRUE, TRUE),
  ('Employee', 'EMPLOYEE', 'Create and update asset workflow records with report access.', TRUE, TRUE),
  ('Viewer', 'VIEWER', 'Read-only access to reports and records.', TRUE, TRUE);

UPDATE roles
SET
  description = CASE role_code
    WHEN 'SUPER_ADMIN' THEN 'Full access, user approval, role management, settings, backup and export control.'
    WHEN 'ADMIN' THEN 'Most module access, request approvals and asset workflow control.'
    WHEN 'EMPLOYEE' THEN 'Create and update asset workflow records with report access.'
    WHEN 'VIEWER' THEN 'Read-only access to reports and records.'
    ELSE description
  END,
  is_system_role = TRUE,
  is_active = TRUE
WHERE role_code IN ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'VIEWER');

INSERT IGNORE INTO departments (
  department_code,
  department_name,
  department_head,
  contact_email,
  contact_phone,
  location,
  description,
  is_active
)
VALUES
  ('IT-DEPT', 'IT Department', NULL, NULL, NULL, 'Main Office', 'Primary IT operations and support department.', TRUE),
  ('IT-STORE', 'IT Store', NULL, NULL, NULL, 'Store Room', 'IT equipment stock and spare inventory location.', TRUE),
  ('ACCOUNTS', 'Accounts', NULL, NULL, NULL, 'Main Office', 'Finance, billing, invoices and payment documentation.', TRUE),
  ('ADMIN', 'Admin', NULL, NULL, NULL, 'Main Office', 'Administration and office operations.', TRUE),
  ('HR', 'HR', NULL, NULL, NULL, 'Main Office', 'Human resources department.', TRUE),
  ('OPERATIONS', 'Operations', NULL, NULL, NULL, 'Main Office', 'Operations and field coordination department.', TRUE);

UPDATE departments
SET
  department_name = CASE department_code
    WHEN 'IT-DEPT' THEN 'IT Department'
    WHEN 'IT-STORE' THEN 'IT Store'
    WHEN 'ACCOUNTS' THEN 'Accounts'
    WHEN 'ADMIN' THEN 'Admin'
    WHEN 'HR' THEN 'HR'
    WHEN 'OPERATIONS' THEN 'Operations'
    ELSE department_name
  END,
  location = CASE department_code
    WHEN 'IT-STORE' THEN 'Store Room'
    ELSE 'Main Office'
  END,
  description = CASE department_code
    WHEN 'IT-DEPT' THEN 'Primary IT operations and support department.'
    WHEN 'IT-STORE' THEN 'IT equipment stock and spare inventory location.'
    WHEN 'ACCOUNTS' THEN 'Finance, billing, invoices and payment documentation.'
    WHEN 'ADMIN' THEN 'Administration and office operations.'
    WHEN 'HR' THEN 'Human resources department.'
    WHEN 'OPERATIONS' THEN 'Operations and field coordination department.'
    ELSE description
  END,
  is_active = TRUE
WHERE department_code IN ('IT-DEPT', 'IT-STORE', 'ACCOUNTS', 'ADMIN', 'HR', 'OPERATIONS');

INSERT IGNORE INTO system_settings (
  setting_group,
  setting_key,
  setting_value,
  value_type,
  description,
  is_public
)
VALUES
  ('company', 'company_name', 'Sangli Miraj Kupwad Municipal Corporation', 'String', 'Company or department name shown in reports.', TRUE),
  ('company', 'company_email', 'it@smkc.gov.in', 'String', 'Company or IT department email shown in reports.', TRUE),
  ('company', 'company_phone', '', 'String', 'Company or IT department phone shown in reports.', TRUE),
  ('company', 'company_address', 'Sangli, Miraj and Kupwad, Maharashtra, India', 'String', 'Company address shown in reports.', TRUE),
  ('reports', 'report_logo_text', 'SMKC', 'String', 'Short text used in report letterhead logo.', TRUE),
  ('reports', 'report_prepared_by', 'IT Department', 'String', 'Default prepared-by value for reports.', TRUE),
  ('reports', 'report_classification', 'Internal', 'String', 'Default report classification.', TRUE),
  ('assets', 'asset_tag_prefix', 'IT', 'String', 'Default asset tag prefix.', FALSE),
  ('backup', 'backup_frequency', 'Weekly', 'String', 'Default backup frequency after backend jobs are enabled.', FALSE),
  ('security', 'request_approval_required', 'true', 'Boolean', 'Require approval before new users can login.', FALSE);

UPDATE system_settings
SET setting_value = 'Sangli Miraj Kupwad Municipal Corporation', value_type = 'String', is_public = TRUE
WHERE setting_group = 'company' AND setting_key = 'company_name';

UPDATE system_settings
SET setting_value = 'it@smkc.gov.in', value_type = 'String', is_public = TRUE
WHERE setting_group = 'company' AND setting_key = 'company_email';

UPDATE system_settings
SET setting_value = '', value_type = 'String', is_public = TRUE
WHERE setting_group = 'company' AND setting_key = 'company_phone';

UPDATE system_settings
SET setting_value = 'Sangli, Miraj and Kupwad, Maharashtra, India', value_type = 'String', is_public = TRUE
WHERE setting_group = 'company' AND setting_key = 'company_address';

UPDATE system_settings
SET setting_value = 'SMKC', value_type = 'String', is_public = TRUE
WHERE setting_group = 'reports' AND setting_key = 'report_logo_text';

UPDATE system_settings
SET setting_value = 'IT Department', value_type = 'String', is_public = TRUE
WHERE setting_group = 'reports' AND setting_key = 'report_prepared_by';

UPDATE system_settings
SET setting_value = 'Internal', value_type = 'String', is_public = TRUE
WHERE setting_group = 'reports' AND setting_key = 'report_classification';

UPDATE system_settings
SET setting_value = 'IT', value_type = 'String', is_public = FALSE
WHERE setting_group = 'assets' AND setting_key = 'asset_tag_prefix';

UPDATE system_settings
SET setting_value = 'Weekly', value_type = 'String', is_public = FALSE
WHERE setting_group = 'backup' AND setting_key = 'backup_frequency';

UPDATE system_settings
SET setting_value = 'true', value_type = 'Boolean', is_public = FALSE
WHERE setting_group = 'security' AND setting_key = 'request_approval_required';

INSERT INTO activity_logs (
  user_id,
  module_name,
  action_name,
  entity_name,
  entity_id,
  description,
  status
)
VALUES (
  NULL,
  'System',
  'Seed Data Applied',
  'Database',
  NULL,
  'Initial SMKC roles, departments and default settings were inserted.',
  'Success'
);

SELECT 'roles' AS table_name, COUNT(*) AS total_records FROM roles
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs;
