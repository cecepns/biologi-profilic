import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DebounceInput } from '../../components/common/DebounceInput';
import { Pagination } from '../../components/common/Pagination';
import { BookOpen, Calendar, Users, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const StudentProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.PROJECTS.LIST, {
        search,
        page,
        limit,
        classId: user?.classId
      });

      if (res.success) {
        const formatted = (res.data || []).map(p => {
          const stageNum = p.current_stage || 1;
          const progress = Math.min(100, Math.round((stageNum / 5) * 100));
          return {
            id: p.id,
            title: p.title,
            topic: p.topic,
            className: p.class_name || user?.className || 'XI IPA',
            teacherName: p.teacher_name || 'Ibu Guru Biologi',
            cover: p.cover || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600',
            currentStage: stageNum,
            progress: progress,
            startDate: p.start_date ? new Date(p.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '20 Agu 2026',
            endDate: p.end_date ? new Date(p.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '10 Sep 2026',
            status: p.status || 'published'
          };
        });

        setProjects(formatted);
        if (res.pagination) {
          setTotal(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      toast.error('Gagal memuat proyek pembelajaran: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, user?.classId, user?.className]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Proyek Pembelajaran Biologi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar topik pembelajaran investigasi berbasis 5 sintaks model ProFLiC.
          </p>
        </div>

        <DebounceInput
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Cari proyek biologi..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm animate-pulse">
              <div className="h-44 bg-slate-200 w-full"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            🌱
          </div>
          <h3 className="font-extrabold text-base text-slate-800">Tidak Ada Proyek Ditemukan</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {search ? `Tidak ada proyek pembelajaran yang cocok dengan kata kunci "${search}".` : 'Belum ada proyek pembelajaran biologi yang diterbitkan guru saat ini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/student/projects/${proj.id}`)}
              className="group bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={proj.cover}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold">
                    {proj.className}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-sm">
                    {proj.progress}% Selesai
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 block line-clamp-1">{proj.topic}</span>
                    <h3 className="text-base font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1 mt-0.5">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium">Tahap Berjalan:</span>
                      <span className="font-bold text-emerald-700">Tahap {proj.currentStage} dari 5</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{proj.startDate}</span>
                    </div>
                    <span className="font-medium">{proj.teacherName}</span>
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">Buka Modul Proyek</span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
};
