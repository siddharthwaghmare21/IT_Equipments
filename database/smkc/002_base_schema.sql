-- IT Equipment Management - SMKC base schema
-- Run this script after 001_database_setup.sql.

USE it_equipment_management_smkc;

CREATE TABLE IF NOT EXISTS roles (
  role_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  role_code VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id),
  UNIQUE KEY uq_roles_role_name (role_name),
  UNIQUE KEY uq_roles_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
  department_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  department_code VARCHAR(50) NOT NULL,
  department_name VARCHAR(150) NOT NULL,
  department_head VARCHAR(150) NULL,
  contact_email VARCHAR(150) NULL,
  contact_phone VARCHAR(30) NULL,
  location VARCHAR(200) NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (department_id),
  UNIQUE KEY uq_departments_code (department_code),
  UNIQUE KEY uq_departments_name (department_name),
  KEY idx_departments_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  account_status ENUM('Pending', 'Active', 'Rejected', 'Suspended', 'Inactive') NOT NULL DEFAULT 'Pending',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at DATETIME NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_id (role_id),
  KEY idx_users_department_id (department_id),
  KEY idx_users_status (account_status),
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
  CONSTRAINT fk_users_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_users_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendors (
  vendor_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vendor_code VARCHAR(50) NOT NULL,
  vendor_name VARCHAR(180) NOT NULL,
  contact_person VARCHAR(150) NULL,
  contact_email VARCHAR(150) NULL,
  contact_phone VARCHAR(30) NULL,
  gst_number VARCHAR(50) NULL,
  address TEXT NULL,
  payment_terms VARCHAR(150) NULL,
  service_category VARCHAR(120) NULL,
  compliance_status ENUM('Compliant', 'Review Required', 'Blocked') NOT NULL DEFAULT 'Review Required',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (vendor_id),
  UNIQUE KEY uq_vendors_code (vendor_code),
  KEY idx_vendors_name (vendor_name),
  KEY idx_vendors_status (compliance_status),
  KEY idx_vendors_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
  setting_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_group VARCHAR(80) NOT NULL,
  setting_key VARCHAR(120) NOT NULL,
  setting_value TEXT NULL,
  value_type ENUM('String', 'Number', 'Boolean', 'Json') NOT NULL DEFAULT 'String',
  description VARCHAR(255) NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_id),
  UNIQUE KEY uq_settings_group_key (setting_group, setting_key),
  KEY idx_settings_group (setting_group),
  CONSTRAINT fk_settings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  activity_log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  module_name VARCHAR(80) NOT NULL,
  action_name VARCHAR(120) NOT NULL,
  entity_name VARCHAR(120) NULL,
  entity_id BIGINT UNSIGNED NULL,
  description TEXT NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  status ENUM('Success', 'Failed', 'Warning') NOT NULL DEFAULT 'Success',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_log_id),
  KEY idx_activity_logs_user_id (user_id),
  KEY idx_activity_logs_module (module_name),
  KEY idx_activity_logs_entity (entity_name, entity_id),
  KEY idx_activity_logs_created_at (created_at),
  CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
