import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DebounceInput } from '../../components/common/DebounceInput';
import { Pagination } from '../../components/common/Pagination';
import { Users, Plus, Edit2, Trash2, Shield, GraduationCap, CheckCircle2, User, Key, Phone, RefreshCw } from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'student',
    password: 'password123',
    nis: '',
    phone: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    role: 'student',
    password: '',
    nis: '',
    phone: '',
    status: 'active'
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, {
        page,
        limit,
        search,
        role: roleFilter
      });
      if (res?.success) {
        setUsersList(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await request.post(API_ENDPOINTS.USERS.CREATE, {
        name: formData.name,
        username: formData.username,
        role: formData.role,
        password: formData.password || 'password123',
        nis: formData.nis,
        phone: formData.phone
      });
      if (res?.success) {
        toast.success(`Pengguna ${formData.name} berhasil didaftarkan!`);
        setIsModalOpen(false);
        setFormData({ name: '', username: '', role: 'student', password: 'password123', nis: '', phone: '' });
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan pengguna.');
    }
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setEditFormData({
      name: u.name || '',
      username: u.username || '',
      role: u.role || 'student',
      password: '',
      nis: u.nis || '',
      phone: u.phone || '',
      status: u.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload = {
        name: editFormData.name,
        username: editFormData.username,
        role: editFormData.role,
        nis: editFormData.nis,
        phone: editFormData.phone,
        status: editFormData.status
      };
      if (editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }

      const res = await request.put(API_ENDPOINTS.USERS.UPDATE(editingUser.id), payload);
      if (res?.success) {
        toast.success(`Data akun ${editFormData.name} berhasil diperbarui!`);
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui data pengguna.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await request.delete(API_ENDPOINTS.USERS.DELETE(deleteTarget.id));
      toast.success(`Pengguna ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error('Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-600" size={24} />
            <span>Data Pengguna BioProFLiC</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola hak akses Guru, Siswa, dan Administrator sekolah secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-300 text-slate-700 hover:text-emerald-600 rounded-xl transition-colors shadow-xs cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={18} />
            <span>Tambah Akun</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setRoleFilter('all'); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              roleFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Semua Role
          </button>
          <button
            onClick={() => { setRoleFilter('teacher'); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              roleFilter === 'teacher' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            👨‍🏫 Guru Biologi
          </button>
          <button
            onClick={() => { setRoleFilter('student'); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              roleFilter === 'student' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            👨‍🎓 Siswa
          </button>
          <button
            onClick={() => { setRoleFilter('admin'); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              roleFilter === 'admin' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            ⚡ Super Admin
          </button>
        </div>

        <DebounceInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Cari nama, username atau NIS..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 rounded-l-xl">Nama Pengguna</th>
                <th className="py-3.5 px-3">Username / NIS</th>
                <th className="py-3.5 px-3">Peran / Role</th>
                <th className="py-3.5 px-3">Kelas / Rombel</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada data pengguna yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          {u.phone && <span className="text-[11px] text-slate-500">{u.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-mono font-bold text-slate-700">
                      {u.username}
                      {u.nis && <span className="block font-sans text-[11px] text-slate-400 font-normal">NIS: {u.nis}</span>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                          u.role === 'teacher'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : u.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 font-medium">
                      {u.class_name || (u.role === 'student' ? 'XI IPA 2' : '-')}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Aktif
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Pengguna"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* Modal Buat Akun */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Akun Pengguna Baru">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Rian Pratama, S.Pd. atau Citra Dewi"
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Username / Login ID
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Contoh: rian_guru atau 20261108"
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Peran / Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="student">👨‍🎓 Siswa (Student)</option>
                <option value="teacher">👩‍🏫 Guru Biologi (Teacher)</option>
                <option value="admin">⚡ Super Admin (Administrator)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                {formData.role === 'student' ? 'Nomor Induk Siswa (NIS)' : formData.role === 'teacher' ? 'NIP Guru' : 'Identitas'}
              </label>
              <input
                type="text"
                value={formData.nis}
                onChange={(e) => setFormData(prev => ({ ...prev, nis: e.target.value }))}
                placeholder={formData.role === 'student' ? 'Contoh: 20261108' : 'Contoh: 19850412...'}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Kata Sandi Default
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="password123"
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
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
              Daftarkan Pengguna
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Akun */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Pengguna: ${editingUser?.name || ''}`}>
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Username / Login ID
              </label>
              <input
                type="text"
                value={editFormData.username}
                onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Peran / Role
              </label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="student">👨‍🎓 Siswa (Student)</option>
                <option value="teacher">👩‍🏫 Guru Biologi (Teacher)</option>
                <option value="admin">⚡ Super Admin (Administrator)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                {editFormData.role === 'student' ? 'Nomor Induk Siswa (NIS)' : 'NIP / ID'}
              </label>
              <input
                type="text"
                value={editFormData.nis}
                onChange={(e) => setEditFormData(prev => ({ ...prev, nis: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Ubah Kata Sandi (Kosongkan jika tidak diubah)
              </label>
              <input
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Masukkan sandi baru..."
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Hapus */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Akun Pengguna?"
        message={`Apakah Anda yakin ingin menghapus akun "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};


