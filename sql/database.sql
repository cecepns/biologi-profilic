-- ==========================================================
-- BioProFLiC Database Export
-- Biology Learning Management System with ProFLiC Model
-- Created for High School Biology (SMA)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS rubric_scores;
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS student_quiz_attempts;
DROP TABLE IF EXISTS student_answers;
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS group_reflections;
DROP TABLE IF EXISTS presentation_feedbacks;
DROP TABLE IF EXISTS presentations;
DROP TABLE IF EXISTS group_solutions;
DROP TABLE IF EXISTS group_discussions;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS student_groups;
DROP TABLE IF EXISTS stage_problems;
DROP TABLE IF EXISTS stage_materials;
DROP TABLE IF EXISTS student_stage_progress;
DROP TABLE IF EXISTS learning_stages;
DROP TABLE IF EXISTS learning_projects;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Table: users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  avatar VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: teachers
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nip VARCHAR(50) UNIQUE DEFAULT NULL,
  specialization VARCHAR(100) DEFAULT 'Biologi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: subjects
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: classes
CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  school_year VARCHAR(20) NOT NULL,
  teacher_id INT DEFAULT NULL,
  code VARCHAR(20) UNIQUE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: students
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nis VARCHAR(50) UNIQUE NOT NULL,
  class_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: learning_projects
CREATE TABLE learning_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  subject_id INT DEFAULT 1,
  title VARCHAR(200) NOT NULL,
  topic VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  cover VARCHAR(255) DEFAULT NULL,
  current_stage INT DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'published', 'completed', 'archived') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: learning_stages
CREATE TABLE learning_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  stage_number INT NOT NULL, -- 1: Pre-Class, 2: Problem, 3: Investigation, 4: Presentation, 5: Reflection & Evaluation
  title VARCHAR(150) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  status ENUM('locked', 'available', 'in_progress', 'completed') DEFAULT 'locked',
  deadline DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES learning_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: stage_materials (Sintaks 1: Pre-Class Preparation)
CREATE TABLE stage_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  type ENUM('video', 'pdf', 'image', 'document', 'text') NOT NULL,
  file_url VARCHAR(255) DEFAULT NULL,
  embed_url TEXT DEFAULT NULL,
  content LONGTEXT DEFAULT NULL,
  duration_minutes INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES learning_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: stage_problems (Sintaks 2: Problem Orientation)
CREATE TABLE stage_problems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  title VARCHAR(250) NOT NULL,
  context_story TEXT NOT NULL,
  trigger_question TEXT NOT NULL,
  questions JSON DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES learning_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: student_groups (Sintaks 3: Collaborative Investigation)
CREATE TABLE student_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  topic_focus VARCHAR(200) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES learning_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: group_members
CREATE TABLE group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  role ENUM('leader', 'member') DEFAULT 'member',
  online_status ENUM('online', 'offline', 'typing') DEFAULT 'offline',
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: group_discussions (Ruang Diskusi Sintaks 3)
CREATE TABLE group_discussions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  content TEXT NOT NULL,
  attachment_url VARCHAR(255) DEFAULT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: group_solutions (Alternatif & Solusi Terpilih Sintaks 3)
CREATE TABLE group_solutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  problem_id INT DEFAULT NULL,
  problem_analysis TEXT DEFAULT NULL,
  facts_identified TEXT DEFAULT NULL,
  inquiry_questions TEXT DEFAULT NULL,
  answers JSON DEFAULT NULL,
  solution_alternatives JSON DEFAULT NULL,
  chosen_solution VARCHAR(255) DEFAULT NULL,
  solution_reasoning TEXT DEFAULT NULL,
  file_url VARCHAR(255) DEFAULT NULL,
  status ENUM('draft', 'submitted') DEFAULT 'draft',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES stage_problems(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: presentations (Sintaks 4: Presentation & Discussion)
CREATE TABLE presentations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  group_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  slide_url VARCHAR(255) DEFAULT NULL,
  embed_link TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  presentation_date DATETIME DEFAULT NULL,
  status ENUM('scheduled', 'presented', 'graded') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES learning_stages(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: presentation_feedbacks (Tanya Jawab & Feedback Sintaks 4)
CREATE TABLE presentation_feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  presentation_id INT NOT NULL,
  user_id INT NOT NULL,
  type ENUM('question', 'response', 'feedback') DEFAULT 'feedback',
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: group_reflections (Sintaks 5: Reflection)
CREATE TABLE group_reflections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  group_id INT NOT NULL,
  key_learnings TEXT NOT NULL,
  challenges_faced TEXT NOT NULL,
  member_contributions TEXT NOT NULL,
  future_improvements TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES learning_stages(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: quizzes (Sintaks 5: Evaluasi Individu)
CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  duration_minutes INT DEFAULT 30,
  passing_score INT DEFAULT 75,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES learning_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: quiz_questions
CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  type ENUM('multiple_choice', 'essay') NOT NULL,
  question_text TEXT NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  points INT DEFAULT 10,
  explanation TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: question_options (Pilihan Ganda)
CREATE TABLE question_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_key VARCHAR(5) NOT NULL, -- A, B, C, D, E
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: student_quiz_attempts
CREATE TABLE student_quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  student_id INT NOT NULL,
  mc_score DECIMAL(5,2) DEFAULT 0.00,
  essay_score DECIMAL(5,2) DEFAULT 0.00,
  total_score DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('in_progress', 'completed', 'graded') DEFAULT 'in_progress',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: student_answers
CREATE TABLE student_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option_key VARCHAR(5) DEFAULT NULL,
  essay_answer TEXT DEFAULT NULL,
  is_correct BOOLEAN DEFAULT NULL,
  score_awarded DECIMAL(5,2) DEFAULT 0.00,
  teacher_feedback TEXT DEFAULT NULL,
  FOREIGN KEY (attempt_id) REFERENCES student_quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: scores & rubrics
CREATE TABLE rubric_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  presentation_id INT NOT NULL,
  teacher_id INT NOT NULL,
  mastery_score INT DEFAULT 85,
  problem_analysis_score INT DEFAULT 85,
  solution_innovation_score INT DEFAULT 85,
  presentation_delivery_score INT DEFAULT 85,
  teamwork_score INT DEFAULT 85,
  total_score DECIMAL(5,2) DEFAULT 85.00,
  feedback TEXT DEFAULT NULL,
  graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: student_stage_progress
CREATE TABLE student_stage_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  stage_id INT NOT NULL,
  status ENUM('locked', 'not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  completed_at DATETIME DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES learning_stages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: activity_logs
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- SEED INITIAL DATA
-- ==========================================================

-- Users
INSERT INTO users (id, name, username, password, role, avatar, status) VALUES
(1, 'Administrator BioProFLiC', 'admin', '$2b$10$YTA854gReeW/XIjUAb8dC.exQYNGyKBvOVsAQ5jBvs/0Nw9WiRo9e', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active'),
(2, 'Ibu Maya Sartika, M.Pd.', 'guru_maya', '$2b$10$YTA854gReeW/XIjUAb8dC.exQYNGyKBvOVsAQ5jBvs/0Nw9WiRo9e', 'teacher', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'active'),
(3, 'Ahmad Fauzan', 'ahmad', '$2b$10$YTA854gReeW/XIjUAb8dC.exQYNGyKBvOVsAQ5jBvs/0Nw9WiRo9e', 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'active'),
(4, 'Budi Santoso', 'budi', '$2b$10$YTA854gReeW/XIjUAb8dC.exQYNGyKBvOVsAQ5jBvs/0Nw9WiRo9e', 'student', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'active'),
(5, 'Citra Lestari', 'citra', '$2b$10$YTA854gReeW/XIjUAb8dC.exQYNGyKBvOVsAQ5jBvs/0Nw9WiRo9e', 'student', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'active'),
(6, 'Dinda Putri', 'dinda', '$2b$10$YTA854gReeW/XIjUAb8dC.exQYNGyKBvOVsAQ5jBvs/0Nw9WiRo9e', 'student', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'active'),
(7, 'Eko Pratama', 'eko', '$2b$10$YTA854gReeW/XIjUAb8dC.exQYNGyKBvOVsAQ5jBvs/0Nw9WiRo9e', 'student', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active');

-- Teacher Profile
INSERT INTO teachers (id, user_id, nip, specialization) VALUES
(1, 2, '198504122010012015', 'Biologi & Ekologi');

-- Subject
INSERT INTO subjects (id, name, code, description) VALUES
(1, 'Biologi SMA', 'BIO-XI', 'Mata Pelajaran Biologi Kelas XI Kurikulum Merdeka');

-- Class
INSERT INTO classes (id, name, grade, school_year, teacher_id, code) VALUES
(1, 'XI IPA 2', 'XI', '2026/2027', 1, 'XI-IPA2-2026'),
(2, 'XI IPA 1', 'XI', '2026/2027', 1, 'XI-IPA1-2026');

-- Students Profile
INSERT INTO students (id, user_id, nis, class_id) VALUES
(1, 3, '20261101', 1),
(2, 4, '20261102', 1),
(3, 5, '20261103', 1),
(4, 6, '20261104', 1),
(5, 7, '20261105', 1);

-- Learning Project
INSERT INTO learning_projects (id, class_id, teacher_id, subject_id, title, topic, description, cover, current_stage, start_date, end_date, status) VALUES
(1, 1, 1, 1, 'Ekosistem di Sekitarku', 'Keseimbangan Ekosistem & Perubahan Lingkungan', 'Proyek pembelajaran interaktif untuk mengkaji interaksi komponen biotik-abiotik dan dampak limbah mikroplastik terhadap kestabilan ekosistem perairan.', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600', 3, '2026-08-20', '2026-09-10', 'published');

-- Stages for Project 1
INSERT INTO learning_stages (id, project_id, stage_number, title, model_name, description, status, deadline) VALUES
(1, 1, 1, 'Pre-Class Preparation', 'Flipped Learning', 'Pelajari materi mandiri melalui video pembelajaran, modul PDF ekosistem, dan artikel jurnal interaksi ekologi sebelum pertemuan kelas.', 'completed', '2026-08-23 23:59:00'),
(2, 1, 2, 'Problem Orientation', 'Problem-Based Learning', 'Pahami kasus nyata eutrofikasi dan pencemaran sungai, identifikasi masalah utama, fakta, dan susun rumusan pertanyaan investigasi.', 'completed', '2026-08-26 14:00:00'),
(3, 1, 3, 'Collaborative Investigation', 'Collaborative Learning', 'Diskusikan bersama kelompok beranggotakan 4-5 siswa, teliti data laboratorium/lingkungan, dan rancang minimal 2 alternatif solusi biologi terpadu.', 'in_progress', '2026-08-30 16:00:00'),
(4, 1, 4, 'Presentation & Discussion', 'Collaborative Learning', 'Unggah bahan paparan kelompok, presentasikan solusi inovatif di depan kelas, serta berikan tanggapan kritis pada kelompok lain.', 'available', '2026-09-03 12:00:00'),
(5, 1, 5, 'Reflection & Evaluation', 'Reflection', 'Lakukan refleksi metakognitif kelompok atas proses kerja sama, lalu selesaikan evaluasi pemahaman biologi secara mandiri.', 'locked', '2026-09-07 20:00:00');

-- Stage 1 Materials
INSERT INTO stage_materials (id, stage_id, title, type, file_url, embed_url, content, duration_minutes) VALUES
(1, 1, 'Video Konsep Aliran Energi & Jaring Makanan', 'video', NULL, 'https://www.youtube.com/embed/LNpHB5Ocbps', 'Video penjelasan komprehensif mengenai tingkat trofik, rantai makanan, dan siklus biogeokimia pada ekosistem darat dan perairan.', 15),
(2, 1, 'Modul PDF: Struktur Komponen Biotik & Abiotik', 'pdf', '/uploads-bioproflic/sample_modul_ekosistem.pdf', NULL, 'Buku saku digital pegangan siswa mengenai dinamika populasi, daya dukung lingkungan (carrying capacity), dan suksesi ekologi.', 20),
(3, 1, 'Infografis Siklus Karbon dan Nitrogen', 'image', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', NULL, 'Bagan alur fiksasi nitrogen, nitrifikasi, asimilasi, serta pelepasan gas nitrogen kembali ke atmosfer.', 10);

-- Stage 2 Problems (3-5 Permasalahan Kontekstual Biologi)
INSERT INTO stage_problems (id, stage_id, title, context_story, trigger_question, image_url) VALUES
(1, 2, 'Kasus 1: Fenomena Blooming Alga di Waduk Cirata dan Kematian Ikan Massal', 'Pada musim kemarau menjelang penghujan, teramati peningkatan drastis populasi eceng gondok dan alga hijau-biru di zona keramba jaring apung. Kadar oksigen terlarut (DO) drop di bawah 2 mg/L pada malam hari, menyebabkan ribuan ikan nila mati lemas. Analisis awal menunjukkan akumulasi pakan fosfat tinggi dan limbah domestik dari hulu sungai.', 'Bagaimana mekanisme biokimia terjadinya penurunan kadar DO akibat blooming alga dan solusi bioremediasi apa yang paling efektif untuk memulihkan kestabilan ekosistem perairan tersebut?', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'),
(2, 2, 'Kasus 2: Kontaminasi Mikroplastik & Bioakumulasi Logam Berat di Muara Sungai', 'Sampel jaringan ikan bandeng dan kerang hijau di muara sungai menunjukkan partikel mikroplastik (<5mm) dan konsentrasi logam timbal (Pb) melampaui batas aman konsumsi. Hal ini mengganggu rantai makanan akuatik dan berpotensi memicu disrupsi endokrin pada fauna endemik serta membahayakan kesehatan masyarakat pesisir.', 'Bagaimana mekanisme perpindahan zat pencemar non-biodegradable melalui jaring-jaring makanan (biomagnifikasi) dan strategi filtrasi ekologis apa yang dapat diterapkan di area muara?', 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800'),
(3, 2, 'Kasus 3: Kerusakan Mangrove & Ancaman Penurunan Stok Ikan Pesisir', 'Alih fungsi 45% lahan mangrove menjadi area tambak intensif menyebabkan erosi pantai meningkat dan hilangnya daerah nursery ground alami bagi bibit udang dan kepiting bakau. Keanekaragaman spesies menurun drastis dan kadar salinitas air tanah daratan kian meningkat akibat intrusi air laut.', 'Bagaimana peranan vegetasi mangrove sebagai habitat kunci (keystone ecosystem) dalam siklus hidup fauna akuatik dan desain restorasi mangrove terpadu seperti apa yang mampu memulihkan keanekaragaman hayati?', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800');

-- Groups
INSERT INTO student_groups (id, project_id, name, topic_focus) VALUES
(1, 1, 'Kelompok 1 - Fitoplankton', 'Bioremediasi Limbah Fosfat dengan Mikroalga'),
(2, 1, 'Kelompok 2 - Makrozoobentos', 'Filtrasi Air Alami menggunakan Tanaman Wetland');

-- Group Members
INSERT INTO group_members (id, group_id, student_id, role, online_status) VALUES
(1, 1, 1, 'leader', 'online'),
(2, 1, 2, 'member', 'online'),
(3, 1, 3, 'member', 'online'),
(4, 1, 4, 'member', 'offline'),
(5, 1, 5, 'member', 'online');

-- Group Discussions
INSERT INTO group_discussions (id, group_id, student_id, content, likes) VALUES
(1, 1, 1, 'Halo teman-teman! Berdasarkan data Stage 2, fokus kita adalah mencari solusi bioremediasi untuk menekan kadar fosfat di waduk.', 2),
(2, 1, 3, 'Saya sudah membaca modul di Stage 1, ternyata Chlorella pyrenoidosa sangat cepat menyerap fosfat terlarut hingga 78%!', 3),
(3, 1, 2, 'Betul Citra! Selain itu kita bisa kombinasikan dengan aerator tenaga surya agar kadar DO cepat naik.', 1);

-- Group Solutions
INSERT INTO group_solutions (id, group_id, problem_id, problem_analysis, facts_identified, inquiry_questions, solution_alternatives, chosen_solution, solution_reasoning, status) VALUES
(1, 1, 1, 
'Tingginya akumulasi nutrien N dan P dari sisa pakan ikan memicu peledakan populasi alga. Dekomposisi oleh bakteri pengurai menghabiskan oksigen terlarut sehingga menyebabkan hipoksia fatal pada biota akuatik.',
'1. DO air waduk turun drastis < 2 mg/L.\n2. Tingkat fosfat melebihi ambang batas baku mutu 0.05 mg/L.\n3. Pertumbuhan eceng gondok menutupi penetrasi cahaya matahari.',
'1. Berapa konsentrasi optimum mikroalga untuk biofiltrasi waduk?\n2. Bagaimana efisiensi biaya penerapan floating wetland dibanding aerasi mekanik?',
'[{"title":"Floating Wetland Tanaman Vetiver & Eceng Gondok Terkontrol","pros":"Biaya rendah, menyerap logam berat dan fosfat","cons":"Perlu pembersihan berkala agar tidak menjadi gulma baru"},{"title":"Fotobioreaktor Mikroalga Chlorella Terpadu Aerator Solar","pros":"Efisiensi penyerapan N & P sangat tinggi (>85%) dan memproduksi biomassa bernilai ekonomis","cons":"Investasi awal modul solar panel"}]',
'Fotobioreaktor Mikroalga Chlorella Terpadu Aerator Solar',
'Solusi ini terbukti paling berkelanjutan secara ilmiah karena tidak hanya memulihkan kadar oksigen terlarut secara cepat lewat fotosintesis alga dan aerator surya, tetapi juga mengubah limbah fosfat menjadi biomassa alga yang dapat diolah kembali menjadi pakan ikan ramah lingkungan.',
'submitted');

-- Presentations (Stage 4)
INSERT INTO presentations (id, stage_id, group_id, title, slide_url, embed_link, notes, presentation_date, status) VALUES
(1, 4, 1, 'Rancangan Sistem Bioremediasi Mikroalga Berbasis Energi Terbarukan', '/uploads-bioproflic/presentasi_kelompok1_ekosistem.pdf', 'https://docs.google.com/presentation/d/e/sample/embed', 'Presentasi membahas perbandingan kinetika reduksi fosfat dan model prototipe lapangan.', '2026-09-02 09:00:00', 'scheduled');

-- Quizzes (Stage 5)
INSERT INTO quizzes (id, stage_id, title, duration_minutes, passing_score) VALUES
(1, 5, 'Evaluasi Akhir Pemahaman Ekosistem & Biosfer', 25, 75);

-- Questions
INSERT INTO quiz_questions (id, quiz_id, type, question_text, points, explanation) VALUES
(1, 1, 'multiple_choice', 'Dalam suatu ekosistem danau, organisme manakah yang menempati tingkat trofik pertama dan berperan penting sebagai produsen primer?', 20, 'Fitoplankton merupakan produsen autotrof utama di ekosistem perairan yang mengonversi energi surya melalui fotosintesis.'),
(2, 1, 'multiple_choice', 'Fenomena penurunan kadar Oksigen Terlarut (DO) yang dipicu oleh limpasan pupuk fosfat dan nitrogen ke perairan disebut dengan peristiwa...', 20, 'Eutrofikasi adalah pengkayaan nutrien berlebih yang memicu blooming alga dan deoksigenasi air.'),
(3, 1, 'multiple_choice', 'Bakteri Nitrosomonas dan Nitrobacter memiliki peranan ekologis vital dalam siklus biogeokimia untuk proses...', 20, 'Nitrosomonas mengoksidasi amonia menjadi nitrit, dan Nitrobacter mengubah nitrit menjadi nitrat (proses Nitrifikasi).'),
(4, 1, 'essay', 'Jelaskan bagaimana interaksi antara komponen biotik (dekomposer) dan abiotik (kadar oksigen terlarut) dapat memengaruhi daya lenting (resiliensi) suatu ekosistem danau yang tercemar!', 40, 'Kunci jawaban: Dekomposer aerob membutuhkan DO untuk memecah bahan organik. Jika limbah organik berlebih, dekomposisi cepat menguras DO, memicu kondisi anoksik dan penurunan resiliensi ekosistem.');

-- Options for MC questions
INSERT INTO question_options (id, question_id, option_key, option_text, is_correct) VALUES
(1, 1, 'A', 'Zooplankton', FALSE),
(2, 1, 'B', 'Fitoplankton', TRUE),
(3, 1, 'C', 'Ikan herbivora', FALSE),
(4, 1, 'D', 'Bakteri dekomposer', FALSE),

(5, 2, 'A', 'Bioakumulasi', FALSE),
(6, 2, 'B', 'Biomagnifikasi', FALSE),
(7, 2, 'C', 'Eutrofikasi', TRUE),
(8, 2, 'D', 'Salinisasi', FALSE),

(9, 3, 'A', 'Fiksasi nitrogen bebas', FALSE),
(10, 3, 'B', 'Denitrifikasi anaerob', FALSE),
(11, 3, 'C', 'Nitrifikasi (pembentukan nitrat)', TRUE),
(12, 3, 'D', 'Amonifikasi protein', FALSE);

-- Activity Logs
INSERT INTO activity_logs (user_id, action, details) VALUES
(2, 'CREATE_PROJECT', 'Guru Maya membuat proyek pembelajaran: Ekosistem di Sekitarku'),
(3, 'FINISH_STAGE_1', 'Ahmad Fauzan menyelesaikan seluruh materi Pre-Class'),
(3, 'SUBMIT_PROBLEM', 'Ahmad Fauzan menyelesaikan lembar identifikasi masalah'),
(1, 'SYSTEM_INIT', 'Sistem BioProFLiC berhasil diinisialisasi');
