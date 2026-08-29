import React from 'react';
import { Check, Lock, Tv, ClipboardCheck, Users, Presentation, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StageTimeline = ({ currentStage = 1, projectId = 1, stages = [] }) => {
  const navigate = useNavigate();

  const stagesList = [
    { num: 1, name: 'Pre-Class', color: 'border-blue-500 bg-blue-500 text-white', textActive: 'text-blue-600', icon: Tv },
    { num: 2, name: 'Problem', color: 'border-emerald-500 bg-emerald-500 text-white', textActive: 'text-emerald-600', icon: ClipboardCheck },
    { num: 3, name: 'Investigation', color: 'border-amber-500 bg-amber-500 text-white', textActive: 'text-amber-600', icon: Users },
    { num: 4, name: 'Presentation', color: 'border-purple-500 bg-purple-500 text-white', textActive: 'text-purple-600', icon: Presentation },
    { num: 5, name: 'Reflection', color: 'border-teal-500 bg-teal-500 text-white', textActive: 'text-teal-600', icon: Lightbulb },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0"></div>

        {stagesList.map((st) => {
          const isCurrent = Number(currentStage) === st.num;
          const isPassed = Number(currentStage) > st.num;
          const Icon = st.icon;

          return (
            <div
              key={st.num}
              onClick={() => navigate(`/student/projects/${projectId}/stage/${st.num}`)}
              className="relative z-10 flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-9 sm:w-11 h-9 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isPassed
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                    : isCurrent
                    ? `${st.color} ring-4 ring-slate-100 scale-110 shadow-md`
                    : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-slate-400'
                }`}
              >
                {isPassed ? <Check size={18} className="stroke-[3]" /> : <Icon size={18} />}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold mt-2 text-center transition-colors ${
                  isCurrent
                    ? `${st.textActive} font-bold`
                    : isPassed
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <span className="hidden sm:inline">Tahap {st.num}: </span>
                {st.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
