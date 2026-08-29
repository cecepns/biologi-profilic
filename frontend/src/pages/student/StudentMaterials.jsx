import React, { useState, useEffect, useCallback } from 'react';
import { DebounceInput } from '../../components/common/DebounceInput';
import { Pagination } from '../../components/common/Pagination';
import { BookOpen, Tv, FileText, Image as ImageIcon, Download, ExternalLink, Play, Loader2 } from 'lucide-react';
import { request } from '../../utils/request';
import { API_ENDPOINTS } from '../../utils/endpoints';
import toast from 'react-hot-toast';

export const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.MATERIALS.LIST, {
        search,
        type: activeType,
        page,
        limit
      });

      if (res.success) {
        setMaterials(res.data || []);
        if (res.pagination) {
          setTotal(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      toast.error('Gagal memuat materi biologi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, activeType, page, limit]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Perpustakaan Digital Materi Biologi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kumpulan video interaktif, modul PDF, dan visual infografis untuk pembelajaran mandiri Flipped Learning.
          </p>
        </div>

        <DebounceInput
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Cari materi biologi..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveType('all'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeType === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Materi ({total})
        </button>
        <button
          onClick={() => { setActiveType('video'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeType === 'video' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Tv size={14} /> Video Animasi
        </button>
        <button
          onClick={() => { setActiveType('pdf'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeType === 'pdf' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText size={14} /> Modul PDF
        </button>
        <button
          onClick={() => { setActiveType('image'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeType === 'image' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ImageIcon size={14} /> Infografis
        </button>
      </div>

      {/* Material Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-10 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            📚
          </div>
          <h3 className="font-extrabold text-base text-slate-800">Tidak Ada Materi Ditemukan</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {search ? `Tidak ada materi yang sesuai dengan pencarian "${search}".` : 'Belum ada materi pada kategori yang dipilih.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => {
            const isVideo = mat.type === 'video';
            const isPdf = mat.type === 'pdf';
            const isImage = mat.type === 'image';
            const targetUrl = mat.embed_url || mat.file_url || '#';

            return (
              <div
                key={mat.id}
                className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {mat.project_topic || 'Ekosistem'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {mat.duration_minutes ? `${mat.duration_minutes} Menit` : 'Mandiri'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                        isVideo
                          ? 'bg-blue-600'
                          : isPdf
                          ? 'bg-rose-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      {isVideo ? <Play size={20} /> : isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-800 line-clamp-2 leading-tight">
                        {mat.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {mat.content || 'Materi pembelajaran esensial model ProFLiC.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-700">● Tersedia Online & PWA</span>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Buka Materi</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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
