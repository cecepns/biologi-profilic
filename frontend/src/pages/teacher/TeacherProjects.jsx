import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DebounceInput } from '../../components/common/DebounceInput';
import { Pagination } from '../../components/common/Pagination';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  Eye,
  Sparkles,
  CheckCircle2,
  Upload,
  FileText,
  Video,
  Youtube,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  Layers,
  RefreshCw,
  HelpCircle,
  Clock,
  Award,
  Check,
  Lock,
  Unlock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import { compressAndUploadImage } from '../../utils/imageCompressor';
import toast from 'react-hot-toast';

export const TeacherProjects = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [projects, setProjects] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stages Management State
  const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
  const [managingStagesProject, setManagingStagesProject] = useState(null);
  const [stagesList, setStagesList] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);

  // Quiz Management State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [managingQuizProject, setManagingQuizProject] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    type: 'multiple_choice',
    question_text: '',
    points: 10,
    explanation: '',
    options: [
      { key: 'A', text: '', is_correct: true },
      { key: 'B', text: '', is_correct: false },
      { key: 'C', text: '', is_correct: false },
      { key: 'D', text: '', is_correct: false },
      { key: 'E', text: '', is_correct: false }
    ]
  });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    class_id: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    cover: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600',
    description: '<p>Tuliskan deskripsi investigasi pembelajaran biologi di sini...</p>',
    includeMaterial: true,
    materialType: 'pdf',
    materialTitle: '',
    materialFileUrl: '',
    materialFileName: '',
    materialFileSize: 0,
    youtubeUrl: '',
    youtubeEmbedUrl: '',
    materialContent: ''
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    topic: '',
    class_id: 1,
    startDate: '',
    endDate: '',
    cover: '',
    description: ''
  });

  // Quill Modules & Formats
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  }), []);

  const optionQuillModules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['clean']
    ]
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // Fetch projects from backend API
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.PROJECTS.LIST, {
        search,
        page,
        limit
      });
      if (res?.success) {
        setProjects(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Thumbnail Upload for Creation (Compressed via Compressor.js Max 500KB)
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const url = await compressAndUploadImage(file);
      setFormData(prev => ({ ...prev, cover: url }));
      toast.success('Thumbnail cover materi berhasil dikompresi & diunggah!');
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Document Upload
  const handleMaterialDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await request.post(API_ENDPOINTS.UPLOAD, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res?.success && res.fileUrl) {
        setFormData(prev => ({
          ...prev,
          materialFileUrl: res.fileUrl,
          materialFileName: file.name,
          materialFileSize: (file.size / (1024 * 1024)).toFixed(2)
        }));
        toast.success(`Berkas materi ${file.name} berhasil diunggah!`);
      }
    } catch (err) {
      toast.error('Gagal mengunggah berkas materi.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Convert YouTube standard URL to Embed URL
  const handleYoutubeChange = (val) => {
    let embed = '';
    if (val.includes('youtube.com/watch?v=')) {
      const vid = val.split('watch?v=')[1]?.split('&')[0];
      embed = `https://www.youtube.com/embed/${vid}`;
    } else if (val.includes('youtu.be/')) {
      const vid = val.split('youtu.be/')[1]?.split('?')[0];
      embed = `https://www.youtube.com/embed/${vid}`;
    } else if (val.includes('youtube.com/embed/')) {
      embed = val;
    }
    setFormData(prev => ({
      ...prev,
      youtubeUrl: val,
      youtubeEmbedUrl: embed
    }));
  };

  // Submit Project Creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul proyek pembelajaran wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        topic: formData.topic || 'Biologi SMA',
        description: formData.description,
        cover: formData.cover,
        class_id: formData.class_id,
        teacher_id: 1,
        start_date: formData.startDate,
        end_date: formData.endDate,
        material_title: formData.includeMaterial ? (formData.materialTitle || `Materi Ajar: ${formData.title}`) : null,
        material_type: formData.materialType,
        material_file_url: formData.materialType !== 'video' ? formData.materialFileUrl : null,
        material_embed_url: formData.materialType === 'video' ? formData.youtubeEmbedUrl : null,
        material_content: formData.materialContent
      };

      const res = await request.post(API_ENDPOINTS.PROJECTS.CREATE, payload);
      if (res?.success) {
        toast.success('Proyek pembelajaran ProFLiC berhasil dibuat beserta materi ajar!');
        setIsCreateModalOpen(false);
        setFormData({
          title: '',
          topic: '',
          class_id: 1,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          cover: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600',
          description: '<p>Tuliskan deskripsi investigasi pembelajaran biologi di sini...</p>',
          includeMaterial: true,
          materialType: 'pdf',
          materialTitle: '',
          materialFileUrl: '',
          materialFileName: '',
          materialFileSize: 0,
          youtubeUrl: '',
          youtubeEmbedUrl: '',
          materialContent: ''
        });
        fetchProjects();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal membuat proyek pembelajaran.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setEditFormData({
      title: proj.title || '',
      topic: proj.topic || '',
      class_id: proj.class_id || 1,
      startDate: proj.start_date ? proj.start_date.split('T')[0] : '',
      endDate: proj.end_date ? proj.end_date.split('T')[0] : '',
      cover: proj.cover || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600',
      description: proj.description || ''
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    if (!editFormData.title.trim()) {
      toast.error('Judul proyek pembelajaran wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: editFormData.title,
        topic: editFormData.topic,
        description: editFormData.description,
        cover: editFormData.cover,
        class_id: editFormData.class_id,
        start_date: editFormData.startDate,
        end_date: editFormData.endDate
      };

      const res = await request.put(API_ENDPOINTS.PROJECTS.UPDATE(editingProject.id), payload);
      if (res?.success) {
        toast.success('Proyek pembelajaran berhasil diperbarui!');
        setIsEditModalOpen(false);
        setEditingProject(null);
        fetchProjects();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui proyek.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Thumbnail Upload (Compressed via Compressor.js Max 500KB)
  const handleEditThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const url = await compressAndUploadImage(file);
      setEditFormData(prev => ({ ...prev, cover: url }));
      toast.success('Thumbnail baru berhasil dikompresi & diunggah!');
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Delete Project
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await request.delete(API_ENDPOINTS.PROJECTS.DETAIL(deleteTarget.id));
      toast.success('Proyek pembelajaran berhasil dihapus.');
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      toast.error('Gagal menghapus proyek.');
    }
  };

  // =========================================================================
  // 5 SINTAKS & STAGES MANAGEMENT
  // =========================================================================
  const handleOpenStages = async (proj) => {
    setManagingStagesProject(proj);
    setIsStagesModalOpen(true);
    setLoadingStages(true);
    try {
      const res = await request.get(API_ENDPOINTS.PROJECTS.STAGES(proj.id));
      if (res?.success) {
        setStagesList(res.data || []);
      }
    } catch (err) {
      console.error('Fetch stages error:', err);
    } finally {
      setLoadingStages(false);
    }
  };

  const handleUpdateStageStatus = async (stageId, newStatus) => {
    try {
      const res = await request.put(API_ENDPOINTS.STAGES.UPDATE_STATUS(stageId), { status: newStatus });
      if (res?.success) {
        toast.success('Status tahapan pembelajaran ProFLiC berhasil diperbarui!');
        setStagesList(prev => prev.map(s => s.id === stageId ? { ...s, status: newStatus } : s));
        fetchProjects();
      }
    } catch (err) {
      toast.error('Gagal memperbarui status tahapan.');
    }
  };

  // =========================================================================
  // QUIZ & QUESTIONS MANAGEMENT
  // =========================================================================
  const handleOpenQuiz = async (proj) => {
    setManagingQuizProject(proj);
    setIsQuizModalOpen(true);
    setLoadingQuiz(true);
    try {
      // Default quiz id for project is 1 or query by stage 5
      const res = await request.get(API_ENDPOINTS.ASSESSMENTS.QUIZ_DETAIL(1));
      if (res?.success) {
        setQuizData(res.data);
      }
    } catch (err) {
      console.error('Fetch quiz error:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      type: 'multiple_choice',
      question_text: '',
      points: 10,
      explanation: '',
      options: [
        { key: 'A', text: '', is_correct: true },
        { key: 'B', text: '', is_correct: false },
        { key: 'C', text: '', is_correct: false },
        { key: 'D', text: '', is_correct: false },
        { key: 'E', text: '', is_correct: false }
      ]
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      type: q.type,
      question_text: q.question_text,
      points: q.points || 10,
      explanation: q.explanation || '',
      options: q.options && q.options.length > 0 ? q.options.map(o => ({
        key: o.key || o.option_key,
        text: o.text || o.option_text,
        is_correct: !!o.is_correct
      })) : [
        { key: 'A', text: '', is_correct: true },
        { key: 'B', text: '', is_correct: false },
        { key: 'C', text: '', is_correct: false },
        { key: 'D', text: '', is_correct: false },
        { key: 'E', text: '', is_correct: false }
      ]
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.question_text.trim()) {
      toast.error('Teks pertanyaan wajib diisi.');
      return;
    }

    try {
      if (editingQuestion) {
        // Update question
        const res = await request.put(API_ENDPOINTS.ASSESSMENTS.UPDATE_QUESTION(editingQuestion.id), questionForm);
        if (res?.success) {
          toast.success('Soal kuis berhasil diperbarui!');
          setIsQuestionModalOpen(false);
          if (managingQuizProject) handleOpenQuiz(managingQuizProject);
        }
      } else {
        // Add new question
        const res = await request.post(API_ENDPOINTS.ASSESSMENTS.ADD_QUESTION(quizData?.id || 1), questionForm);
        if (res?.success) {
          toast.success('Soal kuis baru berhasil ditambahkan!');
          setIsQuestionModalOpen(false);
          if (managingQuizProject) handleOpenQuiz(managingQuizProject);
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan soal kuis.');
    }
  };

  const handleDeleteQuestionConfirm = async () => {
    if (!deleteQuestionTarget) return;
    try {
      await request.delete(API_ENDPOINTS.ASSESSMENTS.DELETE_QUESTION(deleteQuestionTarget.id));
      toast.success('Soal berhasil dihapus.');
      setDeleteQuestionTarget(null);
      if (managingQuizProject) handleOpenQuiz(managingQuizProject);
    } catch (err) {
      toast.error('Gagal menghapus soal.');
    }
  };

  // Quiz Image Upload Handlers with Compressor.js
  const handleQuestionImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await compressAndUploadImage(file);
      setQuestionForm(prev => ({
        ...prev,
        question_text: (prev.question_text || '') + `<p><img src="${url}" alt="Gambar Soal" style="max-height: 240px; border-radius: 12px; margin: 8px 0; border: 1px solid #cbd5e1; display: block;" /></p>`
      }));
      toast.success('Gambar soal terkompresi & berhasil disisipkan!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptionImageUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const optKey = ['A', 'B', 'C', 'D', 'E'][idx] || `${idx + 1}`;
    try {
      const url = await compressAndUploadImage(file);
      setQuestionForm(prev => ({
        ...prev,
        options: prev.options.map((o, i) => i === idx ? {
          ...o,
          text: (o.text || '') + `<p><img src="${url}" alt="Gambar Opsi ${o.key || optKey}" style="max-height: 140px; border-radius: 8px; margin: 6px 0; border: 1px solid #cbd5e1; display: block;" /></p>`
        } : o)
      }));
      toast.success(`Gambar opsi ${optKey} berhasil disisipkan!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExplanationImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await compressAndUploadImage(file);
      setQuestionForm(prev => ({
        ...prev,
        explanation: (prev.explanation || '') + `<p><img src="${url}" alt="Gambar Pembahasan" style="max-height: 200px; border-radius: 10px; margin: 6px 0; border: 1px solid #cbd5e1; display: block;" /></p>`
      }));
      toast.success('Gambar pembahasan terkompresi & berhasil disisipkan!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={24} />
            <span>Manajemen Pembelajaran ProFLiC</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Buat proyek pembelajaran, kontrol pembukaan 5 Sintaks ProFLiC, kelola bank soal kuis evaluasi Stage 5, dan perbarui materi ajar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DebounceInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cari judul proyek..."
            className="w-full sm:w-64"
          />
          <button
            onClick={() => fetchProjects()}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-300 text-slate-700 hover:text-emerald-600 rounded-xl transition-colors shadow-xs cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            <span>Tambah Proyek & Materi</span>
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 rounded-l-xl">Proyek Pembelajaran</th>
                <th className="py-3.5 px-3">Kelas / Rombel</th>
                <th className="py-3.5 px-3">Tahap Berjalan (5 Sintaks)</th>
                <th className="py-3.5 px-3">Periode</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Memuat data proyek pembelajaran...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Belum ada proyek pembelajaran. Klik tombol "Tambah Proyek & Materi" di atas.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.cover || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'}
                          alt={proj.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                        />
                        <div className="max-w-xs sm:max-w-md">
                          <p className="font-bold text-slate-900 line-clamp-1">{proj.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{proj.topic}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                        {proj.class_name || 'XI IPA 2'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleOpenStages(proj)}
                        className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        title="Klik untuk membuka/mengatur 5 Tahapan Sintaks"
                      >
                        <Layers size={13} className="text-emerald-600" />
                        <span>Tahap {proj.current_stage || 1} dari 5</span>
                        <ChevronRight size={13} className="text-emerald-500" />
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 font-medium">
                      {proj.start_date ? new Date(proj.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'} s/d{' '}
                      {proj.end_date ? new Date(proj.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Published
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailProject(proj)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Rincian & Deskripsi"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenStages(proj)}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Kelola 5 Sintaks ProFLiC"
                        >
                          <Layers size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenQuiz(proj)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Kelola Kuis Evaluasi (Stage 5)"
                        >
                          <HelpCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Proyek"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(proj)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Proyek"
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

      {/* ========================================================================= */}
      {/* MODAL 1: KELOLA 5 SINTAKS & TAHAPAN PROFLIC */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isStagesModalOpen}
        onClose={() => setIsStagesModalOpen(false)}
        title={`Kelola 5 Sintaks ProFLiC: ${managingStagesProject?.title || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
            <Layers className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                Alur 5 Sintaks Model Pembelajaran ProFLiC
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Guru dapat mengontrol tahapan yang sedang aktif berjalan, membuka akses materi untuk siswa, atau menandai tahapan yang telah selesai.
              </p>
            </div>
          </div>

          {loadingStages ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Memuat data 5 tahapan...
            </div>
          ) : (
            <div className="space-y-3">
              {stagesList.map((stage, idx) => {
                const stageIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
                const statusColors = {
                  completed: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                  in_progress: 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20',
                  available: 'bg-amber-50 text-amber-800 border-amber-300',
                  locked: 'bg-slate-100 text-slate-500 border-slate-200'
                };

                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-2xl border transition-all ${stage.status === 'in_progress'
                      ? 'bg-blue-50/40 border-blue-300 shadow-sm'
                      : stage.status === 'completed'
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-white border-slate-200'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{stageIcons[idx] || '📌'}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {stage.title}
                            </h4>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {stage.model_name}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{stage.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                            {stage.materials_count > 0 && <span>📁 {stage.materials_count} Bahan Ajar</span>}
                            {stage.problems_count > 0 && <span>🔬 {stage.problems_count} Kasus PBL</span>}
                            {stage.quiz_id && <span>📝 Kuis Evaluasi CBT</span>}
                          </div>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <select
                          value={stage.status}
                          onChange={(e) => handleUpdateStageStatus(stage.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${statusColors[stage.status] || 'bg-white border-slate-300 text-slate-700'
                            }`}
                        >
                          <option value="in_progress">🔵 Sedang Berjalan (Aktif)</option>
                          <option value="available">🟡 Terbuka (Akses Siswa)</option>
                          <option value="completed">🟢 Selesai (Completed)</option>
                          <option value="locked">🔒 Terkunci (Locked)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsStagesModalOpen(false)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Tutup & Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: KELOLA KUIS EVALUASI (STAGE 5 CBT) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title={`Kelola Kuis Evaluasi: ${quizData?.title || 'Evaluasi Akhir'}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Quiz Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <BookOpen className="text-emerald-600 shrink-0" size={20} />
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Total Soal</span>
                <span className="text-sm font-black text-slate-900">
                  {quizData?.questions?.length || 0} Butir Soal
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 flex items-center gap-3">
              <Clock className="text-blue-600 shrink-0" size={20} />
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Durasi Kuis</span>
                <span className="text-sm font-black text-slate-900">
                  {quizData?.duration_minutes || 25} Menit
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-center gap-3">
              <Award className="text-purple-600 shrink-0" size={20} />
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">KKM Kelulusan</span>
                <span className="text-sm font-black text-slate-900">
                  Nilai {quizData?.passing_score || 75}
                </span>
              </div>
            </div>
          </div>

          {/* Action Header */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Daftar Soal Pilihan Ganda & Esai
            </h4>
            <button
              onClick={handleOpenAddQuestion}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Soal Baru</span>
            </button>
          </div>

          {/* Question List */}
          {loadingQuiz ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Memuat data kuis...
            </div>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {quizData?.questions?.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai Investigatif'}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Bobot: {q.points || 10} Poin
                          </span>
                        </div>
                        <div
                          className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 prose prose-slate max-w-none"
                          dangerouslySetInnerHTML={{ __html: q.question_text }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteQuestionTarget(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Options Display for Multiple Choice */}
                  {q.type === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key || opt.option_key}
                          className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${opt.is_correct
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                            : 'bg-white text-slate-700 border-slate-200'
                            }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${opt.is_correct ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                          >
                            {opt.key || opt.option_key}
                          </span>
                          <div
                            className="flex-1 overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: opt.text || opt.option_text }}
                          />
                          {opt.is_correct && <Check size={14} className="text-emerald-600 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">Pembahasan: </span>
                      <div className="inline" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsQuizModalOpen(false)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH / EDIT SOAL KUIS */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion ? 'Edit Soal Kuis' : 'Tambah Butir Soal Baru'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Tipe Soal
              </label>
              <select
                value={questionForm.type}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
              >
                <option value="multiple_choice">Pilihan Ganda (A-B-C-D-E)</option>
                <option value="essay">Esai Investigatif Terbuka</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Bobot Nilai (Poin)
              </label>
              <input
                type="number"
                value={questionForm.points}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, points: parseInt(e.target.value, 10) || 10 }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Teks Pertanyaan Soal Biologi <span className="text-rose-500">*</span>
              </label>
              <label className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 transition-colors shadow-2xs">
                <ImageIcon size={13} className="text-emerald-600" />
                <span>+ Sisip Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQuestionImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
              <ReactQuill
                theme="snow"
                value={questionForm.question_text}
                onChange={(val) => setQuestionForm(prev => ({ ...prev, question_text: val }))}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Tuliskan pertanyaan konsep, siklus biologi, atau sisipkan gambar diagram..."
              />
            </div>
          </div>

          {/* Multiple Choice Options Builder with ReactQuill */}
          {questionForm.type === 'multiple_choice' && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  Pilihan Jawaban & Kunci Benar (Klik radio untuk kunci)
                </label>
                <span className="text-[11px] text-slate-500">Masing-masing opsi menggunakan ReactQuill & Kompresi Gambar</span>
              </div>

              {questionForm.options.map((opt, idx) => (
                <div
                  key={opt.key}
                  className={`p-3.5 rounded-2xl border transition-all ${opt.is_correct
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="correct_option"
                        checked={opt.is_correct}
                        onChange={() => {
                          setQuestionForm(prev => ({
                            ...prev,
                            options: prev.options.map((o, i) => ({ ...o, is_correct: i === idx }))
                          }));
                        }}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black flex items-center justify-center ${opt.is_correct ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                        Opsi {opt.key}
                      </span>
                      {opt.is_correct && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          ✓ Kunci Jawaban Benar
                        </span>
                      )}
                    </label>

                    <label
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                      title={`Sisipkan Gambar pada Opsi ${opt.key}`}
                    >
                      <ImageIcon size={13} className="text-emerald-600" />
                      <span className="text-[11px] font-bold">+ Gambar Opsi</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleOptionImageUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={opt.text}
                      onChange={(val) => {
                        setQuestionForm(prev => ({
                          ...prev,
                          options: prev.options.map((o, i) => i === idx ? { ...o, text: val } : o)
                        }));
                      }}
                      modules={optionQuillModules}
                      formats={quillFormats}
                      placeholder={`Tuliskan teks atau sisipkan gambar untuk pilihan ${opt.key}...`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Pembahasan / Kunci Jawaban Konseptual
              </label>
              <label className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 transition-colors shadow-2xs">
                <ImageIcon size={13} className="text-blue-600" />
                <span>+ Sisip Gambar Pembahasan</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleExplanationImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="bg-white rounded-xl border border-slate-300 overflow-hidden">
              <ReactQuill
                theme="snow"
                value={questionForm.explanation}
                onChange={(val) => setQuestionForm(prev => ({ ...prev, explanation: val }))}
                modules={optionQuillModules}
                formats={quillFormats}
                placeholder="Penjelasan ilmiah yang muncul saat evaluasi siswa selesai..."
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all"
            >
              Simpan Soal
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Hapus Soal */}
      <ConfirmDialog
        isOpen={!!deleteQuestionTarget}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={handleDeleteQuestionConfirm}
        title="Hapus Butir Soal Kuis?"
        message="Apakah Anda yakin ingin menghapus soal ini dari bank kuis evaluasi?"
      />

      {/* Modal Edit Proyek */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Proyek: ${editingProject?.title || ''}`}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleUpdateProject} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Judul Pembelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Topik / Pokok Bahasan Biologi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.topic}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Target Kelas / Rombel
                </label>
                <select
                  value={editFormData.class_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, class_id: parseInt(e.target.value, 10) }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <option value={1}>Kelas XI IPA 2</option>
                  <option value={2}>Kelas XI IPA 1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Tanggal Selesai (Deadline)
                </label>
                <input
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Thumbnail Editor */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 inline-block">
              Thumbnail / Cover Materi
            </h4>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <img
                src={editFormData.cover || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'}
                alt="Thumbnail Preview"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-300 shadow-sm shrink-0 bg-white"
              />

              <div className="space-y-2 flex-1 w-full">
                <p className="text-xs font-bold text-slate-800">
                  Ubah Gambar Thumbnail Materi
                </p>
                <div className="pt-1">
                  <label className="px-4 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors">
                    <Upload size={14} />
                    <span>{uploadingThumbnail ? 'Mengompres & Mengunggah...' : 'Pilih File Gambar Baru'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditThumbnailUpload}
                      disabled={uploadingThumbnail}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi dengan React Quill */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 inline-block">
              Deskripsi & Panduan Materi
            </h4>

            <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-2xs">
              <ReactQuill
                theme="snow"
                value={editFormData.description}
                onChange={(content) => setEditFormData(prev => ({ ...prev, description: content }))}
                modules={quillModules}
                formats={quillFormats}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingThumbnail}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan Proyek'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Proyek & Materi */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Proyek Pembelajaran & Upload Materi"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-6">
          {/* Section 1: Informasi Dasar */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Judul Pembelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Ekosistem di Sekitarku & Bioremediasi"
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-bold placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Topik / Pokok Bahasan Biologi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Contoh: Interaksi Biotik-Abiotik dan Keseimbangan Biosfer"
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Target Kelas / Rombel
                </label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_id: parseInt(e.target.value, 10) }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <option value={1}>Kelas XI IPA 2</option>
                  <option value={2}>Kelas XI IPA 1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                  Tanggal Selesai (Deadline)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Thumbnail Materi */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 inline-block">
              2. Thumbnail / Cover Materi
            </h4>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <img
                src={formData.cover || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'}
                alt="Thumbnail Preview"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-300 shadow-sm shrink-0 bg-white"
              />

              <div className="space-y-2 flex-1 w-full">
                <p className="text-xs font-bold text-slate-800">
                  Unggah Gambar Sampul Materi (Mendukung JPG, PNG, WEBP)
                </p>
                <div className="pt-1">
                  <label className="px-4 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-colors">
                    <Upload size={14} />
                    <span>{uploadingThumbnail ? 'Mengompres & Mengunggah...' : 'Pilih File Gambar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumbnail}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: React Quill Editor */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 inline-block">
                3. Deskripsi & Panduan Materi (React Quill Editor)
              </h4>
              <span className="text-[11px] text-slate-500">
                Mendukung teks tebal, miring, list poin, dan sisip gambar
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-2xs">
              <ReactQuill
                theme="snow"
                value={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Tuliskan petunjuk pembelajaran, pengantar topik, atau sisipkan gambar langsung..."
              />
            </div>
          </div>

          {/* Section 4: Lampirkan Berkas Ajar (PDF, PPT, Embed YouTube) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 inline-block">
                4. Lampiran Bahan Ajar Siswa (PDF / PPT / YouTube Video)
              </h4>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.includeMaterial}
                  onChange={(e) => setFormData(prev => ({ ...prev, includeMaterial: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Sertakan Materi Pada Tahap 1</span>
              </label>
            </div>

            {formData.includeMaterial && (
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, materialType: 'pdf' }))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${formData.materialType === 'pdf' || formData.materialType === 'ppt'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <FileText size={15} />
                    <span>Upload Dokumen (PDF / PPT / DOCX)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, materialType: 'video' }))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${formData.materialType === 'video'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <Youtube size={15} />
                    <span>Link Video YouTube (Embed)</span>
                  </button>
                </div>

                {(formData.materialType === 'pdf' || formData.materialType === 'ppt') && (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Judul Berkas Materi
                      </label>
                      <input
                        type="text"
                        value={formData.materialTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, materialTitle: e.target.value }))}
                        placeholder="Contoh: Modul PDF Ekosistem & Keseimbangan Lingkungan"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-colors">
                        <Upload size={16} className="text-emerald-600" />
                        <span>{uploadingDoc ? 'Mengunggah Berkas...' : 'Unggah File PDF / PPT / PPTX'}</span>
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx,.doc,.docx"
                          onChange={handleMaterialDocUpload}
                          disabled={uploadingDoc}
                          className="hidden"
                        />
                      </label>

                      {formData.materialFileName && (
                        <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>{formData.materialFileName} ({formData.materialFileSize} MB)</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {formData.materialType === 'video' && (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Judul Video Pembelajaran
                      </label>
                      <input
                        type="text"
                        value={formData.materialTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, materialTitle: e.target.value }))}
                        placeholder="Contoh: Video Konsep Aliran Energi & Jaring Makanan"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Link URL Video YouTube
                      </label>
                      <div className="relative">
                        <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                        <input
                          type="text"
                          value={formData.youtubeUrl}
                          onChange={(e) => handleYoutubeChange(e.target.value)}
                          placeholder="Contoh: https://www.youtube.com/watch?v=LNpHB5Ocbps atau https://youtu.be/..."
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {formData.youtubeEmbedUrl && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Pratinjau Embed YouTube:
                        </span>
                        <div className="aspect-video w-full max-w-md rounded-xl overflow-hidden border border-slate-300 bg-black">
                          <iframe
                            src={formData.youtubeEmbedUrl}
                            title="YouTube Preview"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>
              Sistem akan otomatis mengonfigurasi 5 sintaks ProFLiC (Flipped Learning, PBL, Collaborative Investigation, Presentation, & Reflection).
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingThumbnail || uploadingDoc}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              {submitting ? 'Menyimpan ke Server...' : 'Publikasikan Proyek & Materi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Proyek */}
      <Modal
        isOpen={!!detailProject}
        onClose={() => setDetailProject(null)}
        title={detailProject?.title || 'Rincian Proyek'}
        maxWidth="max-w-2xl"
      >
        {detailProject && (
          <div className="space-y-4">
            <img
              src={detailProject.cover || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600'}
              alt={detailProject.title}
              className="w-full h-48 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="text-lg font-black text-slate-900">{detailProject.title}</h3>
              <p className="text-xs font-semibold text-emerald-700">{detailProject.topic}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 prose prose-slate max-w-none text-xs sm:text-sm text-slate-800">
              <div dangerouslySetInnerHTML={{ __html: detailProject.description || '<p>Tidak ada deskripsi rincian.</p>' }} />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailProject(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog Hapus Proyek */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Proyek Pembelajaran?"
        message={`Apakah Anda yakin ingin menghapus proyek "${deleteTarget?.title}"? Seluruh data 5 sintaks dan nilai siswa akan dihapus.`}
      />
    </div>
  );
};
