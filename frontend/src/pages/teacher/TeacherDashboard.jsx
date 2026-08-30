import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  AlertCircle,
  ArrowRight,
  Plus,
  BarChart3,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { StageProgressMatrix } from '../../components/learning/StageProgressMatrix';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { title: 'Kelas Aktif', value: '2', subtitle: 'XI IPA 1 & XI IPA 2', icon: GraduationCap, color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Siswa', value: '38', subtitle: 'Terdaftar Aktif', icon: Users, color: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pembelajaran ProFLiC', value: '3', subtitle: '2 Berjalan, 1 Draft', icon: BookOpen, color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Tugas Belum Dinilai', value: '2', subtitle: 'Presentasi & Essay', icon: Award, color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Teacher Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 block mb-1">
            Dashboard Pendidik
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {user?.name || 'Bapak/Ibu Guru'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-xl leading-relaxed">
            Selamat datang di portal manajemen pembelajaran Biologi model ProFLiC. Pantau aktivitas kelompok dan progres 5 sintaks siswa secara real-time.
          </p>
        </div>

        <button
          onClick={() => navigate('/teacher/projects')}
          className="px-5 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <Plus size={18} />
          <span>Buat Pembelajaran Baru</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="bg-white rounded-3xl border border-slate-150 p-5 sm:p-6 shadow-sm flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${st.bg} ${st.text} flex items-center justify-center font-bold shrink-0`}>
                <Icon size={26} />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold">{st.title}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{st.value}</h3>
                <span className="text-[11px] text-slate-400 font-medium">{st.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pembelajaran Aktif Card (Matching Brainstorming Item #4) */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Pembelajaran Aktif Saat Ini</h3>
            <p className="text-xs text-slate-400">Proyek pembelajaran yang sedang berlangsung di kelas.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            26 / 32 Siswa Aktif
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <h4 className="text-lg font-black text-slate-900">Ekosistem di Sekitarku</h4>
              <span className="text-xs font-bold text-slate-500">• Biologi • XI IPA 2</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="font-semibold">Status: <strong className="text-purple-700">Tahap 4 — Presentation & Discussion</strong></span>
              <span>•</span>
              <span className="font-semibold">Progress: <strong className="text-emerald-700">80% Selesai</strong></span>
            </div>

            <div className="w-full max-w-md h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/grading')}
              className="px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl font-bold text-xs transition-colors"
            >
              Beri Nilai Presentasi
            </button>
            <button
              onClick={() => navigate('/teacher/projects')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>Kelola Pembelajaran</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Monitoring Progres Siswa */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Monitoring Progres 5 Sintaks Siswa (XI IPA 2)</h3>
            <p className="text-xs text-slate-400">Pantau ketuntasan masing-masing siswa di setiap tahapan ProFLiC.</p>
          </div>
        </div>

        <StageProgressMatrix />
      </div>
    </div>
  );
};
