-- ==========================================================
-- BioProFLiC Database Migration: User Profile Enhancements
-- Tanggal: 2026-08-30
-- Deskripsi: Menambahkan kolom bio dan email pendukung untuk fitur edit profil mandiri siswa & guru
-- ==========================================================

SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "bio";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE users MODIFY COLUMN bio TEXT DEFAULT NULL",
  "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL AFTER phone"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
