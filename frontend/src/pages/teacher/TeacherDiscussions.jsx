import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
  Lightbulb,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

export const TeacherDiscussions = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(1);

  const [loading, setLoading] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef(null);

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await request.get(API_ENDPOINTS.PROJECTS.LIST, { limit: 50 });
        if (res.success && res.data && res.data.length > 0) {
          setProjects(res.data);
          setSelectedProjectId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch groups whenever selected project changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedProjectId) return;
      try {
        const res = await request.get(API_ENDPOINTS.GROUPS.LIST, { projectId: selectedProjectId });
        if (res.success && res.data) {
          setGroups(res.data);
          if (res.data.length > 0) {
            setSelectedGroupId(res.data[0].id);
          } else {
            setGroupData(null);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
      }
    };
    fetchGroups();
  }, [selectedProjectId]);

  // Fetch group details (members, discussions, solution draft)
  const fetchGroupDetails = async () => {
    if (!selectedGroupId) return;
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.GROUPS.DETAIL(selectedGroupId));
      if (res.success && res.data) {
        setGroupData(res.data);
        setMessages(res.data.discussions || []);
      }
    } catch (err) {
      toast.error('Gagal memuat data diskusi kelompok: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [selectedGroupId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedGroupId) return;

    setSending(true);
    try {
      const payload = {
        user_id: user?.id || 1,
        user_name: `${user?.name || 'Pendidik'} (${user?.role === 'admin' ? 'Super Admin' : 'Guru Pembimbing'})`,
        content: inputMessage.trim()
      };

      const res = await request.post(API_ENDPOINTS.GROUPS.DISCUSSIONS(selectedGroupId), payload);
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data]);
        setInputMessage('');
        toast.success('Pesan arahan berhasil dikirim ke kelompok!');
      }
    } catch (err) {
      toast.error('Gagal mengirim pesan: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Ruang Diskusi & Monitoring Kolaborasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau ruang investigasi kelompok siswa, keaktifan anggota, serta berikan bimbingan terarah.
          </p>
        </div>

        <button
          onClick={fetchGroupDetails}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Segarkan Diskusi</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Pilih Topik Proyek Pembelajaran
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title} ({p.class_name})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Pilih Kelompok Siswa
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} - {g.topic_focus || 'Investigasi'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Column Discussion Room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-150 p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[550px]">
          <div>
            {/* Group Title & Info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {groupData?.name || 'Kelompok Siswa'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Fokus: {groupData?.topic_focus || 'Bioremediasi Lingkungan'}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                Mode Pendidik Aktif
              </span>
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada pesan diskusi di kelompok ini. Mulai dengan memberikan arahan pembuka!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isTeacherOrMe = msg.user_id === user?.id || (msg.user_name && msg.user_name.includes('Pendidik')) || (msg.user_name && msg.user_name.includes('Guru'));

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 ${isTeacherOrMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isTeacherOrMe && (
                        <img
                          src={msg.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={msg.user_name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      )}

                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm space-y-1 ${
                          isTeacherOrMe
                            ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                            : 'bg-slate-50 border border-slate-150 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 font-bold">
                          <span>{msg.user_name}</span>
                          <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {isTeacherOrMe && (
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                          👨‍🏫
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>
          </div>

          {/* Teacher Message Input */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tulis arahan guru / masukan pembimbing untuk kelompok ini..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              <span className="hidden sm:inline">Kirim Arahan</span>
            </button>
          </form>
        </div>

        {/* Right 1 Col: Members & Solution Preview */}
        <div className="space-y-6">
          {/* Members List Card */}
          <div className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                <span>Anggota Kelompok ({groupData?.members?.length || 0})</span>
              </h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {groupData?.members?.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative">
                      <img
                        src={m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={m.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white ${m.online_status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 block truncate">{m.name}</span>
                      <span className="text-[10px] text-slate-400">NIS: {m.nis || '-'}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                    {m.role === 'leader' ? 'Ketua' : 'Anggota'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Draft Preview */}
          <div className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                <span>Draft Solusi Kelompok</span>
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${groupData?.solution?.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {groupData?.solution?.status === 'submitted' ? 'Telah Disubmit' : 'Draft Kerja'}
              </span>
            </div>

            {groupData?.solution ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Solusi Terpilih:</span>
                  <p className="text-emerald-700 font-semibold mt-0.5">
                    {groupData.solution.chosen_solution || 'Belum dipilih'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Analisis Masalah:</span>
                  <p className="text-slate-600 line-clamp-3 leading-relaxed mt-0.5">
                    {groupData.solution.problem_analysis || 'Belum diisi'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Kelompok belum membuat draf perumusan solusi.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
