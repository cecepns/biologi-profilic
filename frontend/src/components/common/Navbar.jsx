import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, ChevronDown, LogOut, CheckCheck, Sparkles, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import logoImg from '../../assets/logo.png';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, switchDemoRole, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 -ml-1 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
              title="Menu Navigasi"
            >
              <Menu size={20} className="sm:w-[22px] sm:h-[22px]" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <img
              src={logoImg}
              alt="BioProFLiC Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="min-w-0">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent block leading-tight truncate">
                BioProFLiC
              </span>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-400 tracking-wider uppercase truncate">
                SMA Kurikulum Merdeka
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: Role Switcher & Notifications & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Demo Switcher Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
            >
              <Sparkles size={12} className="text-emerald-600 shrink-0" />
              <span className="capitalize">{user?.role === 'teacher' ? 'Guru' : user?.role === 'admin' ? 'Admin' : 'Siswa'}</span>
              <ChevronDown size={13} className="shrink-0" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ganti Akun Demo
                </div>
                <button
                  onClick={() => { switchDemoRole('student_ahmad'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-emerald-50 transition-colors ${
                    user?.username === 'ahmad' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">Siswa: Ahmad Fauzan (XI IPA 2)</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('student_citra'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-emerald-50 transition-colors ${
                    user?.username === 'citra' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">Siswa: Citra Lestari (XI IPA 2)</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('teacher'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-emerald-50 transition-colors ${
                    user?.role === 'teacher' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="truncate">Guru: Ibu Maya Sartika, M.Pd.</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('admin'); setShowRoleMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-emerald-50 transition-colors ${
                    user?.role === 'admin' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                  <span className="truncate">Administrator BioProFLiC</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
              }}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="Notifikasi"
            >
              <Bell size={18} className="sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={13} />
                      Tandai Dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-emerald-50/30' : ''}`}
                    >
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
            <UserAvatar
              src={user?.avatar}
              alt={user?.name}
              size="sm"
              className="sm:w-9 sm:h-9"
            />
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-slate-800 block leading-tight line-clamp-1">{user?.name}</span>
              <span className="text-[11px] text-slate-400 block font-medium capitalize">
                {user?.role === 'teacher' ? 'Guru Biologi' : user?.role === 'admin' ? 'Administrator' : `Siswa (${user?.className || 'XI IPA 2'})`}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5"
              title="Keluar"
            >
              <LogOut size={16} className="sm:w-[17px] sm:h-[17px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
