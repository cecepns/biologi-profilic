import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  BarChart3,
  Settings,
  GraduationCap,
  Sparkles,
  Layers,
  History,
  HelpCircle,
  X
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const teacherNav = [
    { name: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Pembelajaran ProFLiC', to: '/teacher/projects', icon: BookOpen },
    { name: 'Materi Pembelajaran', to: '/teacher/materials', icon: Layers },
    { name: 'Ruang Diskusi', to: '/teacher/discussions', icon: Users },
    { name: 'Manajemen Kelas', to: '/teacher/classes', icon: GraduationCap },
    { name: 'Penilaian & Rubrik', to: '/teacher/grading', icon: Award },
    { name: 'Laporan Pembelajaran', to: '/teacher/reports', icon: BarChart3 },
  ];

  const adminNav = [
    { name: 'Dashboard Admin', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Data Pengguna', to: '/admin/users', icon: Users },
    { name: 'Data Kelas & Mapel', to: '/admin/classes', icon: GraduationCap },
    { name: 'Materi Pembelajaran', to: '/admin/materials', icon: Layers },
    { name: 'Monitoring Diskusi', to: '/admin/discussions', icon: Users },
    { name: 'Audit Log Aktivitas', to: '/admin/logs', icon: History },
  ];

  const studentNav = [
    { name: 'Beranda Pembelajaran', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Proyek ProFLiC', to: '/student/projects', icon: BookOpen },
    { name: 'Perpustakaan Materi', to: '/student/materials', icon: Layers },
    { name: 'Ruang Diskusi', to: '/student/discussion', icon: Users },
    { name: 'Profil & Capaian', to: '/student/profile', icon: GraduationCap },
  ];

  const currentNav = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-100 flex flex-col justify-between py-6 px-4 transition-transform duration-200 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="BioProFLiC Logo"
                className="w-10 h-10 object-contain drop-shadow-sm shrink-0"
              />
              <div>
                <h1 className="font-extrabold text-lg text-slate-800 tracking-tight leading-tight">BioProFLiC</h1>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                  {role === 'teacher' ? 'Panel Pendidik' : role === 'admin' ? 'Super Admin' : 'Portal Siswa'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {currentNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Banner Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold">
            💡
          </div>
          <p className="text-xs font-bold text-slate-800">5 Sintaks ProFLiC</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Flipped, PBL, Collaborative & Reflection</p>
        </div>
      </aside>
    </>
  );
};
