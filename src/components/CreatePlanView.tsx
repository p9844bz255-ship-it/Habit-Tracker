import React, { useState, useMemo } from 'react';
import { ChevronRight, History, Calendar, BookOpen, Target, Users, ClipboardList, Send, Copy, Check, Info } from 'lucide-react';
import { LessonPlan } from '../types';

interface CreatePlanViewProps {
  plan: LessonPlan;
  lessonPlans?: LessonPlan[];
  onSave: (updatedPlan: LessonPlan) => void;
  onCancel: () => void;
}

export default function CreatePlanView({ plan, lessonPlans = [], onSave, onCancel }: CreatePlanViewProps) {
  const [topic, setTopic] = useState(plan.topic || '');
  const [learningObjective, setLearningObjective] = useState(plan.learningObjective || '');
  const [learningActivities, setLearningActivities] = useState(plan.learningActivities || '');
  const [assessment, setAssessment] = useState(plan.assessment || '');

  // Filter other weeks' lesson plans for this class and subject that actually have content
  const historicPlans = useMemo(() => {
    return lessonPlans.filter(
      (lp) => 
        lp.class.toLowerCase() === plan.class.toLowerCase() && 
        lp.subject.toLowerCase() === plan.subject.toLowerCase() && 
        lp.id !== plan.id && 
        (lp.topic || lp.learningObjective || lp.learningActivities || lp.assessment)
    );
  }, [lessonPlans, plan]);

  const [selectedHistoricId, setSelectedHistoricId] = useState<string>(
    historicPlans.length > 0 ? historicPlans[0].id : ''
  );
  const [justDuplicated, setJustDuplicated] = useState(false);

  const selectedHistoricPlan = useMemo(() => {
    return historicPlans.find(hp => hp.id === selectedHistoricId);
  }, [historicPlans, selectedHistoricId]);

  const handleDuplicate = () => {
    if (!selectedHistoricPlan) return;
    setTopic(selectedHistoricPlan.topic || '');
    setLearningObjective(selectedHistoricPlan.learningObjective || '');
    setLearningActivities(selectedHistoricPlan.learningActivities || '');
    setAssessment(selectedHistoricPlan.assessment || '');
    
    // Smooth user notification status update
    setJustDuplicated(true);
    setTimeout(() => {
      setJustDuplicated(false);
    }, 2500);
  };

  // Character limits
  const LIMITS = {
    topic: 200,
    objective: 300,
    activities: 500,
    assessment: 300
  };

  const handleSave = () => {
    // Determine target status
    const isNowFinished = topic && learningObjective && learningActivities && assessment;
    const finalStatus = isNowFinished ? 'Selesai' : 'Sedang Dikerjakan';

    onSave({
      ...plan,
      topic,
      learningObjective,
      learningActivities,
      assessment,
      status: finalStatus,
      lastUpdate: 'Today'
    });
  };

  return (
    <div className="w-full relative z-10 pb-24">
      
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex text-xs font-bold text-on-surface-variant/80 mb-6 font-sans">
        <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
          <li className="inline-flex items-center">
            <button 
              onClick={onCancel}
              className="text-[#111c2d] hover:underline cursor-pointer transition-colors"
            >
              Dashboard
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight size={13} className="text-on-surface-variant/40" />
              <span className="text-[#111c2d] font-black ml-1.5 md:ml-2 uppercase tracking-wide">
                {plan.class} ({plan.subject})
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3.5xl font-extrabold text-on-surface tracking-tight mb-2.5">
          {plan.topic ? 'Edit Weekly Lesson Plan' : 'Create Weekly Lesson Plan'}
        </h1>
        <div className="flex items-center gap-3.5">
          <span className="text-xs md:text-sm font-semibold text-on-surface-variant">
            {plan.week}
          </span>
          <span className="bg-[#ffe085] text-[#574500] text-[11px] font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
            <History size={13} />
            Draft
          </span>
        </div>
      </div>

      {/* Class Information panel */}
      <section className="glass-card p-6 mb-8 transition-all duration-300">
        <h2 className="text-base font-bold text-on-surface tracking-tight mb-5">
          Informasi Kelas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Teacher
            </p>
            <p className="text-sm text-on-surface font-semibold">
              Indra Bayu Muktias
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Class
            </p>
            <p className="text-sm text-on-surface font-semibold">
              {plan.class}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Subject
            </p>
            <p className="text-sm text-on-surface font-semibold">
              {plan.subject}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Week
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-on-surface font-semibold">
                {plan.week.split(' ')[0]} <span className="text-on-surface-variant/70 font-normal">({plan.week.substring(7)})</span>
              </p>
              <Calendar size={16} className="text-on-surface-variant/60" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: DUPLIKASI LESSON PLAN PEKAN LALU */}
      <section className="glass-card p-5.5 mb-8 border border-[#6b38d4]/15 bg-gradient-to-br from-white via-[#faf9ff] to-white/90 shadow-sm transition-all duration-300 relative overflow-hidden">
        {/* Decorative corner visual */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6b38d4]/3 rounded-full filter blur-xl pointer-events-none -mr-8 -mt-8" />
        
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#6b38d4]/10 p-2.5 rounded-2xl text-[#6b38d4] shadow-sm shrink-0">
              <Copy size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111c2d] uppercase tracking-wider font-sans">
                DUPLIKASI RENCANA PEKAN SEBELUMNYA
              </h3>
              <p className="text-xs text-on-surface-variant/80 font-semibold mt-0.5">
                Lihat atau salin langsung isi Lesson Plan yang sudah matang dari pertemuan di pekan lalu.
              </p>
            </div>
          </div>
          
          {justDuplicated && (
            <span className="bg-[#e2f9d3] border border-[#9ed485] text-[#2c7515] font-black text-xs px-4 py-1.5 rounded-full select-none animate-bounce flex items-center gap-1.5 shadow-sm">
              <Check size={14} className="stroke-[3]" /> Berhasil Di-Duplikasi!
            </span>
          )}
        </div>

        {historicPlans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5.5 mt-3">
            {/* Left side: list of historic weeks */}
            <div className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scroll-smooth select-none hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {historicPlans.map((hp) => {
                const isSelected = selectedHistoricId === hp.id;
                return (
                  <button
                    key={hp.id}
                    type="button"
                    onClick={() => setSelectedHistoricId(hp.id)}
                    className={`flex flex-col items-start p-3.5 rounded-2xl border text-left min-w-[160px] lg:min-w-0 transition-all duration-300 transform active:scale-97 ${
                      isSelected
                        ? 'bg-[#111c2d] text-white border-[#111c2d] shadow-md -translate-y-0.5'
                        : 'bg-white/60 hover:bg-white text-on-surface border-neutral-200/80 shadow-sm hover:border-neutral-300 md:hover:shadow'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider font-mono">
                      {hp.week.split(' ')[0]}
                    </span>
                    <span className={`text-[11px] font-bold truncate max-w-full mt-1.5 ${isSelected ? 'text-white' : 'text-[#111c2d]'}`}>
                      {hp.topic || '(Tanpa Tema)'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right side: Selected plan preview and quick copy controls */}
            <div className="lg:col-span-8 bg-white/70 border border-neutral-200/60 rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-inner">
              {selectedHistoricPlan ? (
                <>
                  <div className="space-y-4 text-xs font-sans">
                    <div className="flex justify-between items-center border-b border-neutral-200/70 pb-2.5">
                      <span className="font-extrabold text-[#111c2d] uppercase tracking-wider text-[11px] font-sans flex items-center gap-1.5">
                        <History size={14} className="text-[#6b38d4]" />
                        Review Isi Rencana ({selectedHistoricPlan.week.split(' ')[0]})
                      </span>
                      <span className="bg-[#e9ddff] text-[#5517be] font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wide">
                        {selectedHistoricPlan.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 p-3 rounded-2xl border border-neutral-200/50">
                        <p className="font-extrabold text-[#111c2d] mb-1.5 text-[11px] uppercase tracking-wider">Topic / Tema:</p>
                        <p className="text-on-surface-variant/90 font-medium leading-relaxed max-h-24 overflow-y-auto">
                          {selectedHistoricPlan.topic || <span className="text-neutral-400 italic">Kosong</span>}
                        </p>
                      </div>
                      
                      <div className="bg-white/50 p-3 rounded-2xl border border-neutral-200/50">
                        <p className="font-extrabold text-[#111c2d] mb-1.5 text-[11px] uppercase tracking-wider">Objective (Tujuan):</p>
                        <p className="text-on-surface-variant/90 font-medium leading-relaxed max-h-24 overflow-y-auto">
                          {selectedHistoricPlan.learningObjective || <span className="text-neutral-400 italic">Kosong</span>}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 p-3 rounded-2xl border border-neutral-200/50">
                        <p className="font-extrabold text-[#111c2d] mb-1.5 text-[11px] uppercase tracking-wider">Activities (Aktivitas):</p>
                        <p className="text-on-surface-variant/90 font-medium leading-relaxed max-h-24 overflow-y-auto">
                          {selectedHistoricPlan.learningActivities || <span className="text-neutral-400 italic">Kosong</span>}
                        </p>
                      </div>

                      <div className="bg-white/50 p-3 rounded-2xl border border-neutral-200/50">
                        <p className="font-extrabold text-[#111c2d] mb-1.5 text-[11px] uppercase tracking-wider">Assessment (Penilaian):</p>
                        <p className="text-on-surface-variant/90 font-medium leading-relaxed max-h-24 overflow-y-auto">
                          {selectedHistoricPlan.assessment || <span className="text-neutral-400 italic">Kosong</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      className="w-full sm:w-auto text-xs font-black text-white bg-[#6b38d4] hover:bg-[#5225aa] px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
                    >
                      <Copy size={14} />
                      Salin &amp; Gunakan Rencana Pekan Ini
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-on-surface-variant/60">
                  <Info size={25} className="mb-2 text-neutral-400" />
                  <p className="text-xs font-semibold">Silakan pilih minggu pembelajaran dari panel kiri.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/60 border border-neutral-200/80 rounded-2xl p-4.5 text-xs text-on-surface-variant font-medium flex items-start gap-3 mt-1 leading-relaxed shadow-sm">
            <Info size={16} className="text-[#6b38d4] shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[#111c2d] text-[13px] mb-1">Rencana Sebelumnya Belum Tersedia</p>
              <p className="leading-relaxed">
                Belum ada Lesson Plan di minggu lain yang terisi untuk kelas <strong>{plan.class}</strong> mata pelajaran <strong>{plan.subject}</strong>. Setelah menginput rencana perdana ini, Anda dapat menduplikatnya dengan cepat di minggu-minggu berikutnya secara otomatis.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Sequential Form Sections */}
      <div className="space-y-6">
        
        {/* Section 1: Topic */}
        <section className="glass-card p-6 flex gap-5 transition-all duration-300">
          <div className="relative shrink-0 pt-0.5">
            <div className="absolute -top-1 -left-1.5 bg-[#2d2d2d] text-white text-[9px] font-black h-4.5 w-4.5 flex items-center justify-center rounded-full border-1.5 border-white z-10 shadow">
              1
            </div>
            <div className="h-11 w-11 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-on-surface border border-white/80 shadow-sm">
              <BookOpen size={20} className="text-on-surface-variant/80" />
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm md:text-base font-bold text-on-surface tracking-tight">
              Topic / Materi Pembelajaran
            </h3>
            <p className="text-xs text-on-surface-variant/80 font-semibold mb-4 mt-0.5">
              Tulis materi yang akan dipelajari minggu ini.
            </p>
            <div className="relative">
              <textarea 
                value={topic}
                maxLength={LIMITS.topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm rounded-xl text-sm text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#2d2d2d] focus:border-transparent p-4 placeholder-on-surface-variant/40 resize-y transition-all"
                placeholder="Contoh: Persamaan Linear Dua Variabel"
              />
            </div>
            <div className="text-right mt-1.5 text-[11px] font-bold text-on-surface-variant/70">
              {topic.length} / {LIMITS.topic}
            </div>
          </div>
        </section>

        {/* Section 2: Learning Objective */}
        <section className="glass-card p-6 flex gap-5 transition-all duration-300">
          <div className="relative shrink-0 pt-0.5">
            <div className="absolute -top-1 -left-1.5 bg-[#2d2d2d] text-white text-[9px] font-black h-4.5 w-4.5 flex items-center justify-center rounded-full border-1.5 border-white z-10 shadow">
              2
            </div>
            <div className="h-11 w-11 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-on-surface border border-white/80 shadow-sm">
              <Target size={20} className="text-on-surface-variant/80" />
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm md:text-base font-bold text-on-surface tracking-tight">
              Learning Objective / Tujuan Pembelajaran
            </h3>
            <p className="text-xs text-on-surface-variant/80 font-semibold mb-4 mt-0.5">
              Tulis tujuan pembelajaran yang ingin dicapai siswa.
            </p>
            <div className="relative">
              <textarea 
                value={learningObjective}
                maxLength={LIMITS.objective}
                onChange={(e) => setLearningObjective(e.target.value)}
                rows={3}
                className="w-full bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm rounded-xl text-sm text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#2d2d2d] focus:border-transparent p-4 placeholder-on-surface-variant/40 resize-y transition-all"
                placeholder="Contoh: Siswa mampu menyelesaikan soal SPLDV menggunakan metode eliminasi."
              />
            </div>
            <div className="text-right mt-1.5 text-[11px] font-bold text-on-surface-variant/70">
              {learningObjective.length} / {LIMITS.objective}
            </div>
          </div>
        </section>

        {/* Section 3: Learning Activities */}
        <section className="glass-card p-6 flex gap-5 transition-all duration-300">
          <div className="relative shrink-0 pt-0.5">
            <div className="absolute -top-1 -left-1.5 bg-[#2d2d2d] text-white text-[9px] font-black h-4.5 w-4.5 flex items-center justify-center rounded-full border-1.5 border-white z-10 shadow">
              3
            </div>
            <div className="h-11 w-11 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-on-surface border border-white/80 shadow-sm">
              <Users size={20} className="text-on-surface-variant/80" />
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm md:text-base font-bold text-on-surface tracking-tight">
              Learning Activities / Aktivitas Pembelajaran
            </h3>
            <p className="text-xs text-on-surface-variant/80 font-semibold mb-4 mt-0.5">
              Jelaskan aktivitas atau metode pembelajaran yang akan dilakukan.
            </p>
            <div className="relative">
              <textarea 
                value={learningActivities}
                maxLength={LIMITS.activities}
                onChange={(e) => setLearningActivities(e.target.value)}
                rows={4}
                className="w-full bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm rounded-xl text-sm text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#2d2d2d] focus:border-transparent p-4 placeholder-on-surface-variant/40 resize-y transition-all"
                placeholder="Contoh: Penjelasan konsep, diskusi kelompok, latihan soal, presentasi siswa."
              />
            </div>
            <div className="text-right mt-1.5 text-[11px] font-bold text-on-surface-variant/70">
              {learningActivities.length} / {LIMITS.activities}
            </div>
          </div>
        </section>

        {/* Section 4: Assessment */}
        <section className="glass-card p-6 flex gap-5 transition-all duration-300">
          <div className="relative shrink-0 pt-0.5">
            <div className="absolute -top-1 -left-1.5 bg-[#2d2d2d] text-white text-[9px] font-black h-4.5 w-4.5 flex items-center justify-center rounded-full border-1.5 border-white z-10 shadow">
              4
            </div>
            <div className="h-11 w-11 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-on-surface border border-white/80 shadow-sm">
              <ClipboardList size={20} className="text-on-surface-variant/80" />
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm md:text-base font-bold text-on-surface tracking-tight">
              Assessment / Penilaian
            </h3>
            <p className="text-xs text-on-surface-variant/80 font-semibold mb-4 mt-0.5">
              Bagaimana cara menilai pemahaman siswa?
            </p>
            <div className="relative">
              <textarea 
                value={assessment}
                maxLength={LIMITS.assessment}
                onChange={(e) => setAssessment(e.target.value)}
                rows={3}
                className="w-full bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm rounded-xl text-sm text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#2d2d2d] focus:border-transparent p-4 placeholder-on-surface-variant/40 resize-y transition-all"
                placeholder="Contoh: Quiz singkat, latihan individu, presentasi hasil diskusi."
              />
            </div>
            <div className="text-right mt-1.5 text-[11px] font-bold text-on-surface-variant/70">
              {assessment.length} / {LIMITS.assessment}
            </div>
          </div>
        </section>

      </div>

      {/* Fixed bottom action footer panel exactly matching visual specs */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/35 backdrop-blur-xl border-t border-white/40 shadow-[0_-8px_32px_rgba(0,0,0,0.03)] py-4 px-6 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            type="button"
            onClick={onCancel}
            className="text-[#111c2d] bg-white/80 border border-white hover:bg-white text-xs font-bold px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            onClick={handleSave}
            className="text-white bg-[#111c2d] hover:bg-black text-xs font-bold px-7 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
          >
            <Send size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            Save Draft / Plan
          </button>
        </div>
      </footer>

    </div>
  );
}
