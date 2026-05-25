import React, { useState, useEffect } from 'react';
import { LogOut, Bell, User, Layout, Eye, BookOpen, Layers, Loader2, Calendar } from 'lucide-react';
import { LessonPlan, Teacher, Reminder, CalendarEvent } from './types';
import { INITIAL_LESSON_PLANS, INITIAL_REMINDERS, INITIAL_CALENDAR_EVENTS, INITIAL_TEACHERS } from './data';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import CreatePlanView from './components/CreatePlanView';
import MonitoringView from './components/MonitoringView';
import ScheduleDashboardView, { normalizeTeacherName } from './components/ScheduleDashboardView';
import { getJadwalBiasa, getSavedPlans, savePlanToFirestore, db } from './firebase';
import { setDoc, doc } from 'firebase/firestore';

const AVAILABLE_WEEKS = [
  'Week 1 (28 Apr – 4 Mei 2024)',
  'Week 2 (5 – 11 Mei 2024)',
  'Week 3 (12 – 18 Mei 2024)',
  'Week 4 (19 – 25 Mei 2024)',
  'Week 5 (26 Mei – 1 Jun 2024)',
  'Week 6 (2 – 8 Jun 2024)',
  'Week 7 (9 – 15 Jun 2024)',
  'Week 8 (16 – 22 Jun 2024)'
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default to login page so user starts with login view
  const [currentUser, setCurrentUser] = useState({
    name: 'Indra Bayu Muktias',
    role: 'Kepala Sekolah'
  });
  const [activeNav, setActiveNav] = useState<'dashboard' | 'monitoring' | 'jadwal'>('dashboard');
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);

  // States with persistent updates
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [rawSchedules, setRawSchedules] = useState<any[]>([]);
  const [reminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [calendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildPlansAndTeachers = (jadwalList: any[], savedPlans: any[]) => {
    const plans: LessonPlan[] = [];

    AVAILABLE_WEEKS.forEach((week) => {
      const addedPlansForWeek = new Set<string>();
      jadwalList.forEach((j) => {
        const trimmedKelas = j.kelas ? j.kelas.trim() : '';
        const trimmedMapel = j.mapel ? j.mapel.trim() : '';
        if (!trimmedKelas || !trimmedMapel) return;

        const key = `${week.toLowerCase()}_${trimmedKelas.toLowerCase()}_${trimmedMapel.toLowerCase()}`;
        if (addedPlansForWeek.has(key)) return;
        addedPlansForWeek.add(key);

        const planId = `plan_${week.replace(/[^A-Za-z0-9]/g, '_')}_${trimmedKelas.replace(/[^A-Za-z0-9]/g, '_')}_${trimmedMapel.replace(/[^A-Za-z0-9]/g, '_')}`;

        // Check if custom saved exists in Firestore
        const saved = savedPlans.find((p) => p.id === planId);

        // Check if present in INITIAL_LESSON_PLANS (initial seed fallback)
        const initialSeed = INITIAL_LESSON_PLANS.find(
          (p) =>
            p.class.trim().toLowerCase() === trimmedKelas.toLowerCase() &&
            p.subject.trim().toLowerCase() === trimmedMapel.toLowerCase() &&
            p.week.trim().toLowerCase() === week.trim().toLowerCase()
        );

        if (saved) {
          plans.push({
            id: planId,
            class: trimmedKelas,
            subject: trimmedMapel,
            week: week,
            topic: saved.topic || "",
            learningObjective: saved.learningObjective || "",
            learningActivities: saved.learningActivities || "",
            assessment: saved.assessment || "",
            status: saved.status || "Belum Dimulai",
            lastUpdate: saved.lastUpdate || "-"
          });
        } else if (initialSeed) {
          plans.push({
            id: planId,
            class: trimmedKelas,
            subject: trimmedMapel,
            week: week,
            topic: initialSeed.topic,
            learningObjective: initialSeed.learningObjective,
            learningActivities: initialSeed.learningActivities,
            assessment: initialSeed.assessment,
            status: initialSeed.status,
            lastUpdate: initialSeed.lastUpdate
          });
        } else {
          plans.push({
            id: planId,
            class: trimmedKelas,
            subject: trimmedMapel,
            week: week,
            topic: "",
            learningObjective: "",
            learningActivities: "",
            assessment: "",
            status: "Belum Dimulai",
            lastUpdate: "-"
          });
        }
      });
    });

    // 2. Build list of teachers with their lessons dynamically based on plans
    const teacherNamesSet = new Set<string>();
    jadwalList.forEach((j) => {
      if (j.guru) {
        const parts = j.guru.split('/').map(p => normalizeTeacherName(p).trim()).filter(Boolean);
        parts.forEach(p => {
          teacherNamesSet.add(p);
        });
      }
    });
    const teacherNames = Array.from(teacherNamesSet).sort((a, b) => a.localeCompare(b));
    const compiledTeachers: Teacher[] = [];

    teacherNames.forEach((name, index) => {
      const originalTeacher = INITIAL_TEACHERS.find((t) => normalizeTeacherName(t.name).toLowerCase() === name.toLowerCase());
      const teacherSchedules = jadwalList.filter((j) => {
        if (!j.guru) return false;
        const parts = j.guru.split('/').map(p => normalizeTeacherName(p).toLowerCase().trim());
        return parts.includes(name.toLowerCase());
      });

      // Aggregate for active week - standard Week 4
      const week4 = 'Week 4 (19 – 25 Mei 2024)';
      const teacherLessonsForWeek = plans.filter(
        (p) =>
          p.week === week4 &&
          teacherSchedules.some(
            (js) =>
              js.kelas.trim().toLowerCase() === p.class.trim().toLowerCase() &&
              js.mapel.trim().toLowerCase() === p.subject.trim().toLowerCase()
          )
      );

      const completed = teacherLessonsForWeek.filter((l) => l.status === "Selesai").length;
      const inProgress = teacherLessonsForWeek.filter((l) => l.status === "Sedang Dikerjakan").length;
      const notStarted = teacherLessonsForWeek.filter((l) => l.status === "Belum Dimulai").length;

      compiledTeachers.push({
        id: originalTeacher?.id || `t-${index + 1}`,
        name: name,
        subject: originalTeacher?.subject || (teacherSchedules[0] ? teacherSchedules[0].mapel : "Umum"),
        role: originalTeacher?.role || (name === "Indra Bayu Muktias" ? "Kepala Sekolah & Guru" : "Guru"),
        avatar: originalTeacher?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FFD166&color=2d2d2d`,
        totalClasses: teacherSchedules.length,
        completed,
        inProgress,
        notStarted,
        lessons: teacherLessonsForWeek
      });
    });

    return { plans, compiledTeachers };
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      // Fetch both collections in parallel to cut startup delay in half
      const [jList, sPlans] = await Promise.all([
        getJadwalBiasa(),
        getSavedPlans()
      ]);

      if (!jList || jList.length === 0) {
        // Seed standard schedules into Firestore
        console.log("Seeding schedules into 'jadwal_biasa' collection in Firestore...");
        let idCounter = 0;
        
        // Loop over the seed teachers and copy their schedule templates
        for (const t of INITIAL_TEACHERS) {
          for (const l of t.lessons) {
            const id = `sch_${idCounter++}`;
            const seedSchedule = {
              hari: idCounter % 5 === 0 ? "Senin" : idCounter % 5 === 1 ? "Selasa" : idCounter % 5 === 2 ? "Rabu" : idCounter % 5 === 3 ? "Kamis" : "Jumat",
              kelas: l.class,
              mapel: t.subject,
              guru: t.name,
              jp: idCounter % 2 === 0 ? "1-2" : "3-4",
              waktu: idCounter % 2 === 0 ? "07:15 - 08:35" : "08:35 - 10:00"
            };
            await setDoc(doc(db, "jadwal_biasa", id), seedSchedule);
          }
        }

        // Seeding pre-defined lessons into 'lesson_plans'
        console.log("Seeding template lesson metadata to Firestore...");
        for (const lp of INITIAL_LESSON_PLANS) {
          const planId = `plan_${lp.week.replace(/[^A-Za-z0-9]/g, '_')}_${lp.class.replace(/[^A-Za-z0-9]/g, '_')}_${lp.subject.replace(/[^A-Za-z0-9]/g, '_')}`;
          await setDoc(doc(db, "lesson_plans", planId), {
            id: planId,
            class: lp.class,
            subject: lp.subject,
            topic: lp.topic,
            learningObjective: lp.learningObjective,
            learningActivities: lp.learningActivities,
            assessment: lp.assessment,
            status: lp.status,
            lastUpdate: lp.lastUpdate,
            week: lp.week
          });
        }

        // Load seeded results
        const freshJList = await getJadwalBiasa();
        const freshSavedPlans = await getSavedPlans();
        
        setRawSchedules(freshJList || []);
        const { plans, compiledTeachers } = buildPlansAndTeachers(freshJList || [], freshSavedPlans || []);
        setLessonPlans(plans);
        setTeachers(compiledTeachers);
      } else {
        setRawSchedules(jList || []);
        const { plans, compiledTeachers } = buildPlansAndTeachers(jList || [], sPlans || []);
        setLessonPlans(plans);
        setTeachers(compiledTeachers);
      }
    } catch (e) {
      console.error("Error loading data from Firestore: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Smooth login simulation
  const handleLogin = (name: string, role: string) => {
    setCurrentUser({ name, role });
    setIsLoggedIn(true);
    setActiveNav('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Coordinated save plan updates both Firestore, local plans and principal monitoring list
  const handleSavePlan = async (updatedPlan: LessonPlan) => {
    try {
      // Optimistic state updates - we apply state changes immediately to the React application
      // instead of resetting the whole screen using a jarring setIsLoading(true).

      // Update local React State
      setLessonPlans((prev) =>
        prev.map((lp) => (lp.id === updatedPlan.id ? updatedPlan : lp))
      );

      // Save to Firestore 'lesson_plans' collection in background
      savePlanToFirestore(updatedPlan.id, {
        id: updatedPlan.id,
        class: updatedPlan.class,
        subject: updatedPlan.subject,
        topic: updatedPlan.topic || "",
        learningObjective: updatedPlan.learningObjective || "",
        learningActivities: updatedPlan.learningActivities || "",
        assessment: updatedPlan.assessment || "",
        status: updatedPlan.status,
        lastUpdate: 'Today',
        week: updatedPlan.week
      }).catch(err => {
        console.error("Failed to save background lesson plan to Firestore: ", err);
      });

      // Update local teachers mapping as well
      setTeachers((prevT) =>
        prevT.map((t) => {
          const isThisTeacherClass = t.lessons.some(
            (l) =>
              l.class.trim().toLowerCase() === updatedPlan.class.trim().toLowerCase() &&
              l.subject.trim().toLowerCase() === updatedPlan.subject.trim().toLowerCase()
          );

          if (isThisTeacherClass) {
            const updatedLessons = t.lessons.map((l) => {
              if (
                l.class.trim().toLowerCase() === updatedPlan.class.trim().toLowerCase() &&
                l.subject.trim().toLowerCase() === updatedPlan.subject.trim().toLowerCase()
              ) {
                return {
                  ...l,
                  topic: updatedPlan.topic,
                  learningObjective: updatedPlan.learningObjective,
                  learningActivities: updatedPlan.learningActivities,
                  assessment: updatedPlan.assessment,
                  status: updatedPlan.status,
                  lastUpdate: 'Today'
                };
              }
              return l;
            });

            const completed = updatedLessons.filter((l) => l.status === 'Selesai').length;
            const inProgress = updatedLessons.filter((l) => l.status === 'Sedang Dikerjakan').length;
            const notStarted = updatedLessons.filter((l) => l.status === 'Belum Dimulai').length;

            return {
              ...t,
              lessons: updatedLessons,
              completed,
              inProgress,
              notStarted
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error("Failed to save lesson plan to Firestore: ", err);
    } finally {
      setActiveLessonPlan(null);
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  // Filter lesson plans to only show the logged-in teacher classes on the Dashboard
  const activeUserPlans = lessonPlans.filter((lp) => {
    return rawSchedules.some((s) => {
      if (!s.guru) return false;
      const parts = s.guru.split('/').map(p => normalizeTeacherName(p).toLowerCase().trim());
      const userNorm = normalizeTeacherName(currentUser.name).toLowerCase().trim();
      return parts.includes(userNorm) &&
        s.kelas.trim().toLowerCase() === lp.class.trim().toLowerCase() &&
        s.mapel.trim().toLowerCase() === lp.subject.trim().toLowerCase();
    });
  });

  // Fallback to all plans if current logged-in user does not have any matched schedules (to make sure it doesn't break)
  const dashboardPlans = activeUserPlans.length > 0 ? activeUserPlans : lessonPlans.filter((lp) => lp.class.includes("10 ME") || lp.class.includes("11 IPA 1"));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f2f2f4] via-[#f8f6f0] to-[#f4e6c9]">
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 className="w-12 h-12 text-[#111c2d] animate-spin mb-4" />
          <span className="text-xs font-black text-[#111c2d] tracking-widest uppercase">
            Menghubungkan ke Firestore...
          </span>
          <span className="text-[9px] font-bold text-on-surface-variant/50 mt-1.5 tracking-wider uppercase">
            EDUPLAN AL - WILDAN ISLAMIC SCHOOL
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      
      {/* Dynamic Background Glass Ambiences */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD166]/80 rounded-full filter blur-[140px] opacity-15 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-[#6b38d4]/65 rounded-full filter blur-[140px] opacity-10 pointer-events-none" />

      {/* Primary Stitch Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 select-none">
            <img
              src="https://www.image2url.com/r2/default/images/1778032976429-fb84224a-3e08-4092-b38f-529e608a47d2.png"
              alt="Al-Wildan Logo"
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-[#111c2d] tracking-tight leading-none">
                EduPlan
              </span>
              <span className="text-[9px] font-bold text-on-surface-variant/60 tracking-wider uppercase mt-0.5">
                AL - WILDAN ISLAMIC SCHOOL 3 BSD CITY
              </span>
            </div>
          </div>

          {/* Navigation Items (Dashboard, Monitoring & Jadwal) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-white/50 border border-white/60 rounded-full p-1 shadow-inner">
            <button
              onClick={() => { setActiveNav('dashboard'); setActiveLessonPlan(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-[#2d2d2d] text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/40'
              }`}
            >
              <Layout size={14} />
              Dashboard Saya
            </button>
            <button
              onClick={() => { setActiveNav('monitoring'); setActiveLessonPlan(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeNav === 'monitoring'
                  ? 'bg-[#2d2d2d] text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/40'
              }`}
            >
              <Layers size={14} />
              Monitoring Guru
            </button>
            <button
              onClick={() => { setActiveNav('jadwal'); setActiveLessonPlan(null); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeNav === 'jadwal'
                  ? 'bg-[#2d2d2d] text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/40'
              }`}
            >
              <Calendar size={14} />
              Dashboard Jadwal
            </button>
          </nav>

          {/* User Persona & Information Panel */}
          <div className="flex items-center gap-4">
            
            {/* User Profile Card */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/50">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-extrabold text-[#111c2d] leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant/70 mt-1 uppercase tracking-wide">
                  {currentUser.role}
                </span>
              </div>
              
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANzchcz1sHo9TehgF8AIVVKe5BUjdcYNHOZ_bdff1OxPtV3cpRVJbJGn1bpHaMZqnizghgbqw_Aohz7hpK8Nul23K-xZ6Ku3CNQAB14Rg2DPg-6lciUVxpqmOs-UA3eWUiizv2yXJr19pqmD-HUxPN9fr_3TwyD8vmbIAbOuONee21vJe_H5vn7gPamU8jIxo-PEyGAvESKmeC6KvzVHnXXyqt2k8lmfyNWCfJqqBY1YYoy2oyojp6sXvW-G-CDqbTARNBMnuhrDWC"
                alt="Profile Avatar"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-[#FFD166]/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=FFD166&color=2d2d2d`;
                }}
              />
              
              {/* Logout Trigger button */}
              <button 
                onClick={handleLogout}
                title="Keluar"
                className="p-2 text-on-surface-variant hover:text-accent-red hover:bg-red-50/50 rounded-full transition-all focus:outline-none"
              >
                <LogOut size={16} />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex border-t border-white/40 bg-white/20">
          <button
            onClick={() => { setActiveNav('dashboard'); setActiveLessonPlan(null); }}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
              activeNav === 'dashboard'
                ? 'bg-neutral-800/10 text-[#111c2d] border-b-2 border-[#111c2d]'
                : 'text-on-surface-variant'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveNav('monitoring'); setActiveLessonPlan(null); }}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
              activeNav === 'monitoring'
                ? 'bg-[#2d2d2d]/10 text-[#111c2d] border-b-2 border-[#111c2d]'
                : 'text-on-surface-variant'
            }`}
          >
            Monitoring
          </button>
          <button
            onClick={() => { setActiveNav('jadwal'); setActiveLessonPlan(null); }}
            className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
              activeNav === 'jadwal'
                ? 'bg-[#2d2d2d]/10 text-[#111c2d] border-b-2 border-[#111c2d]'
                : 'text-on-surface-variant'
            }`}
          >
            Jadwal
          </button>
        </div>

      </header>

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-6 md:py-8 flex flex-col gap-6">
        
        {/* Render Page Conditionally */}
        {activeNav === 'dashboard' ? (
          activeLessonPlan ? (
            <CreatePlanView 
              plan={activeLessonPlan}
              lessonPlans={lessonPlans}
              onSave={handleSavePlan}
              onCancel={() => setActiveLessonPlan(null)}
            />
          ) : (
            <DashboardView 
              lessonPlans={dashboardPlans}
              reminders={reminders}
              calendarEvents={calendarEvents}
              onSelectPlan={setActiveLessonPlan}
              onNavigateToMonitoring={() => setActiveNav('monitoring')}
              schedules={rawSchedules}
              currentUserName={currentUser.name}
            />
          )
        ) : activeNav === 'monitoring' ? (
          <MonitoringView 
            teachers={teachers} 
            schedules={rawSchedules}
            currentUserName={currentUser.name}
          />
        ) : (
          <ScheduleDashboardView schedules={rawSchedules} currentUserName={currentUser.name} />
        )}

      </main>

      {/* Static Footer Section */}
      <footer className="py-6 border-t border-white/20 bg-white/10 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-bold text-on-surface-variant/60">
          <span>&copy; {new Date().getFullYear()} EduPlan. All Rights Reserved.</span>
          <span>AL - WILDAN ISLAMIC SCHOOL 3 BSD CITY</span>
        </div>
      </footer>

    </div>
  );
}
