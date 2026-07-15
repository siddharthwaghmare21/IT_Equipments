-- IT Equipment Management - SMKC report branding defaults
-- Updates only the original placeholder branding values.

USE it_equipment_management_smkc;

UPDATE system_settings
SET setting_value = 'Sangli Miraj Kupwad Municipal Corporation',
    value_type = 'String',
    is_public = TRUE
WHERE setting_group = 'company'
  AND setting_key = 'company_name'
  AND setting_value IN ('IT Assets Management', '');

UPDATE system_settings
SET setting_value = 'it@smkc.gov.in',
    value_type = 'String',
    is_public = TRUE
WHERE setting_group = 'company'
  AND setting_key = 'company_email'
  AND setting_value IN ('admin@company.com', '');

UPDATE system_settings
SET setting_value = '',
    value_type = 'String',
    is_public = TRUE
WHERE setting_group = 'company'
  AND setting_key = 'company_phone'
  AND setting_value = '+91 98765 43210';

UPDATE system_settings
SET setting_value = 'Sangli, Miraj and Kupwad, Maharashtra, India',
    value_type = 'String',
    is_public = TRUE
WHERE setting_group = 'company'
  AND setting_key = 'company_address'
  AND setting_value IN ('Main Office, Maharashtra, India', '');

UPDATE system_settings
SET setting_value = 'SMKC',
    value_type = 'String',
    is_public = TRUE
WHERE setting_group = 'reports'
  AND setting_key = 'report_logo_text'
  AND setting_value IN ('IT', '');
