-- ==========================================================
-- BioProFLiC Database Migration: Stage 3 & 4 Management (Custom Questions & Guidelines)
-- Tanggal: 2026-08-30
-- Deskripsi: Menambahkan kolom instructions dan questions pada learning_stages agar guru dapat mengelola pertanyaan investigasi (Sintaks 3) dan panduan presentasi/tanggapan (Sintaks 4)
-- ==========================================================

SET @dbname = DATABASE();

-- 1. Tambah kolom instructions pada learning_stages
SET @tablename = "learning_stages";
SET @columnname = "instructions";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "ALTER TABLE learning_stages MODIFY COLUMN instructions TEXT DEFAULT NULL",
  "ALTER TABLE learning_stages ADD COLUMN instructions TEXT DEFAULT NULL AFTER description"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Tambah kolom questions pada learning_stages
SET @columnname2 = "questions";
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname2)
  ) > 0,
  "ALTER TABLE learning_stages MODIFY COLUMN questions JSON DEFAULT NULL",
  "ALTER TABLE learning_stages ADD COLUMN questions JSON DEFAULT NULL AFTER instructions"
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- 3. Tambah kolom rubric pada learning_stages
SET @columnname3 = "rubric";
SET @preparedStatement3 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname3)
  ) > 0,
  "ALTER TABLE learning_stages MODIFY COLUMN rubric JSON DEFAULT NULL",
  "ALTER TABLE learning_stages ADD COLUMN rubric JSON DEFAULT NULL AFTER questions"
));
PREPARE alterIfNotExists3 FROM @preparedStatement3;
EXECUTE alterIfNotExists3;
DEALLOCATE PREPARE alterIfNotExists3;

-- 4. Inisialisasi data pertanyaan contoh untuk Sintaks 3 (Collaborative Investigation)
UPDATE `learning_stages`
SET 
  `instructions` = 'Diskusikan bersama kelompok beranggotakan 4-5 siswa, kaji data laboratorium & lingkungan, lalu rancang minimal 2 alternatif solusi biologi terpadu.',
  `questions` = JSON_ARRAY(
    'Analisis mendalam mengapa fenomena permasalahan ekosistem ini terjadi secara biokimia dan ekologi?',
    'Rumuskan minimal 2 alternatif solusi biologi terpadu beserta analisis kelebihan (pros) dan kekurangan (cons)!',
    'Tentukan 1 solusi terbaik yang dipilih kelompok serta jelaskan landasan argumen ilmiah dan mekanisme kerjanya!'
  )
WHERE `stage_number` = 3 AND (`questions` IS NULL OR JSON_LENGTH(`questions`) = 0);

-- 5. Inisialisasi data pertanyaan dan Rubrik Penilaian untuk Sintaks 4 (Presentation & Discussion)
UPDATE `learning_stages`
SET 
  `instructions` = 'Unggah slide presentasi kelompok, paparkan rancangan solusi inovatif di depan kelas, dan berikan pertanyaan kritis serta tanggapan ilmiah.',
  `questions` = JSON_ARRAY(
    'Bagaimana kesesuaian prinsip biologi dan efektivitas solusi yang diajukan kelompok presenter dalam mengatasi masalah lingkungan?',
    'Apakah terdapat potensi dampak samping ekologis atau keterbatasan teknis dari solusi yang dipaparkan kelompok presenter?',
    'Saran perbaikan saintifik dan inovasi tambahan apa yang dapat diterapkan untuk memperkuat solusi kelompok presenter?'
  ),
  `rubric` = JSON_ARRAY(
    JSON_OBJECT(
      'id', 1,
      'criteria', 'Penguasaan Materi & Konsep Biologi',
      'weight', 25,
      'description', 'Menjelaskan konsep ekosistem, biogeokimia, dan mekanisme bioremediasi secara akurat tanpa miskonsepsi.'
    ),
    JSON_OBJECT(
      'id', 2,
      'criteria', 'Analisis Fakta & Data Pendukung Masalah',
      'weight', 20,
      'description', 'Menyajikan data pengamatan lapangan/laboratorium yang valid untuk mendukung identifikasi masalah ekologi.'
    ),
    JSON_OBJECT(
      'id', 3,
      'criteria', 'Inovasi & Kelayakan Solusi Terpadu',
      'weight', 25,
      'description', 'Solusi yang dirancang orisinal, ramah lingkungan, teruji secara ilmiah, dan memiliki langkah implementasi logis.'
    ),
    JSON_OBJECT(
      'id', 4,
      'criteria', 'Keterampilan Presentasi & Media Visual',
      'weight', 15,
      'description', 'Slide presentasi sistematis, komunikatif, visual infografis menarik, dan alur bicara jelas serta runtut.'
    ),
    JSON_OBJECT(
      'id', 5,
      'criteria', 'Responsivitas Diskusi & Tanya Jawab',
      'weight', 15,
      'description', 'Mampu merespons pertanyaan kelompok lain dengan argumen saintifik yang kuat, kritis, dan santun.'
    )
  )
WHERE `stage_number` = 4 AND (`rubric` IS NULL OR JSON_LENGTH(`rubric`) = 0);
