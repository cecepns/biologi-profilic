import React, { useState, useEffect } from 'react';
import { ClipboardCheck, HelpCircle, Save, CheckCircle2, AlertCircle, Sparkles, Loader2, BookOpen, Layers } from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

export const Stage2ProblemOrientation = ({ stage, onComplete }) => {
  const { user } = useAuth();
  const groupId = user?.groupId || 1;
  const stageId = stage?.id || 2;

  const [problems, setProblems] = useState(stage?.problems && stage.problems.length > 0 ? stage.problems : []);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [lastSaved, setLastSaved] = useState('Tersimpan otomatis');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!stage?.problems || stage.problems.length === 0) {
          const stageRes = await request.get(API_ENDPOINTS.STAGES.DETAIL(stageId));
          if (stageRes?.success && stageRes.data?.problems?.length > 0) {
            setProblems(stageRes.data.problems);
          }
        }

        // Fetch existing group solution draft
        const solRes = await request.get(API_ENDPOINTS.GROUPS.SOLUTION(groupId));
        if (solRes?.success && solRes.data) {
          if (Array.isArray(solRes.data.answers) && solRes.data.answers.length > 0) {
            setAnswers(solRes.data.answers);
          } else {
            const fallbackAnswers = [];
            if (solRes.data.problem_analysis) fallbackAnswers.push(solRes.data.problem_analysis);
            if (solRes.data.facts_identified) fallbackAnswers.push(solRes.data.facts_identified);
            if (solRes.data.inquiry_questions) fallbackAnswers.push(solRes.data.inquiry_questions);
            setAnswers(fallbackAnswers);
          }
        }
      } catch (err) {
        console.error('Failed to load Stage 2 data from server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stage, stageId, groupId]);

  const activeProblem = problems[selectedProblemIndex] || problems[0];

  // Helper to get questions for active problem (no default fallback if empty)
  const getActiveQuestions = () => {
    if (!activeProblem) return [];
    if (activeProblem.questions) {
      try {
        const parsed = typeof activeProblem.questions === 'string' ? JSON.parse(activeProblem.questions) : activeProblem.questions;
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch { }
    }
    return [];
  };

  const currentQuestions = getActiveQuestions();

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentQuestions.length === 0) {
      toast.error('Belum ada pertanyaan yang dapat disimpan.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await request.post(API_ENDPOINTS.GROUPS.SOLUTION(groupId), {
        problem_id: activeProblem?.id || 1,
        problem_analysis: answers[0] || '',
        facts_identified: answers[1] || '',
        inquiry_questions: answers[2] || '',
        answers: answers,
        status: 'draft'
      });

      if (res.success) {
        setLastSaved(`Tersimpan di server ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        toast.success('Jawaban analisis Problem Orientation berhasil disimpan ke server!');
        if (onComplete) onComplete();
      }
    } catch (err) {
      toast.error('Gagal menyimpan ke server: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="text-xs font-bold text-slate-500">Memuat lembar studi kasus orientasi masalah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">
          <ClipboardCheck size={16} />
          <span>Sintaks 2 • Problem-Based Learning (PBL)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Problem Orientation: Orientasi & Identifikasi Masalah
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-2xl leading-relaxed">
          Guru menyajikan studi kasus lingkungan biologi di bawah ini. Pilih dan telaah permasalahan kontekstual, analisis fakta-fakta saintifik, dan jawab pertanyaan investigasi yang diberikan oleh guru bersama kelompok.
        </p>
      </div>

      {/* Case Switcher Tabs */}
      {problems.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {problems.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => setSelectedProblemIndex(idx)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                selectedProblemIndex === idx
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookOpen size={15} />
              <span>Kasus {idx + 1}: {p.title?.split(':')[1]?.slice(0, 30) || p.title?.slice(0, 30) || `Kasus ${idx + 1}`}...</span>
            </button>
          ))}
        </div>
      )}

      {/* Studi Kasus Biologi Aktif */}
      {activeProblem ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="lg:w-1/3 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 shrink-0">
              <img
                src={activeProblem.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'}
                alt={activeProblem.title}
                className="w-full h-52 lg:h-64 object-cover"
              />
              <div className="p-3 bg-slate-50 text-[11px] text-slate-500 font-medium border-t border-slate-200">
                Dokumentasi: {activeProblem.title}
              </div>
            </div>

            <div className="lg:w-2/3 w-full space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles size={13} className="text-emerald-600" />
                <span>Kasus Lingkungan Terpilih</span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {activeProblem.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeProblem.context_story}
              </p>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <HelpCircle size={15} className="text-amber-600" />
                  <span>Pertanyaan Pemantik Guru:</span>
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  "{activeProblem.trigger_question}"
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-2">
          <AlertCircle size={28} className="text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Belum Ada Kasus Masalah</h4>
          <p className="text-xs text-slate-500">Guru belum menambahkan kasus masalah PBL untuk tahapan ini.</p>
        </div>
      )}

      {/* Lembar Kerja Siswa Sintaks 2 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Lembar Jawaban & Analisis Masalah Siswa</h3>
            <p className="text-xs text-slate-400">Jawab pertanyaan-pertanyaan investigasi berikut sesuai arahan guru.</p>
          </div>
          {currentQuestions.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              {isSaving ? (
                <span className="animate-pulse">Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>{lastSaved}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Questions Form Fields or Empty Alert */}
        {currentQuestions.length > 0 ? (
          <div className="space-y-5">
            {currentQuestions.map((questionText, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-start gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1 leading-relaxed text-slate-800 font-bold">
                    {questionText.replace(/^\d+\.\s*/, '')} <span className="text-rose-500">*</span>
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={answers[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder={`Tuliskan analisis & penjelasan jawaban kelompok untuk pertanyaan #${idx + 1}...`}
                  className="w-full p-4 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-sm font-extrabold text-amber-950">Belum Ada Pertanyaan Lembar Kerja</h4>
            <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
              Guru belum menambahkan pertanyaan lembar kerja untuk studi kasus ini. Silakan berdiskusi dengan guru atau tunggu guru menambahkan pertanyaan tugas.
            </p>
          </div>
        )}

        {currentQuestions.length > 0 && (
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Analisis Sintaks 2'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
