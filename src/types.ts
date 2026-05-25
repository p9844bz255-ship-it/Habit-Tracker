export type StatusType = 'Selesai' | 'Sedang Dikerjakan' | 'Belum Dimulai';

export interface LessonPlan {
  id: string;
  class: string;
  subject: string;
  topic: string; // empty if Belum Dimulai
  learningObjective: string; // empty if Belum Dimulai
  learningActivities: string; // empty if Belum Dimulai
  assessment: string; // empty if Belum Dimulai
  status: StatusType;
  lastUpdate: string; // 'Today', 'Yesterday', '-', or specific dates
  week: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  role: string;
  avatar: string;
  totalClasses: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  lessons: LessonPlan[];
}

export interface Reminder {
  id: string;
  title: string;
  due: string;
  type: 'warning' | 'event';
}

export interface CalendarEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  description: string;
}
