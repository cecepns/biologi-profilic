import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderKanban, BookOpen, MessageSquare, User } from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { label: 'Beranda', to: '/student/dashboard', icon: Home },
    { label: 'Proyek', to: '/student/projects', icon: FolderKanban },
    { label: 'Materi', to: '/student/materials', icon: BookOpen },
    { label: 'Diskusi', to: '/student/discussion', icon: MessageSquare },
    { label: 'Profil', to: '/student/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-100 px-3 py-2 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-600 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
