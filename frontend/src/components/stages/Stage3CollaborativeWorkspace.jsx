import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, Plus, Trash2, CheckCircle2, Paperclip, Sparkles, MessageSquare, Award, ArrowRight, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FileUpload } from '../common/FileUpload';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

export const Stage3CollaborativeWorkspace = ({ stage, onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Group members with attendance/online state from API
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef(null);

  // Solution alternatives & chosen solution from API
  const [solutionForm, setSolutionForm] = useState({
    problemAnalysis: '',
    factsIdentified: '',
    inquiryQuestions: '',
    alternatives: [
      {
        id: 1,
        title: 'Alternatif Solusi 1',
        explanation: '',
        pros: '',
        cons: ''
      }
    ],
    chosenSolution: '',
    chosenReason: '',
    fileUrl: null
  });

  const [lastSaved, setLastSaved] = useState('Tersimpan otomatis');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial group data, discussions, and solution from API
  useEffect(() => {
    const fetchGroupDetails = async () => {
      setLoading(true);
      try {
        const res = await request.get(API_ENDPOINTS.GROUPS.DETAIL(1));
        if (res.success && res.data) {
          setGroupData(res.data);
          if (res.data.members) setMembers(res.data.members);
          if (res.data.discussions) setMessages(res.data.discussions);
          if (res.data.solution) {
            const sol = res.data.solution;
            setSolutionForm({
              problemAnalysis: sol.problem_analysis || '',
              factsIdentified: sol.facts_identified || '',
              inquiryQuestions: sol.inquiry_questions || '',
              alternatives: sol.solution_alternatives || [
                { id: 1, title: 'Alternatif Solusi 1', explanation: '', pros: '', cons: '' }
              ],
              chosenSolution: sol.chosen_solution || '',
              chosenReason: sol.solution_reasoning || '',
              fileUrl: sol.file_url || null
            });
          }
        }
      } catch (err) {
        console.error('Failed to load group details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const payload = {
        user_id: user?.id || 3,
        user_name: user?.name || 'Ahmad Fauzan',
        user_avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        content: inputMessage.trim()
      };

      const res = await request.post(API_ENDPOINTS.GROUPS.DISCUSSIONS(1), payload);
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data]);
        setInputMessage('');
      }
    } catch (err) {
      toast.error('Gagal mengirim pesan: ' + err.message);
    }
  };

  const handleAddAlternative = () => {
    const newAlt = {
      id: Date.now(),
      title: `Alternatif Solusi ${solutionForm.alternatives.length + 1}`,
      explanation: '',
      pros: '',
      cons: ''
    };
    setSolutionForm(prev => ({
      ...prev,
      alternatives: [...prev.alternatives, newAlt]
    }));
    toast.success('Alternatif solusi baru ditambahkan!');
  };

  const handleRemoveAlternative = (id) => {
    if (solutionForm.alternatives.length <= 1) {
      toast.error('Minimal harus ada 1 alternatif solusi.');
      return;
    }
    setSolutionForm(prev => ({
      ...prev,
      alternatives: prev.alternatives.filter(a => a.id !== id)
    }));
  };

  const handleUpdateAlternative = (id, field, value) => {
    setSolutionForm(prev => ({
      ...prev,
      alternatives: prev.alternatives.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  const handleSaveWorkspace = async () => {
    setIsSaving(true);
    try {
      const res = await request.post(API_ENDPOINTS.GROUPS.SOLUTION(1), {
        problem_analysis: solutionForm.problemAnalysis,
        facts_identified: solutionForm.factsIdentified,
        inquiry_questions: solutionForm.inquiryQuestions,
        solution_alternatives: JSON.stringify(solutionForm.alternatives),
        chosen_solution: solutionForm.chosenSolution,
        solution_reasoning: solutionForm.chosenReason,
        file_url: solutionForm.fileUrl,
        status: 'submitted'
      });

      if (res.success) {
        toast.success('Investigasi kelompok berhasil disimpan ke backend & siap dipresentasikan!');
        if (onComplete) onComplete();
      }
    } catch (err) {
      toast.error('Gagal menyimpan formulasi solusi: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-100 mb-2">
          <Users size={16} />
          <span>Sintaks 3 • Collaborative Learning</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Collaborative Investigation: Ruang Kerja Kelompok
        </h2>
        <p className="text-xs sm:text-sm text-amber-50 mt-2 max-w-2xl leading-relaxed">
          Diskusikan hasil temuan bersama tim, formulasikan minimal 2 alternatif solusi biologi terpadu, dan pilih solusi inovatif terbaik kelompok Anda.
        </p>
      </div>

      {/* Group Info & Online Attendance Bar */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Workspace Kelompok 1
            </span>
            <span className="text-xs font-semibold text-slate-500">• XI IPA 2</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">
            Topik: Bioremediasi Limbah Fosfat dengan Fotobioreaktor Mikroalga
          </h3>
        </div>

        {/* Member Status Pill Cards */}
        <div className="flex items-center gap-2 flex-wrap">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs shadow-xs"
              title={`${m.name} (${m.role}) - ${m.status === 'online' ? 'Online' : 'Offline / Daring'}`}
            >
              <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
              <span className="font-bold text-slate-700 max-w-[80px] truncate">{m.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  m.status === 'online' ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300'
                }`}
              ></span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Discussion Thread (Left) & Solution Formulation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Group Discussion Thread */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex flex-col h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <MessageSquare size={18} className="text-amber-600" />
              <span>Diskusi Kelompok Realtime</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ● Live Chat
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
            {messages.map((msg) => {
              const isMe = msg.userId === user?.id || (user?.role === 'student' && msg.userId === 3);
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img src={msg.avatar} alt={msg.userName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                    isMe ? 'bg-amber-500 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`font-bold ${isMe ? 'text-amber-100' : 'text-slate-700'}`}>{msg.userName}</span>
                      <span className={`text-[10px] ${isMe ? 'text-amber-200' : 'text-slate-400'}`}>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Send Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tulis ide atau tanggapan kelompok..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-colors"
              title="Kirim Pesan"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Right: Solution Formulation Matrix & Worksheets */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Formulasi Solusi Biologi</h3>
              <p className="text-xs text-slate-400">Analisis dan rumuskan alternatif solusi kelompok.</p>
            </div>
            <button
              type="button"
              onClick={handleAddAlternative}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Tambah Alternatif</span>
            </button>
          </div>

          {/* Analisis Masalah Kelompok */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Analisis Akar Masalah (Biologi & Ekologi)
            </label>
            <textarea
              rows={3}
              value={solutionForm.problemAnalysis}
              onChange={(e) => setSolutionForm(prev => ({ ...prev, problemAnalysis: e.target.value }))}
              placeholder="Analisis mendalam mengapa fenomena ini terjadi secara biokimia dan ekologi..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Alternatif Solusi Cards */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Daftar Alternatif Solusi Kelompok
            </label>

            {solutionForm.alternatives.map((alt, idx) => (
              <div key={alt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
                    Solusi #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAlternative(alt.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                    title="Hapus Alternatif"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  type="text"
                  value={alt.title}
                  onChange={(e) => handleUpdateAlternative(alt.id, 'title', e.target.value)}
                  placeholder="Judul Solusi..."
                  className="w-full font-bold text-xs sm:text-sm p-2.5 bg-white border border-slate-200 rounded-xl"
                />

                <textarea
                  rows={2}
                  value={alt.explanation}
                  onChange={(e) => handleUpdateAlternative(alt.id, 'explanation', e.target.value)}
                  placeholder="Penjelasan mekanisme kerja solusi..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 block mb-1">Kelebihan / Pros</span>
                    <input
                      type="text"
                      value={alt.pros}
                      onChange={(e) => handleUpdateAlternative(alt.id, 'pros', e.target.value)}
                      placeholder="Kelebihan solusi..."
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-rose-700 block mb-1">Kekurangan / Cons</span>
                    <input
                      type="text"
                      value={alt.cons}
                      onChange={(e) => handleUpdateAlternative(alt.id, 'cons', e.target.value)}
                      placeholder="Kekurangan solusi..."
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Solusi Terpilih */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
              Solusi Terpilih Kelompok & Alasan Saintifik
            </label>

            <select
              value={solutionForm.chosenSolution}
              onChange={(e) => setSolutionForm(prev => ({ ...prev, chosenSolution: e.target.value }))}
              className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
            >
              {solutionForm.alternatives.map((alt) => (
                <option key={alt.id} value={alt.title}>
                  {alt.title}
                </option>
              ))}
            </select>

            <textarea
              rows={3}
              value={solutionForm.chosenReason}
              onChange={(e) => setSolutionForm(prev => ({ ...prev, chosenReason: e.target.value }))}
              placeholder="Mengapa kelompok memilih solusi tersebut sebagai solusi terbaik?..."
              className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs sm:text-sm text-slate-800"
            />
          </div>

          {/* Optional File Attachment */}
          <FileUpload
            label="Unggah Berkas Lembar Kerja / Laporan Kelompok (Opsional)"
            description="Format: PDF, PPTX, DOCX, atau Gambar Rancangan"
          />

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveWorkspace}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>Simpan & Lanjut ke Presentation & Discussion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
