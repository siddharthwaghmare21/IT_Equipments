USE it_equipment_management_smkc;

CREATE TABLE IF NOT EXISTS backup_jobs (
  backup_job_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  backup_type ENUM('Manual', 'Scheduled') NOT NULL DEFAULT 'Manual',
  backup_scope ENUM('Full Database', 'Schema Only', 'Data Only') NOT NULL DEFAULT 'Full Database',
  backup_status ENUM('Pending', 'Running', 'Completed', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  requested_by BIGINT UNSIGNED NULL,
  approved_by BIGINT UNSIGNED NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  file_name VARCHAR(255) NULL,
  file_path VARCHAR(500) NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  checksum_sha256 VARCHAR(64) NULL,
  error_message TEXT NULL,
  remarks TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (backup_job_id),
  KEY idx_backup_jobs_status (backup_status),
  KEY idx_backup_jobs_type (backup_type),
  KEY idx_backup_jobs_created_at (created_at),
  KEY idx_backup_jobs_requested_by (requested_by),
  CONSTRAINT fk_backup_jobs_requested_by
    FOREIGN KEY (requested_by) REFERENCES users(user_id),
  CONSTRAINT fk_backup_jobs_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS export_jobs (
  export_job_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  export_type ENUM('PDF', 'Excel', 'CSV') NOT NULL,
  export_module VARCHAR(100) NOT NULL,
  export_status ENUM('Pending', 'Running', 'Completed', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  requested_by BIGINT UNSIGNED NULL,
  filter_json JSON NULL,
  sort_json JSON NULL,
  file_name VARCHAR(255) NULL,
  file_path VARCHAR(500) NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  row_count INT UNSIGNED NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  error_message TEXT NULL,
  remarks TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (export_job_id),
  KEY idx_export_jobs_module (export_module),
  KEY idx_export_jobs_type (export_type),
  KEY idx_export_jobs_status (export_status),
  KEY idx_export_jobs_created_at (created_at),
  KEY idx_export_jobs_requested_by (requested_by),
  CONSTRAINT fk_export_jobs_requested_by
    FOREIGN KEY (requested_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS import_jobs (
  import_job_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  import_module VARCHAR(100) NOT NULL,
  import_status ENUM('Pending', 'Validating', 'Ready', 'Imported', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  requested_by BIGINT UNSIGNED NULL,
  source_file_name VARCHAR(255) NULL,
  source_file_path VARCHAR(500) NULL,
  source_file_size_bytes BIGINT UNSIGNED NULL,
  total_rows INT UNSIGNED NULL,
  valid_rows INT UNSIGNED NULL,
  invalid_rows INT UNSIGNED NULL,
  imported_rows INT UNSIGNED NULL,
  validation_summary_json JSON NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  error_message TEXT NULL,
  remarks TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (import_job_id),
  KEY idx_import_jobs_module (import_module),
  KEY idx_import_jobs_status (import_status),
  KEY idx_import_jobs_created_at (created_at),
  KEY idx_import_jobs_requested_by (requested_by),
  CONSTRAINT fk_import_jobs_requested_by
    FOREIGN KEY (requested_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO system_settings (
  setting_group,
  setting_key,
  setting_value,
  value_type,
  description,
  is_public
)
VALUES
  ('backup', 'backup_retention_days', '30', 'Number', 'How many days backup records/files should be retained.', FALSE),
  ('backup', 'backup_storage_path', '', 'String', 'Server path or storage location used for database backups.', FALSE),
  ('exports', 'default_export_format', 'Excel', 'String', 'Default export format for report downloads.', FALSE),
  ('exports', 'export_retention_days', '7', 'Number', 'How many days generated export files should be retained.', FALSE),
  ('imports', 'max_import_rows', '5000', 'Number', 'Maximum rows allowed in one import file.', FALSE);

INSERT INTO activity_logs (
  module_name,
  action_name,
  entity_name,
  description,
  status
)
VALUES (
  'Database',
  'Backup export tracking schema ensured',
  'backup_jobs/export_jobs/import_jobs',
  'Backup, export and import tracking tables were created or verified.',
  'Success'
);

SELECT table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('backup_jobs', 'export_jobs', 'import_jobs')
ORDER BY table_name;
