import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProFLiCStageCards } from '../../components/learning/ProFLiCStageCards';
import { ActiveProjectCard } from '../../components/learning/ActiveProjectCard';
import { AboutProFLiCModal } from '../../components/learning/AboutProFLiCModal';
import { ChevronRight, Info, Sparkles, Sprout, BookOpen, Layers, Loader2 } from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await request.get(API_ENDPOINTS.PROJECTS.LIST, { limit: 10, classId: user?.classId });
        if (res.success && res.data && res.data.length > 0) {
          const firstProj = res.data[0];
          // Calculate progress based on current_stage (1 to 5)
          const currentStageNum = firstProj.current_stage || 1;
          const progressPercentage = Math.min(100, Math.round((currentStageNum / 5) * 100));

          setActiveProject({
            ...firstProj,
            progress: progressPercentage
          });

          // Fetch stages for this project
          const stagesRes = await request.get(API_ENDPOINTS.PROJECTS.STAGES(firstProj.id));
          if (stagesRes.success && stagesRes.data) {
            setStages(stagesRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const studentName = user?.name || user?.username || 'Siswa';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Section matching the mobile design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-100/30 rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-sm">
        {/* Subtle decorative background biological elements */}
        <div className="absolute right-4 top-2 text-7xl sm:text-9xl opacity-15 pointer-events-none select-none">
          🧬
        </div>
        <div className="absolute right-28 bottom-2 text-5xl opacity-10 pointer-events-none select-none">
          🌿
        </div>

        <div className="relative z-10 max-w-xl">
          {/* Greeting */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Halo, {studentName}! 👋
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Selamat datang di pembelajaran biologi menggunakan model ProFLiC.
          </p>

          {/* Inspirational Tagline */}
          <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-3 sm:mt-4 leading-relaxed">
            Belajar aktif biologi, berpikir kritis, berkolaborasi, dan reflektif!
          </p>

          {/* Button "Tentang Model ProFLiC >" */}
          <div className="mt-5">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-bold text-xs sm:text-sm shadow-xs transition-all"
            >
              <Info size={16} className="text-emerald-600" />
              <span>Tentang Model ProFLiC</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Section: Tahapan Model Pembelajaran ProFLiC */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="text-lg">🌱</span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
            Tahapan Model Pembelajaran ProFLiC
          </h2>
        </div>

        {/* 5 ProFLiC Stage Cards */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-150 p-8 shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
            <p className="text-xs text-slate-500 font-medium">Memuat tahapan pembelajaran...</p>
          </div>
        ) : (
          <ProFLiCStageCards
            stages={stages}
            projectId={activeProject?.id || 1}
          />
        )}
      </div>

      {/* Section: Proyek Aktif Card at Bottom */}
      {activeProject && (
        <div className="pt-2">
          <ActiveProjectCard
            project={{
              id: activeProject.id,
              title: activeProject.title,
              current_stage: activeProject.current_stage || 1,
              progress: activeProject.progress || 20
            }}
          />
        </div>
      )}

      {/* Modal Dialog: Tentang Model ProFLiC */}
      <AboutProFLiCModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};
