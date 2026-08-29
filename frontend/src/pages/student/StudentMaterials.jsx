import React, { useState } from 'react';
import { DebounceInput } from '../../components/common/DebounceInput';
import { BookOpen, Tv, FileText, Image as ImageIcon, Download, ExternalLink, Play } from 'lucide-react';

export const StudentMaterials = () => {
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');

  const materials = [
    {
      id: 1,
      title: 'Video Pembelajaran: Aliran Energi & Tingkat Trofik',
      topic: 'Ekosistem',
      type: 'video',
      duration: '12 Menit',
      url: 'https://www.youtube.com/embed/LNpHB5Ocbps',
      description: 'Penjelasan transfer energi 10% antar trofik, piramida biomassa, dan rantai makanan.'
    },
    {
      id: 2,
      title: 'Modul PDF: Struktur Komponen Biotik & Abiotik Ekosistem',
      topic: 'Ekosistem',
      type: 'pdf',
      duration: '18 Halaman',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'Kajian interaksi intraspesifik, simbiosis, daya dukung lingkungan, dan suksesi ekologis.'
    },
    {
      id: 3,
      title: 'Infografis Siklus Biogeokimia (Karbon, Nitrogen & Fosfor)',
      topic: 'Ekosistem',
      type: 'image',
      duration: 'Visual Bagan',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      description: 'Bagan daur materi fiksasi nitrogen, nitrifikasi bakteri, serta siklus fosfat batuan.'
    },
    {
      id: 4,
      title: 'E-Book PDF: Biologi Sel & Organel Seluler Tumbuhan/Hewan',
      topic: 'Sel',
      type: 'pdf',
      duration: '24 Halaman',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'Panduan mikroskopik membran sel, mitokondria, kloroplas, dan retikulum endoplasma.'
    },
    {
      id: 5,
      title: 'Video Animasi 3D: Replikasi DNA & Sintesis Protein',
      topic: 'Genetika',
      type: 'video',
      duration: '15 Menit',
      url: 'https://www.youtube.com/embed/LNpHB5Ocbps',
      description: 'Visualisasi transkripsi mRNA dan translasi kodon asam amino pada ribosom.'
    }
  ];

  const filtered = materials.filter(m => {
    const matchType = activeType === 'all' || m.type === activeType;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.topic.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Perpustakaan Digital Materi Biologi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kumpulan video interaktif, modul PDF, dan visual infografis untuk pembelajaran mandiri.
          </p>
        </div>

        <DebounceInput
          value={search}
          onChange={setSearch}
          placeholder="Cari materi biologi..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeType === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Materi ({materials.length})
        </button>
        <button
          onClick={() => setActiveType('video')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeType === 'video' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Tv size={14} /> Video Animasi
        </button>
        <button
          onClick={() => setActiveType('pdf')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeType === 'pdf' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText size={14} /> Modul PDF
        </button>
        <button
          onClick={() => setActiveType('image')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeType === 'image' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ImageIcon size={14} /> Infografis
        </button>
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className="bg-white rounded-3xl border border-slate-150 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {mat.topic}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{mat.duration}</span>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                    mat.type === 'video'
                      ? 'bg-blue-600'
                      : mat.type === 'pdf'
                      ? 'bg-rose-600'
                      : 'bg-amber-600'
                  }`}
                >
                  {mat.type === 'video' ? <Play size={20} /> : mat.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 line-clamp-2 leading-tight">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {mat.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700">● Tersedia Offline PWA</span>
              <a
                href={mat.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors"
              >
                <ExternalLink size={13} />
                <span>Buka Materi</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
