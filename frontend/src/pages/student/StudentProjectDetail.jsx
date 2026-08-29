import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StageTimeline } from '../../components/learning/StageTimeline';
import { Stage1PreClass } from '../../components/stages/Stage1PreClass';
import { Stage2ProblemOrientation } from '../../components/stages/Stage2ProblemOrientation';
import { Stage3CollaborativeWorkspace } from '../../components/stages/Stage3CollaborativeWorkspace';
import { Stage4PresentationDiscussion } from '../../components/stages/Stage4PresentationDiscussion';
import { Stage5ReflectionEvaluation } from '../../components/stages/Stage5ReflectionEvaluation';
import { ArrowLeft, BookOpen, Calendar, User, Sparkles } from 'lucide-react';

export const StudentProjectDetail = () => {
  const { id, stageNum } = useParams();
  const navigate = useNavigate();
  const currentStage = stageNum ? parseInt(stageNum, 10) : 3;

  const project = {
    id: 1,
    title: 'Ekosistem di Sekitarku',
    className: 'XI IPA 2',
    teacherName: 'Ibu Maya Sartika, M.Pd.',
    topic: 'Keseimbangan Ekosistem & Perubahan Lingkungan',
    description: 'Proyek investigasi kontekstual mengenai analisis interaksi rantai makanan, dampak limbah fosfat penyebab eutrofikasi perairan, dan perancangan bioremediasi mikroalga.',
    startDate: '20 Agu 2026',
    endDate: '10 Sep 2026',
    progress: 60,
  };

  const handleCompleteCurrentStage = () => {
    if (currentStage < 5) {
      navigate(`/student/projects/${id || 1}/stage/${currentStage + 1}`);
    }
  };

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
          {project.className} • ProFLiC Model
        </span>
      </div>

      {/* Project Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              {project.topic}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              🌱 {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Progres Proyek</span>
              <span className="text-sm font-black text-emerald-700">{project.progress}% Selesai</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          {project.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 font-medium">
            <User size={14} className="text-emerald-600" />
            <span>Guru: <strong>{project.teacherName}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-emerald-600" />
            <span>Periode: <strong>{project.startDate} - {project.endDate}</strong></span>
          </div>
        </div>
      </div>

      {/* 5-Stage Stepper / Timeline */}
      <StageTimeline currentStage={currentStage} projectId={id || 1} />

      {/* Dynamic Active Stage Container */}
      <div className="transition-all duration-300">
        {currentStage === 1 && <Stage1PreClass onComplete={handleCompleteCurrentStage} />}
        {currentStage === 2 && <Stage2ProblemOrientation onComplete={handleCompleteCurrentStage} />}
        {currentStage === 3 && <Stage3CollaborativeWorkspace onComplete={handleCompleteCurrentStage} />}
        {currentStage === 4 && <Stage4PresentationDiscussion onComplete={handleCompleteCurrentStage} />}
        {currentStage === 5 && <Stage5ReflectionEvaluation onComplete={handleCompleteCurrentStage} />}
      </div>
    </div>
  );
};
