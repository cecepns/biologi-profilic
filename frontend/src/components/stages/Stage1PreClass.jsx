import React, { useState } from 'react';
import { Tv, FileText, Image as ImageIcon, CheckCircle2, Clock, PlayCircle, ExternalLink, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const Stage1PreClass = ({ stage, onComplete }) => {
  const [activeTab, setActiveTab] = useState('video');
  const [checklist, setChecklist] = useState({
    video: true,
    pdf: true,
    infographic: false,
  });

  const materials = stage?.materials && stage.materials.length > 0 ? stage.materials : [
    {
      id: 1,
      title: 'Video Pembelajaran: Aliran Energi & Tingkat Trofik',
      type: 'video',
      embed_url: 'https://www.youtube.com/embed/LNpHB5Ocbps',
      duration_minutes: 12,
      content: 'Penjelasan mendalam mengenai hukum termodinamika 10% dalam rantai makanan, piramida ekologi (energi, biomassa, jumlah), dan keseimbangan jaring-jaring makanan akuatik.'
    },
    {
      id: 2,
      title: 'Modul PDF: Struktur Komponen Biotik & Abiotik Ekosistem',
      type: 'pdf',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      duration_minutes: 20,
      content: 'Materi kajian interaksi simbiosis mutualisme, komensalisme, parasitisme, antibiosis, serta pengaruh faktor abiotik (suhu, pH, DO, salinitas) terhadap daya dukung lingkungan.'
    },
    {
      id: 3,
      title: 'Infografis: Siklus Biogeokimia (Karbon, Nitrogen & Fosfor)',
      type: 'image',
      file_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      duration_minutes: 10,
      content: 'Bagan daur materi: fiksasi nitrogen oleh Rhizobium leguminosarum, nitrifikasi, asimilasi tumbuhan, serta pelepasan gas nitrogen bebas ke atmosfer.'
    }
  ];

  const videoMaterial = materials.find(m => m.type === 'video') || materials[0] || {};
  const pdfMaterial = materials.find(m => m.type === 'pdf') || materials[1] || {};
  const imgMaterial = materials.find(m => m.type === 'image') || materials[2] || {};

  const handleCheck = (key) => {
    const nextState = { ...checklist, [key]: !checklist[key] };
    setChecklist(nextState);
    if (!checklist[key]) {
      toast.success('Checklist pemahaman diperbarui!');
    }
  };

  const handleMarkComplete = () => {
    toast.success('Selamat! Anda telah menyelesaikan Sintaks 1: Pre-Class Preparation.');
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">
          <Tv size={16} />
          <span>Sintaks 1 • Flipped Learning</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Pre-Class Preparation: Belajar Mandiri
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-2xl leading-relaxed">
          Pelajari konsep biologi esensial melalui video, modul PDF, dan visual infografis di bawah ini sebelum memasuki sesi investigasi masalah kelompok.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'video'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlayCircle size={17} />
          <span>Video Materi ({videoMaterial.duration_minutes || 15} Menit)</span>
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'pdf'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={17} />
          <span>Modul PDF Interaktif</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'image'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon size={17} />
          <span>Infografis Siklus</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-3xl border border-slate-150 p-5 sm:p-7 shadow-sm">
        {activeTab === 'video' && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-slate-900">
              <iframe
                className="w-full h-full"
                src={videoMaterial.embed_url || "https://www.youtube.com/embed/LNpHB5Ocbps"}
                title="Video Pembelajaran Biologi"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="pt-2">
              <h3 className="font-extrabold text-base text-slate-800">
                {videoMaterial.title || 'Aliran Energi, Rantai Makanan & Jaring-Jaring Kehidupan'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {videoMaterial.content || 'Video ini membahas peranan autotrof produsen, herbivora primer, karnivora sekunder/tersier, serta pengurai (dekomposer & detritivor) dalam menjaga keseimbangan biosfer.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">
                    {pdfMaterial.title || 'Modul Pegangan Siswa: Ekologi & Keseimbangan Lingkungan'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Format PDF • Disertai Studi Kasus & Fakta Ilmiah</p>
                </div>
              </div>
              <a
                href={pdfMaterial.file_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
              >
                <Download size={15} />
                <span>Unduh / Buka Modul</span>
              </a>
            </div>

            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <h5 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">Ringkasan Materi Esensial</h5>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {pdfMaterial.content || 'Komponen Biotik meliputi Produsen (Autotrof), Konsumen (Heterotrof), dan Dekomposer (Saprofit). Komponen Abiotik meliputi Suhu, Cahaya Matahari, Air, Derajat Keasaman (pH), dan Oksigen Terlarut (DO).'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-96">
              <img
                src={imgMaterial.file_url || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000"}
                alt={imgMaterial.title || "Infografis Siklus Biogeokimia"}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">{imgMaterial.title || 'Infografis Interaktif: Daur Biogeokimia'}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{imgMaterial.content || 'Amati bagaimana siklus materi berpindah dari tanah/air ke tubuh makhluk hidup lalu kembali ke alam.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Kesiapan Mandiri */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Checklist Pemahaman & Kesiapan Pre-Class
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.video}
              onChange={() => handleCheck('video')}
              className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Saya telah menyimak video pembelajaran konsep jaring makanan dan aliran energi.
            </span>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.pdf}
              onChange={() => handleCheck('pdf')}
              className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Saya telah membaca modul PDF struktur ekosistem dan interaksi biotik-abiotik.
            </span>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checklist.infographic}
              onChange={() => handleCheck('infographic')}
              className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Saya telah menelaah infografis daur biogeokimia dan siap mengikuti investigasi kasus.
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleMarkComplete}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Tandai Selesai & Lanjut ke Problem Orientation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
