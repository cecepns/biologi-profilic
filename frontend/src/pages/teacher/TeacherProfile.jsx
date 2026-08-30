import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Award,
  Users,
  Edit3,
  Phone,
  Mail,
  FileText,
  Lock,
  Upload,
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const TeacherProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
    nip: '',
    avatar: '',
    password: ''
  });

  const fetchTeacherProfile = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 1;
      const res = await request.get(API_ENDPOINTS.AUTH.PROFILE, { userId });
      if (res.success && res.data) {
        setProfileData(res.data);
      }

      // Fetch classes for stats
      const classRes = await request.get(API_ENDPOINTS.CLASSES.LIST, { limit: 10 });
      if (classRes.success && classRes.data) {
        setClasses(classRes.data);
      }
    } catch (err) {
      console.error('Failed to load teacher profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherProfile();
  }, [user]);

  const handleOpenEditModal = () => {
    setEditForm({
      name: profileData?.name || user?.name || '',
      phone: profileData?.phone || user?.phone || '',
      bio: profileData?.bio || user?.bio || '',
      nip: profileData?.nip || user?.nip || '',
      avatar: profileData?.avatar || user?.avatar || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const toastId = toast.loading('Mengunggah foto profil...');
    try {
      const res = await request.uploadFile(API_ENDPOINTS.UPLOAD, file);
      if (res.success && res.fileUrl) {
        setEditForm(prev => ({ ...prev, avatar: res.fileUrl }));
        toast.success('Foto profil berhasil diunggah!', { id: toastId });
      } else {
        toast.error(res?.message || 'Gagal mengunggah foto profil.', { id: toastId });
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah foto profil.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Nama lengkap pendidik wajib diisi!');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: user?.id || 1,
        userId: user?.id || 1,
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        bio: editForm.bio.trim(),
        nip: editForm.nip.trim(),
        avatar: editForm.avatar
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await request.put(API_ENDPOINTS.AUTH.PROFILE, payload);
      if (res.success) {
        toast.success('Profil pendidik berhasil diperbarui!');
        updateUser({
          name: editForm.name.trim(),
          avatar: editForm.avatar,
          phone: editForm.phone.trim(),
          bio: editForm.bio.trim(),
          nip: editForm.nip.trim()
        });
        setIsEditModalOpen(false);
        fetchTeacherProfile();
      } else {
        toast.error(res.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      toast.error('Gagal memperbarui profil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="text-xs font-bold text-slate-500">Memuat profil pendidik...</p>
      </div>
    );
  }

  const teacherName = profileData?.name || user?.name || 'Bapak/Ibu Guru';
  const teacherNip = profileData?.nip || user?.nip || '198503152010012004';
  const teacherPhone = profileData?.phone || user?.phone || '0812-3456-7890';
  const teacherBio = profileData?.bio || user?.bio || 'Pendidik Biologi SMA berdedikasi dalam mengembangkan pembelajaran inkuiri berbasis 5 Sintaks ProFLiC untuk mencetak generasi saintis unggul.';

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">
          <GraduationCap size={16} />
          <span>Profil Pendidik & Pengampu Biologi SMA</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Manajemen Profil Guru & Instruktur
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-2xl leading-relaxed">
          Kelola informasi identitas, foto profil, NIP, kontak pembimbing, serta pantau ringkasan kelas binaan model pembelajaran ProFLiC.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="relative group shrink-0">
          <UserAvatar
            src={user?.avatar || profileData?.avatar}
            alt={teacherName}
            size="2xl"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-emerald-500/20 shadow-md"
          />
          <button
            onClick={handleOpenEditModal}
            className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Ubah Foto Profil"
          >
            <Edit3 size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{teacherName}</h1>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Guru Pembimbing ProFLiC
            </span>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 space-y-1 font-medium">
            <p>NIP: <strong>{teacherNip}</strong> • Spesialisasi: <strong>Biologi SMA & Ekosistem</strong></p>
            <p>Kontak / WA: <strong>{teacherPhone}</strong></p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 leading-relaxed italic">
            "{teacherBio}"
          </div>

          <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={handleOpenEditModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit Profil & Foto</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-600" />
              Akun Pendidik Terverifikasi
            </span>
          </div>
        </div>
      </div>

      {/* Class and Supervision Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">Kelas Binaan</span>
            <span className="text-2xl font-black text-slate-800">{classes.length || 2} Kelas</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Tahun Ajaran 2026/2027</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">Materi & Sintaks</span>
            <span className="text-2xl font-black text-slate-800">5 Sintaks</span>
            <span className="text-[11px] text-purple-600 font-semibold block mt-0.5">Model ProFLiC Aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">Kelompok Kolaborasi</span>
            <span className="text-2xl font-black text-slate-800">6 Kelompok</span>
            <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">Dalam 2 Sesi Proyek</span>
          </div>
        </div>
      </div>

      {/* Daftar Kelas Yang Diampu */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Daftar Kelas Yang Diampu</h3>
            <p className="text-xs text-slate-400">Kelas-kelas yang aktif mengikuti pembelajaran Biologi model ProFLiC.</p>
          </div>
          <Users size={20} className="text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classes.length > 0 ? (
            classes.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">{c.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Kode: {c.code || 'BIO-XI'} • {c.student_count || 32} Siswa
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                  Aktif
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between col-span-2">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">XI IPA 2 (Biologi Peminatan)</h4>
                <span className="text-xs text-slate-500 font-medium">32 Siswa • Kurikulum Merdeka</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                Aktif
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Profil Guru */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil Pendidik"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Upload Preview */}
          <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <div className="relative">
              <UserAvatar
                src={editForm.avatar}
                alt={editForm.name}
                size="xl"
                className="w-20 h-20 rounded-2xl border-2 border-emerald-400 shadow-sm"
              />
              {editForm.avatar && (
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, avatar: '' }))}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                  title="Hapus foto"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 mx-auto"
              >
                <Upload size={13} />
                <span>{uploadingAvatar ? 'Mengunggah...' : 'Unggah Foto Baru'}</span>
              </button>
              <p className="text-[11px] text-slate-400">Format PNG, JPG, GIF maksimal 2MB.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Nama & Gelar Pendidik <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Dra. Maya Sartika, M.Pd."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Nomor Induk Pegawai (NIP)
              </label>
              <input
                type="text"
                value={editForm.nip}
                onChange={(e) => setEditForm(prev => ({ ...prev, nip: e.target.value }))}
                placeholder="198503152010012004"
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="081234567890"
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Bio / Motto Pendidik
            </label>
            <textarea
              rows={2}
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tuliskan catatan dedikasi atau visi pembelajaran Anda..."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Ubah Kata Sandi (Opsional)
            </label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Kosongkan jika tidak ingin mengubah sandi..."
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
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
              disabled={isSaving || uploadingAvatar}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
