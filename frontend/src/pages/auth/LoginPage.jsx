import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

import logoImg from '../../assets/logo.png';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Silakan masukkan Username atau NIS.');
      return;
    }
    if (!password) {
      toast.error('Silakan masukkan Kata Sandi.');
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    
    if (result?.success && result.user) {
      if (result.user.role === 'admin') navigate('/admin/dashboard');
      else if (result.user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden border border-emerald-800/30">
        
        {/* Top Biology Accent Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img src={logoImg} alt="BioProFLiC Logo" className="h-16 w-auto object-contain drop-shadow-md mx-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
            BioProFLiC
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Platform Pembelajaran Biologi SMA Berbasis Model ProFLiC (Problem-based, Flipped & Collaborative Learning)
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
                placeholder="Masukkan NIS atau Username"
                autoComplete="username"
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
                placeholder="Masukkan Kata Sandi"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Memproses ke Server...' : 'Masuk ke BioProFLiC'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-600 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Progressive Web App (PWA) • BioProFLiC</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
