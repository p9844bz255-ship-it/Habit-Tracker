import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Search, Calendar, ChevronDown, Filter, Clock, CheckCircle2, MinusCircle, ChevronLeft, ChevronRight, X, BookOpen, Target, Users, ClipboardList, Info, Sparkles, Layers } from 'lucide-react';
import { Teacher, LessonPlan, StatusType } from '../types';
import { normalizeTeacherName, normalizeSubjectName, getGradeLevel, extractGradingCode, formatGradingClasses } from './ScheduleDashboardView';

export function getCommissionBySubject(subject: string, divisi?: string): string {
  if (divisi && divisi.trim() !== '' && divisi.trim() !== '-') {
    return divisi.trim();
  }
  const s = (subject || '').toLowerCase().trim();
  if (s.includes('matematika') || s.includes('fisika') || s.includes('kimia') || s.includes('biologi') || s.includes('sains') || s.includes('statistika') || s.includes('ipa') || s.includes('math') || s.includes('biology')) {
    return 'MIPA';
  }
  if (s.includes('inggris') || s.includes('english')) {
    return 'English';
  }
  if (s.includes('arab')) {
    return 'Arabic';
  }
  if (s.includes('qur') || s.includes('hadits') || s.includes('fiqih') || s.includes('fiqh') || s.includes('setoran') || s.includes('kajian')) {
    return "Al-Qur'an";
  }
  if (s.includes('aqidah') || s.includes('akhlak') || s.includes('diniyah') || s.includes('diniyyah') || s.includes('pai') || s.includes('agama')) {
    return 'Diniyyah';
  }
  if (s.includes('bimbingan') || s.includes('konseling') || s.includes('bk')) {
    return 'G&C';
  }
  return 'SOSHUM';
}

interface MonitoringViewProps {
  teachers: Teacher[];
  schedules?: any[];
  currentUserName?: string;
}

export default function MonitoringView({ 
  teachers,
  schedules = [],
  currentUserName = 'Indra Bayu Muktias'
}: MonitoringViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [selectedWeek, setSelectedWeek] = useState('Week 4 (19 - 25 Mei 24)');
  const [selectedCommission, setSelectedCommission] = useState('Semua Komisi');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Extract all unique commissions dynamically based on teachers in the database (fetched schedules)
  const availableCommissions = useMemo(() => {
    const commissions = new Set<string>();
    teachers.forEach((t) => {
      const comm = getCommissionBySubject(t.subject, t.divisi);
      if (comm && comm !== '-') {
        commissions.add(comm);
      }
    });
    return Array.from(commissions).sort();
  }, [teachers]);

  // Schedule state logic for MonitoringView
  const [monitorSearchQuery, setMonitorSearchQuery] = useState('');
  const [showMonitorDropdown, setShowMonitorDropdown] = useState(false);

  // Find all unique teacher names from schedules
  const allTeachersFromSchedules = useMemo(() => {
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
  const allClassesFromSchedules = useMemo(() => {
    const classesSet = new Set<string>();
    schedules.forEach((item) => {
      if (item.kelas) {
        classesSet.add(item.kelas.toUpperCase().trim());
      }
    });
    return Array.from(classesSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [schedules]);

  // Combined searchable teachers and classes options
  const monitorSearchOptions = useMemo(() => {
    const options: { type: 'guru' | 'kelas'; name: string }[] = [];
    allTeachersFromSchedules.forEach(t => {
      options.push({ type: 'guru', name: t });
    });
    allClassesFromSchedules.forEach(c => {
      options.push({ type: 'kelas', name: c });
    });
    return options;
  }, [allTeachersFromSchedules, allClassesFromSchedules]);

  // Match search options to search query
  const filteredMonitorOptions = useMemo(() => {
    if (!monitorSearchQuery.trim()) return monitorSearchOptions;
    const query = monitorSearchQuery.toLowerCase();
    return monitorSearchOptions.filter((opt) => opt.name.toLowerCase().includes(query));
  }, [monitorSearchOptions, monitorSearchQuery]);

  // Initialize selected item on the monitor board
  const initialMonitorItem = useMemo(() => {
    if (allTeachersFromSchedules.length > 0) return { type: 'guru' as const, name: allTeachersFromSchedules[0] };
    if (allClassesFromSchedules.length > 0) return { type: 'kelas' as const, name: allClassesFromSchedules[0] };
    return null;
  }, [allTeachersFromSchedules, allClassesFromSchedules]);

  const [selectedMonitorItem, setSelectedMonitorItem] = useState<{ type: 'guru' | 'kelas'; name: string } | null>(null);

  useEffect(() => {
    if (!selectedMonitorItem && initialMonitorItem) {
      setSelectedMonitorItem(initialMonitorItem);
    }
  }, [initialMonitorItem, selectedMonitorItem]);

  // Get matching filtered schedules for selected Monitor item
  const filteredMonitorSchedules = useMemo(() => {
    if (!selectedMonitorItem) return [];
    if (selectedMonitorItem.type === 'kelas') {
      const targetClass = selectedMonitorItem.name.toUpperCase().trim();
      return schedules.filter(item => item.kelas && item.kelas.toUpperCase().trim() === targetClass);
    } else {
      const normalizedSel = normalizeTeacherName(selectedMonitorItem.name).toLowerCase();
      return schedules.filter((item) => {
        if (!item.guru) return false;
        const parts = item.guru.split('/').map(p => normalizeTeacherName(p).toLowerCase());
        return parts.includes(normalizedSel);
      });
    }
  }, [schedules, selectedMonitorItem]);

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

  const DAYS_OF_WEEK = useMemo(() => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], []);
  
  const itemsPerPage = 8; // Responsive sizing for preview and container.

  // Dynamically compute global metrics across teachers
  const metrics = useMemo(() => {
    let totalLessonsCount = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;

    teachers.forEach((t) => {
      t.lessons.forEach((l) => {
        totalLessonsCount++;
        if (l.status === 'Selesai') completedCount++;
        else if (l.status === 'Sedang Dikerjakan') inProgressCount++;
        else if (l.status === 'Belum Dimulai') notStartedCount++;
      });
    });

    const averageProgress = totalLessonsCount > 0 
      ? Math.round((completedCount / totalLessonsCount) * 100) 
      : 72; // default visually matched baseline if empty

    return {
      totalTeachers: teachers.length,
      completed: completedCount,
      inProgress: inProgressCount,
      notStarted: notStartedCount,
      averageProgress
    };
  }, [teachers]);

  // Handle filtering
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lessons.some((l) => l.class.toLowerCase().includes(searchQuery.toLowerCase()));

      // If a specific class constraint is selected
      const matchesClass = selectedClass === 'Semua Kelas' || t.lessons.some((l) => {
        if (selectedClass === 'Kelas 10') return l.class.includes('10');
        if (selectedClass === 'Kelas 11') return l.class.includes('11');
        if (selectedClass === 'Kelas 12') return l.class.includes('12');
        return true;
      });

      // If a specific status constraint is selected
      const matchesStatus = selectedStatus === 'Semua Status' || t.lessons.some((l) => {
        if (selectedStatus === 'Selesai') return l.status === 'Selesai';
        if (selectedStatus === 'Dalam Proses') return l.status === 'Sedang Dikerjakan';
        if (selectedStatus === 'Belum Mulai') return l.status === 'Belum Dimulai';
        return true;
      });

      // Commission filter matching
      const matchesCommission = selectedCommission === 'Semua Komisi' || getCommissionBySubject(t.subject, t.divisi) === selectedCommission;

      return matchesSearch && matchesClass && matchesStatus && matchesCommission;
    });
  }, [teachers, searchQuery, selectedClass, selectedStatus, selectedCommission]);

  // Paginated data view
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;

  // Render status helper for columns
  const renderLessonCell = (lesson?: LessonPlan) => {
    if (!lesson) {
      return <span className="text-on-surface-variant/30 text-xs font-semibold select-none">-</span>;
    }

    let badgeBg = "bg-[#ffe085] text-[#574500]"; // Belum Mulai
    let badgeLabel = "Belum Mulai";
    let badgeIcon = <MinusCircle size={12} />;
    let percent = "0%";
    let barColor = "bg-transparent";

    if (lesson.status === 'Selesai') {
      badgeBg = "bg-[#e9ddff] text-[#5517be]";
      badgeLabel = "Selesai";
      badgeIcon = <CheckCircle2 size={12} />;
      percent = "100%";
      barColor = "bg-[#FFD166]"; // gold bar for Selesai as shown in Image 2
    } else if (lesson.status === 'Sedang Dikerjakan') {
      badgeBg = "bg-[#d8e2ff] text-[#00418f]";
      badgeLabel = "Dalam Proses";
      badgeIcon = <Clock size={12} />;
      // Mock progress values matching row specifics
      percent = lesson.class.includes('AE') ? '60%' : '40%';
      if (lesson.class.includes('10 ME')) percent = '70%';
      if (lesson.class.includes('11 ME')) percent = '30%';
      barColor = "bg-[#2d2d2d]"; // dark navy bar for Dalam Proses
    }

    return (
      <div className="flex flex-col items-center gap-2 p-1">
        <span className="text-xs font-bold text-on-surface truncate max-w-[130px]" title={lesson.class}>
          {lesson.class}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-sm select-none ${badgeBg}`}>
          {badgeIcon}
          {badgeLabel}
        </span>
        {/* Progress Bar under cell */}
        <div className="w-24 mt-0.5">
          <div className="flex justify-between text-[9px] mb-1 font-extrabold text-[#111c2d]">
            <span>{percent}</span>
          </div>
          <div className="h-1.5 w-full bg-[#eef1ff] progress-bar-bg rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: percent }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 relative z-10">
      
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-md border border-white/60 flex items-center justify-center text-[#2d2d2d] shadow-sm shrink-0">
          <BarChart3 size={28} />
        </div>
        <div className="flex flex-col justify-center h-14">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111c2d] tracking-tight">
            Monitoring Lesson Plan
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant/90 font-semibold mt-0.5">
            Pantau progres penyusunan lesson plan setiap guru dengan mudah.
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <section className="flex flex-col xl:flex-row gap-3.5 justify-between items-center z-10 relative">
        <div className="w-full xl:w-1/3 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">
            <Search size={18} />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Cari nama guru atau mata pelajaran..."
            className="w-full pl-11 pr-4 py-3 rounded-full glass-input focus:ring-1.5 focus:ring-[#2d2d2d] focus:border-transparent outline-none transition-all text-xs font-semibold text-on-surface placeholder:text-outline/65 border border-white/50 bg-white/60 backdrop-blur-sm shadow-3xs"
          />
        </div>
        
        <div className="w-full xl:w-auto flex flex-wrap lg:flex-nowrap gap-2.5 items-center">
          
          {/* Week selection with calendar icon */}
          <div className="relative w-full lg:w-auto min-w-[210px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              <Calendar size={15} />
            </span>
            <select 
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-full glass-input text-xs font-bold text-on-surface appearance-none outline-none focus:ring-1.5 focus:ring-[#2d2d2d] cursor-pointer"
            >
              <option>Week 4 (19 - 25 Mei 24)</option>
              <option>Week 3 (12 - 18 Mei 24)</option>
              <option>Week 2 (05 - 11 Mei 24)</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Status selection */}
          <div className="relative w-full lg:w-auto min-w-[150px]">
            <select 
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-9 py-2.5 rounded-full glass-input text-xs font-bold text-on-surface appearance-none outline-none focus:ring-1.5 focus:ring-[#2d2d2d] cursor-pointer"
            >
              <option>Semua Status</option>
              <option>Selesai</option>
              <option>Dalam Proses</option>
              <option>Belum Mulai</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* Commission filter select */}
          <div className="relative w-full lg:w-auto min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              <Filter size={14} className="text-[#6b38d4]" />
            </span>
            <select 
              value={selectedCommission}
              onChange={(e) => { setSelectedCommission(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-9 py-2.5 rounded-full glass-input text-xs font-bold text-on-surface appearance-none outline-none focus:ring-1.5 focus:ring-[#2d2d2d] cursor-pointer"
            >
              <option value="Semua Komisi">Semua Komisi</option>
              {availableCommissions.map((comm) => (
                <option key={comm} value={comm}>{comm}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>
        </div>

      </section>

      {/* Landing visual / placeholder when searchQuery is not inputted */}
      {!searchQuery.trim() ? (
        <div className="w-full flex-col items-center justify-center py-10 md:py-16 flex z-10 relative">
          <div className="w-full max-w-xl bg-white/75 backdrop-blur-md border border-white/60 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col items-center gap-6 text-center animate-fade-in relative overflow-hidden">
            
            {/* Design elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6b38d4]/5 rounded-full filter blur-xl pointer-events-none -mr-4 -mt-4" />
            
            <div className="relative shadow-sm rounded-full overflow-hidden p-1.5 bg-white/30 border border-white/40">
              <div className="absolute inset-0 bg-[#FFD166]/20 rounded-full filter blur-md animate-pulse" />
              <img
                src="https://www.image2url.com/r2/default/images/1778032976429-fb84224a-3e08-4092-b38f-529e608a47d2.png"
                alt="Al-Wildan Logo"
                className="w-18 h-18 object-contain relative z-10"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Al-Wildan&background=FFD166&color=2d2d2d';
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg md:text-xl font-black text-[#1y1c2d] text-[#111c2d] tracking-tight uppercase">
                Pencarian Monitoring Guru
              </h2>
              <p className="text-[10px] font-bold text-[#111c2d]/70 uppercase tracking-widest leading-relaxed">
                AL - WILDAN ISLAMIC SCHOOL 3 BSD CITY
              </p>
              <p className="text-xs font-bold text-[#6b38d4] bg-[#6b38d4]/5 px-3.5 py-1.5 rounded-full mt-3 self-center max-w-sm">
                Silakan ketik nama ustadz pada kolom pencarian di atas untuk memantau progres lesson plan.
              </p>
              
              <div className="mt-6 text-left p-4.5 bg-neutral-50/70 border border-neutral-200/60 rounded-2xl w-full">
                <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-[#111c2d] flex items-center gap-1.5">
                  <Info size={12} className="text-[#6b38d4]" />
                  Aturan / Tips Cepat Pencarian:
                </p>
                <ul className="text-xs text-neutral-500 font-bold space-y-1.5 list-disc pl-4.5">
                  <li>Ketik sebagian nama guru (misal: <span className="text-[#111c2d]">"Indra"</span>, <span className="text-[#111c2d]">"Siti"</span>, <span className="text-[#111c2d]">"Ahmad"</span>).</li>
                  <li>Sistem akan menyaring data secara real-time dari database.</li>
                  <li>Anda masih dapat melakukan filter lanjutan per komisi mata pelajaran di bagian kanan atas.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <>
          {/* Bento-style stats row (5 Cards) */}
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Total Guru */}
            <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Total Guru Terfilter
              </span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-on-surface">
                  {filteredTeachers.length}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant/40">guru</span>
              </div>
              <span className="text-[10px] text-on-surface-variant/70 font-bold">Aktif</span>
            </div>

            {/* Selesai */}
            <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Selesai
              </span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-on-surface">
                  {filteredTeachers.reduce((acc, t) => acc + t.lessons.filter(l => l.status === 'Selesai').length, 0)}
                </span>
                <span className="text-[10px] font-bold text-[#5517be] bg-secondary-fixed px-2.5 py-0.5 rounded-full select-none">
                  {filteredTeachers.reduce((acc, t) => acc + t.lessons.length, 0) > 0 ? `${Math.round((filteredTeachers.reduce((acc, t) => acc + t.lessons.filter(l => l.status === 'Selesai').length, 0) / filteredTeachers.reduce((acc, t) => acc + t.lessons.length, 0)) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant/70 font-bold">Selesai dinilai</span>
            </div>

            {/* Dalam Proses */}
            <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Dalam Proses
              </span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-on-surface">
                  {filteredTeachers.reduce((acc, t) => acc + t.lessons.filter(l => l.status === 'Sedang Dikerjakan').length, 0)}
                </span>
                <span className="text-[10px] font-bold text-on-primary-fixed-variant bg-primary-fixed px-2.5 py-0.5 rounded-full select-none">
                  {filteredTeachers.reduce((acc, t) => acc + t.lessons.length, 0) > 0 ? `${Math.round((filteredTeachers.reduce((acc, t) => acc + t.lessons.filter(l => l.status === 'Sedang Dikerjakan').length, 0) / filteredTeachers.reduce((acc, t) => acc + t.lessons.length, 0)) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant/70 font-bold">Sedang dikerjakan</span>
            </div>

            {/* Belum Mulai */}
            <div className="glass-card p-5 flex flex-col gap-1.5 transition-all duration-300">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Belum Mulai
              </span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-on-surface">
                  {filteredTeachers.reduce((acc, t) => acc + t.lessons.filter(l => l.status === 'Belum Dimulai').length, 0)}
                </span>
                <span className="text-[10px] font-bold text-on-tertiary-fixed-variant bg-tertiary-fixed px-2.5 py-0.5 rounded-full select-none">
                  {filteredTeachers.reduce((acc, t) => acc + t.lessons.length, 0) > 0 ? `${Math.round((filteredTeachers.reduce((acc, t) => acc + t.lessons.filter(l => l.status === 'Belum Dimulai').length, 0) / filteredTeachers.reduce((acc, t) => acc + t.lessons.length, 0)) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant/70 font-bold">Belum mengisi draft</span>
            </div>

            {/* Rata-rata progress */}
            <div className="glass-card p-5 flex flex-col justify-center gap-3 transition-all duration-300 col-span-2 lg:col-span-1">
              {(() => {
                const totalFilteredLessons = filteredTeachers.reduce((acc, t) => acc + t.lessons.length, 0);
                const totalFinishedFilteredLessons = filteredTeachers.reduce((acc, t) => acc + t.lessons.filter(l => l.status === 'Selesai').length, 0);
                const avgProgressFiltered = totalFilteredLessons > 0 ? Math.round((totalFinishedFilteredLessons / totalFilteredLessons) * 100) : 0;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Rata-rata Progress
                      </span>
                      <span className="text-xl font-extrabold text-[#111c2d]">
                        {avgProgressFiltered}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f0f0f0] rounded-full h-2.5 overflow-hidden border border-white/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] bg-neutral-200">
                      <div 
                        className="bg-[#FFD166] h-full rounded-full relative transition-all duration-500" 
                        style={{ width: `${avgProgressFiltered}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full rounded-full blur-[1px]" />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

          </section>

          {/* Central Data Table Panel in Glassmorphism Container */}
          <section className="glass-card shadow-lg flex-grow flex flex-col overflow-hidden max-w-full">
            <div className="overflow-x-auto table-scrollbar flex-grow">
              <table className="w-full min-w-[1300px] text-left text-xs whitespace-nowrap">
                
                <thead className="bg-[#f0f3ff]/50 border-b border-white/60 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider sticky top-0 z-15 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4.5 w-60 bg-[#edf2fe]/80 backdrop-blur-md sticky left-0 z-20 shadow-[1px_0_0_0_rgba(255,255,255,0.7)]">Nama Guru</th>
                    <th className="px-6 py-4.5 text-center">Pelajaran 1</th>
                    <th className="px-6 py-4.5 text-center">Pelajaran 2</th>
                    <th className="px-6 py-4.5 text-center">Pelajaran 3</th>
                    <th className="px-6 py-4.5 text-center">Pelajaran 4</th>
                    <th className="px-6 py-4.5 text-center">Pelajaran 5</th>
                    <th className="px-6 py-4.5 text-center">Pelajaran 6</th>
                    <th className="px-6 py-4.5 text-center">Pelajaran 7</th>
                    <th className="px-6 py-4.5 text-center w-36 sticky right-0 bg-[#edf2fe]/80 backdrop-blur-md shadow-[-1px_0_0_0_rgba(255,255,255,0.7)] z-20">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/45 animate-fade-in bg-white/20">
                  {paginatedTeachers.length > 0 ? (
                    paginatedTeachers.map((tc) => (
                      <tr key={tc.id} className="hover:bg-white/40 transition-colors group">
                        {/* Left Head cell: Teacher name & subject */}
                        <td className="px-6 py-5 bg-white/20 group-hover:bg-white/40 sticky left-0 z-10 shadow-[1px_0_0_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
                          <div className="font-extrabold text-[#111c2d] text-sm mb-0.5 flex items-center gap-2">
                            <span>{tc.name}</span>
                            <span className="text-[8px] bg-[#6b38d4]/10 text-[#6b38d4] font-black tracking-wide px-2 py-0.5 rounded uppercase">
                              {getCommissionBySubject(tc.subject, tc.divisi)}
                            </span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-bold tracking-wide">{tc.subject}</div>
                        </td>

                        {/* Pelajaran columns */}
                        <td className="px-6 py-4 text-center align-middle">{renderLessonCell(tc.lessons[0])}</td>
                        <td className="px-6 py-4 text-center align-middle">{renderLessonCell(tc.lessons[1])}</td>
                        <td className="px-6 py-4 text-center align-middle">{renderLessonCell(tc.lessons[2])}</td>
                        <td className="px-6 py-4 text-center align-middle">{renderLessonCell(tc.lessons[3])}</td>
                        <td className="px-6 py-4 text-center align-middle">{renderLessonCell(tc.lessons[4])}</td>
                        <td className="px-6 py-4 text-center align-middle">{renderLessonCell(tc.lessons[5])}</td>
                        <td className="px-6 py-4 text-center align-middle">{renderLessonCell(tc.lessons[6])}</td>

                        {/* Right Head cell: Actions */}
                        <td className="px-6 py-4 text-center sticky right-0 bg-white/22 group-hover:bg-white/40 shadow-[-1px_0_0_0_rgba(255,255,255,0.7)] z-10 align-middle backdrop-blur-sm">
                          <button 
                            onClick={() => setSelectedTeacher(tc)}
                            className="px-4.5 py-2.5 border border-white/80 bg-white/50 hover:bg-white text-[11px] text-[#2d2d2d] rounded-full font-bold shadow-sm select-none transition-all active:scale-95 whitespace-nowrap"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-xs font-semibold text-neutral-400 italic">
                        Tidak ada guru yang cocok dengan kriteria pencarian / filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            {/* Dynamic Pagination Controls panel */}
            <div className="border-t border-white/65 p-4 bg-white/50 backdrop-blur-md flex items-center justify-between text-xs flex-wrap gap-4">
              <div className="font-semibold text-on-surface-variant">
                Menampilkan {filteredTeachers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} dari {filteredTeachers.length} guru
              </div>

              <div className="flex items-center gap-2">
                {/* Prev Chevron */}
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                  className="w-8.5 h-8.5 rounded-full border border-white/70 flex items-center justify-center hover:bg-white/70 text-on-surface bg-white/40 shadow-sm disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Pagination numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8.5 h-8.5 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                        currentPage === i + 1 
                          ? 'bg-[#2d2d2d] text-white shadow-md' 
                          : 'border border-transparent hover:bg-white/60 text-on-surface'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {/* Next Chevron */}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                  className="w-8.5 h-8.5 rounded-full border border-white/70 flex items-center justify-center hover:bg-white/70 text-on-surface bg-white/40 shadow-sm disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Items Per Page display dropdown */}
                <div className="ml-3 relative">
                  <select className="pl-3.5 pr-8 py-1.8 rounded-full border border-white/65 bg-white/50 backdrop-blur-md focus:ring-1.5 focus:ring-[#2d2d2d] outline-none font-bold text-on-surface cursor-pointer shadow-sm text-[11px] appearance-none">
                    <option>{itemsPerPage} / halaman</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                </div>

              </div>
            </div>

          </section>
        </>
      )}

      {/* Slide-Over Detail Modal / INSPECTOR PANEL */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setSelectedTeacher(null)}
            className="absolute inset-0 bg-[#111c2d]/20 backdrop-blur-sm transition-opacity" 
          />
          
          {/* Modal content body */}
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#f2f2f4] to-[#f6f2e8] h-full shadow-2xl flex flex-col z-10 border-l border-white/40 animate-slide-in overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-white/75 backdrop-blur-xl border-b border-white/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4.5">
                <img 
                  src={selectedTeacher.avatar} 
                  alt={selectedTeacher.name} 
                  className="w-12 h-12 rounded-2xl border-2 border-white object-cover shadow-sm"
                  onError={(e) => {
                    // fallbacks If unsplash avatar rates limits
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeacher.name)}&background=FFD166&color=2d2d2d`;
                  }}
                />
                <div>
                  <h3 className="text-base font-extrabold text-on-surface">
                    {selectedTeacher.name}
                  </h3>
                  <p className="text-[11px] font-bold text-on-surface-variant">
                    {selectedTeacher.role} • {selectedTeacher.subject}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeacher(null)}
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-on-surface-variant hover:text-on-surface shadow-sm border border-white/40 transition-all active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Inspection Body */}
            <div className="p-6 flex-grow overflow-y-auto space-y-5 table-scrollbar">
              
              <div className="flex items-center justify-between bg-white/40 p-3 rounded-2xl border border-white/50">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Progress Lesson Plan:</span>
                <span className="text-xs font-black text-[#5517be] bg-secondary-fixed px-3 py-1 rounded-full">
                  {selectedTeacher.lessons.filter((l) => l.status === 'Selesai').length} dari {selectedTeacher.lessons.length} Selesai
                </span>
              </div>

              <h4 className="text-xs font-black text-[#002c64] uppercase tracking-wider">
                Detail Pelajaran &amp; Dokumen Rencana Belajar
              </h4>

              {/* Grid of Lesson Plans info */}
              <div className="space-y-4">
                {selectedTeacher.lessons.map((lesson, idx) => {
                  const isFinished = lesson.status === 'Selesai';
                  const isWorking = lesson.status === 'Sedang Dikerjakan';
                  let badgeColor = "bg-[#ffe085] text-[#574500]"; // Not started
                  
                  if (isFinished) badgeColor = "bg-[#e9ddff] text-[#5517be]";
                  else if (isWorking) badgeColor = "bg-[#d8e2ff] text-[#00418f]";

                  return (
                    <div key={idx} className="glass-card p-5 border border-white/60 bg-white/40 flex flex-col gap-4">
                      
                      <div className="flex justify-between items-center border-b border-white/40 pb-3">
                        <div>
                          <span className="text-sm font-extrabold text-[#111c2d] block">
                            {lesson.class}
                          </span>
                          <span className="text-[10px] font-medium text-on-surface-variant/60 block mt-0.5">
                            {lesson.week}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${badgeColor}`}>
                          {lesson.status === 'Sedang Dikerjakan' ? 'Dalam Proses' : lesson.status}
                        </span>
                      </div>

                      {/* Content Inspector conditional */}
                      {!lesson.topic ? (
                        <p className="text-xs text-on-surface-variant/60 italic font-medium py-2">
                          Guru belum menyusun draf materi pelajaran untuk kelas ini.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {/* Topic block */}
                          <div className="flex gap-3">
                            <BookOpen size={16} className="text-[#002c64] shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-extrabold text-on-surface-variant uppercase block">Materi / Topik:</span>
                              <p className="text-xs text-on-surface font-semibold mt-0.5">{lesson.topic}</p>
                            </div>
                          </div>

                          {/* Objectives block */}
                          {lesson.learningObjective && (
                            <div className="flex gap-3">
                              <Target size={16} className="text-[#6b38d4] shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-extrabold text-on-surface-variant uppercase block">Tujuan Pembelajaran:</span>
                                <p className="text-xs text-on-surface font-semibold mt-0.5">{lesson.learningObjective}</p>
                              </div>
                            </div>
                          )}

                          {/* Activities block */}
                          {lesson.learningActivities && (
                            <div className="flex gap-3">
                              <Users size={16} className="text-yellow-650 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-extrabold text-on-surface-variant uppercase block">Aktivitas Belajar:</span>
                                <p className="text-xs text-on-surface font-semibold mt-0.5">{lesson.learningActivities}</p>
                              </div>
                            </div>
                          )}

                          {/* Assessments block */}
                          {lesson.assessment && (
                            <div className="flex gap-3">
                              <ClipboardList size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-extrabold text-on-surface-variant uppercase block">Penilaian / Asesmen:</span>
                                <p className="text-xs text-on-surface font-semibold mt-0.5">{lesson.assessment}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Weekly Timetable for selectedTeacher */}
              {(() => {
                const normTeacher = normalizeTeacherName(selectedTeacher.name).toLowerCase();
                const teacherSchedules = schedules.filter((item) => {
                  if (!item.guru) return false;
                  const parts = item.guru.split('/').map(p => normalizeTeacherName(p).toLowerCase());
                  return parts.includes(normTeacher);
                });

                const teacherClasses = Array.from(new Set(teacherSchedules.map(item => item.kelas).filter(Boolean)))
                  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })) as string[];

                const uniqueSlotKeys = Array.from(new Set(schedules.map((item) => item.jp).filter(Boolean)))
                  .sort((a, b) => {
                    const numA = parseInt(a.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.replace(/\D/g, '')) || 0;
                    return numA - numB;
                  });

                const getJPPeriodTime = (jpName: string) => {
                  const matched = schedules.find((item) => item.jp === jpName && item.waktu);
                  return matched ? matched.waktu : 'Waktu Fleksibel';
                };

                const currentDayName = (() => {
                  const index = new Date().getDay();
                  const map = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                  return map[index];
                })();

                const daysList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

                return (
                  <div className="space-y-4 pt-4 border-t border-neutral-300/45">
                    <h4 className="text-xs font-black text-[#002c64] uppercase tracking-wider flex items-center gap-2 font-sans">
                      <Sparkles size={14} className="text-[#6b38d4]" />
                      Jadwal Mengajar Guru ({teacherClasses.length} Kelas Belajar)
                    </h4>
                    
                    {/* Badges of classes taught */}
                    <div className="flex flex-wrap gap-1 bg-white/40 p-3 rounded-xl border border-white/50">
                      <span className="text-[10px] uppercase font-black text-neutral-400 block w-full mb-1 font-sans">Daftar Rombel Kelas:</span>
                      {teacherClasses.length > 0 ? (
                        teacherClasses.map(cls => (
                          <span key={cls} className="bg-[#111c2d] text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-3xs uppercase tracking-wide">
                            {cls}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-semibold text-neutral-400 italic">Belum terdaftar jadwal mengajar</span>
                      )}
                    </div>

                    {/* Visual timetable grid matching schedule design */}
                    <div className="w-full overflow-x-auto border border-white/50 bg-white/60 backdrop-blur-md rounded-2xl shadow-3xs p-3">
                      <table className="w-full border-collapse text-left text-[10px] min-w-[600px]">
                        <thead>
                          <tr className="bg-neutral-100/40">
                            <th className="border-b border-neutral-200/50 p-2 text-center text-[9px] font-mono font-black text-[#111c2d] border-r border-neutral-200/20 w-20">JP</th>
                            {daysList.map(day => (
                              <th key={day} className={`border-b border-neutral-200/50 p-2 text-center text-[9.5px] font-black uppercase text-neutral-600 ${currentDayName.toLowerCase() === day.toLowerCase() ? 'bg-[#FFD166]/20' : ''}`}>
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Homeroom Session sub header */}
                          <tr className="border-b border-neutral-100 text-[9px]">
                            <td className="p-2 text-center border-r border-neutral-200/20 font-black text-[#6b38d4] bg-[#6b38d4]/5">HOMEROOM</td>
                            {daysList.map(day => {
                              const isFridayOrSaturday = day.toLowerCase() === 'jumat' || day.toLowerCase() === 'sabtu';
                              return (
                                <td key={day} className="p-1.5 align-middle">
                                  <div className={`p-1 rounded-md text-center font-black text-[8px] uppercase ${isFridayOrSaturday ? 'bg-[#e0f2fe] text-[#0369a1]' : 'bg-neutral-50/60 text-neutral-500'}`}>
                                    Sesi Homeroom
                                  </div>
                                </td>
                              );
                            })}
                          </tr>

                          {uniqueSlotKeys.map(jpPeriod => {
                            const timeRange = getJPPeriodTime(jpPeriod);
                            return (
                              <tr key={jpPeriod} className="border-b border-neutral-100 opacity-95">
                                <td className="p-2 text-center border-r border-neutral-200/20 bg-neutral-50/50 font-mono">
                                  <span className="font-black text-neutral-800">{jpPeriod}</span>
                                  <span className="text-[8px] text-neutral-400 font-bold block mt-0.5 leading-none">{timeRange}</span>
                                </td>
                                {daysList.map(day => {
                                  const matchedSchedules = teacherSchedules.filter(item =>
                                    item.hari?.toLowerCase().trim() === day.toLowerCase().trim() &&
                                    item.jp === jpPeriod
                                  );

                                  const distinctClasses = Array.from(new Set(matchedSchedules.map(item => item.kelas).filter(Boolean))) as string[];
                                  const firstSubject = matchedSchedules[0]?.mapel || '';

                                  return (
                                    <td key={day} className="p-1.5 align-top">
                                      {distinctClasses.length > 0 ? (
                                        <div className="bg-white/95 p-1.5 rounded-lg border border-neutral-200 shadow-3xs flex flex-col">
                                          <span className="font-extrabold text-[#002c64] uppercase text-[9px] leading-none mb-1">
                                            {formatGradingClasses(distinctClasses, distinctClasses.length > 1)}
                                          </span>
                                          <span className="text-neutral-500 font-extrabold text-[8px] truncate leading-tight flex items-center gap-1">
                                            <BookOpen size={7} className="text-[#6b38d4]" />
                                            {firstSubject}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="text-center py-1.5 text-neutral-300 font-bold">-</div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white/60 backdrop-blur-md border-t border-white/40 text-center text-[11px] font-semibold text-on-surface-variant/70 shrink-0">
              Penilai: <strong>M. Indra Bayu Muktias</strong> (Kepala Sekolah)
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
