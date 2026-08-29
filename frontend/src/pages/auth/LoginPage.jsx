import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, User, ArrowRight, ShieldCheck, GraduationCap, School, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoadingKey, setDemoLoadingKey] = useState(null);

  const demoAccounts = [
    {
      key: 'admin',
      name: 'Super Administrator',
      desc: 'Kelola Akun, Kelas & Audit Log',
      username: 'admin',
      password: 'password123',
      role: 'admin',
      badge: 'Admin',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '⚡'
    },
    {
      key: 'teacher',
      name: 'Ibu Maya Sartika, M.Pd.',
      desc: 'Guru Biologi • Rombel XI IPA',
      username: 'guru_maya',
      password: 'password123',
      role: 'teacher',
      badge: 'Guru',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '👩‍🏫'
    },
    {
      key: 'student_ahmad',
      name: 'Ahmad Fauzan',
      desc: 'Siswa • NIS: 20261101 (XI IPA 2)',
      username: 'ahmad',
      password: 'password123',
      role: 'student',
      badge: 'Siswa Ketua',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: '👨‍🎓'
    },
    {
      key: 'student_citra',
      name: 'Citra Lestari',
      desc: 'Siswa • NIS: 20261103 (XI IPA 2)',
      username: 'citra',
      password: 'password123',
      role: 'student',
      badge: 'Siswa Anggota',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: '👩‍🎓'
    },
    {
      key: 'student_budi',
      name: 'Budi Santoso',
      desc: 'Siswa • NIS: 20261102 (XI IPA 2)',
      username: 'budi',
      password: 'password123',
      role: 'student',
      badge: 'Siswa Anggota',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: '👨‍🎓'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Silakan isi Username atau NIS.');
      return;
    }
    setLoading(true);
    const result = await login(username, password || 'password123');
    setLoading(false);
    if (result?.success && result.user) {
      if (result.user.role === 'admin') navigate('/admin/dashboard');
      else if (result.user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
  };

  const handleQuickLogin = async (acc) => {
    setDemoLoadingKey(acc.key);
    setUsername(acc.username);
    setPassword(acc.password);
    const result = await login(acc.username, acc.password);
    setDemoLoadingKey(null);
    if (result?.success && result.user) {
      if (result.user.role === 'admin') navigate('/admin/dashboard');
      else if (result.user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden border border-emerald-800/30">
        
        {/* Top Biology Accent Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-600/30 mx-auto">
            🧬
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
            BioProFLiC
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Platform Pembelajaran Biologi SMA Berbasis 5 Sintaks ProFLiC (Problem-Based & Flipped Learning)
          </p>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              NIS / Username
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: ahmad, guru_maya, atau admin"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (default: password123)"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!demoLoadingKey}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Memproses ke Server...' : 'Masuk ke BioProFLiC'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Login Section (Placed below login form) */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              <span>Daftar Akun Demo (Quick Login via API):</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
              Klik Langsung Masuk
            </span>
          </div>

          <div className="space-y-2">
            {demoAccounts.map((acc) => {
              const isSelected = demoLoadingKey === acc.key;
              return (
                <button
                  key={acc.key}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading || !!demoLoadingKey}
                  className="w-full p-2.5 sm:p-3 bg-white hover:bg-emerald-100/50 border border-emerald-200/90 rounded-xl text-left transition-all shadow-xs flex items-center justify-between group hover:border-emerald-400 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{acc.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700">
                          {acc.name}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${acc.badgeClass}`}>
                          {acc.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {acc.desc} • User: <span className="font-mono text-slate-700 font-bold">{acc.username}</span>
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <span className="text-xs text-emerald-600 font-bold animate-pulse">Menghubungkan...</span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white transition-all flex items-center">
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-600 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Progressive Web App (PWA) • Terintegrasi REST API Express & MySQL</span>
          </p>
        </div>
      </div>
    </div>
  );
};

