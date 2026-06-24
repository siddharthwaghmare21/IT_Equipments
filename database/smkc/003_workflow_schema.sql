-- IT Equipment Management - SMKC workflow schema
-- Run this script after 002_base_schema.sql and 004_seed_data.sql.

USE it_equipment_management_smkc;

CREATE TABLE IF NOT EXISTS assets (
  asset_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_tag VARCHAR(80) NOT NULL,
  asset_name VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NULL,
  model VARCHAR(120) NULL,
  serial_number VARCHAR(150) NOT NULL,
  work_order_ref VARCHAR(80) NULL,
  invoice_number VARCHAR(100) NULL,
  purchase_date DATE NULL,
  warranty_expiry DATE NULL,
  custodian_department_id BIGINT UNSIGNED NULL,
  current_department_id BIGINT UNSIGNED NULL,
  current_receiver_name VARCHAR(150) NULL,
  location VARCHAR(200) NULL,
  asset_condition ENUM('New', 'Good', 'Working', 'Needs Repair', 'Damaged', 'Retired') NOT NULL DEFAULT 'New',
  lifecycle_status ENUM('In Stock', 'In Use', 'Under Maintenance', 'Returned', 'Archived', 'Scrapped') NOT NULL DEFAULT 'In Stock',
  asset_status ENUM('Available', 'Delivered', 'Maintenance', 'Damaged', 'Archived', 'Scrapped') NOT NULL DEFAULT 'Available',
  qr_code VARCHAR(150) NULL,
  specifications TEXT NULL,
  description TEXT NULL,
  remarks TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (asset_id),
  UNIQUE KEY uq_assets_asset_tag (asset_tag),
  UNIQUE KEY uq_assets_serial_number (serial_number),
  KEY idx_assets_category (category),
  KEY idx_assets_status (asset_status),
  KEY idx_assets_lifecycle_status (lifecycle_status),
  KEY idx_assets_current_department (current_department_id),
  KEY idx_assets_warranty_expiry (warranty_expiry),
  CONSTRAINT fk_assets_custodian_department
    FOREIGN KEY (custodian_department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_assets_current_department
    FOREIGN KEY (current_department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_assets_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_assets_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS asset_documents (
  document_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('Invoice', 'Warranty Card', 'Acknowledgement', 'Photo', 'Other') NOT NULL DEFAULT 'Other',
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  mime_type VARCHAR(120) NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (document_id),
  KEY idx_asset_documents_asset_id (asset_id),
  KEY idx_asset_documents_type (document_type),
  CONSTRAINT fk_asset_documents_asset
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
  CONSTRAINT fk_asset_documents_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS asset_lifecycle_history (
  history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  asset_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  from_department_id BIGINT UNSIGNED NULL,
  to_department_id BIGINT UNSIGNED NULL,
  receiver_name VARCHAR(150) NULL,
  event_status VARCHAR(80) NULL,
  event_notes TEXT NULL,
  performed_by BIGINT UNSIGNED NULL,
  performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_asset_history_asset_id (asset_id),
  KEY idx_asset_history_event_type (event_type),
  KEY idx_asset_history_performed_at (performed_at),
  CONSTRAINT fk_asset_history_asset
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
  CONSTRAINT fk_asset_history_from_department
    FOREIGN KEY (from_department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_asset_history_to_department
    FOREIGN KEY (to_department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_asset_history_performed_by
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_orders (
  work_order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  work_order_number VARCHAR(80) NOT NULL,
  vendor_id BIGINT UNSIGNED NOT NULL,
  invoice_number VARCHAR(100) NULL,
  work_order_date DATE NOT NULL,
  expected_delivery_date DATE NULL,
  received_date DATE NULL,
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  approval_status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  payment_status ENUM('Pending', 'Partial', 'Paid', 'Not Required') NOT NULL DEFAULT 'Pending',
  received_status ENUM('Pending', 'Partially Received', 'Fully Received') NOT NULL DEFAULT 'Pending',
  invoice_status ENUM('Pending', 'Uploaded', 'Not Required') NOT NULL DEFAULT 'Pending',
  work_order_status ENUM('Draft', 'Ordered', 'Received', 'Cancelled') NOT NULL DEFAULT 'Draft',
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  remarks TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (work_order_id),
  UNIQUE KEY uq_work_orders_number (work_order_number),
  KEY idx_work_orders_vendor_id (vendor_id),
  KEY idx_work_orders_date (work_order_date),
  KEY idx_work_orders_status (work_order_status),
  CONSTRAINT fk_work_orders_vendor
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
  CONSTRAINT fk_work_orders_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
  CONSTRAINT fk_work_orders_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_work_orders_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_order_items (
  work_order_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  work_order_id BIGINT UNSIGNED NOT NULL,
  item_name VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  warranty VARCHAR(120) NULL,
  specifications TEXT NULL,
  description TEXT NULL,
  PRIMARY KEY (work_order_item_id),
  KEY idx_work_order_items_work_order_id (work_order_id),
  CONSTRAINT fk_work_order_items_work_order
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_order_documents (
  document_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  work_order_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('Work Order', 'Invoice', 'Quotation', 'Warranty', 'Other') NOT NULL DEFAULT 'Other',
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (document_id),
  KEY idx_work_order_documents_work_order_id (work_order_id),
  CONSTRAINT fk_work_order_documents_work_order
    FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
  CONSTRAINT fk_work_order_documents_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deliveries (
  delivery_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  delivery_code VARCHAR(80) NOT NULL,
  asset_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NOT NULL,
  receiver_name VARCHAR(150) NOT NULL,
  delivery_date DATE NOT NULL,
  delivered_by BIGINT UNSIGNED NULL,
  accessories TEXT NULL,
  acknowledgement_status ENUM('Pending', 'Acknowledged', 'Rejected') NOT NULL DEFAULT 'Pending',
  delivery_status ENUM('Pending', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  remarks TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (delivery_id),
  UNIQUE KEY uq_deliveries_code (delivery_code),
  KEY idx_deliveries_asset_id (asset_id),
  KEY idx_deliveries_department_id (department_id),
  KEY idx_deliveries_date (delivery_date),
  CONSTRAINT fk_deliveries_asset
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  CONSTRAINT fk_deliveries_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_deliveries_delivered_by
    FOREIGN KEY (delivered_by) REFERENCES users(user_id),
  CONSTRAINT fk_deliveries_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_deliveries_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transfers (
  transfer_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transfer_code VARCHAR(80) NOT NULL,
  transfer_type ENUM('Department Transfer', 'IT Collection', 'Reassignment', 'Repair Return', 'Temporary Handover') NOT NULL DEFAULT 'Department Transfer',
  asset_id BIGINT UNSIGNED NOT NULL,
  from_department_id BIGINT UNSIGNED NULL,
  to_department_id BIGINT UNSIGNED NULL,
  current_receiver_name VARCHAR(150) NULL,
  new_receiver_name VARCHAR(150) NULL,
  transfer_reason VARCHAR(150) NULL,
  accessories TEXT NULL,
  condition_at_transfer ENUM('Good', 'Working', 'Needs Inspection', 'Needs Repair', 'Damaged') NOT NULL DEFAULT 'Good',
  collection_date DATE NULL,
  collected_by BIGINT UNSIGNED NULL,
  issue_date DATE NULL,
  handover_acknowledgement ENUM('Pending', 'Acknowledged', 'Rejected') NOT NULL DEFAULT 'Pending',
  new_acknowledgement ENUM('Pending', 'Acknowledged', 'Rejected') NOT NULL DEFAULT 'Pending',
  transfer_status ENUM('Pending', 'Collected by IT', 'Reassigned', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  remarks TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (transfer_id),
  UNIQUE KEY uq_transfers_code (transfer_code),
  KEY idx_transfers_asset_id (asset_id),
  KEY idx_transfers_from_department (from_department_id),
  KEY idx_transfers_to_department (to_department_id),
  KEY idx_transfers_status (transfer_status),
  CONSTRAINT fk_transfers_asset
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  CONSTRAINT fk_transfers_from_department
    FOREIGN KEY (from_department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_transfers_to_department
    FOREIGN KEY (to_department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_transfers_collected_by
    FOREIGN KEY (collected_by) REFERENCES users(user_id),
  CONSTRAINT fk_transfers_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_transfers_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS returns (
  return_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  return_code VARCHAR(80) NOT NULL,
  delivery_id BIGINT UNSIGNED NULL,
  asset_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  returned_by_name VARCHAR(150) NOT NULL,
  return_date DATE NOT NULL,
  return_condition ENUM('Good', 'Working', 'Needs Inspection', 'Needs Repair', 'Damaged', 'Missing Accessories') NOT NULL DEFAULT 'Good',
  received_by BIGINT UNSIGNED NULL,
  received_location VARCHAR(200) NULL,
  acknowledgement_status ENUM('Pending', 'Acknowledged', 'Rejected') NOT NULL DEFAULT 'Pending',
  inspection_status ENUM('Pending', 'Completed', 'Damage Review') NOT NULL DEFAULT 'Pending',
  inspection_by BIGINT UNSIGNED NULL,
  damage_decision ENUM('Pending', 'No Damage', 'Repair Required', 'Write-off Required') NOT NULL DEFAULT 'Pending',
  return_status ENUM('Returned', 'Damaged', 'Pending Inspection', 'Under Review', 'Rejected') NOT NULL DEFAULT 'Returned',
  remarks TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (return_id),
  UNIQUE KEY uq_returns_code (return_code),
  KEY idx_returns_asset_id (asset_id),
  KEY idx_returns_department_id (department_id),
  KEY idx_returns_date (return_date),
  CONSTRAINT fk_returns_delivery
    FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id),
  CONSTRAINT fk_returns_asset
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  CONSTRAINT fk_returns_department
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_returns_received_by
    FOREIGN KEY (received_by) REFERENCES users(user_id),
  CONSTRAINT fk_returns_inspection_by
    FOREIGN KEY (inspection_by) REFERENCES users(user_id),
  CONSTRAINT fk_returns_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_returns_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_records (
  maintenance_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  maintenance_code VARCHAR(80) NOT NULL,
  asset_id BIGINT UNSIGNED NOT NULL,
  issue_type VARCHAR(150) NOT NULL,
  reported_by_name VARCHAR(150) NULL,
  vendor_id BIGINT UNSIGNED NULL,
  service_type VARCHAR(150) NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  service_date DATE NULL,
  expected_completion_date DATE NULL,
  completion_date DATE NULL,
  downtime_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  warranty_claim BOOLEAN NOT NULL DEFAULT FALSE,
  approval_status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
  maintenance_cost DECIMAL(14,2) NOT NULL DEFAULT 0,
  maintenance_status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  remarks TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (maintenance_id),
  UNIQUE KEY uq_maintenance_code (maintenance_code),
  KEY idx_maintenance_asset_id (asset_id),
  KEY idx_maintenance_vendor_id (vendor_id),
  KEY idx_maintenance_status (maintenance_status),
  KEY idx_maintenance_priority (priority),
  CONSTRAINT fk_maintenance_asset
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
  CONSTRAINT fk_maintenance_vendor
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
  CONSTRAINT fk_maintenance_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_maintenance_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approval_requests (
  approval_request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_type ENUM('User Access', 'Transfer', 'High Value Asset', 'Backup', 'Other') NOT NULL DEFAULT 'Other',
  entity_name VARCHAR(120) NULL,
  entity_id BIGINT UNSIGNED NULL,
  requested_by BIGINT UNSIGNED NULL,
  requested_role_id BIGINT UNSIGNED NULL,
  approval_status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  remarks TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (approval_request_id),
  KEY idx_approval_requests_type (request_type),
  KEY idx_approval_requests_status (approval_status),
  KEY idx_approval_requests_requested_by (requested_by),
  CONSTRAINT fk_approval_requests_requested_by
    FOREIGN KEY (requested_by) REFERENCES users(user_id),
  CONSTRAINT fk_approval_requests_requested_role
    FOREIGN KEY (requested_role_id) REFERENCES roles(role_id),
  CONSTRAINT fk_approval_requests_approved_by
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  related_entity_name VARCHAR(120) NULL,
  related_entity_id BIGINT UNSIGNED NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_is_read (is_read),
  KEY idx_notifications_created_at (created_at),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
    'assets',
    'asset_documents',
    'asset_lifecycle_history',
    'work_orders',
    'work_order_items',
    'work_order_documents',
    'deliveries',
    'transfers',
    'returns',
    'maintenance_records',
    'approval_requests',
    'notifications'
  )
ORDER BY table_name;
