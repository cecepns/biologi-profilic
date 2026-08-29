import React, { useState, useEffect } from 'react';
import { Presentation, MessageSquare, Award, Star, ExternalLink, Send, CheckCircle2, UploadCloud, HelpCircle, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

export const Stage4PresentationDiscussion = ({ stage, onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [presentation, setPresentation] = useState({
    id: 1,
    title: 'Rancangan Sistem Bioremediasi Mikroalga Berbasis Energi Terbarukan',
    groupName: user?.groupName || 'Kelompok 1 - Fitoplankton',
    slideUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
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

  useEffect(() => {
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
            slideUrl: p.slide_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
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

    fetchPresentationData();
  }, [stage, user]);

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
  const slideUrl = presentation?.slideUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

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

          <a
            href={slideUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto"
          >
            <ExternalLink size={16} />
            <span>Buka Slide Presentasi</span>
          </a>
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
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
            ● Slide Terverifikasi Siap Paparan
          </span>
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
    </div>
  );
};
