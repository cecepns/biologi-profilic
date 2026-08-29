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

  const [problemData, setProblemData] = useState({
    identifiedProblem: '',
    facts: '',
    knowledgeGaps: '',
    researchQuestion: ''
  });

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
          } else {
            setProblems([
              {
                id: 1,
                title: 'Kasus 1: Fenomena Blooming Alga di Waduk Cirata dan Kematian Ikan Massal',
                context_story: 'Pada musim kemarau menjelang penghujan, teramati peningkatan drastis populasi eceng gondok dan alga hijau-biru di zona keramba jaring apung. Kadar oksigen terlarut (DO) drop drastis di bawah 2 mg/L pada malam hari, menyebabkan ribuan ikan nila mati lemas. Analisis awal menunjukkan akumulasi pakan fosfat tinggi dan limbah domestik dari hulu sungai.',
                trigger_question: 'Bagaimana mekanisme biokimia terjadinya penurunan kadar DO akibat blooming alga dan solusi bioremediasi apa yang paling efektif untuk memulihkan kestabilan ekosistem perairan tersebut?',
                image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
              },
              {
                id: 2,
                title: 'Kasus 2: Kontaminasi Mikroplastik & Bioakumulasi Logam Berat di Muara Sungai',
                context_story: 'Sampel jaringan ikan bandeng dan kerang hijau di muara sungai menunjukkan partikel mikroplastik (<5mm) dan konsentrasi logam timbal (Pb) melampaui batas aman konsumsi. Hal ini mengganggu rantai makanan akuatik dan berpotensi memicu disrupsi endokrin pada fauna endemik serta membahayakan kesehatan masyarakat pesisir.',
                trigger_question: 'Bagaimana mekanisme perpindahan zat pencemar non-biodegradable melalui jaring-jaring makanan (biomagnifikasi) dan strategi filtrasi ekologis apa yang dapat diterapkan di area muara?',
                image_url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800'
              },
              {
                id: 3,
                title: 'Kasus 3: Kerusakan Mangrove & Ancaman Penurunan Stok Ikan Pesisir',
                context_story: 'Alih fungsi 45% lahan mangrove menjadi area tambak intensif menyebabkan erosi pantai meningkat dan hilangnya daerah nursery ground alami bagi bibit udang dan kepiting bakau. Keanekaragaman spesies menurun drastis dan kadar salinitas air tanah daratan kian meningkat akibat intrusi air laut.',
                trigger_question: 'Bagaimana peranan vegetasi mangrove sebagai habitat kunci (keystone ecosystem) dalam siklus hidup fauna akuatik dan desain restorasi mangrove terpadu seperti apa yang mampu memulihkan keanekaragaman hayati?',
                image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
              }
            ]);
          }
        }

        // Fetch existing group solution draft
        const solRes = await request.get(API_ENDPOINTS.GROUPS.SOLUTION(groupId));
        if (solRes?.success && solRes.data) {
          setProblemData({
            identifiedProblem: solRes.data.problem_analysis || '',
            facts: solRes.data.facts_identified || '',
            knowledgeGaps: solRes.data.inquiry_questions || '',
            researchQuestion: solRes.data.chosen_solution || ''
          });
        }
      } catch (err) {
        console.error('Failed to load Stage 2 data from server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stage, stageId, groupId]);

  const handleChange = (field, value) => {
    setProblemData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const activeProblem = problems[selectedProblemIndex] || problems[0];
      const res = await request.post(API_ENDPOINTS.GROUPS.SOLUTION(groupId), {
        problem_id: activeProblem?.id || 1,
        problem_analysis: problemData.identifiedProblem,
        facts_identified: problemData.facts,
        inquiry_questions: problemData.knowledgeGaps,
        chosen_solution: problemData.researchQuestion,
        status: 'draft'
      });

      if (res.success) {
        setLastSaved(`Tersimpan di server ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        toast.success('Analisis Problem Orientation berhasil disimpan ke server!');
        if (onComplete) onComplete();
      }
    } catch (err) {
      toast.error('Gagal menyimpan ke server: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const activeProblem = problems[selectedProblemIndex] || problems[0];

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
          Guru menyajikan 3 studi kasus lingkungan biologi di bawah ini. Pilih dan telaah permasalahan kontekstual, analisis fakta-fakta saintifik, dan rumuskan pertanyaan investigasi bersama kelompok.
        </p>
      </div>

      {/* Case Switcher Tabs */}
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
            <span>Kasus {idx + 1}: {p.title.split(':')[1]?.slice(0, 30) || `Permasalahan ${idx + 1}`}...</span>
          </button>
        ))}
      </div>

      {/* Studi Kasus Biologi Aktif */}
      {activeProblem && (
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
      )}

      {/* Lembar Kerja Siswa Sintaks 2 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Lembar Identifikasi & Rumusan Masalah</h3>
            <p className="text-xs text-slate-400">Isi analisis Anda secara cermat. Data disimpan secara otomatis.</p>
          </div>
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
        </div>

        {/* 1. Identifikasi Masalah Utama */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Apa Permasalahan Utama yang Ditemukan? <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={problemData.identifiedProblem}
            onChange={(e) => handleChange('identifiedProblem', e.target.value)}
            placeholder="Tuliskan analisis permasalahan ekosistem dan dampak biologi yang terjadi..."
            className="w-full p-4 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          />
        </div>

        {/* 2. Fakta-fakta Lapangan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Fakta-fakta Saintifik & Data Lapangan yang Teridentifikasi <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={problemData.facts}
            onChange={(e) => handleChange('facts', e.target.value)}
            placeholder="Contoh: 1. Kadar DO turun di bawah 2 mg/L. 2. Blooming eceng gondok menghalangi sinar matahari..."
            className="w-full p-4 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          />
        </div>

        {/* 3. Pertanyaan Investigasi Inkuiri */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            3. Rumusan Pertanyaan Investigasi / Ruang Lingkup Masalah <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={problemData.knowledgeGaps}
            onChange={(e) => handleChange('knowledgeGaps', e.target.value)}
            placeholder="Rumuskan pertanyaan penting yang akan diselidiki bersama kelompok di Sintaks 3..."
            className="w-full p-4 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          />
        </div>

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
      </form>
    </div>
  );
};
