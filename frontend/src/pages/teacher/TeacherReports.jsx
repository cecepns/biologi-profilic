import React, { useState } from 'react';
import { BarChart3, Download, Printer, Filter, Users, Award, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const TeacherReports = () => {
  const [selectedClass, setSelectedClass] = useState('XI IPA 2');
  const [selectedProject, setSelectedProject] = useState('Ekosistem di Sekitarku');

  const reportData = [
    { id: 1, name: 'Ahmad Fauzan', nis: '20261101', group: 'Kelompok 1', preClass: 95, problem: 90, investigation: 92, presentation: 90, reflection: 95, evaluation: 95, finalScore: 92.8, status: 'Sangat Baik' },
    { id: 2, name: 'Citra Lestari', nis: '20261103', group: 'Kelompok 1', preClass: 90, problem: 88, investigation: 92, presentation: 90, reflection: 95, evaluation: 90, finalScore: 90.8, status: 'Sangat Baik' },
    { id: 3, name: 'Budi Santoso', nis: '20261102', group: 'Kelompok 1', preClass: 85, problem: 85, investigation: 92, presentation: 90, reflection: 95, evaluation: 85, finalScore: 88.4, status: 'Baik' },
    { id: 4, name: 'Dinda Putri', nis: '20261104', group: 'Kelompok 1', preClass: 80, problem: 82, investigation: 92, presentation: 90, reflection: 95, evaluation: 80, finalScore: 86.2, status: 'Baik' },
    { id: 5, name: 'Eko Pratama', nis: '20261105', group: 'Kelompok 1', preClass: 85, problem: 84, investigation: 92, presentation: 90, reflection: 95, evaluation: 85, finalScore: 88.2, status: 'Baik' }
  ];

  const handleExportCSV = () => {
    const header = 'No,Nama Siswa,NIS,Kelompok,Pre-Class (15%),Problem (20%),Investigation (25%),Presentation (20%),Reflection & Eval (20%),Nilai Akhir,Keterangan\n';
    const rows = reportData.map((r, i) => `${i + 1},${r.name},${r.nis},${r.group},${r.preClass},${r.problem},${r.investigation},${r.presentation},${r.evaluation},${r.finalScore},${r.status}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Nilai_ProFLiC_${selectedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File Rekap Nilai CSV/Excel berhasil diunduh!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Pembelajaran & Rekapitulasi Nilai
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ekspor laporan capaian 5 sintaks ProFLiC per siswa dan per kelompok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer size={16} />
            <span>Cetak Raport</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download size={16} />
            <span>Unduh Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Rata-Rata Nilai Kelas</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">89.3</h3>
          <span className="text-xs text-emerald-600 font-bold">● 100% Ketuntasan Belajar</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Tingkat Partisipasi Pre-Class</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">98.5%</h3>
          <span className="text-xs text-blue-600 font-bold">● Flipped Learning Optimal</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-slate-150 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block">Skor Kolaborasi Investigasi</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">92.0</h3>
          <span className="text-xs text-amber-600 font-bold">● Kerja Sama Tim Efektif</span>
        </div>
      </div>

      {/* Grade Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Daftar Rekapitulasi Nilai Siswa (XI IPA 2)</h3>
            <p className="text-xs text-slate-400">Proyek: Ekosistem di Sekitarku</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-3 rounded-l-xl">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-3">NIS</th>
                <th className="py-3.5 px-3">Kelompok</th>
                <th className="py-3.5 px-2 text-center text-blue-700">Pre-Class (15%)</th>
                <th className="py-3.5 px-2 text-center text-emerald-700">Problem (20%)</th>
                <th className="py-3.5 px-2 text-center text-amber-700">Investigasi (25%)</th>
                <th className="py-3.5 px-2 text-center text-purple-700">Presentasi (20%)</th>
                <th className="py-3.5 px-2 text-center text-teal-700">Refleksi & Eval (20%)</th>
                <th className="py-3.5 px-3 text-center text-slate-900 font-black">Nilai Akhir</th>
                <th className="py-3.5 px-3 text-center rounded-r-xl">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reportData.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-400">{i + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{r.name}</td>
                  <td className="py-3.5 px-3 text-slate-500">{r.nis}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {r.group}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-center font-bold text-slate-700">{r.preClass}</td>
                  <td className="py-3.5 px-2 text-center font-bold text-slate-700">{r.problem}</td>
                  <td className="py-3.5 px-2 text-center font-bold text-slate-700">{r.investigation}</td>
                  <td className="py-3.5 px-2 text-center font-bold text-slate-700">{r.presentation}</td>
                  <td className="py-3.5 px-2 text-center font-bold text-slate-700">{r.evaluation}</td>
                  <td className="py-3.5 px-3 text-center font-black text-sm text-emerald-700 bg-emerald-50/50">
                    {r.finalScore}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
