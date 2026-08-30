import React, { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle2, Award, Clock, HelpCircle, Sparkles, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';

export const Stage5ReflectionEvaluation = ({ stage }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reflection');
  const [loading, setLoading] = useState(true);
  const [stageDetails, setStageDetails] = useState(stage || null);

  const defaultQuestions = [
    'Apa hal paling esensial dan baru yang kalian pelajari dari proyek ini?',
    'Kesulitan/hambatan apa yang dihadapi selama proses investigasi dan bagaimana solusinya?',
    'Bagaimana kontribusi dan pembagian peran setiap anggota kelompok?',
    'Apa yang akan kelompok lakukan secara berbeda untuk meningkatkan kualitas proyek berikutnya?'
  ];

  // Dynamic reflection answers indexed by question index
  const [reflectionAnswers, setReflectionAnswers] = useState({});
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);

  // CBT Quiz Questions from API
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const activeQuestions = (stageDetails?.questions && stageDetails.questions.length > 0)
    ? stageDetails.questions
    : defaultQuestions;

  // Fetch stage details, quiz, and reflection data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Stage details for custom questions & instructions
        if (stage?.id) {
          const sRes = await request.get(API_ENDPOINTS.STAGES.DETAIL(stage.id));
          if (sRes.success && sRes.data) {
            setStageDetails(sRes.data);
          }
        }

        // Fetch Quiz from backend
        const quizRes = await request.get(API_ENDPOINTS.ASSESSMENTS.QUIZ_DETAIL(1));
        if (quizRes.success && quizRes.data) {
          setQuiz(quizRes.data);
        }

        // Fetch existing reflection if any
        const refRes = await request.get(API_ENDPOINTS.REFLECTIONS.LIST, { 
          groupId: user?.groupId || 1,
          stageId: stage?.id || 5
        });
        if (refRes.success && refRes.data && refRes.data.length > 0) {
          const latest = refRes.data[0];
          const loadedAnswers = {};
          if (latest.responses && Array.isArray(latest.responses) && latest.responses.length > 0) {
            latest.responses.forEach((item, idx) => {
              loadedAnswers[idx] = item.answer || '';
            });
          } else {
            if (latest.key_learnings) loadedAnswers[0] = latest.key_learnings;
            if (latest.challenges_faced) loadedAnswers[1] = latest.challenges_faced;
            if (latest.member_contributions) loadedAnswers[2] = latest.member_contributions;
            if (latest.future_improvements) loadedAnswers[3] = latest.future_improvements;
          }
          setReflectionAnswers(loadedAnswers);
          setReflectionSaved(true);
        }

        // Check if student already attempted quiz
        const attemptRes = await request.get(API_ENDPOINTS.ASSESSMENTS.ATTEMPTS, { studentId: user?.id || 3, quizId: 1 });
        if (attemptRes.success && attemptRes.data && attemptRes.data.length > 0) {
          const prevAttempt = attemptRes.data[0];
          setQuizResult({
            mcScore: prevAttempt.mc_score,
            essayScore: prevAttempt.essay_score,
            total: prevAttempt.total_score,
            percentage: prevAttempt.total_score,
            answers: prevAttempt.answers
          });
          setQuizSubmitted(true);
        }
      } catch (err) {
        console.error('Failed to load Stage 5 data from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, stage?.id]);

  const handleSaveReflection = async (e) => {
    e.preventDefault();
    setSavingReflection(true);
    try {
      const responses = activeQuestions.map((q, idx) => ({
        question: q,
        answer: reflectionAnswers[idx] || ''
      }));

      const res = await request.post(API_ENDPOINTS.REFLECTIONS.CREATE, {
        stage_id: stage?.id || 5,
        group_id: user?.groupId || 1,
        key_learnings: reflectionAnswers[0] || '',
        challenges_faced: reflectionAnswers[1] || '',
        member_contributions: reflectionAnswers[2] || '',
        future_improvements: reflectionAnswers[3] || '',
        responses
      });
      if (res.success) {
        setReflectionSaved(true);
        toast.success('Refleksi kelompok berhasil disimpan ke database!');
      }
    } catch (err) {
      toast.error('Gagal menyimpan refleksi: ' + err.message);
    } finally {
      setSavingReflection(false);
    }
  };

  const handleSelectOption = (qId, optionKey) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const handleEssayChange = (qId, text) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!quiz || !quiz.questions) return;

    // Validate that student has answered
    const unansweredMC = quiz.questions.filter(q => q.type === 'multiple_choice' && !selectedAnswers[q.id]);
    if (unansweredMC.length > 0) {
      toast.error(`Harap jawab semua soal pilihan ganda (tersisa ${unansweredMC.length} soal belum dijawab).`);
      return;
    }

    setSubmittingQuiz(true);
    try {
      const formattedAnswers = quiz.questions.map(q => ({
        question_id: q.id,
        selected_key: q.type === 'multiple_choice' ? selectedAnswers[q.id] : null,
        essay_answer: q.type === 'essay' ? selectedAnswers[q.id] || '' : null
      }));

      const res = await request.post(API_ENDPOINTS.ASSESSMENTS.SUBMIT_QUIZ(quiz.id), {
        student_id: user?.id || 3,
        student_name: user?.name || 'Ahmad Fauzan',
        answers: formattedAnswers
      });

      if (res.success) {
        setQuizResult(res.data);
        setQuizSubmitted(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(res.message || 'Evaluasi individu berhasil dinilai secara otomatis!');
      }
    } catch (err) {
      toast.error('Gagal mengirim evaluasi: ' + err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F8B8D] to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-200 mb-2">
          <Lightbulb size={16} />
          <span>Sintaks 5 • Reflection & Individual Assessment</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Reflection & Evaluation: Refleksi Kelompok & Uji Pemahaman
        </h2>
        <p className="text-xs sm:text-sm text-teal-100 mt-2 max-w-2xl leading-relaxed">
          Refleksikan proses pembelajaran tim, lalu kerjakan evaluasi individu untuk mengukur pemahaman konsep biologi secara terstandar.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('reflection')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'reflection'
              ? 'bg-[#0F8B8D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lightbulb size={17} />
          <span>1. Refleksi Kolaboratif (Kelompok)</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'quiz'
              ? 'bg-[#0F8B8D] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award size={17} />
          <span>2. Evaluasi Individu (CBT Quiz)</span>
        </button>
      </div>

      {/* 1. Group Reflection Form */}
      {activeTab === 'reflection' && (
        <form onSubmit={handleSaveReflection} className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Lembar Refleksi Metakognitif Kelompok</h3>
              <p className="text-xs text-slate-400">
                {stageDetails?.instructions || `Jawab ${activeQuestions.length} pertanyaan refleksi untuk mengevaluasi dinamika kolaborasi dan pemahaman kelompok.`}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full shrink-0">
              {activeQuestions.length} Poin Pertanyaan
            </span>
          </div>

          <div className="space-y-5">
            {activeQuestions.map((qText, qIdx) => (
              <div key={qIdx} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {qIdx + 1}. {qText.replace(/^\d+\.\s*/, '')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reflectionAnswers[qIdx] || ''}
                  onChange={(e) => setReflectionAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                  placeholder={`Tuliskan refleksi kelompok untuk pertanyaan ke-${qIdx + 1}...`}
                  className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            {reflectionSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 size={16} /> Refleksi Kelompok Berhasil Disimpan
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={savingReflection}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0F8B8D] hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-700/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingReflection ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>{savingReflection ? 'Menyimpan...' : 'Simpan Refleksi Kelompok'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Individual Assessment (CBT Quiz Player) */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Result Card when finished */}
          {quizResult && (
            <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-300 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F8B8D] text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
                    <Award size={36} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Hasil Evaluasi Individu</span>
                    <h3 className="text-xl font-extrabold text-slate-800">{user?.name || 'Ahmad Fauzan'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Status: <strong className="text-emerald-700 font-bold">LULUS (Sangat Baik)</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl border border-teal-200 text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-400 block">Pilihan Ganda</span>
                    <span className="text-base font-extrabold text-slate-800">{quizResult.mcScore}/60</span>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-teal-200 text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-400 block">Essay Guru</span>
                    <span className="text-base font-extrabold text-slate-800">{quizResult.essayScore}/40</span>
                  </div>
                  <div className="p-3.5 bg-[#0F8B8D] text-white rounded-2xl shadow-md text-center min-w-[100px]">
                    <span className="text-[10px] text-teal-100 block font-bold">Total Nilai</span>
                    <span className="text-xl font-black">{quizResult.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Questions Form */}
          <form onSubmit={handleSubmitQuiz} className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Evaluasi Pemahaman Materi Biologi</h3>
                <p className="text-xs text-slate-400">Total 4 Soal (3 Pilihan Ganda + 1 Analisis Essay)</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <Clock size={14} className="text-teal-600" />
                <span>Waktu: 25 Menit</span>
              </div>
            </div>

            {/* Questions Loop from API */}
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-teal-600" size={28} />
                <p className="text-xs">Memuat soal evaluasi biologi dari server...</p>
              </div>
            ) : (
              (quiz?.questions || []).map((q, idx) => (
                <div key={q.id} className="space-y-3 p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#0F8B8D] text-white text-xs font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Uraian / Essay'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {q.points} Poin
                    </span>
                  </div>

                  <div
                    className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed pt-1 prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: q.question_text || q.question }}
                  />

                  {/* Multiple choice options */}
                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2 pt-2">
                      {(q.options || []).map((opt) => {
                        const isSelected = selectedAnswers[q.id] === opt.key;
                        const correctOpt = (q.options || []).find(o => o.is_correct);
                        const isCorrect = opt.is_correct || opt.key === correctOpt?.key;
                        let optionStyle = 'bg-white border-slate-200 hover:border-teal-400';

                        if (quizSubmitted) {
                          if (isCorrect) optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                          else if (isSelected && !isCorrect) optionStyle = 'bg-rose-50 border-rose-500 text-rose-800';
                        } else if (isSelected) {
                          optionStyle = 'bg-teal-50 border-teal-500 text-teal-900 font-bold ring-1 ring-teal-500';
                        }

                        return (
                          <div
                            key={opt.key}
                            onClick={() => handleSelectOption(q.id, opt.key)}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs transition-all ${optionStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-lg font-extrabold flex items-center justify-center text-xs shrink-0 ${
                              isSelected ? 'bg-[#0F8B8D] text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {opt.key}
                            </span>
                            <div
                              className="flex-1 overflow-hidden"
                              dangerouslySetInnerHTML={{ __html: opt.option_text || opt.text }}
                            />
                          </div>
                        );
                      })}

                      {quizSubmitted && q.explanation && (
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-xs mt-2 border border-blue-200">
                          <strong>Pembahasan Ilmiah: </strong>
                          <div className="inline" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Essay Box */}
                  {q.type === 'essay' && (
                    <div className="pt-2 space-y-2">
                      <textarea
                        rows={4}
                        value={selectedAnswers[q.id] || ''}
                        onChange={(e) => handleEssayChange(q.id, e.target.value)}
                        disabled={quizSubmitted}
                        placeholder="Tuliskan analisis saintifik lengkap Anda..."
                        className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />

                      {quizSubmitted && (
                        <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 text-xs space-y-1">
                          <p className="font-bold text-teal-950">Kunci Jawaban Model Guru:</p>
                          <p className="text-slate-700 leading-relaxed">{q.model_answer || q.modelAnswer || 'Kunci jawaban telah tercatat.'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {!quizSubmitted && (
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingQuiz || loading}
                  className="px-8 py-3.5 rounded-2xl bg-[#0F8B8D] hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-700/20 transition-all flex items-center gap-2"
                >
                  {submittingQuiz ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  <span>{submittingQuiz ? 'Menilai Jawaban...' : 'Kirim Jawaban & Dapatkan Nilai'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
