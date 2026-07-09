-- IT Equipment Management - department demand tracking
-- Stores demand counts from department-wise stock sheets.

USE it_equipment_management_smkc;

CREATE TABLE IF NOT EXISTS department_demands (
  demand_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  department_id BIGINT UNSIGNED NOT NULL,
  demand_count INT UNSIGNED NOT NULL DEFAULT 0,
  source VARCHAR(100) NOT NULL DEFAULT 'Excel Import',
  remarks VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (demand_id),
  UNIQUE KEY uq_department_demands_department (department_id),
  KEY idx_department_demands_count (demand_count),
  CONSTRAINT fk_department_demands_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
