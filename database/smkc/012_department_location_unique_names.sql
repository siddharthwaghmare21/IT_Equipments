-- IT Equipment Management - department naming by location
-- Allows the same department name in different locations while keeping code unique.

USE it_equipment_management_smkc;

SET @drop_name_unique := (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE departments DROP INDEX uq_departments_name',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'departments'
    AND index_name = 'uq_departments_name'
);
PREPARE drop_name_unique_stmt FROM @drop_name_unique;
EXECUTE drop_name_unique_stmt;
DEALLOCATE PREPARE drop_name_unique_stmt;

SET @add_name_location_unique := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE departments ADD UNIQUE KEY uq_departments_name_location (department_name, location)',
    'SELECT 1'
  )
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'departments'
    AND index_name = 'uq_departments_name_location'
);
PREPARE add_name_location_unique_stmt FROM @add_name_location_unique;
EXECUTE add_name_location_unique_stmt;
DEALLOCATE PREPARE add_name_location_unique_stmt;
