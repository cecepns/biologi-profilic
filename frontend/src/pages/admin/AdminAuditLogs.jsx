import React, { useState } from 'react';
import { History, Search, CheckCircle2, Shield } from 'lucide-react';
import { DebounceInput } from '../../components/common/DebounceInput';
import { Pagination } from '../../components/common/Pagination';

export const AdminAuditLogs = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const logs = [
    { id: 1, user: 'Ibu Maya Sartika, M.Pd.', role: 'Guru', action: 'CREATE_PROJECT', details: 'Membuat proyek pembelajaran baru: Ekosistem di Sekitarku', ip: '192.168.1.12', time: '28 Agu 2026 08:30:15' },
    { id: 2, user: 'Ahmad Fauzan', role: 'Siswa', action: 'COMPLETE_STAGE_1', details: 'Menyelesaikan modul video dan PDF ekosistem', ip: '192.168.1.45', time: '28 Agu 2026 09:15:20' },
    { id: 3, user: 'Kelompok 1 (Fitoplankton)', role: 'Kelompok', action: 'SUBMIT_SOLUTIONS', details: 'Mengunggah formulasi solusi alternatif fotobioreaktor', ip: '192.168.1.45', time: '28 Agu 2026 10:15:40' },
    { id: 4, user: 'Ibu Maya Sartika, M.Pd.', role: 'Guru', action: 'GRADE_RUBRIC', details: 'Memberikan nilai 90.00 untuk presentasi Kelompok 1', ip: '192.168.1.12', time: '28 Agu 2026 11:45:00' },
    { id: 5, user: 'Ahmad Fauzan', role: 'Siswa', action: 'SUBMIT_QUIZ', details: 'Menyelesaikan CBT Kuis Evaluasi Pemahaman Ekosistem (Skor: 95)', ip: '192.168.1.45', time: '28 Agu 2026 12:22:10' },
    { id: 6, user: 'Administrator', role: 'Admin', action: 'SYSTEM_BACKUP', details: 'Export otomatis struktur basis data sql/database.sql', ip: '127.0.0.1', time: '28 Agu 2026 07:00:00' },
  ];

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Audit Log Aktivitas Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekam jejak setiap aksi penting guru, siswa, dan sistem dalam pembelajaran ProFLiC.
          </p>
        </div>

        <DebounceInput
          value={search}
          onChange={setSearch}
          placeholder="Cari aktivitas / pengguna..."
          className="w-full sm:w-72"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 rounded-l-xl">Waktu Log</th>
                <th className="py-3.5 px-3">Pengguna</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Aksi</th>
                <th className="py-3.5 px-4">Rincian Aktivitas</th>
                <th className="py-3.5 px-3 text-right rounded-r-xl">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-500 whitespace-nowrap">{l.time}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-800">{l.user}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {l.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{l.details}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-400">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={filtered.length}
          totalPages={Math.ceil(filtered.length / limit) || 1}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
};
