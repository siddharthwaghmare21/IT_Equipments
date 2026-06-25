USE it_equipment_management_smkc;

GRANT SELECT, INSERT, UPDATE, DELETE
ON it_equipment_management_smkc.*
TO 'Siddharth'@'localhost';

FLUSH PRIVILEGES;

SHOW GRANTS FOR 'Siddharth'@'localhost';
