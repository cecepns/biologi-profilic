import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, GraduationCap, CheckCircle2, BookOpen, Star, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import { UserAvatar } from '../../components/common/UserAvatar';
import toast from 'react-hot-toast';

export const StudentProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id || 1;
        const res = await request.get(API_ENDPOINTS.STUDENTS.DETAIL(studentId));
        if (res.success && res.data) {
          setProfileData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  const scores = profileData?.scores || [
    { stage: '1. Pre-Class Preparation', score: 95, weight: '15%', note: 'Sangat Mandiri' },
    { stage: '2. Problem Orientation', score: 90, weight: '20%', note: 'Analisis Kritis' },
    { stage: '3. Collaborative Investigation', score: 92, weight: '25%', note: 'Aktif Bekerja Sama' },
    { stage: '4. Presentation & Discussion', score: 90, weight: '20%', note: 'Penyampaian Runut' },
    { stage: '5. Reflection & Evaluation', score: 95, weight: '20%', note: 'CBT & Refleksi Valid' },
  ];

  const finalScore = profileData?.finalScore || 92.4;
  const predicate = profileData?.predicate || 'A (Sangat Baik)';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="relative">
          <UserAvatar
            src={user?.avatar}
            alt={user?.name}
            size="2xl"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-emerald-500/20 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl shadow-xs">
            <ShieldCheck size={16} />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profileData?.name || user?.name || 'Ahmad Fauzan'}</h1>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Siswa Aktif
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            NIS: <strong>{profileData?.nis || user?.nis || '20261101'}</strong> • Kelas: <strong>{profileData?.class_name || user?.className || 'XI IPA 2'}</strong> • {profileData?.group_name || user?.groupName || 'Kelompok 1 (Fitoplankton)'}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
              <GraduationCap size={14} className="text-emerald-600" />
              SMA Kurikulum Merdeka
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <Sparkles size={14} />
              Badge: Peneliti Ekosistem Handal
            </span>
          </div>
        </div>

        {/* Final Grade Badge */}
        <div className="p-4 bg-emerald-600 text-white rounded-3xl text-center shadow-md shadow-emerald-600/20 min-w-[130px]">
          <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">Nilai Akhir</span>
          <span className="text-3xl font-black">{finalScore}</span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full block mt-1 font-bold">Predikat: {predicate}</span>
        </div>
      </div>

      {/* Breakdown Nilai 5 Sintaks ProFLiC */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Rekapitulasi Nilai 5 Sintaks ProFLiC</h3>
            <p className="text-xs text-slate-400">Rincian perolehan skor aktivitas individu dan kolaborasi kelompok di database.</p>
          </div>
          <Award size={20} className="text-emerald-600" />
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="animate-spin text-emerald-600" size={18} />
            <span>Memuat rincian nilai capaian...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((sc, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 block">{sc.stage}</span>
                  <span className="text-[11px] text-slate-500">Bobot: {sc.weight} • Catatan: {sc.note}</span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="w-28 sm:w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${sc.score}%` }}
                    ></div>
                  </div>
                  <span className="font-black text-sm text-slate-800 min-w-[32px] text-right">{sc.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
