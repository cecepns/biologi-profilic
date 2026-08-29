import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StageTimeline } from '../../components/learning/StageTimeline';
import { Stage1PreClass } from '../../components/stages/Stage1PreClass';
import { Stage2ProblemOrientation } from '../../components/stages/Stage2ProblemOrientation';
import { Stage3CollaborativeWorkspace } from '../../components/stages/Stage3CollaborativeWorkspace';
import { Stage4PresentationDiscussion } from '../../components/stages/Stage4PresentationDiscussion';
import { Stage5ReflectionEvaluation } from '../../components/stages/Stage5ReflectionEvaluation';
import { ArrowLeft, BookOpen, Calendar, User, Sparkles, Loader2 } from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const StudentProjectDetail = () => {
  const { id, stageNum } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentStage = stageNum ? parseInt(stageNum, 10) : 1;

  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [activeStageData, setActiveStageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const projId = id || 1;
        const res = await request.get(API_ENDPOINTS.PROJECTS.DETAIL(projId));
        if (res.success && res.data) {
          const p = res.data;
          const stageNumber = p.current_stage || 1;
          const progress = Math.min(100, Math.round((stageNumber / 5) * 100));

          setProject({
            id: p.id,
            title: p.title,
            className: p.class_name || user?.className || 'XI IPA 2',
            teacherName: p.teacher_name || 'Ibu Guru Biologi',
            topic: p.topic || 'Keseimbangan Ekosistem & Biosfer',
            description: p.description || 'Proyek pembelajaran investigasi berbasis model ProFLiC.',
            startDate: p.start_date ? new Date(p.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '20 Agu 2026',
            endDate: p.end_date ? new Date(p.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '10 Sep 2026',
            progress: progress,
            groups: p.groups || []
          });

          if (p.stages && p.stages.length > 0) {
            setStages(p.stages);
            // Find current active stage object
            const currentStageObj = p.stages.find(s => s.stage_number === currentStage) || p.stages[0];
            if (currentStageObj) {
              const stageDetailRes = await request.get(API_ENDPOINTS.STAGES.DETAIL(currentStageObj.id));
              if (stageDetailRes.success && stageDetailRes.data) {
                setActiveStageData(stageDetailRes.data);
              }
            }
          }
        }
      } catch (err) {
        toast.error('Gagal memuat detail proyek: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, currentStage, user?.className]);

  const handleCompleteCurrentStage = () => {
    if (currentStage < 5) {
      navigate(`/student/projects/${id || 1}/stage/${currentStage + 1}`);
    } else {
      navigate('/student/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-sm font-bold text-slate-600">Memuat Modul Proyek ProFLiC...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/projects')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Proyek</span>
        </button>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          {project?.className} • ProFLiC Model
        </span>
      </div>

      {/* Project Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              {project?.topic}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              🌱 {project?.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Progres Proyek</span>
              <span className="text-sm font-black text-emerald-700">{project?.progress}% Selesai</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          {project?.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 font-medium">
            <User size={14} className="text-emerald-600" />
            <span>Guru: <strong>{project?.teacherName}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-emerald-600" />
            <span>Periode: <strong>{project?.startDate} - {project?.endDate}</strong></span>
          </div>
        </div>
      </div>

      {/* 5-Stage Stepper / Timeline */}
      <StageTimeline currentStage={currentStage} projectId={id || 1} stages={stages} />

      {/* Dynamic Active Stage Container */}
      <div className="transition-all duration-300">
        {currentStage === 1 && (
          <Stage1PreClass
            stage={activeStageData}
            onComplete={handleCompleteCurrentStage}
          />
        )}
        {currentStage === 2 && (
          <Stage2ProblemOrientation
            stage={activeStageData}
            onComplete={handleCompleteCurrentStage}
          />
        )}
        {currentStage === 3 && (
          <Stage3CollaborativeWorkspace
            stage={activeStageData}
            onComplete={handleCompleteCurrentStage}
          />
        )}
        {currentStage === 4 && (
          <Stage4PresentationDiscussion
            stage={activeStageData}
            onComplete={handleCompleteCurrentStage}
          />
        )}
        {currentStage === 5 && (
          <Stage5ReflectionEvaluation
            stage={activeStageData}
            onComplete={handleCompleteCurrentStage}
          />
        )}
      </div>
    </div>
  );
};
