-- ==========================================================
-- BioProFLiC Database Migration: Stage 2 Custom Questions
-- Tanggal: 2026-08-30
-- Deskripsi: Menambahkan kolom questions pada stage_problems agar guru dapat mengkustomisasi pertanyaan orientasi masalah PBL
-- ==========================================================

-- 1. Tambah kolom questions pada stage_problems
SET @dbname = DATABASE();
SET @tablename = "stage_problems";
SET @columnname = "questions";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE stage_problems MODIFY COLUMN questions LONGTEXT DEFAULT NULL",
  "ALTER TABLE stage_problems ADD COLUMN questions LONGTEXT DEFAULT NULL AFTER trigger_question"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Tambah kolom answers pada group_solutions untuk menyimpan respon dinamis siswa
SET @tablename2 = "group_solutions";
SET @columnname2 = "answers";
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename2)
      AND (table_schema = @dbname)
      AND (column_name = @columnname2)
  ) > 0,
  "ALTER TABLE group_solutions MODIFY COLUMN answers LONGTEXT DEFAULT NULL",
  "ALTER TABLE group_solutions ADD COLUMN answers LONGTEXT DEFAULT NULL AFTER inquiry_questions"
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- 3. Inisialisasi pertanyaan default untuk data existing
UPDATE `stage_problems` 
SET `questions` = JSON_ARRAY(
  '1. Apa Permasalahan Utama yang Ditemukan?',
  '2. Fakta-fakta Saintifik & Data Lapangan yang Teridentifikasi',
  '3. Rumusan Pertanyaan Investigasi / Ruang Lingkup Masalah'
)
WHERE `questions` IS NULL;
