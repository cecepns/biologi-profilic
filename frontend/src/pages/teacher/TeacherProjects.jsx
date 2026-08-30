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
  ChevronRight,
  ClipboardCheck,
  MoreVertical,
  Presentation
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
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, popUp: false });

  // Stages Management State
  const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
  const [managingStagesProject, setManagingStagesProject] = useState(null);
  const [stagesList, setStagesList] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);

  // Problems Management State (Sintaks 2)
  const [isProblemsModalOpen, setIsProblemsModalOpen] = useState(false);
  const [managingProblemsProject, setManagingProblemsProject] = useState(null);
  const [problemsStageId, setProblemsStageId] = useState(null);
  const [problemsList, setProblemsList] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [isProblemFormModalOpen, setIsProblemFormModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [deleteProblemTarget, setDeleteProblemTarget] = useState(null);
  const [uploadingProblemImage, setUploadingProblemImage] = useState(false);

  const [problemForm, setProblemForm] = useState({
    title: '',
    context_story: '',
    trigger_question: '',
    image_url: '',
    questions: ['']
  });

  // Quiz Management State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [managingQuizProject, setManagingQuizProject] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [previewQuizOpen, setPreviewQuizOpen] = useState(false);

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

  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    class_id: 1,
    startDate: '',
    endDate: '',
    cover: '',
    description: '',
    materialTitle: '',
    materialType: 'pdf',
    materialDocUrl: '',
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
      ['link', 'image'],
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

  // Fetch Projects with debounce search
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.PROJECTS.LIST, {
        page,
        limit,
        search
      });
      if (res?.success) {
        setProjects(res.data || []);
        if (res.pagination) {
          setTotal(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
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

  // Click & scroll outside to close action dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActiveDropdownId(null);
      }
    };
    const handleScroll = () => {
      setActiveDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

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

  // Stage 3 & 4 Guidelines & Questions Management State
  const [isStageConfigModalOpen, setIsStageConfigModalOpen] = useState(false);
  const [configuringStage, setConfiguringStage] = useState(null);
  const [managingConfigProject, setManagingConfigProject] = useState(null);
  const [activeConfigTab, setActiveConfigTab] = useState('questions');
  const [stageConfigForm, setStageConfigForm] = useState({
    instructions: '',
    questions: [''],
    rubric: []
  });
  const [savingStageConfig, setSavingStageConfig] = useState(false);

  // =========================================================================
  // SINTAKS 3 & 4: GUIDELINES, CUSTOM QUESTIONS & RUBRICS CONFIGURATION
  // =========================================================================
  const handleOpenStageConfig = async (project, stageOrNumber) => {
    setManagingConfigProject(project);
    setActiveConfigTab('questions');
    let targetStage = null;
    if (typeof stageOrNumber === 'object' && stageOrNumber !== null) {
      targetStage = stageOrNumber;
    } else {
      try {
        const res = await request.get(API_ENDPOINTS.PROJECTS.STAGES(project.id));
        if (res.success && res.data) {
          targetStage = res.data.find(s => s.stage_number === stageOrNumber) || res.data[0];
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (!targetStage) {
      toast.error('Data tahapan tidak ditemukan.');
      return;
    }

    setConfiguringStage(targetStage);
    let questionsList = [];
    if (targetStage.questions) {
      try {
        const parsed = typeof targetStage.questions === 'string' ? JSON.parse(targetStage.questions) : targetStage.questions;
        if (Array.isArray(parsed) && parsed.length > 0) questionsList = parsed;
      } catch { }
    }

    if (questionsList.length === 0) {
      if (targetStage.stage_number === 3) {
        questionsList = [
          'Analisis mendalam mengapa fenomena permasalahan ekosistem ini terjadi secara biokimia dan ekologi?',
          'Rumuskan minimal 2 alternatif solusi biologi terpadu beserta analisis kelebihan (pros) dan kekurangan (cons)!',
          'Tentukan 1 solusi terbaik yang dipilih kelompok serta jelaskan landasan argumen ilmiah dan mekanisme kerjanya!'
        ];
      } else if (targetStage.stage_number === 4) {
        questionsList = [
          'Bagaimana kesesuaian prinsip biologi dan efektivitas solusi yang diajukan kelompok presenter dalam mengatasi masalah lingkungan?',
          'Apakah terdapat potensi dampak samping ekologis atau keterbatasan teknis dari solusi yang dipaparkan kelompok presenter?',
          'Saran perbaikan saintifik dan inovasi tambahan apa yang dapat diterapkan untuk memperkuat solusi kelompok presenter?'
        ];
      } else if (targetStage.stage_number === 5) {
        questionsList = [
          'Apa hal paling esensial dan baru yang kalian pelajari dari proyek ini?',
          'Kesulitan atau hambatan apa yang dihadapi selama proses investigasi dan bagaimana solusinya?',
          'Bagaimana kontribusi dan pembagian peran setiap anggota kelompok selama pelaksanaan proyek?',
          'Apa yang akan kelompok lakukan secara berbeda untuk meningkatkan kualitas investigasi pada proyek berikutnya?'
        ];
      } else {
        questionsList = [''];
      }
    }

    let rubricList = [];
    if (targetStage.rubric) {
      try {
        const parsed = typeof targetStage.rubric === 'string' ? JSON.parse(targetStage.rubric) : targetStage.rubric;
        if (Array.isArray(parsed) && parsed.length > 0) rubricList = parsed;
      } catch { }
    }

    if (rubricList.length === 0 && targetStage.stage_number === 4) {
      rubricList = [
        { id: 1, criteria: 'Penguasaan Materi & Konsep Biologi', weight: 25, description: 'Menjelaskan konsep ekosistem, biogeokimia, dan mekanisme bioremediasi secara akurat tanpa miskonsepsi.' },
        { id: 2, criteria: 'Analisis Fakta & Data Pendukung Masalah', weight: 20, description: 'Menyajikan data pengamatan lapangan/laboratorium yang valid untuk mendukung identifikasi masalah ekologi.' },
        { id: 3, criteria: 'Inovasi & Kelayakan Solusi Terpadu', weight: 25, description: 'Solusi yang dirancang orisinal, ramah lingkungan, teruji secara ilmiah, dan memiliki langkah implementasi logis.' },
        { id: 4, criteria: 'Keterampilan Presentasi & Media Visual', weight: 15, description: 'Slide presentasi sistematis, komunikatif, visual infografis menarik, dan alur bicara jelas serta runtut.' },
        { id: 5, criteria: 'Responsivitas Diskusi & Tanya Jawab', weight: 15, description: 'Mampu merespons pertanyaan kelompok lain dengan argumen saintifik yang kuat, kritis, dan santun.' }
      ];
    }

    setStageConfigForm({
      instructions: targetStage.instructions || targetStage.description || '',
      questions: questionsList,
      rubric: rubricList
    });
    setIsStageConfigModalOpen(true);
  };

  const handleSaveStageConfig = async (e) => {
    e.preventDefault();
    if (!configuringStage) return;
    setSavingStageConfig(true);
    try {
      const cleanQuestions = (stageConfigForm.questions || []).map(q => q.trim()).filter(Boolean);
      const payload = {
        instructions: stageConfigForm.instructions,
        questions: cleanQuestions
      };

      if (configuringStage.stage_number === 4) {
        payload.rubric = stageConfigForm.rubric || [];
      }

      const res = await request.put(API_ENDPOINTS.STAGES.UPDATE(configuringStage.id), payload);

      if (res.success) {
        toast.success(`Panduan, pertanyaan & rubrik Sintaks ${configuringStage.stage_number} berhasil disimpan!`);
        setIsStageConfigModalOpen(false);
        if (managingConfigProject) {
          const detailRes = await request.get(API_ENDPOINTS.PROJECTS.STAGES(managingConfigProject.id));
          if (detailRes.success && detailRes.data) {
            setStagesList(detailRes.data);
          }
        }
      } else {
        toast.error(res.message || 'Gagal menyimpan konfigurasi tahapan.');
      }
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setSavingStageConfig(false);
    }
  };

  // =========================================================================
  // SINTAKS 2: PROBLEM ORIENTATION (KASUS MASALAH PBL) MANAGEMENT
  // =========================================================================
  const handleOpenProblems = async (proj, specificStageId = null) => {
    setManagingProblemsProject(proj);
    setIsProblemsModalOpen(true);
    setLoadingProblems(true);
    try {
      let stage2Id = specificStageId;
      if (!stage2Id) {
        const stagesRes = await request.get(API_ENDPOINTS.PROJECTS.STAGES(proj.id));
        if (stagesRes?.success && stagesRes.data) {
          const s2 = stagesRes.data.find(s => s.stage_number === 2);
          stage2Id = s2?.id || 2;
        } else {
          stage2Id = 2;
        }
      }
      setProblemsStageId(stage2Id);

      const stageDetailRes = await request.get(API_ENDPOINTS.STAGES.DETAIL(stage2Id));
      if (stageDetailRes?.success && stageDetailRes.data?.problems) {
        setProblemsList(stageDetailRes.data.problems);
      }
    } catch (err) {
      console.error('Fetch problems error:', err);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleOpenAddProblem = () => {
    setEditingProblem(null);
    setProblemForm({
      title: '',
      context_story: '',
      trigger_question: '',
      questions: [''],
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    });
    setIsProblemFormModalOpen(true);
  };

  const handleOpenEditProblem = (prob) => {
    setEditingProblem(prob);
    let parsedQuestions = [];
    if (prob.questions) {
      try {
        const parsed = typeof prob.questions === 'string' ? JSON.parse(prob.questions) : prob.questions;
        if (Array.isArray(parsed)) {
          parsedQuestions = parsed;
        }
      } catch { }
    }

    setProblemForm({
      title: prob.title || '',
      context_story: prob.context_story || '',
      trigger_question: prob.trigger_question || '',
      questions: parsedQuestions,
      image_url: prob.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'
    });
    setIsProblemFormModalOpen(true);
  };

  const handleProblemImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProblemImage(true);
    try {
      const res = await request.uploadFile(API_ENDPOINTS.UPLOAD, file);
      if (res.success) {
        setProblemForm(prev => ({ ...prev, image_url: res.fileUrl }));
        toast.success('Gambar kasus berhasil diunggah!');
      }
    } catch (err) {
      toast.error('Gagal mengunggah gambar: ' + err.message);
    } finally {
      setUploadingProblemImage(false);
    }
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    if (!problemForm.title || !problemForm.context_story || !problemForm.trigger_question) {
      toast.error('Judul kasus, cerita fenomena, dan pertanyaan pemantik wajib diisi!');
      return;
    }

    try {
      if (editingProblem) {
        const res = await request.put(API_ENDPOINTS.PROBLEMS.UPDATE(editingProblem.id), problemForm);
        if (res.success) {
          toast.success('Kasus masalah PBL berhasil diperbarui!');
          setIsProblemFormModalOpen(false);
          if (problemsStageId) {
            const detailRes = await request.get(API_ENDPOINTS.STAGES.DETAIL(problemsStageId));
            if (detailRes?.success && detailRes.data?.problems) {
              setProblemsList(detailRes.data.problems);
            }
          }
        }
      } else {
        const res = await request.post(API_ENDPOINTS.PROBLEMS.CREATE(problemsStageId || 2), problemForm);
        if (res.success) {
          toast.success('Kasus masalah PBL baru berhasil ditambahkan!');
          setIsProblemFormModalOpen(false);
          if (problemsStageId) {
            const detailRes = await request.get(API_ENDPOINTS.STAGES.DETAIL(problemsStageId));
            if (detailRes?.success && detailRes.data?.problems) {
              setProblemsList(detailRes.data.problems);
            }
          }
        }
      }
    } catch (err) {
      toast.error('Gagal menyimpan kasus: ' + err.message);
    }
  };

  const handleDeleteProblem = async () => {
    if (!deleteProblemTarget) return;
    try {
      const res = await request.delete(API_ENDPOINTS.PROBLEMS.DELETE(deleteProblemTarget.id));
      if (res.success) {
        toast.success('Kasus masalah PBL berhasil dihapus.');
        setDeleteProblemTarget(null);
        setProblemsList(prev => prev.filter(p => p.id !== deleteProblemTarget.id));
      }
    } catch (err) {
      toast.error('Gagal menghapus kasus: ' + err.message);
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
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[380px]">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 rounded-l-xl">Proyek Pembelajaran</th>
                <th className="py-3.5 px-3">Kelas / Rombel</th>
                <th className="py-3.5 px-3">Tahap Berjalan (5 Sintaks)</th>
                <th className="py-3.5 px-3">Periode</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-center rounded-r-xl w-16">Aksi</th>
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
                    <td className="py-3.5 px-4 text-center">
                      <div className="action-dropdown-wrapper inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeDropdownId === proj.id) {
                              setActiveDropdownId(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              const popUp = spaceBelow < 340;
                              setDropdownPos({
                                top: popUp ? rect.top - 6 : rect.bottom + 6,
                                right: Math.max(16, window.innerWidth - rect.right),
                                popUp
                              });
                              setActiveDropdownId(proj.id);
                            }
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            activeDropdownId === proj.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                          title="Pilihan Aksi"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeDropdownId === proj.id && (
                          <div
                            style={{
                              top: `${dropdownPos.top}px`,
                              right: `${dropdownPos.right}px`,
                              transform: dropdownPos.popUp ? 'translateY(-100%)' : 'none'
                            }}
                            className="fixed w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-[9999] divide-y divide-slate-100 text-left animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="px-3.5 py-2 bg-slate-50/70 border-b border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aksi Proyek</p>
                              <p className="text-xs font-bold text-slate-800 truncate">{proj.title}</p>
                            </div>

                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setDetailProject(proj);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Eye size={15} className="text-slate-500" />
                                <span>Lihat Rincian & Deskripsi</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenStages(proj);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Layers size={15} className="text-purple-600" />
                                <span>Kelola 5 Sintaks ProFLiC</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenProblems(proj);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <ClipboardCheck size={15} className="text-emerald-600" />
                                <span>Kasus Masalah (Sintaks 2)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenStageConfig(proj, 3);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Users size={15} className="text-amber-600" />
                                <span>Panduan Investigasi (Sintaks 3)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenStageConfig(proj, 4);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Presentation size={15} className="text-purple-600" />
                                <span>Panduan Presentasi (Sintaks 4)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenStageConfig(proj, 5);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <MessageSquare size={15} className="text-teal-600" />
                                <span>Pertanyaan Refleksi (Sintaks 5)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenQuiz(proj);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <HelpCircle size={15} className="text-teal-600" />
                                <span>Bank Soal Kuis (Sintaks 5)</span>
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  handleOpenEdit(proj);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Edit2 size={15} className="text-blue-600" />
                                <span>Edit Informasi Proyek</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setDeleteTarget(proj);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} className="text-rose-600" />
                                <span>Hapus Proyek</span>
                              </button>
                            </div>
                          </div>
                        )}
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
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium flex-wrap">
                            {stage.materials_count > 0 && <span>📁 {stage.materials_count} Bahan Ajar</span>}
                            {stage.problems_count > 0 && <span>🔬 {stage.problems_count} Kasus PBL</span>}
                            {stage.stage_number === 3 && stage.questions?.length > 0 && (
                              <span>📋 {stage.questions.length} Poin Investigasi</span>
                            )}
                            {stage.stage_number === 4 && stage.questions?.length > 0 && (
                              <span>💬 {stage.questions.length} Panduan Diskusi</span>
                            )}
                            {stage.quiz_id && <span>📝 Kuis Evaluasi CBT</span>}
                          </div>

                          {stage.stage_number === 2 && (
                            <div className="mt-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsStagesModalOpen(false);
                                  handleOpenProblems(managingStagesProject, stage.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <ClipboardCheck size={14} />
                                <span>Kelola Kasus Masalah PBL (Sintaks 2)</span>
                              </button>
                            </div>
                          )}

                          {stage.stage_number === 3 && (
                            <div className="mt-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsStagesModalOpen(false);
                                  handleOpenStageConfig(managingStagesProject, stage);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <Users size={14} />
                                <span>Kelola Panduan & Pertanyaan Investigasi (Sintaks 3)</span>
                              </button>
                            </div>
                          )}

                          {stage.stage_number === 4 && (
                            <div className="mt-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsStagesModalOpen(false);
                                  handleOpenStageConfig(managingStagesProject, stage);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <Presentation size={14} />
                                <span>Kelola Panduan & Pertanyaan Presentasi (Sintaks 4)</span>
                              </button>
                            </div>
                          )}

                          {stage.stage_number === 5 && (
                            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsStagesModalOpen(false);
                                  handleOpenStageConfig(managingStagesProject, stage);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <MessageSquare size={14} />
                                <span>Kelola Pertanyaan Refleksi (Sintaks 5)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsStagesModalOpen(false);
                                  handleOpenQuiz(managingStagesProject);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                              >
                                <HelpCircle size={14} />
                                <span>Kelola Soal Kuis CBT (Sintaks 5)</span>
                              </button>
                            </div>
                          )}
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

      {/* ========================================================================= */}
      {/* MODAL 3: KELOLA KASUS MASALAH PBL (STAGE 2 PROBLEM ORIENTATION) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isProblemsModalOpen}
        onClose={() => setIsProblemsModalOpen(false)}
        title={`Kelola Kasus Masalah PBL (Sintaks 2): ${managingProblemsProject?.title || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="flex items-start gap-3">
              <ClipboardCheck className="text-emerald-700 shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  Sintaks 2: Problem Orientation (Problem-Based Learning)
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Daftar kasus kontekstual, fenomena lingkungan nyata, dan pertanyaan pemantik untuk dianalisis oleh siswa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddProblem}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>Tambah Kasus PBL Baru</span>
            </button>
          </div>

          {loadingProblems ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Memuat kasus masalah PBL...
            </div>
          ) : problemsList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Belum ada kasus masalah PBL yang dibuat. Klik tombol "Tambah Kasus PBL Baru" di atas.
            </div>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {problemsList.map((prob, idx) => (
                <div
                  key={prob.id || idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {prob.image_url && (
                        <img
                          src={prob.image_url}
                          alt={prob.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Kasus #{idx + 1}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                          {prob.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProblem(prob)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Kasus"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteProblemTarget(prob)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kasus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs space-y-2.5 pt-1 border-t border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 block">Cerita Kontekstual / Fenomena:</span>
                      <p className="text-slate-600 leading-relaxed mt-0.5 whitespace-pre-wrap">
                        {prob.context_story}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-800 block">Pertanyaan Pemantik Investigasi:</span>
                      <p className="text-emerald-700 font-semibold leading-relaxed mt-0.5 italic">
                        "{prob.trigger_question}"
                      </p>
                    </div>

                    {prob.questions && Array.isArray(typeof prob.questions === 'string' ? JSON.parse(prob.questions || '[]') : prob.questions) && (
                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60">
                        <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider mb-1">
                          Pertanyaan Tugas Siswa:
                        </span>
                        <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
                          {(typeof prob.questions === 'string' ? JSON.parse(prob.questions) : prob.questions).map((qItem, qIdx) => (
                            <li key={qIdx} className="leading-relaxed">
                              {qItem.replace(/^\d+\.\s*/, '')}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsProblemsModalOpen(false)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: FORM TAMBAH / EDIT KASUS MASALAH PBL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isProblemFormModalOpen}
        onClose={() => setIsProblemFormModalOpen(false)}
        title={editingProblem ? 'Edit Kasus Masalah PBL' : 'Tambah Kasus Masalah PBL Baru'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProblem} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Judul Kasus Masalah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={problemForm.title}
              onChange={(e) => setProblemForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Kasus 1: Fenomena Blooming Alga di Waduk Cirata"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cerita Kontekstual / Fenomena Lingkungan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={problemForm.context_story}
              onChange={(e) => setProblemForm(prev => ({ ...prev, context_story: e.target.value }))}
              placeholder="Tuliskan latar belakang masalah kontekstual, data pengamatan (misal kadar DO < 2 mg/L), fakta ekosistem yang teramati..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pertanyaan Pemantik Investigasi Ilmiah <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="3"
              value={problemForm.trigger_question}
              onChange={(e) => setProblemForm(prev => ({ ...prev, trigger_question: e.target.value }))}
              placeholder="Contoh: Bagaimana mekanisme biokimia terjadinya penurunan kadar DO akibat blooming alga dan solusi bioremediasi apa yang paling efektif?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Pertanyaan Lembar Kerja Siswa */}
          <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Daftar Pertanyaan Lembar Kerja Siswa (Sintaks 2)
                </label>
                <p className="text-[11px] text-emerald-700">
                  Pertanyaan ini akan dijawab oleh siswa pada lembar orientasi masalah.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProblemForm(prev => ({ ...prev, questions: [...(prev.questions || []), ''] }))}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Plus size={13} />
                <span>Tambah Pertanyaan</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {(problemForm.questions || []).map((q, qIdx) => (
                <div key={qIdx} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1.5">
                    {qIdx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={q}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProblemForm(prev => {
                        const updated = [...(prev.questions || [])];
                        updated[qIdx] = val;
                        return { ...prev, questions: updated };
                      });
                    }}
                    placeholder={`Pertanyaan ${qIdx + 1}...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {(problemForm.questions || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setProblemForm(prev => ({
                          ...prev,
                          questions: prev.questions.filter((_, i) => i !== qIdx)
                        }));
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-0.5"
                      title="Hapus Pertanyaan"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Gambar / Ilustrasi Kasus
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={problemForm.image_url}
                onChange={(e) => setProblemForm(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <label className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProblemImageUpload}
                  className="hidden"
                />
                <Upload size={14} />
                <span>{uploadingProblemImage ? 'Mengunggah...' : 'Upload'}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProblemFormModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploadingProblemImage}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {editingProblem ? 'Simpan Perubahan Kasus' : 'Terbitkan Kasus PBL'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: KELOLA PANDUAN & PERTANYAAN SINTAKS 3 & 4 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isStageConfigModalOpen}
        onClose={() => setIsStageConfigModalOpen(false)}
        title={
          configuringStage?.stage_number === 3
            ? `Kelola Panduan & Pertanyaan Investigasi (Sintaks 3)`
            : configuringStage?.stage_number === 4
              ? `Kelola Panduan & Pertanyaan Presentasi (Sintaks 4)`
              : `Kelola Pertanyaan Refleksi Metakognitif (Sintaks 5)`
        }
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveStageConfig} className="space-y-5">
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            configuringStage?.stage_number === 3
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : configuringStage?.stage_number === 4
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}>
            {configuringStage?.stage_number === 3 ? (
              <Users className="text-amber-600 shrink-0 mt-0.5" size={20} />
            ) : configuringStage?.stage_number === 4 ? (
              <Presentation className="text-purple-600 shrink-0 mt-0.5" size={20} />
            ) : (
              <MessageSquare className="text-teal-600 shrink-0 mt-0.5" size={20} />
            )}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider">
                {configuringStage?.stage_number === 3
                  ? 'Konfigurasi Lembar Kerja Investigasi Kelompok'
                  : configuringStage?.stage_number === 4
                    ? 'Konfigurasi Panduan Paparan & Forum Diskusi'
                    : 'Konfigurasi Lembar Refleksi Metakognitif Kelompok'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {configuringStage?.stage_number === 3
                  ? 'Pertanyaan dan panduan di bawah ini akan ditampilkan kepada siswa di Sintaks 3 sebagai acuan utama dalam merumuskan analisis akar masalah dan alternatif solusi biologis.'
                  : configuringStage?.stage_number === 4
                    ? 'Pertanyaan pemantik dan panduan ini akan tampil di Sintaks 4 sebagai pedoman bagi kelompok presenter dan audiens dalam berdiskusi serta menanggapi paparan.'
                    : 'Pertanyaan refleksi di bawah ini akan ditampilkan kepada siswa di Sintaks 5 untuk mengevaluasi proses belajar, dinamika kolaborasi kelompok, dan rencana perbaikan masa depan.'}
              </p>
            </div>
          </div>

          {/* Tab Switcher for Stage 4 */}
          {configuringStage?.stage_number === 4 && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveConfigTab('questions')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeConfigTab === 'questions'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Presentation size={14} />
                <span>1. Panduan & Pertanyaan Pemantik</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveConfigTab('rubric')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeConfigTab === 'rubric'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award size={14} />
                <span>2. Rubrik Penilaian Presentasi ({stageConfigForm.rubric?.length || 0} Kriteria)</span>
              </button>
            </div>
          )}

          {/* TAB 1: Panduan & Pertanyaan */}
          {(configuringStage?.stage_number !== 4 || activeConfigTab === 'questions') && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Petunjuk / Panduan Guru untuk Siswa <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={stageConfigForm.instructions}
                  onChange={(e) => setStageConfigForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Tuliskan petunjuk umum atau target capaian yang harus diselesaikan siswa..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Daftar Pertanyaan Panduan Dinamis */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Daftar Pertanyaan Panduan / Poin Analisis (Dinamis)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Guru bebas menambahkan, mengubah, atau menghapus pertanyaan panduan untuk siswa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStageConfigForm(prev => ({ ...prev, questions: [...(prev.questions || []), ''] }))}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus size={14} />
                    <span>Tambah Pertanyaan</span>
                  </button>
                </div>

                <div className="space-y-2.5 pt-1">
                  {(stageConfigForm.questions || []).map((q, qIdx) => (
                    <div key={qIdx} className="flex items-start gap-2">
                      <span className={`w-6 h-6 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1.5 ${
                        configuringStage?.stage_number === 3 
                          ? 'bg-amber-600' 
                          : configuringStage?.stage_number === 4 
                            ? 'bg-purple-600' 
                            : 'bg-teal-600'
                      }`}>
                        {qIdx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={q}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStageConfigForm(prev => {
                            const updated = [...(prev.questions || [])];
                            updated[qIdx] = val;
                            return { ...prev, questions: updated };
                          });
                        }}
                        placeholder={`Tuliskan pertanyaan / poin panduan ke-${qIdx + 1}...`}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      {(stageConfigForm.questions || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setStageConfigForm(prev => ({
                              ...prev,
                              questions: prev.questions.filter((_, idx) => idx !== qIdx)
                            }));
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5"
                          title="Hapus pertanyaan"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Rubrik Penilaian Presentasi (Khusus Stage 4) */}
          {configuringStage?.stage_number === 4 && activeConfigTab === 'rubric' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                <div>
                  <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                    Rubrik Penilaian Presentasi & Diskusi
                  </h4>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Siswa akan melihat kriteria dan deskriptor ini sebagai pedoman persiapan presentasi kelompok.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-3 py-1 rounded-xl border ${
                    (stageConfigForm.rubric || []).reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0) === 100
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    Total Bobot: {(stageConfigForm.rubric || []).reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = Date.now();
                      setStageConfigForm(prev => ({
                        ...prev,
                        rubric: [
                          ...(prev.rubric || []),
                          {
                            id: newId,
                            criteria: `Kriteria Baru ${(prev.rubric || []).length + 1}`,
                            weight: 10,
                            description: 'Deskripsi indikator capaian penilaian...'
                          }
                        ]
                      }));
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Tambah Kriteria</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {(stageConfigForm.rubric || []).map((crit, cIdx) => (
                  <div key={crit.id || cIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 relative group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {cIdx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={crit.criteria}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStageConfigForm(prev => ({
                              ...prev,
                              rubric: prev.rubric.map((r, i) => i === cIdx ? { ...r, criteria: val } : r)
                            }));
                          }}
                          placeholder="Nama Kriteria Penilaian..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-slate-500">Bobot:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            value={crit.weight}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setStageConfigForm(prev => ({
                                ...prev,
                                rubric: prev.rubric.map((r, i) => i === cIdx ? { ...r, weight: val } : r)
                              }));
                            }}
                            className="w-16 px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-center text-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                          <span className="text-xs font-bold text-slate-600">%</span>
                        </div>

                        {(stageConfigForm.rubric || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setStageConfigForm(prev => ({
                                ...prev,
                                rubric: prev.rubric.filter((_, i) => i !== cIdx)
                              }));
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Hapus kriteria"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={crit.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStageConfigForm(prev => ({
                            ...prev,
                            rubric: prev.rubric.map((r, i) => i === cIdx ? { ...r, description: val } : r)
                          }));
                        }}
                        placeholder="Tuliskan deskripsi indikator capaian nilai untuk kriteria ini..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStageConfigModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingStageConfig}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                configuringStage?.stage_number === 3
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : configuringStage?.stage_number === 4
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {savingStageConfig ? 'Menyimpan...' : 'Simpan Panduan, Pertanyaan & Rubrik'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus Kasus */}
      <ConfirmDialog
        isOpen={Boolean(deleteProblemTarget)}
        onClose={() => setDeleteProblemTarget(null)}
        onConfirm={handleDeleteProblem}
        title="Hapus Kasus Masalah PBL"
        message={`Apakah Anda yakin ingin menghapus kasus "${deleteProblemTarget?.title}"? Kasus yang dihapus tidak dapat dipulihkan.`}
      />
    </div>
  );
};
