import React from 'react';
import { Users, GraduationCap, BookOpen, Shuffle, ShieldCheck, History, Activity, Sparkles } from 'lucide-react';

export const AdminDashboard = () => {
  const stats = [
    { title: 'Total Guru', value: '4', icon: GraduationCap, color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Siswa', value: '72', icon: Users, color: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Kelas', value: '4', icon: ShieldCheck, color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Proyek Pembelajaran', value: '6', icon: BookOpen, color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentLogs = [
    { id: 1, user: 'Ibu Maya Sartika, M.Pd.', role: 'Guru', action: 'Membuat Proyek Baru: Ekosistem di Sekitarku', time: '10 menit lalu' },
    { id: 2, user: 'Ahmad Fauzan', role: 'Siswa', action: 'Menyelesaikan Sintaks 1 Pre-Class Preparation', time: '25 menit lalu' },
    { id: 3, user: 'Kelompok 1 (Fitoplankton)', role: 'Kelompok', action: 'Mengunggah Solusi Alternatif Fotobioreaktor', time: '40 menit lalu' },
    { id: 4, user: 'Ibu Maya Sartika, M.Pd.', role: 'Guru', action: 'Memberikan Nilai Rubrik Presentasi Kelompok 1', time: '1 jam lalu' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
          Super Administrator Panel
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Dashboard Sistem BioProFLiC
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
          Pemantauan kesehatan infrastruktur server, basis data MySQL, manajemen pengguna, dan aktivitas pembelajaran Biologi.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${st.bg} ${st.text} flex items-center justify-center font-bold shrink-0`}>
                <Icon size={26} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold">{st.title}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{st.value}</h3>
                <span className="text-[10px] text-emerald-600 font-bold">● Sistem Normal</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Activity & Health Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-800">Aktivitas Pembelajaran Terkini</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Live Stream</span>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.user}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">{log.role}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.action}</p>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck size={18} className="text-purple-600" />
            <h3 className="text-base font-extrabold text-slate-800">Status Server & Database</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900">Backend Express API</span>
              <span className="font-extrabold text-emerald-700">Online (Port 5000)</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900">Database MySQL Ready</span>
              <span className="font-extrabold text-emerald-700">sql/database.sql Synced</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900">Upload Folder</span>
              <span className="font-extrabold text-emerald-700">uploads-bioproflic/ Active</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <span className="font-bold text-emerald-900">PWA Manifest & Cache</span>
              <span className="font-extrabold text-emerald-700">Standalone Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
