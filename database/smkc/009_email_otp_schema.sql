USE it_equipment_management_smkc;

CREATE TABLE IF NOT EXISTS email_otp_requests (
  email_otp_request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  email VARCHAR(150) NOT NULL,
  purpose ENUM('Signup Verification', 'Login Verification', 'Password Reset') NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts INT UNSIGNED NOT NULL DEFAULT 5,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (email_otp_request_id),
  KEY idx_email_otp_email_purpose (email, purpose),
  KEY idx_email_otp_user_id (user_id),
  KEY idx_email_otp_expires_at (expires_at),
  KEY idx_email_otp_is_used (is_used),
  CONSTRAINT fk_email_otp_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
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
  ('security', 'email_otp_expiry_minutes', '10', 'Number', 'Email OTP expiry duration in minutes.', FALSE),
  ('security', 'email_otp_max_attempts', '5', 'Number', 'Maximum attempts allowed for one OTP request.', FALSE);

INSERT INTO activity_logs (
  module_name,
  action_name,
  entity_name,
  description,
  status
)
VALUES (
  'Database',
  'Email OTP schema ensured',
  'email_otp_requests',
  'Email OTP request tracking table was created or verified.',
  'Success'
);

SELECT table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'email_otp_requests';
