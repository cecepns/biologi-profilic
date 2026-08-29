import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Layers, Plus, Trash2, GraduationCap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminClasses = () => {
  const [classes, setClasses] = useState([
    { id: 1, name: 'XI IPA 2', grade: 'XI', schoolYear: '2026/2027', teacher: 'Ibu Maya Sartika, M.Pd.', studentsCount: 32, code: 'XI-IPA2-2026' },
    { id: 2, name: 'XI IPA 1', grade: 'XI', schoolYear: '2026/2027', teacher: 'Ibu Maya Sartika, M.Pd.', studentsCount: 30, code: 'XI-IPA1-2026' },
    { id: 3, name: 'X IPA 1', grade: 'X', schoolYear: '2026/2027', teacher: 'Bpk. Hendra, S.Pd.', studentsCount: 34, code: 'X-IPA1-2026' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const handleAddClass = (e) => {
    e.preventDefault();
    const newCls = {
      id: classes.length + 1,
      name: newClassName,
      grade: 'XI',
      schoolYear: '2026/2027',
      teacher: 'Ibu Maya Sartika, M.Pd.',
      studentsCount: 0,
      code: `KLS-${Date.now().toString().slice(-4)}`
    };
    setClasses(prev => [newCls, ...prev]);
    setIsModalOpen(false);
    setNewClassName('');
    toast.success(`Kelas ${newCls.name} berhasil ditambahkan!`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Kelas & Rombel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar kelas aktif untuk implementasi proyek pembelajaran Biologi ProFLiC.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Kelas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <GraduationCap size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {cls.code}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{cls.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tingkat {cls.grade} • TP {cls.schoolYear}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
              <div className="flex justify-between">
                <span>Wali Guru:</span>
                <strong className="text-slate-800">{cls.teacher}</strong>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Siswa:</span>
                <strong className="text-slate-800">{cls.studentsCount} Siswa</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Class */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Kelas Baru">
        <form onSubmit={handleAddClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">Nama Kelas / Rombel</label>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Contoh: XI IPA 3"
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all"
            >
              Simpan Kelas
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
