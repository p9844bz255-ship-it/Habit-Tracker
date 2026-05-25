import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, LayoutGrid, List, Bell, Calendar, ChevronRight, ChevronLeft, AlertTriangle, Play, BookOpen, Clock, CheckCircle2, RotateCcw, Layers, User, Check, Info, Sparkles, X } from 'lucide-react';
import { LessonPlan, Reminder, CalendarEvent } from '../types';
import { normalizeTeacherName, normalizeSubjectName, getGradeLevel, extractGradingCode, formatGradingClasses } from './ScheduleDashboardView';

interface DashboardViewProps {
  lessonPlans: LessonPlan[];
  reminders: Reminder[];
  calendarEvents: CalendarEvent[];
  onSelectPlan: (plan: LessonPlan) => void;
  onNavigateToMonitoring: () => void;
  schedules?: any[];
  currentUserName?: string;
}

export default function DashboardView({
  lessonPlans,
  reminders,
  calendarEvents,
  onSelectPlan,
  onNavigateToMonitoring,
  schedules = [],
  currentUserName = 'Indra Bayu Muktias'
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [weekFilter, setWeekFilter] = useState('Week 4 (19 – 25 Mei 2024)');
  const [viewType, setViewType] = useState<'grid' | 'list'>('list'); // Default to list so Image 5 style displays nicely, but supports both!

  const weekSliderRef = useRef<HTMLDivElement>(null);

  const DAYS_OF_WEEK = useMemo(() => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], []);

  // Schedule state logic for DashboardView
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);

  // Find all unique teacher names from schedules
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

  // Combined searchable options
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

  // Find classes taught specifically by the logged-in teacher ("guru tersebut mengajar di kelas mana saja")
  const classesTaughtByMe = useMemo(() => {
    const classesSet = new Set<string>();
    const normalizedMe = normalizeTeacherName(currentUserName).toLowerCase();
    schedules.forEach((item) => {
      if (item.kelas && item.guru) {
        const parts = item.guru.split('/').map(p => normalizeTeacherName(p).toLowerCase());
        if (parts.includes(normalizedMe)) {
          classesSet.add(item.kelas.toUpperCase().trim());
        }
      }
    });
    return Array.from(classesSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [schedules, currentUserName]);

  // Default selected item is the logged-in user as teacher (to display their personal schedule first!)
  const initialItem = useMemo(() => {
    const normalizedUser = normalizeTeacherName(currentUserName).toLowerCase();
    const matched = allTeachers.find(t => normalizeTeacherName(t).toLowerCase() === normalizedUser);
    if (matched) return { type: 'guru' as const, name: matched };
    if (allTeachers.length > 0) return { type: 'guru' as const, name: allTeachers[0] };
    if (allClasses.length > 0) return { type: 'kelas' as const, name: allClasses[0] };
    return null;
  }, [allTeachers, allClasses, currentUserName]);

  const [activeScheduleItem, setActiveScheduleItem] = useState<{ type: 'guru' | 'kelas'; name: string } | null>(null);

  // Filter schedule search suggestions
  const filteredScheduleOptions = useMemo(() => {
    if (!scheduleSearchQuery.trim()) return searchOptions;
    const query = scheduleSearchQuery.toLowerCase();
    return searchOptions.filter((opt) => opt.name.toLowerCase().includes(query));
  }, [searchOptions, scheduleSearchQuery]);

  // Get matching filtered schedules for the selected search item (user or class)
  const filteredSchedules = useMemo(() => {
    if (!activeScheduleItem) return [];
    if (activeScheduleItem.type === 'kelas') {
      const targetClass = activeScheduleItem.name.toUpperCase().trim();
      return schedules.filter(item => item.kelas && item.kelas.toUpperCase().trim() === targetClass);
    } else {
      const normalizedSel = normalizeTeacherName(activeScheduleItem.name).toLowerCase();
      return schedules.filter((item) => {
        if (!item.guru) return false;
        const parts = item.guru.split('/').map(p => normalizeTeacherName(p).toLowerCase());
        return parts.includes(normalizedSel);
      });
    }
  }, [schedules, activeScheduleItem]);

  const uniqueJPSlots = useMemo(() => {
    const slots = Array.from(new Set(schedules.map((item) => item.jp).filter(Boolean)));
    return slots.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [schedules]);

  const getJPTime = (jpName: string) => {
    const matched = schedules.find((item) => item.jp === jpName && item.waktu);
    return matched ? matched.waktu : 'Waktu Fleksibel';
  };

  const todayName = useMemo(() => {
    const index = new Date().getDay();
    const map = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return map[index];
  }, []);

  // Hardcoded standard sequence of academic weeks for BSD Al-Wildan
  const AVAILABLE_WEEKS = useMemo(() => {
    const standardWeeks = [
      'Week 1 (28 Apr – 4 Mei 2024)',
      'Week 2 (5 – 11 Mei 2024)',
      'Week 3 (12 – 18 Mei 2024)',
      'Week 4 (19 – 25 Mei 2024)',
      'Week 5 (26 Mei – 1 Jun 2024)',
      'Week 6 (2 – 8 Jun 2024)',
      'Week 7 (9 – 15 Jun 2024)',
      'Week 8 (16 – 22 Jun 2024)'
    ];

    // Read any other potential values that can be added/edited by users
    const planWeeks = lessonPlans.map((lp) => lp.week).filter(Boolean);
    const allUnique = Array.from(new Set([...standardWeeks, ...planWeeks]));

    // Sort weeks naturally based on the number identifier in 'Week X'
    return allUnique.sort((a, b) => {
      const numA = parseInt(a.match(/Week\s+(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/Week\s+(\d+)/)?.[1] || '0', 10);
      return numA - numB;
    });
  }, [lessonPlans]);

  // Navigate to previous/next selected week card
  const handlePrevWeek = () => {
    if (weekFilter === 'All Weeks') {
      setWeekFilter(AVAILABLE_WEEKS[0]);
      return;
    }
    const currentIndex = AVAILABLE_WEEKS.indexOf(weekFilter);
    if (currentIndex > 0) {
      setWeekFilter(AVAILABLE_WEEKS[currentIndex - 1]);
    }
  };

  const handleNextWeek = () => {
    if (weekFilter === 'All Weeks') {
      setWeekFilter(AVAILABLE_WEEKS[0]);
      return;
    }
    const currentIndex = AVAILABLE_WEEKS.indexOf(weekFilter);
    if (currentIndex < AVAILABLE_WEEKS.length - 1 && currentIndex !== -1) {
      setWeekFilter(AVAILABLE_WEEKS[currentIndex + 1]);
    }
  };

  // Implement automatic centering scroll when active week shifts
  useEffect(() => {
    if (weekSliderRef.current) {
      const activeEl = weekSliderRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [weekFilter]);

  // Find which classes are assigned to the selected activeScheduleItem
  const currentAssignedClassesAndSubjects = useMemo(() => {
    const matchedSet = new Set<string>();
    if (!activeScheduleItem) return matchedSet;
    if (activeScheduleItem.type === 'kelas') return matchedSet;
    const normalizedSel = normalizeTeacherName(activeScheduleItem.name).toLowerCase().trim();
    schedules.forEach((s) => {
      if (!s.guru) return;
      const parts = s.guru.split('/').map((p: string) => normalizeTeacherName(p).toLowerCase().trim());
      if (parts.includes(normalizedSel)) {
        const classKey = (s.kelas || '').trim().toLowerCase();
        const subjectKey = (s.mapel || '').trim().toLowerCase();
        if (classKey && subjectKey) {
          matchedSet.add(`${classKey}_${subjectKey}`);
        }
      }
    });
    return matchedSet;
  }, [schedules, activeScheduleItem]);

  // Filter lesson plans based on active ustadz / class selection
  const activeSelectionPlans = useMemo(() => {
    if (!activeScheduleItem) return [];
    const isKelas = activeScheduleItem.type === 'kelas';
    const targetName = activeScheduleItem.name.toLowerCase().trim();
    return lessonPlans.filter((lp) => {
      if (isKelas) {
        return (lp.class || '').toLowerCase().trim() === targetName;
      } else {
        const classKey = (lp.class || '').trim().toLowerCase();
        const subjectKey = (lp.subject || '').trim().toLowerCase();
        return currentAssignedClassesAndSubjects.has(`${classKey}_${subjectKey}`);
      }
    });
  }, [lessonPlans, activeScheduleItem, currentAssignedClassesAndSubjects]);

  // Filter based on selected week using normalized dashes to prevent matching issues (en-dash vs standard hyphen)
  const plansForSelectedWeek = useMemo(() => {
    return activeSelectionPlans.filter((lp) => {
      if (weekFilter === 'All Weeks') return true;
      const normalize = (val: string) => val.replace(/\s+/g, '').replace(/[–-]/g, '-').toLowerCase();
      return normalize(lp.week) === normalize(weekFilter);
    });
  }, [activeSelectionPlans, weekFilter]);

  // Compute dynamic stats based on plans for selected week
  const stats = useMemo(() => {
    const total = plansForSelectedWeek.length;
    const completed = plansForSelectedWeek.filter((lp) => lp.status === 'Selesai').length;
    const inProgress = plansForSelectedWeek.filter((lp) => lp.status === 'Sedang Dikerjakan').length;
    const notStarted = plansForSelectedWeek.filter((lp) => lp.status === 'Belum Dimulai').length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, notStarted, progressPercent };
  }, [plansForSelectedWeek]);

  // Filter by search query and status of plans in selected week
  const filteredPlans = useMemo(() => {
    return plansForSelectedWeek.filter((lp) => {
      const matchesSearch =
        lp.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lp.topic && lp.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        lp.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All Status' || lp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [plansForSelectedWeek, searchQuery, statusFilter]);

  if (!activeScheduleItem) {
    return (
      <div className="w-full flex-col items-center justify-center py-10 md:py-16 flex z-10 relative">
        <div className="w-full max-w-xl bg-white/75 backdrop-blur-md border border-white/60 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col items-center gap-6 text-center animate-fade-in">
          
          <div className="relative">
            <div className="absolute inset-0 bg-[#FFD166]/20 rounded-full filter blur-md animate-pulse" />
            <img
              src="https://www.image2url.com/r2/default/images/1778032976429-fb84224a-3e08-4092-b38f-529e608a47d2.png"
              alt="Al-Wildan Logo"
              className="w-18 h-18 object-contain relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-black text-[#111c2d] tracking-tight uppercase">
              EduPlan
            </h1>
            <p className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-widest leading-relaxed">
              AL - WILDAN ISLAMIC SCHOOL 3 BSD CITY
            </p          <div className="w-full bg-[#fbfaf8]/80 border border-neutral-200/60 p-4.5 rounded-2xl flex flex-col text-left relative z-40 shadow-inner">
            
            <div className="relative">
              <input
                id="landingSearchInput"
                type="text"
                placeholder="Ketik nama ustadz"
                value={scheduleSearchQuery}
                onFocus={() => setShowScheduleDropdown(true)}
                onClick={() => setShowScheduleDropdown(true)}
                onChange={(e) => {
                  setScheduleSearchQuery(e.target.value);
                  setShowScheduleDropdown(true);
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-[#111c2d] outline-none focus:ring-2 focus:ring-[#6b38d4]/30 focus:border-[#6b38d4] transition-all placeholder-neutral-400 shadow-3xs"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <Search size={14} />
              </span>
              {scheduleSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setScheduleSearchQuery('');
                    setShowScheduleDropdown(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X size={12} />
                </button>
              )}

              {/* Suggestions autocomplete dropdown list */}
              {showScheduleDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowScheduleDropdown(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1.5 max-h-48 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-45 p-2 overflow-y-auto table-scrollbar animate-fade-in text-xs font-bold text-[#111c2d]">
                    <div className="px-2 py-1 text-[9px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 mb-1 font-mono">
                      HASIL PENCARIAN GURU / ROMBEL
                    </div>
                    {filteredScheduleOptions.length > 0 ? (
                      filteredScheduleOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveScheduleItem(opt);
                            setScheduleSearchQuery('');
                            setShowScheduleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-all flex items-center justify-between mb-0.5 last:mb-0"
                        >
                          <span className="truncate flex items-center gap-2">
                            {opt.type === 'kelas' ? (
                              <Layers size={12} className="text-[#6b38d4]" />
                            ) : (
                              <User size={12} className="text-[#002c64]" />
                            )}
                            <span className="truncate">{opt.name}</span>
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                            opt.type === 'kelas' 
                              ? 'bg-[#111c2d]/5 text-[#111c2d]' 
                              : 'bg-[#6b38d4]/10 text-[#6b38d4]'
                          }`}>
                            {opt.type === 'kelas' ? 'Kelas' : 'Guru'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3.5 py-5 text-center text-xs text-neutral-400 font-bold flex flex-col items-center justify-center gap-1">
                        <Info size={14} />
                        <span>Nama guru atau kelas tidak ditemukan</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>div>

        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
      
      {/* Left Content Area (8 Columns) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 p-5 rounded-3xl border border-white/60 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#111c2d] flex items-center justify-center text-white relative shadow-sm shrink-0">
              {activeScheduleItem.type === 'kelas' ? (
                <Layers size={20} className="stroke-[2.2]" />
              ) : (
                <User size={20} className="stroke-[2.2]" />
              )}
            </div>
            <div>
              <h1 className="text-xl md:text-2.5xl font-black text-[#111c2d] tracking-tight uppercase">
                {activeScheduleItem.name}
              </h1>
              <p className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest font-mono mt-0.5">
                {activeScheduleItem.type === 'kelas' ? 'PROGRES WEEKLY KELAS BELAJAR' : 'PROGRES WEEKLY USTADZ/GURU'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setActiveScheduleItem(null);
              setScheduleSearchQuery('');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 text-neutral-700 font-bold text-xs bg-white hover:bg-neutral-50 hover:border-neutral-400 transition-all self-start md:self-auto shadow-sm active:scale-95 shrink-0"
          >
            <RotateCcw size={12} />
            <span>Ganti Ustadz / Kelas</span>
          </button>
        </section>

        {/* Metrics Overview Bento Grid (4 Cards) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300 hover:shadow-md">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Total Classes
            </span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-[#111c2d] lg:text-4xl">
                {stats.total}
              </span>
              <span className="text-xs font-semibold text-on-surface-variant/40">classes</span>
            </div>
          </div>

          <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300 hover:shadow-md">
            <span className="text-[11px] font-bold text-[#5517be] uppercase tracking-wider">
              Completed
            </span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-[#5517be] lg:text-4xl">
                {stats.completed}
              </span>
              <span className="text-[11px] font-bold text-[#5517be] bg-[#e9ddff] px-2.5 py-1 rounded-full select-none">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300 hover:shadow-md">
            <span className="text-[11px] font-bold text-[#00418f] uppercase tracking-wider">
              In Progress
            </span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-[#00418f] lg:text-4xl">
                {stats.inProgress}
              </span>
              <span className="text-[11px] font-bold text-[#00418f] bg-[#d8e2ff] px-2.5 py-1 rounded-full select-none">
                {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300 hover:shadow-md">
            <span className="text-[11px] font-bold text-[#574500] uppercase tracking-wider">
              Not Started
            </span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-[#574500] lg:text-4xl">
                {stats.notStarted}
              </span>
              <span className="text-[11px] font-bold text-[#574500] bg-[#ffe085] px-2.5 py-1 rounded-full select-none">
                {stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>

        </section>

        {/* Overall Progress Bar Card */}
        <section className="glass-card p-5.5 flex flex-col gap-3.5 transition-all duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-[#111c2d] tracking-tight">
              Overall Progress
            </h2>
            <span className="text-xs font-black text-on-surface bg-[#FFD166] px-4 py-1 rounded-full shadow-sm">
              {stats.progressPercent}% Completed
            </span>
          </div>
          <div className="w-full bg-[#f3f0e8] rounded-full h-3 overflow-hidden border border-white/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
            <div 
              className="bg-[#111c2d] h-full rounded-full relative transition-all duration-1000 ease-out" 
              style={{ width: `${stats.progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/10 w-full h-full rounded-full blur-[1px]" />
            </div>
          </div>
        </section>

        {/* ==================== MODERN WEEK SELECTOR SECTION ==================== */}
        <section className="glass-card p-5 flex flex-col gap-4 transition-all duration-300 border border-white/60">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#111c2d]/5 p-1.5 rounded-full">
                <Calendar className="text-[#111c2d] w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#111c2d] uppercase tracking-wider font-sans">
                PILIH MINGGU PEMBELAJARAN (WEEK SELECTOR)
              </h3>
            </div>
            
            {/* Prev/Next Week buttons */}
            <div className="flex items-center gap-1 bg-white/60 p-0.5 rounded-full border border-neutral-200 shadow-sm">
              <button
                onClick={handlePrevWeek}
                disabled={weekFilter === 'All Weeks' || weekFilter === AVAILABLE_WEEKS[0]}
                className="p-1.5 rounded-full text-[#111c2d] hover:bg-neutral-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                title="Minggu Sebelumnya (Prev Week)"
              >
                <ChevronLeft size={15} />
              </button>
              <div className="h-4.5 w-px bg-neutral-200" />
              <button
                onClick={handleNextWeek}
                disabled={weekFilter === 'All Weeks' || weekFilter === AVAILABLE_WEEKS[AVAILABLE_WEEKS.length - 1]}
                className="p-1.5 rounded-full text-[#111c2d] hover:bg-neutral-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                title="Minggu Berikutnya (Next Week)"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Horizontally scrollable tab bar */}
            <div 
              ref={weekSliderRef}
              className="flex items-center gap-3 overflow-x-auto py-1 px-0.5 w-full scroll-smooth select-none hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Reset to show 'All Weeks' */}
              <button
                data-active={weekFilter === 'All Weeks'}
                onClick={() => setWeekFilter('All Weeks')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[130px] h-17 border transition-all duration-300 transform active:scale-95 ${
                  weekFilter === 'All Weeks'
                    ? 'bg-[#111c2d] text-white border-[#111c2d] shadow-md -translate-y-0.5 font-bold'
                    : 'bg-white/50 hover:bg-white/95 text-on-surface border-white/60 hover:border-white shadow-sm hover:shadow'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider font-black leading-none">Semua Minggu</span>
                <span className="text-[9px] opacity-75 mt-1 font-mono">All {lessonPlans.length} plans</span>
              </button>

              {AVAILABLE_WEEKS.map((wk) => {
                const isActive = weekFilter === wk;
                const matches = wk.match(/(Week\s+\d+)(?:\s*\(([^)]+)\))?/);
                const weekLabel = matches ? matches[1] : wk;
                const rangeLabel = matches ? matches[2] : '';
                
                // Real count of classes mapped to this week
                const countOfPlans = lessonPlans.filter(lp => {
                  const normalize = (val: string) => val.replace(/\s+/g, '').replace(/[–-]/g, '-').toLowerCase();
                  return normalize(lp.week) === normalize(wk);
                }).length;

                return (
                  <button
                    key={wk}
                    data-active={isActive}
                    onClick={() => setWeekFilter(wk)}
                    className={`flex flex-col items-start justify-center p-3 rounded-2xl min-w-[175px] h-17 border text-left transition-all duration-300 transform active:scale-95 relative group ${
                      isActive
                        ? 'bg-[#111c2d] text-white border-[#111c2d] shadow-lg -translate-y-0.5 scale-102 font-bold'
                        : 'bg-white/50 hover:bg-white/95 text-on-surface border-white/60 hover:border-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[11px] font-extrabold uppercase tracking-wide ${isActive ? 'text-white' : 'text-[#111c2d]'}`}>
                        {weekLabel}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm select-none ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#111c2d]/5 text-[#111c2d]'
                      }`}>
                        {countOfPlans} {countOfPlans === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                    {rangeLabel && (
                      <span className={`text-[10px] font-semibold font-mono mt-1 ${isActive ? 'text-white/80' : 'text-on-surface-variant/70'}`}>
                        {rangeLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================== */}

        {/* Filter Bar & List Header with STICKY Placement on Desktop for ease-of-access */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2 mb-2 md:sticky md:top-20 md:z-30 py-3 bg-[#faf9f6]/95 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm px-4">
          
          <div className="flex items-center gap-3 w-full justify-between md:justify-start md:w-auto">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#111c2d] tracking-tight leading-none">
                Lesson Plans
              </h2>
              <span className="bg-white/80 shadow-sm border border-white/60 text-on-surface-variant font-bold text-[11px] px-3.5 py-1 rounded-full select-none">
                {filteredPlans.length} items
              </span>
            </div>

            {/* View Toggles Capsule */}
            <div className="flex bg-white/60 backdrop-blur-xl rounded-full p-1 border border-white/50 shadow-sm md:hidden">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  viewType === 'grid' 
                    ? 'bg-[#2d2d2d] text-white shadow-sm' 
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  viewType === 'list' 
                    ? 'bg-[#2d2d2d] text-white shadow-sm' 
                    : 'text-on-surface-variant/60 hover:text-on-surface'
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search classes */}
            <div className="relative flex-grow md:w-56">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                <Search size={15} />
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classes..."
                className="w-full pl-9.5 pr-4 py-2 bg-white border border-neutral-200 shadow-sm rounded-full text-xs font-semibold text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#111c2d] focus:border-transparent transition-all placeholder-on-surface-variant/40"
              />
            </div>

            {/* Status Select */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 pl-4 pr-8 bg-white border border-neutral-200 shadow-sm rounded-full text-xs font-bold text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#111c2d] focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                <option>All Status</option>
                <option>Selesai</option>
                <option>Sedang Dikerjakan</option>
                <option>Belum Dimulai</option>
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[9px] font-black">▼</span>
            </div>

            {/* Hidden dropdown in desktop since we have horizontal navigator, but visible in small size for fallback convenience */}
            <div className="relative block md:hidden">
              <select 
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="py-2 pl-4 pr-8 bg-white border border-neutral-200 shadow-sm rounded-full text-xs font-bold text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#111c2d] focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                {AVAILABLE_WEEKS.map((wk) => (
                  <option key={wk} value={wk}>{wk}</option>
                ))}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[9px] font-black font-sans">▼</span>
            </div>

            {/* View Toggles Capsule on bigger screens */}
            <div className="hidden md:flex bg-white border border-neutral-200 rounded-full p-1 shadow-sm">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  viewType === 'grid' 
                    ? 'bg-[#111c2d] text-white shadow-sm' 
                    : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-neutral-50'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  viewType === 'list' 
                    ? 'bg-[#111c2d] text-white shadow-sm' 
                    : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-neutral-50'
                }`}
                title="List View"
              >
                <List size={15} />
              </button>
            </div>

          </div>

        </section>

        {/* Lesson Plans Lists or Grids Renderer */}
        <section className="mb-4">
          {filteredPlans.length === 0 ? (
            <div className="glass-card p-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
              <AlertTriangle className="text-on-surface-variant/30 w-12 h-12 mb-3" />
              <p className="font-semibold text-sm">Tidak ada lesson plan yang cocok dengan kriteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('All Status'); setWeekFilter('All Weeks'); }}
                className="mt-3 text-xs text-[#002c64] font-bold bg-white px-4 py-2 border border-white rounded-full hover:bg-white/80 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : viewType === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlans.map((plan) => {
                let badgeStyle = "bg-[#ffe085] text-[#574500]"; // Belum Dimulai
                let actionText = "Buat Plan";
                let actionStyle = "bg-white/90 text-on-surface border border-white/60 hover:bg-white";

                if (plan.status === 'Selesai') {
                  badgeStyle = "bg-[#e9ddff] text-[#5517be]";
                  actionText = "Lihat Plan";
                  actionStyle = "bg-[#1s2d3d] bg-[#2d2d2d] text-white hover:bg-black";
                } else if (plan.status === 'Sedang Dikerjakan') {
                  badgeStyle = "bg-[#d8e2ff] text-[#004494]";
                  actionText = "Lanjutkan";
                  actionStyle = "bg-[#2d2d2d] text-white hover:bg-black";
                }

                return (
                  <div key={plan.id} className="glass-card p-5 flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-col gap-3.5 flex-grow">
                      <div>
                        <span className={`font-bold text-[11px] px-3.5 py-1.5 rounded-full inline-flex tracking-tight shadow-sm ${badgeStyle}`}>
                          {plan.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold text-on-surface tracking-tight line-clamp-2">
                          {plan.topic || '(Topik Belum Diisi)'}
                        </h3>
                        <p className="text-xs text-on-surface-variant/80 font-semibold">
                          {plan.class} • {plan.subject}
                        </p>
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/30 text-[11px] font-bold text-on-surface-variant/60">
                        <span>Last update: {plan.lastUpdate}</span>
                        <span>{plan.week}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onSelectPlan(plan)}
                      className={`mt-4 w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-200 shadow-sm hover:shadow active:scale-95 text-center ${actionStyle}`}
                    >
                      {actionText}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-3">
              {filteredPlans.map((plan) => {
                let badgeStyle = "bg-[#ffe085] text-[#574500]"; // Belum Dimulai
                let actionText = "Buat Plan";
                let actionStyle = "bg-[#eef1ff] bg-white/80 border border-white text-on-surface hover:bg-white";

                if (plan.status === 'Selesai') {
                  badgeStyle = "bg-[#e9ddff] text-[#5517be]";
                  actionText = "Lihat Plan";
                  actionStyle = "bg-[#2d2d2d] text-white hover:bg-black";
                } else if (plan.status === 'Sedang Dikerjakan') {
                  badgeStyle = "bg-[#d8e2ff] text-[#004494]";
                  actionText = "Lanjutkan";
                  actionStyle = "bg-[#2d2d2d] text-white hover:bg-black";
                }

                return (
                  <div 
                    key={plan.id} 
                    className="glass-card p-4 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:translate-x-1 group"
                  >
                    <div className="flex items-center gap-4 flex-grow">
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex justify-between items-start md:items-center mb-0.5 md:mb-0">
                          <span className={`font-bold text-[11px] px-3.5 py-1.2 rounded-full inline-flex tracking-tight shadow-sm select-none ${badgeStyle}`}>
                            {plan.status}
                          </span>
                          <span className="text-[11px] font-medium text-on-surface-variant/40 md:hidden">
                            Last update: {plan.lastUpdate}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-sm md:text-base font-bold text-on-surface group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                            {plan.topic || '(Topik Belum Ditentukan)'}
                          </h3>
                          <p className="text-xs text-on-surface-variant/80 font-semibold mt-0.5">
                            {plan.class} • {plan.subject}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 md:w-1/3">
                      <span className="text-[11px] font-bold text-outline select-none hidden md:block whitespace-nowrap bg-white/40 px-3 py-1 rounded-full">
                        Last update: {plan.lastUpdate}
                      </span>
                      <button 
                        onClick={() => onSelectPlan(plan)}
                        className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm whitespace-nowrap ${actionStyle}`}
                      >
                        {actionText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>



      </div>

      {/* Right Sidebar (4 Columns) */}
      <div className="xl:col-span-4 flex flex-col gap-6">

        {/* Reminders Card */}
        <section className="p-6 flex flex-col gap-5 text-white shadow-xl rounded-[32px] bg-[#1a1a1a]">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Reminders
          </h3>
          <div className="flex flex-col gap-4">
            
            {/* Quick Reminder 1 (Warning Style) */}
            <div className="flex gap-4.5 items-start pb-4.5 border-b border-white/15">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD166]/15 text-[#FFD166] flex items-center justify-center flex-shrink-0 border border-[#FFD166]/30">
                <AlertTriangle size={18} />
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-sm font-bold text-white leading-snug">
                  Submit Midterm Grades
                </span>
                <span className="text-[10px] font-extrabold text-[#1a1a1a] mt-1.5 bg-accent-yellow w-max px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                  Due Today, 5:00 PM
                </span>
              </div>
            </div>

            {/* Quick Reminder 2 (Event Style) */}
            <div className="flex gap-4.5 items-start">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center flex-shrink-0 border border-white/15">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="text-sm font-bold text-white leading-snug">
                  Department Meeting
                </span>
                <span className="text-xs font-medium text-white/60 mt-0.5">
                  Tomorrow, 10:00 AM
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Academic Calendar Container */}
        <section className="glass-card p-6 flex flex-col gap-5 transition-all duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-on-surface flex items-center gap-2 tracking-tight">
              <div className="bg-white/70 p-1.5 rounded-full border border-white/50">
                <Calendar size={14} className="text-on-surface" />
              </div>
              Academic Calendar
            </h3>
            <button className="text-on-surface hover:text-[#002c64] bg-white/50 hover:bg-white p-1 rounded-full border border-white/40 shadow-sm transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1 table-scrollbar">
            {calendarEvents.map((evt) => (
              <div 
                key={evt.id} 
                className="bg-white/50 backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3.5 border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-white/75"
              >
                {/* Visual Date Square */}
                <div className="flex flex-col items-center justify-center bg-white rounded-xl p-2 min-w-[52px] h-13 shadow-sm border border-white/80 select-none">
                  <span className="text-[9px] text-[#111c2d] font-black tracking-wider leading-none">
                    {evt.month}
                  </span>
                  <span className="text-lg font-black text-[#111c2d] mt-0.5 leading-none">
                    {evt.day}
                  </span>
                </div>
                {/* Event Name */}
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#111c2d]">
                    {evt.title}
                  </span>
                  <span className="text-[11px] font-medium text-on-surface-variant/80 mt-0.5">
                    {evt.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}
