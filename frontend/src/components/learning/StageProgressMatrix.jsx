import React from 'react';
import { CheckCircle2, Clock, MinusCircle } from 'lucide-react';

export const StageProgressMatrix = ({ students = [] }) => {
  const getStatusIcon = (status) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 size={13} className="text-emerald-600" /> Selesai
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-200">
          <Clock size={13} className="text-amber-600 animate-spin" /> Berjalan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
        <MinusCircle size={13} /> Belum
      </span>
    );
  };

  const sampleMonitoring = [
    { id: 1, name: 'Ahmad Fauzan', nis: '20261101', group: 'Kelompok 1', s1: 'completed', s2: 'completed', s3: 'in_progress', s4: 'in_progress', s5: 'not_started' },
    { id: 2, name: 'Citra Lestari', nis: '20261103', group: 'Kelompok 1', s1: 'completed', s2: 'completed', s3: 'in_progress', s4: 'in_progress', s5: 'not_started' },
    { id: 3, name: 'Budi Santoso', nis: '20261102', group: 'Kelompok 1', s1: 'completed', s2: 'completed', s3: 'in_progress', s4: 'in_progress', s5: 'not_started' },
    { id: 4, name: 'Dinda Putri', nis: '20261104', group: 'Kelompok 1', s1: 'completed', s2: 'completed', s3: 'in_progress', s4: 'in_progress', s5: 'not_started' },
    { id: 5, name: 'Eko Pratama', nis: '20261105', group: 'Kelompok 1', s1: 'completed', s2: 'completed', s3: 'in_progress', s4: 'in_progress', s5: 'not_started' }
  ];

  const list = students.length > 0 ? students : sampleMonitoring;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 px-4 rounded-l-xl">Siswa</th>
            <th className="py-3.5 px-3">Kelompok</th>
            <th className="py-3.5 px-3 text-center text-blue-600">1. Pre-Class</th>
            <th className="py-3.5 px-3 text-center text-emerald-600">2. Problem</th>
            <th className="py-3.5 px-3 text-center text-amber-600">3. Investigasi</th>
            <th className="py-3.5 px-3 text-center text-purple-600">4. Presentasi</th>
            <th className="py-3.5 px-3 text-center text-teal-600 rounded-r-xl">5. Refleksi & Evaluasi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {list.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4">
                <p className="font-bold text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-400">NIS: {s.nis}</p>
              </td>
              <td className="py-3 px-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {s.group}
                </span>
              </td>
              <td className="py-3 px-3 text-center">{getStatusIcon(s.s1)}</td>
              <td className="py-3 px-3 text-center">{getStatusIcon(s.s2)}</td>
              <td className="py-3 px-3 text-center">{getStatusIcon(s.s3)}</td>
              <td className="py-3 px-3 text-center">{getStatusIcon(s.s4)}</td>
              <td className="py-3 px-3 text-center">{getStatusIcon(s.s5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
