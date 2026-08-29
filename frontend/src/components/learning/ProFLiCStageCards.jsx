import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, ClipboardCheck, Users, Presentation, Lightbulb, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';

export const ProFLiCStageCards = ({ stages = [], projectId = 1 }) => {
  const navigate = useNavigate();

  const stageMeta = {
    1: {
      number: 1,
      title: 'Pre-Class Preparation',
      model: '(Flipped Learning)',
      desc: 'Pelajari materi terlebih dahulu secara mandiri melalui video, bacaan, atau sumber lainnya.',
      icon: Tv,
      numBg: 'bg-[#2563EB]',
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      textColor: 'text-[#2563EB]',
      arrowColor: 'text-[#2563EB]',
      borderHover: 'hover:border-[#2563EB]/40',
      badgeBg: 'bg-blue-50 text-blue-700'
    },
    2: {
      number: 2,
      title: 'Problem Orientation',
      model: '(Problem-Based Learning)',
      desc: 'Pahami masalah, ajukan pertanyaan, dan identifikasi hal-hal penting yang perlu dikaji.',
      icon: ClipboardCheck,
      numBg: 'bg-[#16A34A]',
      iconBg: 'bg-[#F0FDF4] text-[#16A34A]',
      textColor: 'text-[#16A34A]',
      arrowColor: 'text-[#16A34A]',
      borderHover: 'hover:border-[#16A34A]/40',
      badgeBg: 'bg-emerald-50 text-emerald-700'
    },
    3: {
      number: 3,
      title: 'Collaborative Investigation',
      model: '(Collaborative Learning)',
      desc: 'Bekerja dalam kelompok untuk menganalisis masalah dan mencari solusi terbaik.',
      icon: Users,
      numBg: 'bg-[#F59E0B]',
      iconBg: 'bg-[#FFFBEB] text-[#F59E0B]',
      textColor: 'text-[#F59E0B]',
      arrowColor: 'text-[#F59E0B]',
      borderHover: 'hover:border-[#F59E0B]/40',
      badgeBg: 'bg-amber-50 text-amber-700'
    },
    4: {
      number: 4,
      title: 'Presentation & Discussion',
      model: '(Collaborative Learning)',
      desc: 'Presentasikan hasil diskusi kelompok dan berikan tanggapan terhadap kelompok lain.',
      icon: Presentation,
      numBg: 'bg-[#7C3AED]',
      iconBg: 'bg-[#FAF5FF] text-[#7C3AED]',
      textColor: 'text-[#7C3AED]',
      arrowColor: 'text-[#7C3AED]',
      borderHover: 'hover:border-[#7C3AED]/40',
      badgeBg: 'bg-purple-50 text-purple-700'
    },
    5: {
      number: 5,
      title: 'Reflection & Evaluation',
      model: '(Reflection)',
      desc: 'Refleksikan proses dan hasil belajar, serta kerjakan soal evaluasi yang tersedia.',
      icon: Lightbulb,
      numBg: 'bg-[#0F8B8D]',
      iconBg: 'bg-[#F0FDFA] text-[#0F8B8D]',
      textColor: 'text-[#0F8B8D]',
      arrowColor: 'text-[#0F8B8D]',
      borderHover: 'hover:border-[#0F8B8D]/40',
      badgeBg: 'bg-teal-50 text-teal-700'
    }
  };

  const handleStageClick = (stageNum) => {
    navigate(`/student/projects/${projectId}/stage/${stageNum}`);
  };

  return (
    <div className="space-y-3.5">
      {[1, 2, 3, 4, 5].map((num) => {
        const meta = stageMeta[num];
        const Icon = meta.icon;
        const currentStageData = stages.find((s) => s.stage_number === num);
        const status = currentStageData?.status || (num <= 2 ? 'completed' : num === 3 ? 'in_progress' : num === 4 ? 'available' : 'locked');

        return (
          <div
            key={num}
            onClick={() => handleStageClick(num)}
            className={`group relative bg-white rounded-2xl border border-slate-150 p-4 sm:p-5 shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-3.5 sm:gap-5 hover:shadow-md ${meta.borderHover}`}
          >
            {/* Left Stage Number Badge */}
            <div className={`w-10 sm:w-12 h-14 sm:h-16 rounded-xl ${meta.numBg} text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-sm shrink-0`}>
              {meta.number}
            </div>

            {/* Circular Icon Container */}
            <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-full ${meta.iconBg} flex items-center justify-center shrink-0 border border-slate-100 shadow-xs`}>
              <Icon size={24} className="sm:scale-110" />
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-1">
                <h3 className={`font-bold text-sm sm:text-base ${meta.textColor} leading-tight`}>
                  {meta.title}
                </h3>
                <span className={`text-xs font-semibold ${meta.textColor} opacity-90`}>
                  {meta.model}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                {meta.desc}
              </p>
            </div>

            {/* Right Status / Arrow Action */}
            <div className="flex items-center gap-2 shrink-0">
              {status === 'completed' ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 size={12} /> Selesai
                </span>
              ) : status === 'locked' ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  <Lock size={12} /> Terkunci
                </span>
              ) : null}

              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${meta.arrowColor} group-hover:translate-x-1 transition-transform`}>
                <ChevronRight size={22} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
