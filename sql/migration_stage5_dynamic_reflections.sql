-- ==========================================================
-- BioProFLiC Database Migration: Stage 5 Dynamic Reflection Questions
-- Tanggal: 2026-08-30
-- Deskripsi: Menambahkan dukungan pertanyaan refleksi dinamis untuk Sintaks 5 (Reflection & Evaluation) dan kolom responses pada group_reflections
-- ==========================================================

SET @dbname = DATABASE();

-- 1. Tambah kolom responses JSON pada group_reflections jika belum ada
SET @tablename = "group_reflections";
SET @columnname = "responses";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE group_reflections MODIFY COLUMN responses JSON DEFAULT NULL",
  "ALTER TABLE group_reflections ADD COLUMN responses JSON DEFAULT NULL AFTER future_improvements"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Pastikan kolom key_learnings dkk bersifat nullable agar mendukung pertanyaan dinamis
ALTER TABLE `group_reflections` 
  MODIFY COLUMN `key_learnings` TEXT DEFAULT NULL,
  MODIFY COLUMN `challenges_faced` TEXT DEFAULT NULL,
  MODIFY COLUMN `member_contributions` TEXT DEFAULT NULL,
  MODIFY COLUMN `future_improvements` TEXT DEFAULT NULL;

-- 3. Inisialisasi pertanyaan refleksi default untuk Sintaks 5 (Reflection & Evaluation) pada tabel learning_stages
UPDATE `learning_stages`
SET 
  `instructions` = 'Jawablah pertanyaan refleksi metakognitif di bawah ini untuk mengevaluasi proses berpikir, dinamika kolaborasi kelompok, dan rencana tindak lanjut perbaikan.',
  `questions` = JSON_ARRAY(
    'Apa hal paling esensial dan baru yang kalian pelajari dari proyek ini?',
    'Kesulitan atau hambatan apa yang dihadapi selama proses investigasi dan bagaimana solusinya?',
    'Bagaimana kontribusi dan pembagian peran setiap anggota kelompok selama pelaksanaan proyek?',
    'Apa yang akan kelompok lakukan secara berbeda untuk meningkatkan kualitas investigasi pada proyek berikutnya?'
  )
WHERE `stage_number` = 5 AND (`questions` IS NULL OR JSON_LENGTH(`questions`) = 0);
