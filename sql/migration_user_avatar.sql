-- ==========================================================
-- BioProFLiC Database Migration: User Avatar & Profile Management
-- Tanggal: 2026-08-30
-- Deskripsi: Memastikan kolom avatar di tabel users mendukung upload file / NULL
-- ==========================================================

-- 1. Memastikan kolom avatar ada dan nullable di tabel users
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "avatar";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE users MODIFY COLUMN avatar VARCHAR(255) DEFAULT NULL",
  "ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL AFTER role"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Memastikan index username & role optimal
CREATE INDEX IF NOT EXISTS `idx_users_role_status` ON `users` (`role`, `status`);

-- 3. Reset dummy unsplash URL avatar menjadi NULL agar memakai placeholder icon otomatis jika diinginkan
-- (Uncomment baris di bawah jika ingin mereset avatar dummy lama)
-- UPDATE `users` SET `avatar` = NULL WHERE `avatar` LIKE '%unsplash.com%';
