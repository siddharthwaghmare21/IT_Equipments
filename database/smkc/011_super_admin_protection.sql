USE it_equipment_management_smkc;

DROP TRIGGER IF EXISTS users_protect_super_admin_update;
DROP TRIGGER IF EXISTS users_protect_super_admin_delete;
DROP TRIGGER IF EXISTS users_single_super_admin_insert;

DELIMITER $$

CREATE TRIGGER users_protect_super_admin_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  IF OLD.role_id = (SELECT role_id FROM roles WHERE role_code = 'SUPER_ADMIN' LIMIT 1)
     AND (NEW.role_id <> OLD.role_id OR NEW.account_status <> 'Active') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Super Admin role and active status are protected.';
  END IF;
END$$

CREATE TRIGGER users_protect_super_admin_delete
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
  IF OLD.role_id = (SELECT role_id FROM roles WHERE role_code = 'SUPER_ADMIN' LIMIT 1) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Super Admin account cannot be deleted.';
  END IF;
END$$

CREATE TRIGGER users_single_super_admin_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.role_id = (SELECT role_id FROM roles WHERE role_code = 'SUPER_ADMIN' LIMIT 1)
     AND EXISTS (SELECT 1 FROM users WHERE role_id = NEW.role_id) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only one Super Admin account is allowed.';
  END IF;
END$$

DELIMITER ;
