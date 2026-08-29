import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Tv,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Play,
  Search,
  Upload,
  Link2,
  Clock,
  BookOpen,
  Filter,
  CheckCircle2,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DebounceInput } from '../../components/common/DebounceInput';
import { Pagination } from '../../components/common/Pagination';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

export const TeacherMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Filter & Pagination
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    stage_id: 1,
    project_id: 1,
    title: '',
    type: 'pdf',
    embed_url: '',
    file_url: '',
    fileName: '',
    duration_minutes: 15,
    content: ''
  });

  const fetchProjectsAndStages = async () => {
    try {
      const projRes = await request.get(API_ENDPOINTS.PROJECTS.LIST, { limit: 50 });
      if (projRes.success && projRes.data) {
        setProjects(projRes.data);
        if (projRes.data.length > 0) {
          const firstProjId = projRes.data[0].id;
          const stagesRes = await request.get(API_ENDPOINTS.PROJECTS.STAGES(firstProjId));
          if (stagesRes.success && stagesRes.data) {
            setStages(stagesRes.data);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects/stages:', err);
    }
  };

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search,
        type: activeType,
        page,
        limit
      };
      const res = await request.get(API_ENDPOINTS.MATERIALS.LIST, params);
      if (res.success) {
        setMaterials(res.data || []);
        if (res.pagination) {
          setTotal(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      toast.error('Gagal memuat materi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, activeType, page, limit]);

  useEffect(() => {
    fetchProjectsAndStages();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleProjectChange = async (projectId) => {
    setFormData(prev => ({ ...prev, project_id: projectId }));
    try {
      const stagesRes = await request.get(API_ENDPOINTS.PROJECTS.STAGES(projectId));
      if (stagesRes.success && stagesRes.data && stagesRes.data.length > 0) {
        setStages(stagesRes.data);
        setFormData(prev => ({ ...prev, stage_id: stagesRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      stage_id: stages[0]?.id || 1,
      project_id: projects[0]?.id || 1,
      title: '',
      type: 'pdf',
      embed_url: '',
      file_url: '',
      fileName: '',
      duration_minutes: 15,
      content: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      stage_id: item.stage_id || 1,
      project_id: item.project_id || 1,
      title: item.title || '',
      type: item.type || 'pdf',
      embed_url: item.embed_url || '',
      file_url: item.file_url || '',
      fileName: item.file_url ? item.file_url.split('/').pop() : '',
      duration_minutes: item.duration_minutes || 15,
      content: item.content || ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Ukuran berkas maksimal 25 MB.');
      return;
    }

    setUploadingFile(true);
    try {
      const uploadRes = await request.uploadFile(API_ENDPOINTS.UPLOAD, file);
      if (uploadRes.success) {
        setFormData(prev => ({
          ...prev,
          file_url: uploadRes.fileUrl,
          fileName: file.name
        }));
        toast.success(`Berkas "${file.name}" berhasil diunggah!`);
      }
    } catch (err) {
      toast.error('Gagal mengunggah berkas: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul materi wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        stage_id: formData.stage_id,
        title: formData.title.trim(),
        type: formData.type,
        embed_url: formData.type === 'video' ? formData.embed_url : null,
        file_url: formData.type !== 'video' ? formData.file_url : null,
        duration_minutes: formData.duration_minutes || 15,
        content: formData.content
      };

      if (editingItem) {
        const res = await request.put(API_ENDPOINTS.MATERIALS.UPDATE(editingItem.id), payload);
        if (res.success) {
          toast.success('Materi pembelajaran berhasil diperbarui!');
          setIsModalOpen(false);
          fetchMaterials();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.MATERIALS.CREATE, payload);
        if (res.success) {
          toast.success('Materi pembelajaran baru berhasil ditambahkan!');
          setIsModalOpen(false);
          fetchMaterials();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan materi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await request.delete(API_ENDPOINTS.MATERIALS.DELETE(deleteTarget.id));
      if (res.success) {
        toast.success('Materi berhasil dihapus.');
        setDeleteTarget(null);
        fetchMaterials();
      }
    } catch (err) {
      toast.error('Gagal menghapus materi: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Perpustakaan & Manajemen Materi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola repositori materi digital ProFLiC (Video Animasi, Modul PDF, Infografis Bagan, dan Dokumen).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Tambah Materi Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-150 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => { setActiveType('all'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeType === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({total})
          </button>
          <button
            onClick={() => { setActiveType('video'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeType === 'video'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tv size={14} /> Video
          </button>
          <button
            onClick={() => { setActiveType('pdf'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeType === 'pdf'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText size={14} /> Modul PDF
          </button>
          <button
            onClick={() => { setActiveType('image'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeType === 'image'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon size={14} /> Infografis
          </button>
        </div>

        <DebounceInput
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Cari materi berdasarkan judul atau topik..."
          className="w-full md:w-80"
        />
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            📂
          </div>
          <h3 className="font-extrabold text-base text-slate-800">Belum Ada Materi Ditemukan</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {search ? `Tidak ada materi yang cocok dengan pencarian "${search}".` : 'Belum ada materi pembelajaran yang ditambahkan. Silakan klik tombol "Tambah Materi Baru" di atas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => {
            const isVideo = mat.type === 'video';
            const isPdf = mat.type === 'pdf';
            const isImage = mat.type === 'image';

            return (
              <div
                key={mat.id}
                className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {mat.project_topic || 'Biologi SMA'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {mat.duration_minutes ? `${mat.duration_minutes} Menit` : 'Mandiri'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5 pt-1">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                        isVideo
                          ? 'bg-blue-600'
                          : isPdf
                          ? 'bg-rose-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      {isVideo ? <Play size={22} /> : isPdf ? <FileText size={22} /> : <ImageIcon size={22} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                        {mat.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {mat.content || 'Materi pembelajaran mandiri Flipped Learning ProFLiC.'}
                      </p>
                    </div>
                  </div>

                  {/* Project Info Badge */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="truncate font-medium">Proyek: {mat.project_title || 'Ekosistem'}</span>
                    <span className="font-bold text-emerald-700 shrink-0">Tahap {mat.stage_number || 1}</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(mat)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                      title="Edit Materi"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(mat)}
                      className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Hapus Materi"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <a
                    href={mat.embed_url || mat.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink size={13} />
                    <span>Lihat Berkas</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Modal Tambah / Edit Materi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Project & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Proyek Pembelajaran
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => handleProjectChange(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.class_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tahapan Sintaks ProFLiC
              </label>
              <select
                value={formData.stage_id}
                onChange={(e) => setFormData(prev => ({ ...prev, stage_id: parseInt(e.target.value, 10) }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>Tahap {s.stage_number}: {s.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Judul Materi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Video Interaktif Aliran Energi & Piramida Biomassa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Type & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipe Media
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="pdf">Modul PDF</option>
                <option value="video">Video YouTube / MP4</option>
                <option value="image">Infografis / Gambar</option>
                <option value="document">Dokumen / Word</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Estimasi Durasi / Waktu (Menit)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value, 10) || 15 }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Video URL or File Upload depending on Type */}
          {formData.type === 'video' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tautan Video YouTube (Embed / Watch Link)
              </label>
              <input
                type="url"
                value={formData.embed_url}
                onChange={(e) => setFormData(prev => ({ ...prev, embed_url: e.target.value }))}
                placeholder="https://www.youtube.com/embed/LNpHB5Ocbps atau https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Unggah Berkas Materi ({formData.type.toUpperCase()})
              </label>
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  id="material-upload"
                  onChange={handleFileUpload}
                  accept={formData.type === 'pdf' ? '.pdf' : formData.type === 'image' ? 'image/*' : '*'}
                  className="hidden"
                />
                <label htmlFor="material-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    {uploadingFile ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {uploadingFile ? 'Mengunggah berkas...' : formData.fileName ? formData.fileName : 'Klik untuk memilih berkas dari komputer'}
                  </span>
                  <span className="text-[11px] text-slate-400">PDF, PNG, JPG, atau Dokumen hingga 25 MB</span>
                </label>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi / Ringkasan Materi
            </label>
            <textarea
              rows="3"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Jelaskan ringkasan materi, instruksi membaca, atau tujuan pembelajaran materi ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingFile}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="animate-spin" size={14} />}
              <span>{editingItem ? 'Simpan Perubahan' : 'Terbitkan Materi'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Materi Pembelajaran"
        message={`Apakah Anda yakin ingin menghapus materi "${deleteTarget?.title}"? Materi yang dihapus tidak dapat dipulihkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
