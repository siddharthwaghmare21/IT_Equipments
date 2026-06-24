-- IT Equipment Management - SMKC local database setup
-- Run as a MySQL admin/root user in MySQL Workbench.
-- Do not store real passwords in this file.

CREATE DATABASE IF NOT EXISTS it_equipment_management_smkc
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- App user already created manually.
-- If you need to recreate grants, replace Siddharth only if your local app user is different.
GRANT ALL PRIVILEGES ON it_equipment_management_smkc.*
TO 'Siddharth'@'localhost';

FLUSH PRIVILEGES;

SHOW DATABASES LIKE 'it_equipment_management_smkc';
SHOW GRANTS FOR 'Siddharth'@'localhost';
