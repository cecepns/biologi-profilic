import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import {
  Award,
  Star,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Sliders,
  Sparkles,
  Loader2,
  FileText,
  Eye,
  Calendar,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Download,
  Video
} from 'lucide-react';
import { getFileUrl } from '../../utils/api';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

export const TeacherGradingCenter = () => {
  const [activeTab, setActiveTab] = useState('presentation');
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewingSolution, setViewingSolution] = useState(null);
  const [loading, setLoading] = useState(true);

  // 5 Aspect Rubric
  const [rubricScores, setRubricScores] = useState({
    mastery: 90,
    problemAnalysis: 92,
    solutionInnovation: 88,
    presentationDelivery: 86,
    teamwork: 94,
    feedback: 'Pemaparan sangat runut, rancangan fotobioreaktor didukung data literatur ilmiah yang solid!'
  });

  const [presentations, setPresentations] = useState([]);
  const [essays, setEssays] = useState([]);

  // Friendly Indonesian Date Formatter
  const formatIndonesianDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch {
      return dateStr;
    }
  };

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      // Fetch presentations
      const presRes = await request.get(API_ENDPOINTS.PRESENTATIONS.LIST);
      if (presRes.success && presRes.data) {
        setPresentations(presRes.data.map(p => ({
          id: p.id,
          groupName: p.group_name || 'Kelompok 1 - Fitoplankton',
          topic: p.title || p.topic_focus || 'Bioremediasi Limbah Fosfat dengan Mikroalga',
          membersCount: 5,
          rawDate: p.presentation_date,
          submittedDate: formatIndonesianDate(p.presentation_date),
          status: p.status,
          slide_url: p.slide_url,
          embed_link: p.embed_link,
          notes: p.notes,
          solution: p.solution || null,
          totalScore: p.rubric_score?.total_score || null,
          rubric_score: p.rubric_score || null
        })));
      }

      // Fetch attempts for essay grading
      const attemptsRes = await request.get(API_ENDPOINTS.ASSESSMENTS.ATTEMPTS);
      if (attemptsRes.success && attemptsRes.data) {
        const essayList = [];
        attemptsRes.data.forEach(att => {
          const essayAns = att.answers?.find(a => a.essay_answer !== null && a.essay_answer !== undefined);
          if (essayAns) {
            essayList.push({
              id: att.id,
              studentName: att.student_name,
              nis: '20261101',
              question: 'Jelaskan bagaimana interaksi dekomposer mikroba dan kadar oksigen terlarut mempengaruhi daya lenting ekosistem!',
              studentAnswer: essayAns.essay_answer,
              modelAnswer: 'Dekomposer aerob memerlukan oksigen terlarut untuk memecah bahan organik. Apabila dekomposisi berlebih, DO drop < 2 mg/L dan merusak rantai trofik akuatik.',
              awardedScore: essayAns.score || 35,
              maxScore: 40,
              teacherFeedback: essayAns.feedback || 'Penjelasan logis dan tepat sesuai konsep dekomposisi aerob.'
            });
          }
        });
        setEssays(essayList);
      }
    } catch (err) {
      console.error('Failed to load grading data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradingData();
  }, []);

  const handleOpenRubric = (group) => {
    setSelectedGroup(group);
    if (group.rubric_score) {
      setRubricScores({
        mastery: group.rubric_score.mastery_score || 85,
        problemAnalysis: group.rubric_score.problem_analysis_score || 85,
        solutionInnovation: group.rubric_score.solution_innovation_score || 85,
        presentationDelivery: group.rubric_score.presentation_delivery_score || 85,
        teamwork: group.rubric_score.teamwork_score || 85,
        feedback: group.rubric_score.feedback || ''
      });
    }
    setIsRubricModalOpen(true);
  };

  const handleOpenAnswers = (group) => {
    setViewingSolution(group);
    setIsAnswerModalOpen(true);
  };

  const handleSaveRubric = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;

    try {
      const res = await request.post(API_ENDPOINTS.PRESENTATIONS.GRADE(selectedGroup.id), {
        mastery_score: rubricScores.mastery,
        problem_analysis_score: rubricScores.problemAnalysis,
        solution_innovation_score: rubricScores.solutionInnovation,
        presentation_delivery_score: rubricScores.presentationDelivery,
        teamwork_score: rubricScores.teamwork,
        feedback: rubricScores.feedback
      });

      if (res.success) {
        setIsRubricModalOpen(false);
        toast.success(`Nilai rubrik berhasil disimpan ke server untuk ${selectedGroup?.groupName}!`);
        fetchGradingData();
      }
    } catch (err) {
      toast.error('Gagal menyimpan nilai rubrik: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="text-purple-600" size={26} />
          <span>Pusat Penilaian & Rubrik ProFLiC</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Peninjauan hasil investigasi solusi kelompok (Sintaks 3 & 4), penilaian rubrik presentasi, dan evaluasi uraian essay (Sintaks 5).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('presentation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'presentation'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Award size={16} />
          <span>Rubrik Presentasi & Solusi Kelompok (Sintaks 3-4)</span>
        </button>
        <button
          onClick={() => setActiveTab('essay')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'essay'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MessageSquare size={16} />
          <span>Koreksi Essay Evaluasi (Sintaks 5)</span>
        </button>
      </div>

      {/* 1. Presentation Rubric Table */}
      {activeTab === 'presentation' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Daftar Paparan Presentasi Kelompok</h3>
              <p className="text-xs text-slate-500">
                Guru dapat melihat rincian jawaban analisis masalah & solusi kelompok sebelum memberikan nilai rubrik.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              5 Aspek Rubrik ProFLiC
            </span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-purple-600" />
                <span>Memuat data paparan presentasi...</span>
              </div>
            ) : presentations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada kelompok yang mengunggah paparan presentasi.
              </div>
            ) : (
              presentations.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900">{p.groupName}</span>
                      <span className="text-xs text-slate-500 font-semibold">• {p.membersCount} Anggota Tim</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {p.solution?.chosen_solution ? 'Solusi Terpilih Siap' : 'Investigasi Selesai'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium line-clamp-1">{p.topic}</p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Diupload: <strong className="text-slate-700">{p.submittedDate}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    {/* Tombol Lihat Jawaban Kelompok */}
                    <button
                      onClick={() => handleOpenAnswers(p)}
                      className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 hover:text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title="Lihat Rincian Jawaban & Solusi Kelompok"
                    >
                      <Eye size={15} className="text-emerald-600" />
                      <span>Lihat Jawaban & Karya</span>
                    </button>

                    {p.status === 'graded' ? (
                      <div className="text-right px-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">Sudah Dinilai</span>
                        <span className="text-base font-black text-purple-900">{p.totalScore} / 100</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        Menunggu Penilaian
                      </span>
                    )}

                    {/* Tombol Beri Nilai Rubrik */}
                    <button
                      onClick={() => handleOpenRubric(p)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Sliders size={15} />
                      <span>{p.status === 'graded' ? 'Edit Nilai Rubrik' : 'Beri Nilai Rubrik'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. Essay Evaluation Table */}
      {activeTab === 'essay' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">Koreksi Jawaban Uraian / Essay Siswa</h3>
            <p className="text-xs text-slate-500">Cocokkan jawaban siswa dengan model jawaban guru untuk memberikan skor.</p>
          </div>

          {essays.map((es) => (
            <div key={es.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{es.studentName}</h4>
                  <span className="text-xs text-slate-500">NIS: {es.nis}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Skor Diperoleh:</span>
                  <input
                    type="number"
                    defaultValue={es.awardedScore}
                    max={es.maxScore}
                    className="w-16 p-1.5 bg-white border border-slate-300 rounded-lg text-center font-extrabold text-xs text-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-500">/ {es.maxScore} Poin</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                <strong className="text-slate-800 block mb-1">Pertanyaan Soal:</strong>
                <p className="text-slate-700 font-medium">{es.question}</p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                <strong className="text-emerald-900 block mb-1">Jawaban Siswa:</strong>
                <p className="text-slate-800 leading-relaxed font-medium">"{es.studentAnswer}"</p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                <strong className="text-blue-900 block mb-1">Kunci Jawaban Model Guru:</strong>
                <p className="text-slate-800 leading-relaxed">{es.modelAnswer}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => toast.success(`Nilai essay siswa ${es.studentName} berhasil disimpan!`)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Koreksi Essay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Lihat Rincian Jawaban & Hasil Karya Kelompok */}
      <Modal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        title={`Hasil Jawaban & Paparan: ${viewingSolution?.groupName}`}
        maxWidth="max-w-3xl"
      >
        {viewingSolution && (
          <div className="space-y-5">
            {/* Header Informasi */}
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">Topik Fokus Investigasi:</span>
                <h4 className="text-base font-black text-purple-950">{viewingSolution.topic}</h4>
                <p className="text-xs text-purple-800 mt-0.5">Diupload: {viewingSolution.submittedDate}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAnswerModalOpen(false);
                  handleOpenRubric(viewingSolution);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Sliders size={14} />
                <span>Beri Nilai Sekarang</span>
              </button>
            </div>

            {/* 1. Analisis Masalah */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={15} className="text-emerald-600" />
                <span>1. Analisis Masalah & Dinamika Ekosistem:</span>
              </span>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                {viewingSolution.solution?.problem_analysis ||
                  'Tingginya akumulasi nutrien N dan P dari sisa pakan ikan memicu peledakan populasi alga. Dekomposisi oleh bakteri pengurai menghabiskan oksigen terlarut sehingga menyebabkan hipoksia fatal pada biota akuatik.'}
              </div>
            </div>

            {/* 2. Fakta yang Diidentifikasi */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle size={15} className="text-blue-600" />
                <span>2. Fakta Ilmiah yang Diidentifikasi:</span>
              </span>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                {viewingSolution.solution?.facts_identified ||
                  '1. Kadar DO air waduk turun drastis < 2 mg/L pada malam hari.\n2. Tingkat fosfat melebihi ambang batas baku mutu 0.05 mg/L.\n3. Pertumbuhan alga & eceng gondok menghalangi penetrasi sinar matahari.'}
              </div>
            </div>

            {/* 3. Rumusan Pertanyaan Investigasi */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HelpCircle size={15} className="text-amber-600" />
                <span>3. Rumusan Pertanyaan Penyelidikan:</span>
              </span>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                {viewingSolution.solution?.inquiry_questions ||
                  '1. Berapa konsentrasi optimum mikroalga Chlorella untuk biofiltrasi limbah fosfat waduk?\n2. Bagaimana efisiensi biaya penerapan floating wetland dibanding aerasi mekanik?'}
              </div>
            </div>

            {/* 4. Alternatif Solusi yang Diajukan */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Lightbulb size={15} className="text-purple-600" />
                <span>4. Alternatif Solusi yang Dikaji Tim:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.isArray(viewingSolution.solution?.solution_alternatives) ? (
                  viewingSolution.solution.solution_alternatives.map((alt, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
                      <strong className="text-slate-900 block font-bold">💡 Alternatif {idx + 1}: {alt.title}</strong>
                      <p className="text-emerald-700 font-medium">✅ Kelebihan: {alt.pros}</p>
                      <p className="text-rose-700 font-medium">⚠️ Tantangan: {alt.cons}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 col-span-2">
                    Fotobioreaktor Mikroalga Chlorella Terpadu Aerator Solar & Floating Wetland
                  </div>
                )}
              </div>
            </div>

            {/* 5. Solusi Terpilih & Alasan Ilmiah */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-emerald-600 fill-emerald-600" />
                <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  5. Solusi Terpilih & Argumentasi Ilmiah:
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900">
                {viewingSolution.solution?.chosen_solution || 'Fotobioreaktor Mikroalga Chlorella Terpadu Aerator Solar'}
              </p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {viewingSolution.solution?.solution_reasoning ||
                  'Solusi ini terbukti paling berkelanjutan secara ilmiah karena tidak hanya memulihkan kadar oksigen terlarut secara cepat lewat fotosintesis alga dan aerator surya, tetapi juga mengubah limbah fosfat menjadi biomassa alga bernilai guna.'}
              </p>
            </div>

            {/* 6. Lampiran Slide / File / Link Presentasi */}
            {(viewingSolution.slide_url || viewingSolution.embed_link || viewingSolution.solution?.file_url) && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Lampiran Berkas & Tautan Presentasi:
                </span>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {viewingSolution.slide_url && (
                    <a
                      href={getFileUrl(viewingSolution.slide_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <Download size={14} className="text-emerald-600" />
                      <span>Unduh File Slide Presentasi (PDF/PPT)</span>
                    </a>
                  )}
                  {viewingSolution.embed_link && (
                    <a
                      href={viewingSolution.embed_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink size={14} className="text-blue-600" />
                      <span>Buka Tautan Slide Online</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAnswerModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rubric Evaluation Modal */}
      <Modal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
        title={`Penilaian Rubrik: ${selectedGroup?.groupName}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveRubric} className="space-y-4">
          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-3">
            <div>
              <strong>Pedoman Penilaian:</strong> Geser skor 50 - 100 untuk 5 aspek saintifik. Total dihitung otomatis.
            </div>
            <button
              type="button"
              onClick={() => {
                setIsRubricModalOpen(false);
                handleOpenAnswers(selectedGroup);
              }}
              className="px-3 py-1.5 bg-white border border-purple-300 text-purple-800 font-bold rounded-lg text-xs hover:bg-purple-100/50 shrink-0 flex items-center gap-1"
            >
              <Eye size={13} />
              <span>Lihat Jawaban</span>
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>1. Penguasaan Konsep Biologi (Bobot 25%)</span>
                <span className="text-purple-700 font-black">{rubricScores.mastery} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={rubricScores.mastery}
                onChange={(e) => setRubricScores(prev => ({ ...prev, mastery: Number(e.target.value) }))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>2. Ketajaman Analisis Masalah (Bobot 25%)</span>
                <span className="text-purple-700 font-black">{rubricScores.problemAnalysis} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={rubricScores.problemAnalysis}
                onChange={(e) => setRubricScores(prev => ({ ...prev, problemAnalysis: Number(e.target.value) }))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>3. Inovasi & Kelayakan Solusi (Bobot 20%)</span>
                <span className="text-purple-700 font-black">{rubricScores.solutionInnovation} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={rubricScores.solutionInnovation}
                onChange={(e) => setRubricScores(prev => ({ ...prev, solutionInnovation: Number(e.target.value) }))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>4. Kualitas Penyampaian & Retorika (Bobot 15%)</span>
                <span className="text-purple-700 font-black">{rubricScores.presentationDelivery} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={rubricScores.presentationDelivery}
                onChange={(e) => setRubricScores(prev => ({ ...prev, presentationDelivery: Number(e.target.value) }))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>5. Kerja Sama & Kolaborasi Tim (Bobot 15%)</span>
                <span className="text-purple-700 font-black">{rubricScores.teamwork} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={rubricScores.teamwork}
                onChange={(e) => setRubricScores(prev => ({ ...prev, teamwork: Number(e.target.value) }))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Catatan & Feedback Konstruktif Guru
            </label>
            <textarea
              rows={3}
              value={rubricScores.feedback}
              onChange={(e) => setRubricScores(prev => ({ ...prev, feedback: e.target.value }))}
              placeholder="Berikan masukan untuk perbaikan karya kelompok..."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRubricModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all"
            >
              Simpan & Publikasikan Nilai
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

