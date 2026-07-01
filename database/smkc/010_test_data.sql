-- IT Equipment Management - non-destructive test data
-- This script adds clearly marked ITTEST records for final local testing.

USE it_equipment_management_smkc;

START TRANSACTION;

INSERT INTO departments (
  department_code, department_name, department_head, contact_email,
  contact_phone, location, description, is_active
)
VALUES
  ('ITTEST-IT', 'ITTEST IT Support', 'Aarav Kulkarni', 'ittest.it@example.com', '+91 90000 10001', 'Main Office - 2nd Floor', 'Test department for IT support workflows.', TRUE),
  ('ITTEST-FIN', 'ITTEST Finance', 'Neha Deshmukh', 'ittest.finance@example.com', '+91 90000 10002', 'Main Office - 1st Floor', 'Test department for finance workflows.', TRUE),
  ('ITTEST-HR', 'ITTEST Human Resources', 'Rohan Patil', 'ittest.hr@example.com', '+91 90000 10003', 'Admin Wing', 'Test department for HR workflows.', TRUE),
  ('ITTEST-OPS', 'ITTEST Operations', 'Priya Shah', 'ittest.ops@example.com', '+91 90000 10004', 'Operations Bay', 'Test department for operations workflows.', TRUE)
ON DUPLICATE KEY UPDATE
  department_head = VALUES(department_head),
  contact_email = VALUES(contact_email),
  contact_phone = VALUES(contact_phone),
  location = VALUES(location),
  description = VALUES(description),
  is_active = TRUE;

INSERT INTO vendors (
  vendor_code, vendor_name, contact_person, contact_email, contact_phone,
  gst_number, address, payment_terms, service_category, compliance_status, is_active
)
VALUES
  ('ITTEST-VEN-DELL', 'ITTEST Dell Partner', 'Kiran Joshi', 'dell.partner@example.com', '+91 90000 20001', '27ITTESTDELL1Z5', 'Pune, Maharashtra', '30 Days', 'Laptop and desktop supply', 'Compliant', TRUE),
  ('ITTEST-VEN-NET', 'ITTEST Network Solutions', 'Meera Iyer', 'network.solutions@example.com', '+91 90000 20002', '27ITTESTNET01Z8', 'Mumbai, Maharashtra', '15 Days', 'Network and accessories', 'Review Required', TRUE),
  ('ITTEST-VEN-SVC', 'ITTEST Service Care', 'Sahil Khan', 'service.care@example.com', '+91 90000 20003', '27ITTESTSVC01Z2', 'Nashik, Maharashtra', 'Immediate', 'Repair and maintenance', 'Compliant', TRUE)
ON DUPLICATE KEY UPDATE
  contact_person = VALUES(contact_person),
  contact_email = VALUES(contact_email),
  contact_phone = VALUES(contact_phone),
  gst_number = VALUES(gst_number),
  address = VALUES(address),
  payment_terms = VALUES(payment_terms),
  service_category = VALUES(service_category),
  compliance_status = VALUES(compliance_status),
  is_active = TRUE;

SET @it_dept_id = (SELECT department_id FROM departments WHERE department_code = 'ITTEST-IT');
SET @fin_dept_id = (SELECT department_id FROM departments WHERE department_code = 'ITTEST-FIN');
SET @hr_dept_id = (SELECT department_id FROM departments WHERE department_code = 'ITTEST-HR');
SET @ops_dept_id = (SELECT department_id FROM departments WHERE department_code = 'ITTEST-OPS');
SET @dell_vendor_id = (SELECT vendor_id FROM vendors WHERE vendor_code = 'ITTEST-VEN-DELL');
SET @net_vendor_id = (SELECT vendor_id FROM vendors WHERE vendor_code = 'ITTEST-VEN-NET');
SET @svc_vendor_id = (SELECT vendor_id FROM vendors WHERE vendor_code = 'ITTEST-VEN-SVC');
SET @admin_user_id = (SELECT user_id FROM users WHERE email = 'siddharthwaghmare2145@gmail.com' LIMIT 1);

INSERT INTO work_orders (
  work_order_number, vendor_id, invoice_number, work_order_date,
  expected_delivery_date, received_date, total_amount, approval_status,
  payment_status, received_status, invoice_status, work_order_status,
  approved_by, approved_at, remarks, created_by, updated_by
)
VALUES
  ('ITTEST-WO-001', @dell_vendor_id, 'ITTEST-INV-001', '2026-06-01', '2026-06-05', '2026-06-04', 245000.00, 'Approved', 'Paid', 'Fully Received', 'Uploaded', 'Received', @admin_user_id, NOW(), 'Test laptop purchase order.', @admin_user_id, @admin_user_id),
  ('ITTEST-WO-002', @net_vendor_id, 'ITTEST-INV-002', '2026-06-08', '2026-06-12', NULL, 86000.00, 'Pending', 'Partial', 'Partially Received', 'Pending', 'Ordered', NULL, NULL, 'Test network/accessory order.', @admin_user_id, @admin_user_id),
  ('ITTEST-WO-003', @svc_vendor_id, 'ITTEST-INV-003', '2026-06-10', '2026-06-15', '2026-06-14', 18000.00, 'Approved', 'Paid', 'Fully Received', 'Uploaded', 'Received', @admin_user_id, NOW(), 'Test service support order.', @admin_user_id, @admin_user_id)
ON DUPLICATE KEY UPDATE
  vendor_id = VALUES(vendor_id),
  invoice_number = VALUES(invoice_number),
  total_amount = VALUES(total_amount),
  approval_status = VALUES(approval_status),
  payment_status = VALUES(payment_status),
  received_status = VALUES(received_status),
  invoice_status = VALUES(invoice_status),
  work_order_status = VALUES(work_order_status),
  remarks = VALUES(remarks),
  updated_by = VALUES(updated_by);

SET @wo1_id = (SELECT work_order_id FROM work_orders WHERE work_order_number = 'ITTEST-WO-001');
SET @wo2_id = (SELECT work_order_id FROM work_orders WHERE work_order_number = 'ITTEST-WO-002');
SET @wo3_id = (SELECT work_order_id FROM work_orders WHERE work_order_number = 'ITTEST-WO-003');

DELETE FROM work_order_items WHERE work_order_id IN (@wo1_id, @wo2_id, @wo3_id);

INSERT INTO work_order_items (
  work_order_id, item_name, category, quantity, unit_price,
  total_amount, warranty, specifications, description
)
VALUES
  (@wo1_id, 'Latitude 7440 Laptop', 'Laptop', 3, 75000.00, 225000.00, '3 Years', 'Intel i7, 16GB RAM, 512GB SSD', 'Test laptop items.'),
  (@wo1_id, 'Wireless Mouse', 'Mouse', 5, 4000.00, 20000.00, '1 Year', 'Bluetooth mouse', 'Test accessories.'),
  (@wo2_id, '24 Port Switch', 'Network', 2, 28000.00, 56000.00, '3 Years', 'Gigabit managed switch', 'Test network switch.'),
  (@wo2_id, 'Patch Cable Bundle', 'Network', 30, 1000.00, 30000.00, '6 Months', 'CAT6 cables', 'Test network accessories.'),
  (@wo3_id, 'Preventive Service Pack', 'Other', 1, 18000.00, 18000.00, 'Not Applicable', 'On-site service', 'Test service package.');

INSERT INTO assets (
  asset_tag, asset_name, category, brand, model, serial_number,
  work_order_ref, invoice_number, purchase_date, warranty_expiry,
  custodian_department_id, current_department_id, current_receiver_name,
  location, asset_condition, lifecycle_status, asset_status, qr_code,
  specifications, description, remarks, created_by, updated_by
)
VALUES
  ('ITTEST-LAP-001', 'ITTEST Dell Latitude 7440', 'Laptop', 'Dell', 'Latitude 7440', 'ITTEST-SN-LAP-001', 'ITTEST-WO-001', 'ITTEST-INV-001', '2026-06-04', '2029-06-04', @it_dept_id, @fin_dept_id, 'Amit Finance', 'Finance Desk 01', 'New', 'In Use', 'Delivered', 'QR-ITTEST-LAP-001', 'Intel i7, 16GB RAM, 512GB SSD', 'Test finance laptop.', 'Random test data.', @admin_user_id, @admin_user_id),
  ('ITTEST-LAP-002', 'ITTEST Dell Latitude 7440 Spare', 'Laptop', 'Dell', 'Latitude 7440', 'ITTEST-SN-LAP-002', 'ITTEST-WO-001', 'ITTEST-INV-001', '2026-06-04', '2029-06-04', @it_dept_id, @it_dept_id, NULL, 'IT Store Rack A', 'New', 'In Stock', 'Available', 'QR-ITTEST-LAP-002', 'Intel i7, 16GB RAM, 512GB SSD', 'Test spare laptop.', 'Random test data.', @admin_user_id, @admin_user_id),
  ('ITTEST-MON-001', 'ITTEST Dell Monitor 24', 'Monitor', 'Dell', 'P2422H', 'ITTEST-SN-MON-001', 'ITTEST-WO-001', 'ITTEST-INV-001', '2026-06-04', '2029-06-04', @it_dept_id, @hr_dept_id, 'Riya HR', 'HR Desk 04', 'Good', 'In Use', 'Delivered', 'QR-ITTEST-MON-001', '24 inch IPS', 'Test HR monitor.', 'Random test data.', @admin_user_id, @admin_user_id),
  ('ITTEST-SW-001', 'ITTEST Managed Switch', 'Network', 'Cisco', 'CBS350', 'ITTEST-SN-SW-001', 'ITTEST-WO-002', 'ITTEST-INV-002', '2026-06-12', '2029-06-12', @it_dept_id, @ops_dept_id, 'Operations Network Rack', 'Operations Bay Rack', 'Working', 'In Use', 'Delivered', 'QR-ITTEST-SW-001', '24 port gigabit switch', 'Test operations switch.', 'Random test data.', @admin_user_id, @admin_user_id),
  ('ITTEST-PRN-001', 'ITTEST Office Printer', 'Printer', 'HP', 'LaserJet Pro', 'ITTEST-SN-PRN-001', 'ITTEST-WO-002', 'ITTEST-INV-002', '2026-06-12', '2028-06-12', @it_dept_id, @hr_dept_id, 'HR Shared Desk', 'HR Print Area', 'Needs Repair', 'Under Maintenance', 'Maintenance', 'QR-ITTEST-PRN-001', 'Mono laser printer', 'Test maintenance printer.', 'Random test data.', @admin_user_id, @admin_user_id)
ON DUPLICATE KEY UPDATE
  asset_name = VALUES(asset_name),
  current_department_id = VALUES(current_department_id),
  current_receiver_name = VALUES(current_receiver_name),
  location = VALUES(location),
  asset_condition = VALUES(asset_condition),
  lifecycle_status = VALUES(lifecycle_status),
  asset_status = VALUES(asset_status),
  remarks = VALUES(remarks),
  updated_by = VALUES(updated_by);

SET @lap1_id = (SELECT asset_id FROM assets WHERE asset_tag = 'ITTEST-LAP-001');
SET @lap2_id = (SELECT asset_id FROM assets WHERE asset_tag = 'ITTEST-LAP-002');
SET @mon1_id = (SELECT asset_id FROM assets WHERE asset_tag = 'ITTEST-MON-001');
SET @sw1_id = (SELECT asset_id FROM assets WHERE asset_tag = 'ITTEST-SW-001');
SET @prn1_id = (SELECT asset_id FROM assets WHERE asset_tag = 'ITTEST-PRN-001');

INSERT INTO asset_documents (
  asset_id, document_type, file_name, file_path, file_size_bytes, mime_type, uploaded_by
)
VALUES
  (@lap1_id, 'Invoice', 'ittest-lap-001-invoice.pdf', 'test-documents/ittest-lap-001-invoice.pdf', 245760, 'application/pdf', @admin_user_id),
  (@prn1_id, 'Photo', 'ittest-printer-photo.jpg', 'test-documents/ittest-printer-photo.jpg', 1048576, 'image/jpeg', @admin_user_id)
ON DUPLICATE KEY UPDATE
  file_path = VALUES(file_path),
  file_size_bytes = VALUES(file_size_bytes),
  mime_type = VALUES(mime_type);

INSERT INTO deliveries (
  delivery_code, asset_id, department_id, receiver_name, delivery_date,
  delivered_by, accessories, acknowledgement_status, delivery_status,
  remarks, created_by, updated_by
)
VALUES
  ('ITTEST-DLV-001', @lap1_id, @fin_dept_id, 'Amit Finance', '2026-06-06', @admin_user_id, 'Laptop bag, charger, mouse', 'Acknowledged', 'Delivered', 'Test delivery to finance.', @admin_user_id, @admin_user_id),
  ('ITTEST-DLV-002', @mon1_id, @hr_dept_id, 'Riya HR', '2026-06-07', @admin_user_id, 'HDMI cable, power cable', 'Acknowledged', 'Delivered', 'Test delivery to HR.', @admin_user_id, @admin_user_id),
  ('ITTEST-DLV-003', @sw1_id, @ops_dept_id, 'Operations Network Rack', '2026-06-13', @admin_user_id, 'Power cable, rack kit', 'Pending', 'Pending', 'Test pending operations delivery.', @admin_user_id, @admin_user_id)
ON DUPLICATE KEY UPDATE
  asset_id = VALUES(asset_id),
  department_id = VALUES(department_id),
  receiver_name = VALUES(receiver_name),
  acknowledgement_status = VALUES(acknowledgement_status),
  delivery_status = VALUES(delivery_status),
  remarks = VALUES(remarks);

SET @dlv1_id = (SELECT delivery_id FROM deliveries WHERE delivery_code = 'ITTEST-DLV-001');
SET @dlv2_id = (SELECT delivery_id FROM deliveries WHERE delivery_code = 'ITTEST-DLV-002');

INSERT INTO transfers (
  transfer_code, transfer_type, asset_id, from_department_id, to_department_id,
  current_receiver_name, new_receiver_name, transfer_reason, accessories,
  condition_at_transfer, collection_date, collected_by, issue_date,
  handover_acknowledgement, new_acknowledgement, transfer_status,
  remarks, created_by, updated_by
)
VALUES
  ('ITTEST-TRF-001', 'Department Transfer', @lap1_id, @fin_dept_id, @ops_dept_id, 'Amit Finance', 'Sneha Operations', 'Project allocation', 'Laptop bag, charger', 'Good', '2026-06-20', @admin_user_id, '2026-06-21', 'Acknowledged', 'Pending', 'Pending', 'Test pending transfer.', @admin_user_id, @admin_user_id),
  ('ITTEST-TRF-002', 'IT Collection', @prn1_id, @hr_dept_id, @it_dept_id, 'HR Shared Desk', 'IT Repair Desk', 'Repair collection', 'Power cable', 'Needs Repair', '2026-06-18', @admin_user_id, NULL, 'Acknowledged', 'Acknowledged', 'Collected by IT', 'Test printer repair collection.', @admin_user_id, @admin_user_id)
ON DUPLICATE KEY UPDATE
  asset_id = VALUES(asset_id),
  from_department_id = VALUES(from_department_id),
  to_department_id = VALUES(to_department_id),
  transfer_status = VALUES(transfer_status),
  remarks = VALUES(remarks);

INSERT INTO returns (
  return_code, delivery_id, asset_id, department_id, returned_by_name,
  return_date, return_condition, received_by, received_location,
  acknowledgement_status, inspection_status, inspection_by, damage_decision,
  return_status, remarks, created_by, updated_by
)
VALUES
  ('ITTEST-RET-001', @dlv2_id, @mon1_id, @hr_dept_id, 'Riya HR', '2026-06-25', 'Good', @admin_user_id, 'IT Store', 'Acknowledged', 'Completed', @admin_user_id, 'No Damage', 'Returned', 'Test monitor return.', @admin_user_id, @admin_user_id),
  ('ITTEST-RET-002', @dlv1_id, @lap1_id, @fin_dept_id, 'Amit Finance', '2026-06-26', 'Needs Repair', @admin_user_id, 'IT Inspection Desk', 'Pending', 'Pending', NULL, 'Pending', 'Pending Inspection', 'Test pending inspection return.', @admin_user_id, @admin_user_id)
ON DUPLICATE KEY UPDATE
  delivery_id = VALUES(delivery_id),
  asset_id = VALUES(asset_id),
  department_id = VALUES(department_id),
  inspection_status = VALUES(inspection_status),
  damage_decision = VALUES(damage_decision),
  return_status = VALUES(return_status),
  remarks = VALUES(remarks);

INSERT INTO maintenance_records (
  maintenance_code, asset_id, issue_type, reported_by_name, vendor_id,
  service_type, priority, service_date, expected_completion_date,
  completion_date, downtime_hours, warranty_claim, approval_status,
  maintenance_cost, maintenance_status, remarks, created_by, updated_by
)
VALUES
  ('ITTEST-MNT-001', @prn1_id, 'Paper Jam', 'Riya HR', @svc_vendor_id, 'Corrective Repair', 'High', '2026-06-19', '2026-06-21', NULL, 6.50, FALSE, 'Approved', 2500.00, 'In Progress', 'Test printer maintenance.', @admin_user_id, @admin_user_id),
  ('ITTEST-MNT-002', @lap2_id, 'Preventive Service', 'IT Store', @svc_vendor_id, 'Preventive Service', 'Medium', '2026-06-22', '2026-06-22', '2026-06-22', 1.00, TRUE, 'Approved', 0.00, 'Completed', 'Test spare laptop preventive service.', @admin_user_id, @admin_user_id)
ON DUPLICATE KEY UPDATE
  asset_id = VALUES(asset_id),
  vendor_id = VALUES(vendor_id),
  priority = VALUES(priority),
  maintenance_status = VALUES(maintenance_status),
  maintenance_cost = VALUES(maintenance_cost),
  remarks = VALUES(remarks);

INSERT INTO export_jobs (
  export_type, export_module, export_status, requested_by, file_name,
  row_count, started_at, completed_at, remarks
)
VALUES
  ('Excel', 'ITTEST Assets Report', 'Completed', @admin_user_id, 'ittest-assets-report.xlsx', 5, NOW(), NOW(), 'Test export tracking job.'),
  ('CSV', 'ITTEST Maintenance Report', 'Completed', @admin_user_id, 'ittest-maintenance-report.csv', 2, NOW(), NOW(), 'Test export tracking job.');

INSERT INTO import_jobs (
  import_module, import_status, requested_by, source_file_name,
  source_file_size_bytes, total_rows, valid_rows, invalid_rows,
  imported_rows, started_at, completed_at, remarks
)
VALUES
  ('ITTEST Assets', 'Ready', @admin_user_id, 'ittest-assets.csv', 4096, 5, 5, 0, 0, NOW(), NOW(), 'Test import validation job.');

INSERT INTO backup_jobs (
  backup_type, backup_scope, backup_status, requested_by, started_at,
  completed_at, file_name, file_size_bytes, remarks
)
VALUES
  ('Manual', 'Full Database', 'Completed', @admin_user_id, NOW(), NOW(), 'ittest-backup.json', 32768, 'Test backup tracking job.');

INSERT INTO activity_logs (
  user_id, module_name, action_name, entity_name, description, status
)
VALUES
  (@admin_user_id, 'Test Data', 'Inserted', 'ITTEST Records', 'Non-destructive ITTEST random data was inserted for final project testing.', 'Success');

COMMIT;

SELECT 'departments' AS table_name, COUNT(*) AS total_records FROM departments WHERE department_code LIKE 'ITTEST-%'
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors WHERE vendor_code LIKE 'ITTEST-%'
UNION ALL
SELECT 'work_orders', COUNT(*) FROM work_orders WHERE work_order_number LIKE 'ITTEST-%'
UNION ALL
SELECT 'assets', COUNT(*) FROM assets WHERE asset_tag LIKE 'ITTEST-%'
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries WHERE delivery_code LIKE 'ITTEST-%'
UNION ALL
SELECT 'transfers', COUNT(*) FROM transfers WHERE transfer_code LIKE 'ITTEST-%'
UNION ALL
SELECT 'returns', COUNT(*) FROM returns WHERE return_code LIKE 'ITTEST-%'
UNION ALL
SELECT 'maintenance_records', COUNT(*) FROM maintenance_records WHERE maintenance_code LIKE 'ITTEST-%';
