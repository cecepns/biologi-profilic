import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, ChevronRight } from 'lucide-react';

export const ActiveProjectCard = ({ project = null }) => {
  const navigate = useNavigate();

  const title = project?.title || 'Ekosistem di Sekitarku';
  const currentStage = project?.current_stage || 2;
  const progress = project?.progress || 40;
  const id = project?.id || 1;

  return (
    <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3.5">
        {/* Biology Sprout Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
          <Sprout size={24} className="stroke-[2.2]" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80 block">
            Proyek Aktif
          </span>
          <h4 className="text-base font-extrabold text-slate-800 truncate">{title}</h4>

          {/* Progress bar info */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Tahap {currentStage} dari 5
            </span>
            <div className="w-24 sm:w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-emerald-700">{progress}%</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/student/projects/${id}/stage/${currentStage}`)}
        className="self-end sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all"
      >
        <span>Lanjutkan</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
