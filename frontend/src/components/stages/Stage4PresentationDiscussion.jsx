import React, { useState, useEffect, useRef } from 'react';
import { Presentation, MessageSquare, Award, Star, ExternalLink, Send, CheckCircle2, UploadCloud, HelpCircle, Loader2, Upload, Edit3, Link, FileText, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import { getFileUrl } from '../../utils/api';
import { Modal } from '../common/Modal';
import toast from 'react-hot-toast';

export const Stage4PresentationDiscussion = ({ stage, onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [stageDetails, setStageDetails] = useState(stage || null);
  const fileInputRef = useRef(null);

  const [presentation, setPresentation] = useState({
    id: 1,
    title: 'Rancangan Sistem Bioremediasi Mikroalga Berbasis Energi Terbarukan',
    groupName: user?.groupName || 'Kelompok 1 - Fitoplankton',
    slideUrl: '/uploads-bioproflic/presentasi_kelompok1_ekosistem.pdf',
    embedLink: '',
    notes: 'Presentasi membahas perbandingan kinetika reduksi fosfat dan model prototipe lapangan.',
    date: '2026-09-02 09:00',
    rubricScore: {
      mastery: 92,
      problemAnalysis: 90,
      solutionInnovation: 95,
      presentationDelivery: 88,
      teamwork: 94,
      total: 92.1,
      feedback: 'Penyampaian sangat runut, argumen ilmiah penggunaan fotobioreaktor Chlorella didukung data yang akurat.'
    }
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    notes: '',
    slideUrl: '',
    embedLink: ''
  });

  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      userName: 'Citra Lestari (Siswa)',
      type: 'question',
      comment: 'Berapa waktu retensi hidrolik (HRT) yang dibutuhkan mikroalga untuk menurunkan fosfat hingga 80%?',
      time: '10:15'
    },
    {
      id: 2,
      userName: 'Ahmad Fauzan (Presenter)',
      type: 'response',
      comment: 'Berdasarkan jurnal acuan kami, waktu retensi optimum adalah 48 jam dengan aerasi periodik.',
      time: '10:18'
    },
    {
      id: 3,
      userName: 'Ibu Maya Sartika (Guru)',
      type: 'feedback',
      comment: 'Bagus sekali kolaborasi kelompok 1! Analisis fakta dan perhitungan stoichiometri bioremediasi sangat mendalam.',
      time: '10:25'
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('question');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchPresentationData = async () => {
    setLoading(true);
    try {
      const presRes = await request.get(API_ENDPOINTS.PRESENTATIONS.LIST, { stageId: stage?.id || 4 });
      if (presRes.success && presRes.data && presRes.data.length > 0) {
        const p = presRes.data[0];
        setPresentation({
          id: p.id,
          title: p.title || 'Rancangan Sistem Bioremediasi Mikroalga',
          groupName: p.group_name || user?.groupName || 'Kelompok 1 - Fitoplankton',
          slideUrl: p.slide_url || '',
          embedLink: p.embed_link || '',
          notes: p.notes || 'Bahan tayang presentasi kelompok model ProFLiC.',
          date: p.presentation_date ? new Date(p.presentation_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '2 Sep 2026, 09:00',
          rubricScore: p.rubric_score ? {
            mastery: p.rubric_score.mastery_score,
            problemAnalysis: p.rubric_score.problem_analysis_score,
            solutionInnovation: p.rubric_score.solution_innovation_score,
            presentationDelivery: p.rubric_score.presentation_delivery_score,
            teamwork: p.rubric_score.teamwork_score,
            total: p.rubric_score.total_score,
            feedback: p.rubric_score.feedback
          } : null
        });

        // Fetch feedbacks
        const fbRes = await request.get(API_ENDPOINTS.PRESENTATIONS.FEEDBACKS(p.id));
        if (fbRes.success && fbRes.data && fbRes.data.length > 0) {
          const mapped = fbRes.data.map(f => ({
            id: f.id,
            userName: f.user_name || 'Pengguna',
            type: f.type || 'feedback',
            comment: f.comment,
            time: f.created_at ? new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'
          }));
          setFeedbacks(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to load presentation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentationData();
    if (stage?.id) {
      request.get(API_ENDPOINTS.STAGES.DETAIL(stage.id)).then(res => {
        if (res.success && res.data) {
          setStageDetails(res.data);
        }
      }).catch(err => console.error('Fetch stage 4 detail error:', err));
    }
  }, [stage, user]);

  const handleOpenEditModal = () => {
    setEditFormData({
      title: presentation.title || '',
      notes: presentation.notes || '',
      slideUrl: presentation.slideUrl || '',
      embedLink: presentation.embedLink || ''
    });
    setIsEditModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSlide(true);
    const toastId = toast.loading('Mengunggah file slide presentasi...');
    try {
      const res = await request.uploadFile(API_ENDPOINTS.UPLOAD, file);
      if (res.success && res.fileUrl) {
        setEditFormData(prev => ({ ...prev, slideUrl: res.fileUrl }));
        toast.success('File slide berhasil diunggah!', { id: toastId });
      } else {
        toast.error(res?.message || 'Gagal mengunggah slide.', { id: toastId });
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah file slide.', { id: toastId });
    } finally {
      setUploadingSlide(false);
      e.target.value = '';
    }
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: editFormData.title,
        notes: editFormData.notes,
        slide_url: editFormData.slideUrl,
        embed_link: editFormData.embedLink
      };

      if (presentation?.id) {
        await request.put(API_ENDPOINTS.PRESENTATIONS.UPDATE(presentation.id), payload);
      } else {
        await request.post(API_ENDPOINTS.PRESENTATIONS.CREATE, {
          ...payload,
          stage_id: stage?.id || 4,
          group_id: user?.groupId || 1
        });
      }

      toast.success('Bahan presentasi kelompok berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchPresentationData();
    } catch (err) {
      toast.error('Gagal memperbarui presentasi: ' + err.message);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const presId = presentation?.id || 1;
      const res = await request.post(API_ENDPOINTS.PRESENTATIONS.FEEDBACKS(presId), {
        user_id: user?.id || 3,
        user_name: `${user?.name || 'Siswa'} (${user?.role === 'teacher' ? 'Guru' : 'Siswa'})`,
        type: commentType,
        comment: newComment.trim()
      });

      if (res.success && res.data) {
        const added = {
          id: res.data.id || Date.now(),
          userName: res.data.user_name || `${user?.name || 'Siswa'}`,
          type: commentType,
          comment: newComment.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setFeedbacks(prev => [...prev, added]);
        setNewComment('');
        toast.success('Komentar/Tanggapan berhasil dikirim ke server!');
      }
    } catch (err) {
      toast.error('Gagal mengirim tanggapan: ' + err.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-purple-600" size={32} />
        <p className="text-xs font-bold text-slate-500">Memuat berkas presentasi & diskusi kelompok...</p>
      </div>
    );
  }

  const groupName = presentation?.groupName || user?.groupName || 'Kelompok 1 - Fitoplankton';
  const presTitle = presentation?.title || 'Rancangan Sistem Bioremediasi Lingkungan';
  const presDate = presentation?.date || '2026-09-02 09:00';
  const activeSlideUrl = presentation?.slideUrl || presentation?.embedLink;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
          <Presentation size={16} />
          <span>Sintaks 4 • Collaborative Learning</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Presentation & Discussion: Paparan Karya & Diskusi Antar-Kelompok
        </h2>
        <p className="text-xs sm:text-sm text-purple-100 mt-2 max-w-2xl leading-relaxed">
          Unggah slide presentasi kelompok, simak karya kelompok lain, dan berikan pertanyaan kritis serta tanggapan ilmiah.
        </p>
      </div>

      {/* Teacher Guidance & Discussion Questions Card (Dynamic from Sintaks 4 Configuration) */}
      {(stageDetails?.instructions || (stageDetails?.questions && stageDetails?.questions.length > 0)) && (
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-white rounded-3xl border border-purple-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-purple-950 font-extrabold text-sm">
            <Sparkles className="text-purple-600" size={18} />
            <span>Petunjuk & Pertanyaan Pemantik Diskusi Presentasi dari Guru</span>
          </div>

          {stageDetails?.instructions && (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {stageDetails.instructions}
            </p>
          )}

          {stageDetails?.questions && stageDetails.questions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-purple-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                Pertanyaan Pemantik & Panduan Tanggapan Antar-Kelompok:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {stageDetails.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/90 rounded-2xl border border-purple-200/80 text-xs text-slate-800 flex items-start gap-2.5 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-lg bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-semibold leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Presentation Assessment Rubric Section (Pedoman Capaian Nilai Siswa) */}
      {stageDetails?.rubric && stageDetails.rubric.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Rubrik Penilaian Presentasi & Diskusi
                </h3>
                <p className="text-xs text-slate-500">
                  Pelajari indikator capaian penilaian di bawah ini agar kelompok Anda dapat meraih nilai maksimal.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full shrink-0">
              {stageDetails.rubric.length} Kriteria Penilaian
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {stageDetails.rubric.map((r, idx) => (
              <div
                key={r.id || idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1">
                      {r.criteria}
                    </h4>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 shrink-0">
                    {r.weight}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Presentation Artifact Card */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {groupName}
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mt-2">
              {presTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Jadwal Sesi: {presDate}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleOpenEditModal}
              className="px-4 py-2.5 rounded-xl border border-purple-300 hover:bg-purple-50 text-purple-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Edit3 size={15} />
              <span>Unggah / Kelola Slide</span>
            </button>

            {activeSlideUrl ? (
              <a
                href={getFileUrl(activeSlideUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <ExternalLink size={16} />
                <span>Buka Slide Presentasi</span>
              </a>
            ) : (
              <span className="px-3.5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl">
                Belum ada file slide
              </span>
            )}
          </div>
        </div>

        {/* Slide Preview Box */}
        <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Presentation size={32} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base">{presTitle}</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md">{presentation?.notes || 'Bahan tayang presentasi kelompok model ProFLiC.'}</p>
          </div>
          {activeSlideUrl ? (
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
              ● Slide Terverifikasi Siap Paparan
            </span>
          ) : (
            <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full">
              ⚠️ Silakan klik "Unggah / Kelola Slide" untuk melampirkan berkas presentasi
            </span>
          )}
        </div>

        {/* Rubrik Penilaian Guru */}
        {presentation?.rubricScore && (
          <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-purple-700" />
                <h4 className="text-sm font-extrabold text-purple-950">Nilai & Rubrik Evaluasi Guru</h4>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-extrabold text-sm shadow-xs">
                Skor Akhir: {presentation.rubricScore.total} / 100
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                <span className="text-[10px] text-slate-400 block">Penguasaan</span>
                <span className="font-bold text-slate-800">{presentation.rubricScore.mastery}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                <span className="text-[10px] text-slate-400 block">Analisis Masalah</span>
                <span className="font-bold text-slate-800">{presentation.rubricScore.problemAnalysis}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                <span className="text-[10px] text-slate-400 block">Inovasi Solusi</span>
                <span className="font-bold text-slate-800">{presentation.rubricScore.solutionInnovation}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-purple-100">
                <span className="text-[10px] text-slate-400 block">Penyampaian</span>
                <span className="font-bold text-slate-800">{presentation.rubricScore.presentationDelivery}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-purple-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">Kerja Sama</span>
                <span className="font-bold text-slate-800">{presentation.rubricScore.teamwork}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs text-slate-700">
              <strong>Catatan Evaluasi Guru:</strong> "{presentation.rubricScore.feedback}"
            </div>
          </div>
        )}
      </div>

      {/* Forum Diskusi & Tanggapan Antar Kelompok */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MessageSquare size={18} className="text-purple-600" />
          <h3 className="text-base font-extrabold text-slate-800">
            Forum Tanya Jawab & Tanggapan Antar-Kelompok
          </h3>
        </div>

        {/* Comment list */}
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                fb.type === 'question'
                  ? 'bg-blue-50/50 border-blue-200/80'
                  : fb.type === 'response'
                  ? 'bg-emerald-50/50 border-emerald-200/80'
                  : 'bg-purple-50/50 border-purple-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{fb.userName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      fb.type === 'question'
                        ? 'bg-blue-200 text-blue-800'
                        : fb.type === 'response'
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-purple-200 text-purple-800'
                    }`}
                  >
                    {fb.type === 'question' ? 'Pertanyaan' : fb.type === 'response' ? 'Jawaban' : 'Feedback Guru'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">{fb.time}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{fb.comment}</p>
            </div>
          ))}
        </div>

        {/* Form Add Feedback */}
        <form onSubmit={handleAddFeedback} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Tipe Respon:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCommentType('question')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  commentType === 'question' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'
                }`}
              >
                Pertanyaan
              </button>
              <button
                type="button"
                onClick={() => setCommentType('response')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  commentType === 'response' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'
                }`}
              >
                Tanggapan / Jawaban
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tuliskan pertanyaan saintifik atau tanggapan untuk kelompok presenter..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmittingComment ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
              <span>Kirim</span>
            </button>
          </div>
        </form>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              toast.success('Tahap Presentasi selesai! Silakan lanjut ke Reflection & Evaluation.');
              if (onComplete) onComplete();
            }}
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Lanjut ke Reflection & Evaluation</span>
          </button>
        </div>
      </div>

      {/* Modal Kelola / Unggah Berkas Slide Presentasi */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Unggah / Kelola Berkas Slide Presentasi Kelompok"
      >
        <form onSubmit={handleSaveSlide} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Judul Bahan Presentasi
            </label>
            <input
              type="text"
              required
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Rancangan Sistem Bioremediasi Mikroalga..."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Unggah File Slide (PDF / PPT / PPTX)
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingSlide}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Upload size={14} />
                <span>{uploadingSlide ? 'Mengunggah...' : 'Pilih File Slide'}</span>
              </button>
              <div className="flex-1 min-w-0">
                {editFormData.slideUrl ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold truncate">
                    <FileText size={14} className="shrink-0" />
                    <span className="truncate">{editFormData.slideUrl}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Belum ada file yang diunggah</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Atau Tautan Slide Online (Canva / Google Slides)
            </label>
            <input
              type="url"
              value={editFormData.embedLink}
              onChange={(e) => setEditFormData(prev => ({ ...prev, embedLink: e.target.value }))}
              placeholder="https://docs.google.com/presentation/... atau https://canva.com/..."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Catatan / Ringkasan Paparan
            </label>
            <textarea
              rows={3}
              value={editFormData.notes}
              onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Tuliskan catatan penting bahan tayang..."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploadingSlide}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              Simpan Slide Presentasi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
