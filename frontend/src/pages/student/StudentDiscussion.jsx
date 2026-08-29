import React from 'react';
import { Stage3CollaborativeWorkspace } from '../../components/stages/Stage3CollaborativeWorkspace';

export const StudentDiscussion = () => {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Ruang Kolaborasi & Diskusi Kelompok
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Akses cepat ruang diskusi dan formulasi solusi kelompok aktif Anda.
        </p>
      </div>

      <Stage3CollaborativeWorkspace />
    </div>
  );
};
