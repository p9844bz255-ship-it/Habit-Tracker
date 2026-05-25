import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, User, Clock, BookOpen, Layers, Check, Info, ArrowRight, Sparkles, ChevronDown, X, Filter } from 'lucide-react';

interface ScheduleItem {
  id?: string;
  hari: string;
  kelas: string;
  mapel: string;
  guru: string;
  jp: string;
  waktu: string;
  divisi?: string;
  divisi_lower?: string;
}

interface ScheduleDashboardViewProps {
  schedules: ScheduleItem[];
  currentUserName?: string;
}

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function normalizeTeacherName(name: string): string {
  if (!name) return '';
  
  // 1. Remove grading patterns like "(B)", "(A)", "(C)", "(A/B)", etc. anywhere or at the end
  let cleaned = name.replace(/\s*\([a-zA-Z0-9\/+-]+\)\s*/g, ' ').trim();
  
  // 2. Remove isolated trailing (B), (A), B, A, etc. specifically when they represent grading group tags
  // but don't touch common academic/title designations
  cleaned = cleaned.replace(/\s+([A-Za-z])\s*$/g, '').trim();

  // 3. Normalize spacing
  cleaned = cleaned.replace(/\s+/g, ' ');

  // 4. Transform to consistent Title Case and restore standard formatting for common abbreviations
  const words = cleaned.split(' ');
  const capitalizedWords = words.map(w => {
    if (!w) return '';
    const lower = w.toLowerCase();
    
    // Explicit format checks for typical academic/religious titles
    if (lower === 'lc.' || lower === 'lc') return 'Lc.';
    if (lower === 'm' || lower === 'm.') return 'M.';
    if (lower === 'spd' || lower === 's.pd.') return 'S.Pd.';
    if (lower === 'mpd' || lower === 'm.pd.') return 'M.Pd.';
    if (lower === 'm.ag' || lower === 'mag' || lower === 'm.ag.') return 'M.Ag.';
    if (lower === 's.ag' || lower === 'sag' || lower === 's.ag.') return 'S.Ag.';
    if (lower === 'sh' || lower === 's.h' || lower === 's.h.') return 'S.H.';
    if (lower === 'se' || lower === 's.e' || lower === 's.e.') return 'S.E.';
    if (lower === 'si' || lower === 's.i' || lower === 's.i.') return 'S.I.';
    if (lower === 'ss' || lower === 's.s' || lower === 's.s.') return 'S.S.';
    
    // Regular name capitalization
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
  
  return capitalizedWords.join(' ').trim();
}

export function normalizeSubjectName(name: string): string {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function getGradeLevel(className: string): string {
  if (!className) return '';
  const match = className.trim().match(/^(\d+)/);
  return match ? match[1] : className.trim();
}

export function extractGradingCode(fullName: string): { name: string; code: string | null } {
  if (!fullName) return { name: '', code: null };
  const match = fullName.match(/\(([^)]+)\)/);
  if (match) {
    const code = match[1].trim();
    // Clean of parentheses and optional grading word phrases
    const name = fullName.replace(/\s*\([^)]+\)\s*/g, ' ').trim();
    return { name, code };
  }
  return { name: fullName, code: null };
}

export function formatGradingClasses(distinctClasses: string[], isGradingSlot: boolean): string {
  if (!distinctClasses || distinctClasses.length === 0) return '';
  if (!isGradingSlot) {
    return distinctClasses.join(', ');
  }

  const simplified = distinctClasses.map(cls => {
    const upper = cls.toUpperCase();
    const numMatch = upper.match(/\b(10|11|12)\b/) || upper.match(/\d+/);
    const gradeNum = numMatch ? numMatch[0] : '';
    
    let stream = '';
    if (/\bME\b/.test(upper)) {
      stream = 'ME';
    } else if (/\bDI\b/.test(upper)) {
      stream = 'DI';
    } else if (/\bMQ\b/.test(upper)) {
      stream = 'MQ';
    } else if (/\bAE\b/.test(upper)) {
      stream = 'AE';
    } else {
      const fallbackMatch = upper.match(/\b(SAINTEK|SOSHUM|TIMTENG|IPA|IPS)\b/);
      if (fallbackMatch) {
        stream = fallbackMatch[0];
      }
    }
    
    if (gradeNum && stream) {
      return `${gradeNum} ${stream}`;
    }
    return cls;
  });

  return Array.from(new Set(simplified)).join(', ');
}

export default function ScheduleDashboardView({ schedules = [], currentUserName = 'Indra Bayu Muktias' }: ScheduleDashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Find all unique teacher names from schedules, splitting composite names and normalizing
  const allTeachers = useMemo(() => {
    const namesSet = new Set<string>();
    schedules.forEach((item) => {
      if (item.guru) {
        const parts = item.guru.split('/').map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          const norm = normalizeTeacherName(p);
          if (norm) {
            namesSet.add(norm);
          }
        });
      }
    });
    return Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  }, [schedules]);

  // Find all unique class names from schedules
  const allClasses = useMemo(() => {
    const classesSet = new Set<string>();
    schedules.forEach((item) => {
      if (item.kelas) {
        classesSet.add(item.kelas.toUpperCase().trim());
      }
    });
    return Array.from(classesSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [schedules]);

  // Combine unique teachers and classes into a single search list
  const searchOptions = useMemo(() => {
    const options: { type: 'guru' | 'kelas'; name: string }[] = [];
    allTeachers.forEach(t => {
      options.push({ type: 'guru', name: t });
    });
    allClasses.forEach(c => {
      options.push({ type: 'kelas', name: c });
    });
    return options;
  }, [allTeachers, allClasses]);

  // Handle active selected item - defaults to currentUserName as a teacher, or the first teacher/class
  const initialItem = useMemo(() => {
    const normalizedUser = normalizeTeacherName(currentUserName).toLowerCase();
    const matched = allTeachers.find(t => normalizeTeacherName(t).toLowerCase() === normalizedUser);
    if (matched) return { type: 'guru' as const, name: matched };
    if (allTeachers.length > 0) return { type: 'guru' as const, name: allTeachers[0] };
    if (allClasses.length > 0) return { type: 'kelas' as const, name: allClasses[0] };
    return null;
  }, [allTeachers, allClasses, currentUserName]);

  const [activeItem, setActiveItem] = useState<{ type: 'guru' | 'kelas'; name: string } | null>(null);

  // Filter search options based on query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return searchOptions;
    const query = searchQuery.toLowerCase();
    return searchOptions.filter((opt) => opt.name.toLowerCase().includes(query));
  }, [searchOptions, searchQuery]);

  // Get filtered schedules for the current active item (either teacher or class rombel)
  const filteredSchedules = useMemo(() => {
    if (!activeItem) return [];
    if (activeItem.type === 'kelas') {
      const targetClass = activeItem.name.toUpperCase().trim();
      return schedules.filter(item => item.kelas && item.kelas.toUpperCase().trim() === targetClass);
    } else {
      const normalizedSel = normalizeTeacherName(activeItem.name).toLowerCase();
      return schedules.filter((item) => {
        if (!item.guru) return false;
        const parts = item.guru.split('/').map(p => normalizeTeacherName(p).toLowerCase());
        return parts.includes(normalizedSel);
      });
    }
  }, [schedules, activeItem]);

  const selectedTeacher = activeItem?.type === 'guru' ? activeItem.name : '';
  const selectedTeacherSchedules = filteredSchedules;

  // Gather all unique JP slots across the entire schedule to build the Y-axis timetable dynamically
  const uniqueJPSlots = useMemo(() => {
    const slots = Array.from(new Set(schedules.map((item) => item.jp).filter(Boolean)));
    
    // Sort JP periods intelligently (e.g. JP 1, JP 2, or Jam 1-2 etc.)
    return slots.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [schedules]);

  // Find standard time slots associated with JP periods for clearer displays
  const getJPTime = (jpName: string) => {
    const matched = schedules.find((item) => item.jp === jpName && item.waktu);
    return matched ? matched.waktu : 'Waktu Fleksibel';
  };

  // Determine current day of week to highlight it
  const todayName = useMemo(() => {
    const index = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const map = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return map[index];
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Upper header section */}
      <section className="flex flex-col gap-1.5">
        <h2 className="text-2xl md:text-3xl font-black text-[#111c2d] uppercase tracking-tight">
          DASHBOARD JADWAL MENGAJAR
        </h2>
        <p className="text-xs md:text-sm text-on-surface-variant/80 font-bold uppercase tracking-wider">
          INFORMASI JADWAL MENGAJAR GURU AL-WILDAN ISLAMIC SCHOOL 3 BSD CITY
        </p>
      </section>

      {/* Full-width interactive timetable card */}
      <div className="w-full">
        <div className="glass-card p-5 md:p-6 border border-white/60 bg-white/70 shadow-sm flex flex-col gap-5 md:gap-6 relative overflow-hidden w-full">
            
            {/* Background design glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6b38d4]/3 rounded-full filter blur-xl pointer-events-none -mr-8 -mt-8" />

            {/* Header: Selected Teacher State & Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/50 pb-5">
              <div className="flex items-center gap-3">
                <div className="bg-[#6b38d4]/10 p-3 rounded-2xl text-[#6b38d4] shadow-xs shrink-0">
                  {activeItem?.type === 'kelas' ? (
                    <Layers size={21} className="stroke-[2.2]" />
                  ) : (
                    <Calendar size={21} className="stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest block font-mono">
                    {activeItem?.type === 'kelas' ? 'TIMETABLE KELAS TERPILIH' : 'TIMETABLE GURU TERPILIH'}
                  </span>
                  <h3 className="text-xl font-black text-[#111c2d] uppercase tracking-wide mt-0.5">
                    {activeItem?.name || 'BELUM ADA PILIHAN'}
                  </h3>
                </div>
              </div>

              {activeItem && (
                <span className="bg-[#002c64]/10 text-[#002c64] border border-[#002c64]/10 font-bold text-xs px-4 py-2 rounded-full uppercase tracking-wider flex items-center gap-2 self-start md:self-auto shadow-2xs">
                  {activeItem.type === 'kelas' ? (
                    <>
                      <Layers size={13} className="stroke-[3]" /> KELAS {activeItem.name} (AKTIF)
                    </>
                  ) : (
                    <>
                      <User size={13} className="stroke-[3]" /> {activeItem.name} (AKTIF)
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Toolbar: Search & Select Teacher / Class above the Table Grid */}
            <div className="flex flex-col gap-4 bg-neutral-50/50 border border-[#e5e7eb] p-4 rounded-3xl">
              <div className="flex flex-col gap-1.5 w-full max-w-xl relative">
                <label htmlFor="teacherSearchInput" className="text-[10px] font-black text-[#111c2d] uppercase tracking-wider flex items-center gap-1.5 select-none font-sans">
                  <Search size={12} className="text-[#6b38d4]" />
                  <span>Cari Nama Guru / Kelas</span>
                </label>
                <div className="relative">
                  <input
                    id="teacherSearchInput"
                    type="text"
                    placeholder="Cari nama ustadz atau kelas..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#e5e7eb] text-xs font-bold text-[#111c2d] placeholder-neutral-400 outline-none focus:ring-2 focus:ring-[#6b38d4]/35 focus:border-[#6b38d4] transition-all shadow-inner"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Search size={15} />
                  </span>
                  
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setShowDropdown(true);
                        }}
                        className="text-neutral-400 hover:text-neutral-600 p-0.5"
                      >
                        <X size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="text-neutral-400 hover:text-[#111c2d] p-0.5"
                    >
                      <ChevronDown size={14} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Combobox suggest dropdown */}
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e7eb] rounded-2xl shadow-xl z-40 max-h-[250px] overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar animate-fade-in">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => {
                          const isSelected = activeItem?.name.toLowerCase() === opt.name.toLowerCase() && activeItem?.type === opt.type;
                          return (
                            <button
                              key={`${opt.type}:${opt.name}`}
                              type="button"
                              onClick={() => {
                                setActiveItem(opt);
                                setSearchQuery('');
                                setShowDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                                isSelected
                                  ? 'bg-[#6b38d4] text-white shadow-sm'
                                  : 'hover:bg-neutral-50 text-[#111c2d]'
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                {opt.type === 'kelas' ? (
                                  <Layers size={12} className={isSelected ? 'text-white' : 'text-[#6b38d4]'} />
                                ) : (
                                  <User size={12} className={isSelected ? 'text-white' : 'text-[#002c64]'} />
                                )}
                                <span className="truncate">{opt.name}</span>
                              </span>
                              {isSelected && <Check size={12} className="stroke-[3]" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-xs font-bold text-neutral-400 flex flex-col items-center justify-center gap-1.5">
                          <Info size={16} />
                          <span>Nama guru atau kelas tidak ditemukan</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {activeItem ? (
              <div className="flex flex-col gap-5">
                
                {/* Scrollable grid table container */}
                <div className="w-full overflow-x-auto border border-neutral-200/60 rounded-2xl shadow-inner scroll-smooth custom-scrollbar">
                  <table className="w-full border-collapse text-left min-w-[700px]">
                    
                    <thead className="bg-[#faf9ff]">
                      <tr>
                        {/* Period header */}
                        <th className="sticky top-0 bg-[#faf9ff] border-b border-neutral-200/60 px-4 py-3.5 text-center text-[10px] font-black text-[#111c2d] uppercase tracking-wider font-mono w-24 border-r border-neutral-200/40">
                          JP TIME
                        </th>

                        {/* Days header column with active-day check */}
                        {DAYS_OF_WEEK.map((day) => {
                          const isActiveToday = todayName.toLowerCase() === day.toLowerCase();
                          return (
                            <th
                              key={day}
                              className={`sticky top-0 border-b border-neutral-200/60 px-4 py-3.5 text-center text-xs font-black uppercase tracking-wider w-36 ${
                                isActiveToday
                                  ? 'bg-[#111c2d] text-white border-b-[#111c2d]'
                                  : 'bg-[#faf9ff] text-on-surface-variant border-r border-neutral-200/40 last:border-r-0'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span>{day}</span>
                                {isActiveToday && (
                                  <span className="bg-[#FFD166] text-[#2d2d2d] font-black text-[8px] px-1.5 py-0.5 rounded uppercase mt-0.5 tracking-wide scale-90">
                                    HARI INI
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {/* Sub header: 07.00 - 07.30 except Friday/Saturday which is Homeroom Teacher Session */}
                      <tr className="bg-neutral-50/10 border-b border-neutral-100">
                        <td className="px-4 py-3 text-center border-r border-neutral-200/40 font-mono text-[10px] alignment-baseline">
                          <span className="bg-[#6b38d4]/10 text-[#6b38d4] font-black px-2.5 py-1 rounded-md block uppercase tracking-wider">
                            HOMEROOM
                          </span>
                          <span className="text-[9px] font-bold text-neutral-400 block mt-1 leading-none">
                            07.00 - 07.30
                          </span>
                        </td>
                        {DAYS_OF_WEEK.map((day) => {
                          const isFridayOrSaturday = day.toLowerCase() === 'jumat' || day.toLowerCase() === 'sabtu';
                          const isActiveToday = todayName.toLowerCase() === day.toLowerCase();
                          return (
                            <td
                              key={day}
                              className={`px-3 py-3 border-r border-[#e5e7eb] last:border-r-0 align-middle text-xs ${
                                isActiveToday ? 'bg-[#FFD166]/5' : ''
                              }`}
                            >
                              <div className={`p-2 rounded-xl text-center font-extrabold text-[10px] uppercase tracking-wider border leading-relaxed ${
                                isFridayOrSaturday
                                  ? 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd] shadow-3xs'
                                  : 'bg-neutral-50/60 text-neutral-500 border-neutral-200/40'
                              }`}>
                                Sesi Homeroom
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {uniqueJPSlots.length > 0 ? (
                        uniqueJPSlots.map((jpPeriod) => {
                          const timeRange = getJPTime(jpPeriod);
                          return (
                            <tr key={jpPeriod} className="hover:bg-neutral-50/40 transition-colors border-b border-neutral-100 last:border-b-0">
                              
                              {/* Left slot marker */}
                              <td className="px-4 py-4 text-center border-r border-neutral-200/40 font-mono text-[10px] border-b-0">
                                <span className="bg-[#111c2d]/5 text-[#111c2d] font-black px-2.5 py-1 rounded-md block">
                                  {jpPeriod}
                                </span>
                                <span className="text-[9px] font-bold text-on-surface-variant/60 block mt-1 leading-none">
                                  {timeRange}
                                </span>
                              </td>

                              {/* Days map for cells */}
                              {DAYS_OF_WEEK.map((day) => {
                                const isActiveToday = todayName.toLowerCase() === day.toLowerCase();

                                // Filter schedules that match this teacher, day, and JP period
                                const matchingSchedules = selectedTeacherSchedules.filter(
                                  (item) =>
                                    item.hari?.toLowerCase().trim() === day.toLowerCase().trim() &&
                                    item.jp === jpPeriod
                                );

                                // Extract unique subject + grade-level pairs taught by the active teacher during this period
                                const uniquePairsForSlot: { subject: string; gradeLevel: string }[] = [];
                                const seenKeys = new Set<string>();
                                matchingSchedules.forEach((sch) => {
                                  const subjNorm = normalizeSubjectName(sch.mapel);
                                  if (!subjNorm) return;
                                  const grade = getGradeLevel(sch.kelas);
                                  const key = `${subjNorm}||${grade}`;
                                  if (!seenKeys.has(key)) {
                                    seenKeys.add(key);
                                    uniquePairsForSlot.push({ subject: subjNorm, gradeLevel: grade });
                                  }
                                });

                                return (
                                  <td
                                    key={day}
                                    className={`px-3 py-3 border-r border-[#e5e7eb] last:border-r-0 align-top text-xs relative ${
                                      isActiveToday ? 'bg-[#FFD166]/5' : ''
                                    }`}
                                  >
                                    {uniquePairsForSlot.length > 0 ? (
                                      <div className="flex flex-col gap-2.5">
                                        {uniquePairsForSlot.map(({ subject, gradeLevel }, pairIdx) => {
                                          // Find all schedules with the same day, JP, subject, and grade level
                                          const combinedItemsForSubject = schedules.filter((item) =>
                                            item.hari?.toLowerCase().trim() === day.toLowerCase().trim() &&
                                            item.jp === jpPeriod &&
                                            normalizeSubjectName(item.mapel) === subject &&
                                            getGradeLevel(item.kelas) === gradeLevel
                                          );

                                          // Combine and sort classes mathematically / naturally
                                          const distinctClasses = (Array.from(new Set(combinedItemsForSubject.map(item => item.kelas).filter(Boolean))) as string[])
                                            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                                          // Collect all unique guru values (and parts of composite guru values)
                                          const distinctGurus = Array.from(new Set(
                                            combinedItemsForSubject.flatMap(item => 
                                              item.guru ? item.guru.split('/').map(g => g.trim()).filter(Boolean) : []
                                            )
                                          )) as string[];

                                          // Determine if this is a grading slot (multiple classes, multiple teachers, or explicit multiple items)
                                          const isGradingSlot = distinctClasses.length > 1 || distinctGurus.length > 1 || combinedItemsForSubject.length > 1;
                                          const displayMapel = (combinedItemsForSubject[0]?.mapel || subject.toUpperCase()) as string;

                                          return (
                                            <div
                                              key={pairIdx}
                                              className={`p-2.5 rounded-xl transition-all border ${
                                                isGradingSlot 
                                                  ? 'bg-[#f5f3ff] border-[#6b38d4]/20 hover:border-[#6b38d4]/40 shadow-xs' 
                                                  : 'bg-[#faf9ff] border-[#e5e7eb] hover:border-[#111c2d]/15 hover:shadow-2xs'
                                              }`}
                                            >
                                              {/* Romble classes + optional status tag */}
                                              <div className="flex items-center justify-between gap-1.5 border-b border-neutral-200/30 pb-1 mb-1.5">
                                                <span className="font-extrabold text-[#002c64] uppercase tracking-wide text-[10.5px] leading-tight break-words">
                                                  {formatGradingClasses(distinctClasses, isGradingSlot)}
                                                </span>
                                                {isGradingSlot && (
                                                  <span className="bg-[#6b38d4] text-white font-mono text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                                                    GRADING
                                                  </span>
                                                )}
                                              </div>

                                              {/* Subject block description */}
                                              <p className="font-extrabold text-[#111c2d] text-[10.5px] leading-snug flex items-center gap-1.5 mb-1.5">
                                                <BookOpen size={10} className="text-[#6b38d4] shrink-0" />
                                                <span className="truncate" title={displayMapel}>{displayMapel}</span>
                                              </p>

                                              {/* Bullet lists of teachers with grading badges */}
                                              <div className="text-[9.5px] font-bold text-on-surface-variant/70 uppercase tracking-wide flex flex-col gap-1 border-t border-neutral-200/20 pt-1.5">
                                                {distinctGurus.map((gName: string, gIdx) => {
                                                  const { name: cleanName, code: gradingCode } = extractGradingCode(gName);
                                                  return (
                                                    <span key={gIdx} className="flex flex-wrap items-center gap-1.5 text-[#111c2d]/90 normal-case">
                                                      <span className="text-[#6b38d4] font-black">•</span>
                                                      <span className="truncate font-bold">{cleanName}</span>
                                                      {gradingCode && (
                                                        <span className="bg-[#6b38d4]/10 text-[#6b38d4] font-mono text-[7.5px] px-1.5 py-0.5 rounded font-black uppercase tracking-wide select-none">
                                                          {gradingCode}
                                                        </span>
                                                      )}
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="min-h-[40px] flex items-center justify-center text-outline/30 font-medium select-none">
                                        <span className="text-[10px] text-neutral-300">-</span>
                                      </div>
                                    )}
                                  </td>
                                );
                              })}

                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-on-surface-variant/60 font-medium text-xs">
                            <Info size={20} className="mx-auto mb-2 text-neutral-300 animate-pulse" />
                            Belum ada pembagian JP yang diinput.
                          </td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                </div>

                {/* Additional footer check details */}
                <div className="bg-white/50 border border-[#e5e7eb] p-4 rounded-xl text-xs font-semibold text-on-surface-variant flex items-start gap-2.5 leading-relaxed shadow-xs">
                  <Info size={15} className="text-[#002c64] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-[#111c2d] mb-1">Panduan Membaca Timetable</h5>
                    <p className="text-[11px] leading-normal">
                      Pilih nama Ustadz dari kolom pencarian di atas untuk memuat jadwal mengajar beliau. 
                      Hari ini ditandai menggunakan kolom highlight <strong className="text-[#111c2d]">HARI INI</strong> berwarna kuning keemasan. 
                      Jika terdeteksi penggabungan kelas (Sistem Grading), informasi kelas-kelas tersetel berdampingan di jam pelajaran yang bersangkutan.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-16 text-center text-on-surface-variant/50 flex flex-col items-center justify-center gap-3">
                <Calendar size={36} className="text-neutral-300 animate-pulse" />
                <p className="text-xs font-bold">Silakan ketik atau pilih nama guru di kolom pencarian di atas untuk melihat isi jadwal.</p>
              </div>
            )}

          </div>
        </div>

      </div>
  );
}
