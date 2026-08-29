import React from 'react';
import { Modal } from '../common/Modal';
import { Tv, ClipboardCheck, Users, Presentation, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutProFLiCModal = ({ isOpen, onClose }) => {
  const syntaxes = [
    {
      num: 1,
      title: 'Pre-Class Preparation',
      model: 'Flipped Learning',
      color: 'bg-blue-600 text-white',
      border: 'border-blue-200',
      bg: 'bg-blue-50/60',
      textColor: 'text-blue-700',
      icon: Tv,
      summary: 'Siswa mempelajari materi awal secara mandiri melalui video pembelajaran, modul digital, dan bacaan kontekstual sebelum pertemuan tatap muka/kelas dimulai.',
      activity: 'Menyimak video, membaca modul PDF, mencatat poin penting, dan mengisi checklist kesiapan.'
    },
    {
      num: 2,
      title: 'Problem Orientation',
      model: 'Problem-Based Learning (PBL)',
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/60',
      textColor: 'text-emerald-700',
      icon: ClipboardCheck,
      summary: 'Guru menyajikan permasalahan nyata (fenomena alam, isu lingkungan, atau kasus biologi). Siswa mengidentifikasi fakta saintifik dan merumuskan pertanyaan kunci.',
      activity: 'Membaca konteks fenomena, menyusun fakta-fakta lapangan, dan merumuskan hipotesis pertanyaan masalah.'
    },
    {
      num: 3,
      title: 'Collaborative Investigation',
      model: 'Collaborative Learning',
      color: 'bg-amber-500 text-white',
      border: 'border-amber-200',
      bg: 'bg-amber-50/60',
      textColor: 'text-amber-700',
      icon: Users,
      summary: 'Siswa bekerja dalam kelompok kecil (4-5 orang) untuk mengumpulkan bukti ilmiah, mengkaji pustaka, berdiskusi di workspace interaktif, dan merancang alternatif solusi terbaik.',
      activity: 'Diskusi tim hybrid (daring/luring), membandingkan kelebihan/kekurangan solusi, dan memilih solusi terpilih.'
    },
    {
      num: 4,
      title: 'Presentation & Discussion',
      model: 'Collaborative Learning',
      color: 'bg-purple-600 text-white',
      border: 'border-purple-200',
      bg: 'bg-purple-50/60',
      textColor: 'text-purple-700',
      icon: Presentation,
      summary: 'Setiap kelompok memaparkan hasil solusi inovatifnya menggunakan media presentasi. Kelompok lain memberikan tanggapan, pertanyaan kritis, dan apresiasi.',
      activity: 'Unggah slide karya, presentasi, forum tanya jawab antar-kelompok, dan penilaian rubrik guru.'
    },
    {
      num: 5,
      title: 'Reflection & Evaluation',
      model: 'Reflection & Authentic Assessment',
      color: 'bg-teal-600 text-white',
      border: 'border-teal-200',
      bg: 'bg-teal-50/60',
      textColor: 'text-teal-700',
      icon: Lightbulb,
      summary: 'Kelompok merefleksikan proses kerja sama dan capaian belajar, diikuti evaluasi individu untuk menguji pemahaman konsep biologi secara terukur.',
      activity: 'Pengisian refleksi metakognitif tim, pengerjaan kuis CBT Pilihan Ganda (auto-score), dan soal analisis essay.'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mengenal Model Pembelajaran ProFLiC" maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Intro */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200 block mb-1">
            Kerangka Pedagogis
          </span>
          <h2 className="text-xl font-extrabold">Apa itu ProFLiC?</h2>
          <p className="text-xs sm:text-sm text-emerald-50 mt-2 leading-relaxed">
            <strong>ProFLiC (Problem-Flipped-Collaborative Learning)</strong> adalah model pembelajaran biologi yang mengintegrasikan 
            <em> Flipped Learning</em>, <em>Problem-Based Learning</em>, <em>Collaborative Learning</em>, dan <em>Metacognitive Reflection</em> untuk menumbuhkan keterampilan berpikir kritis, kolaborasi tim, dan penguasaan konsep biologi secara mendalam.
          </p>
        </div>

        {/* 5 Syntax Step-by-Step */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">5 Tahapan Sintaks ProFLiC</h4>
          
          <div className="space-y-3">
            {syntaxes.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className={`p-4 rounded-2xl border ${s.border} ${s.bg} flex flex-col sm:flex-row items-start gap-4 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl ${s.color} font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0`}>
                      {s.num}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-sm shrink-0`}>
                      <Icon size={20} className={s.textColor} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h5 className="text-sm font-bold text-slate-800">{s.title}</h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.textColor} bg-white shadow-xs border border-slate-100`}>
                        {s.model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{s.summary}</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-white/70 px-2.5 py-1 rounded-lg border border-slate-100/80">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span><strong>Aktivitas:</strong> {s.activity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-colors"
          >
            Mengerti & Mulai Belajar
          </button>
        </div>
      </div>
    </Modal>
  );
};
