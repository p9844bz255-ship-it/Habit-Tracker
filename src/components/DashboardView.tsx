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

  const [activeScheduleItem, setActiveScheduleItem] = useState<{ type: 'guru' | 'kelas'; name: string } | null>(initialItem);

  // Automatically sync/initialize active item
  useEffect(() => {
    if (!activeScheduleItem && initialItem) {
      setActiveScheduleItem(initialItem);
    }
  }, [initialItem, activeScheduleItem]);

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

  // Filter based on selected week using normalized dashes to prevent matching issues (en-dash vs standard hyphen)
  const plansForSelectedWeek = useMemo(() => {
    return lessonPlans.filter((lp) => {
      if (weekFilter === 'All Weeks') return true;
      const normalize = (val: string) => val.replace(/\s+/g, '').replace(/[–-]/g, '-').toLowerCase();
      return normalize(lp.week) === normalize(weekFilter);
    });
  }, [lessonPlans, weekFilter]);

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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
      
      {/* Left Content Area (8 Columns) */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Header Section */}
        <section className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-3.5xl font-extrabold text-[#111c2d] tracking-tight">
            Ahlan ustadz indra bayu muktias
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant font-medium">
            Here is your lesson plan progress for this week.
          </p>
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

        {/* ===================================================================== */}
        {/* INTERACTIVE CLASS & TEACHER TIMETABLE MODULE (JADWAL MENGAJAR GURU & KELAS) */}
        {/* ===================================================================== */}
        <section className="mt-4 flex flex-col gap-5">
          
          {/* Informational Header showing Classes Taught by active user */}
          <div className="glass-card p-5 border border-white/60 bg-white/70 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#6b38d4]/10 p-2 rounded-xl text-[#6b38d4]">
                  <Sparkles size={18} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-wider font-sans">
                    KELAS YANG ANDA AJAR (CLASSES YOU TEACH)
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                    Ustadz {currentUserName} mengoperasikan pelajaran pada kelas-kelas berikut:
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {classesTaughtByMe.length > 0 ? (
                  classesTaughtByMe.map((cls) => (
                    <span 
                      key={cls} 
                      className="bg-[#111c2d] text-white font-extrabold text-[10px] px-3 py-1.5 rounded-full shadow-sm tracking-wide transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      onClick={() => {
                        setActiveScheduleItem({ type: 'kelas', name: cls });
                        setScheduleSearchQuery(cls);
                      }}
                      title="Klik untuk melihat jadwal kelas ini"
                    >
                      {cls}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-400 font-semibold italic">Tidak ada list kelas mengajar</span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Timetable Board with Cari Guru / Kelas Dropdown Search */}
          <div className="glass-card p-5 md:p-6 border border-white/60 bg-white/70 shadow-sm flex flex-col gap-5 relative overflow-hidden">
            
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6b38d4]/3 rounded-full filter blur-lg pointer-events-none -mr-4 -mt-4" />

            {/* Header: Input search and active view status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/50 pb-5">
              <div className="flex items-center gap-3">
                <div className="bg-[#111c2d]/5 p-2.5 rounded-xl text-[#111c2d] shrink-0">
                  {activeScheduleItem?.type === 'kelas' ? (
                    <Layers size={18} className="stroke-[2.2]" />
                  ) : (
                    <Calendar size={18} className="stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#111c2d] uppercase tracking-wider font-sans">
                    Jadwal Mengajar &amp; Kelas
                  </h3>
                  <p className="text-[11px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wide">
                    {activeScheduleItem ? `${activeScheduleItem.type === 'guru' ? 'USTADZ/GURU' : 'ROMBEL KELAS'} : ${activeScheduleItem.name}` : 'PILIH JADWAL'}
                  </p>
                </div>
              </div>

              {/* Dynamic cari guru / kelas bar */}
              <div className="relative w-full md:w-80">
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={scheduleSearchQuery}
                    onFocus={() => setShowScheduleDropdown(true)}
                    onClick={() => setShowScheduleDropdown(true)}
                    onChange={(e) => {
                      setScheduleSearchQuery(e.target.value);
                      setShowScheduleDropdown(true);
                    }}
                    placeholder="Cari Nama Guru / Kelas..."
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-neutral-200 rounded-full text-xs font-semibold text-on-surface focus:outline-none focus:ring-1.5 focus:ring-[#111c2d] transition-all placeholder-neutral-400 shadow-3xs"
                  />
                  {scheduleSearchQuery && (
                    <button
                      onClick={() => {
                        setScheduleSearchQuery('');
                        setShowScheduleDropdown(true);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Autocomplete dropdown box */}
                {showScheduleDropdown && (
                  <div className="absolute left-0 right-0 mt-1.5 max-h-56 bg-white border border-neutral-200 rounded-2xl shadow-lg overflow-y-auto z-40 p-2 table-scrollbar animate-fade-in">
                    
                    {/* Helper action titles */}
                    <div className="px-2 py-1 text-[9px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 mb-1">
                      Pilihan Guru / Rombel Belajar
                    </div>

                    {filteredScheduleOptions.length > 0 ? (
                      filteredScheduleOptions.map((opt, idx) => {
                        const isThisActive = activeScheduleItem?.type === opt.type && activeScheduleItem?.name === opt.name;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveScheduleItem(opt);
                              setScheduleSearchQuery(opt.name);
                              setShowScheduleDropdown(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between mb-0.5 last:mb-0 ${
                              isThisActive
                                ? 'bg-[#111c2d] text-white'
                                : 'hover:bg-neutral-50 text-neutral-700'
                            }`}
                          >
                            <span className="truncate">{opt.name}</span>
                            <span className={`text-[8px] font-black px-1.8 py-0.5 rounded uppercase tracking-wider ${
                              isThisActive 
                                ? 'bg-white/20 text-white' 
                                : opt.type === 'kelas' 
                                  ? 'bg-[#111c2d]/5 text-[#111c2d]' 
                                  : 'bg-[#6b38d4]/10 text-[#6b38d4]'
                            }`}>
                              {opt.type === 'kelas' ? 'Kelas' : 'Guru'}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3.5 py-4 text-center text-xs text-neutral-400 font-semibold italic">
                        Nama guru atau kelas tidak ditemukan
                      </div>
                    )}
                  </div>
                )}
                {/* Backdrop handle to dismiss dropdown */}
                {showScheduleDropdown && (
                  <div 
                    className="fixed inset-0 z-30 bg-transparent" 
                    onClick={() => setShowScheduleDropdown(false)}
                  />
                )}
              </div>
            </div>

            {/* Timetable Grid View */}
            {activeScheduleItem ? (
              <div className="flex flex-col gap-4">
                
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
                              className={`sticky top-0 border-b border-neutral-200/60 px-4 py-3 text-center text-xs font-black uppercase tracking-wider w-36 ${
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

                                // Filter schedules that match this teacher/class, day, and JP period
                                const matchingSchedules = filteredSchedules.filter(
                                  (item) =>
                                    item.hari?.toLowerCase().trim() === day.toLowerCase().trim() &&
                                    item.jp === jpPeriod
                                );

                                // Extract unique subject + grade-level pairs taught during this period
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
                                              className={`p-2 rounded-xl transition-all border ${
                                                isGradingSlot 
                                                  ? 'bg-[#f5f3ff] border-[#6b38d4]/20 hover:border-[#6b38d4]/40 shadow-xs' 
                                                  : 'bg-[#faf9ff] border-[#e5e7eb] hover:border-[#111c2d]/15 hover:shadow-2xs'
                                              }`}
                                            >
                                              {/* Romble classes + optional status tag */}
                                              <div className="flex items-center justify-between gap-1.5 border-b border-neutral-200/30 pb-1 mb-1.5">
                                                <span className="font-extrabold text-[#002c64] uppercase tracking-wide text-[10px] leading-tight break-words">
                                                  {formatGradingClasses(distinctClasses, isGradingSlot)}
                                                </span>
                                                {isGradingSlot && (
                                                  <span className="bg-[#6b38d4] text-white font-mono text-[6.5px] px-1.2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                                                    GRADING
                                                  </span>
                                                )}
                                              </div>

                                              {/* Subject block description */}
                                              <p className="font-extrabold text-[#111c2d] text-[10px] leading-snug flex items-center gap-1.5 mb-1.5">
                                                <BookOpen size={9} className="text-[#6b38d4] shrink-0" />
                                                <span className="truncate" title={displayMapel}>{displayMapel}</span>
                                              </p>

                                              {/* Bullet lists of teachers with grading badges */}
                                              <div className="text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-wide flex flex-col gap-1 border-t border-neutral-200/20 pt-1.5">
                                                {distinctGurus.map((gName: string, gIdx) => {
                                                  const { name: cleanName, code: gradingCode } = extractGradingCode(gName);
                                                  return (
                                                    <span key={gIdx} className="flex flex-wrap items-center gap-1 text-[#111c2d]/90 normal-case">
                                                      <span className="text-[#6b38d4] font-black">•</span>
                                                      <span className="truncate font-bold">{cleanName}</span>
                                                      {gradingCode && (
                                                        <span className="bg-neutral-100/80 text-neutral-600 font-mono text-[7px] border border-neutral-200 font-black px-1.2 py-0.2 rounded shrink-0 uppercase tracking-wider">
                                                          ({gradingCode})
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
                                      <div className="text-center py-2 text-neutral-300 text-[10px] font-semibold tracking-wider uppercase select-none">
                                        -
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
                          <td colSpan={7} className="text-center py-10 text-neutral-400 font-semibold italic">
                            Jadwal tidak tersedia
                          </td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                </div>

                {/* Footnote information regarding BSD grading system splits */}
                <div className="flex items-start gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200/40 text-[11px] font-semibold text-neutral-500 leading-relaxed">
                  <Info size={14} className="text-[#111c2d] shrink-0 mt-0.5" />
                  <p>
                    <strong>Sistem Grading Pembagian Rombel (BSD Al-Wildan):</strong> Apabila dalam jam pelajaran (JP) yang sama, ustadz yang sama mengajar materi yang sama pada rombel kelas paralel terpisah, sistem akan secara otomatis memecah kelas tersebut ke dalam baris grading tersendiri (GRADING) guna memudahkan proses checklist rencana pembelajaran mandiri.
                  </p>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400 font-semibold italic">
                Gagal memuat detail jadwal.
              </div>
            )}

          </div>

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
