-- ==========================================================
-- BioProFLiC Database Migration: Materials & Discussions
-- ==========================================================

-- 1. Pastikan kolom pendukung pada stage_materials lengkap
ALTER TABLE `stage_materials` 
  MODIFY COLUMN `type` ENUM('video', 'pdf', 'image', 'document', 'text') NOT NULL DEFAULT 'pdf',
  MODIFY COLUMN `file_url` VARCHAR(255) DEFAULT NULL,
  MODIFY COLUMN `embed_url` TEXT DEFAULT NULL,
  MODIFY COLUMN `content` LONGTEXT DEFAULT NULL,
  MODIFY COLUMN `duration_minutes` INT DEFAULT 15;

-- 2. Pastikan tabel group_discussions memiliki index untuk performa query realtime
CREATE INDEX IF NOT EXISTS `idx_group_discussions_group_id` ON `group_discussions` (`group_id`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_stage_materials_stage_id` ON `stage_materials` (`stage_id`);
CREATE INDEX IF NOT EXISTS `idx_learning_stages_project_id` ON `learning_stages` (`project_id`, `stage_number`);

-- 3. Sample Data Tambahan untuk Materi Pembelajaran (Opsional / Idempotent)
INSERT IGNORE INTO `stage_materials` (`id`, `stage_id`, `title`, `type`, `file_url`, `embed_url`, `content`, `duration_minutes`) VALUES
(1, 1, 'Video Konsep Aliran Energi & Jaring Makanan', 'video', NULL, 'https://www.youtube.com/embed/LNpHB5Ocbps', 'Video penjelasan komprehensif mengenai tingkat trofik, rantai makanan, dan siklus biogeokimia pada ekosistem darat dan perairan.', 15),
(2, 1, 'Modul PDF: Struktur Komponen Biotik & Abiotik', 'pdf', '/uploads-bioproflic/sample_modul_ekosistem.pdf', NULL, 'Buku saku digital pegangan siswa mengenai dinamika populasi, daya dukung lingkungan (carrying capacity), dan suksesi ekologi.', 20),
(3, 1, 'Infografis Siklus Karbon dan Nitrogen', 'image', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', NULL, 'Bagan alur fiksasi nitrogen, nitrifikasi, asimilasi, serta pelepasan gas nitrogen kembali ke atmosfer.', 10),
(4, 1, 'Modul PDF: Bioremediasi & Filtrasi Alami Perairan', 'pdf', '/uploads-bioproflic/sample_modul_ekosistem.pdf', NULL, 'Panduan teknis pengaplikasian mikroalga Chlorella dan tanaman wetland dalam mereduksi polutan fosfat.', 25),
(5, 1, 'Infografis: Jaring-Jaring Makanan Ekosistem Danau', 'image', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800', NULL, 'Visual struktur rantai makanan akuatik dari fitoplankton hingga predator puncak.', 10);
