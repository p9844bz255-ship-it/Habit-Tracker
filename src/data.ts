import { Teacher, LessonPlan, Reminder, CalendarEvent } from './types';

export const INITIAL_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lp-1',
    class: 'Kelas 10 ME',
    subject: 'Matematika',
    topic: 'Persamaan Linear Dua Variabel',
    learningObjective: 'Siswa mampu menyelesaikan soal SPLDV menggunakan metode eliminasi dan substitusi.',
    learningActivities: 'Penjelasan konsep oleh guru, diskusi kelompok untuk menyelesaikan lembar kerja, latihan soal mandiri, dan presentasi hasil diskusi.',
    assessment: 'Quiz singkat di akhir sesi, penilaian keaktifan saat diskusi, dan pemeriksaan latihan individu.',
    status: 'Selesai',
    lastUpdate: 'Today',
    week: 'Week 4 (19 – 25 Mei 2024)'
  },
  {
    id: 'lp-2',
    class: 'Kelas 11 IPA 1',
    subject: 'Fisika',
    topic: 'Dinamika Partikel',
    learningObjective: 'Siswa mampu mengidentifikasi gaya-gaya yang bekerja pada benda dalam bidang miring.',
    learningActivities: 'Eksperimen virtual menggunakan PhET Simulation, pencatatan data dan analisis variabel gaya, serta diskusi kelompok.',
    assessment: 'Laporan praktikum mini dan pengerjaan 3 tantangan soal fisika.',
    status: 'Sedang Dikerjakan',
    lastUpdate: 'Yesterday',
    week: 'Week 4 (19 – 25 Mei 2024)'
  },
  {
    id: 'lp-3',
    class: 'Kelas 11 IPS 2',
    subject: 'Bahasa Indonesia',
    topic: 'Struktur Teks Eksplanasi',
    learningObjective: 'Siswa dapat menentukan gagasan utama dan hubungan kausalitas teks eksplanasi.',
    learningActivities: 'Membaca contoh teks eksplanasi, mendaftar kata kunci, dan merumuskan pola hubungan sebab-akibat.',
    assessment: 'Latihan soal esai analisis kausalitas teks.',
    status: 'Belum Dimulai',
    lastUpdate: '1 day ago',
    week: 'Week 1 (28 Apr – 4 Mei 2024)'
  },
  {
    id: 'lp-4',
    class: 'Kelas 12 IPS 1',
    subject: 'Sejarah',
    topic: 'Proklamasi Kemerdekaan RI',
    learningObjective: 'Siswa mampu menganalisis peran tokoh pejuang di sekitar peristiwa proklamasi kemerdekaan.',
    learningActivities: 'Menonton video dokumenter proklamasi, diskusi kelompok peran tokoh, presentasi lisan.',
    assessment: 'Penulisan ulasan mini biografi tokoh bangsa.',
    status: 'Belum Dimulai',
    lastUpdate: '2 days ago',
    week: 'Week 1 (28 Apr – 4 Mei 2024)'
  },
  // Adding 8 more classes to complete 12 items (5 Completed, 4 In Progress, 3 Not Started)
  {
    id: 'lp-5',
    class: 'Kelas 10 AE',
    subject: 'Matematika',
    topic: 'Fungsi Kuadrat dan Grafiknya',
    learningObjective: 'Siswa dapat menggambar sketsa grafik fungsi kuadrat dengan menentukan titik potong dan puncak.',
    learningActivities: 'Demonstrasi menggambar grafik, eksplorasi koordinat Geogebra, dan latihan soal mandiri.',
    assessment: 'Penilaian portofolio gambar grafik fungsi kuadrat.',
    status: 'Selesai',
    lastUpdate: '2 days ago',
    week: 'Week 2 (5 – 11 Mei 2024)'
  },
  {
    id: 'lp-6',
    class: 'Kelas 11 AE',
    subject: 'Statistika',
    topic: 'Ukuran Pemusatan Data Kelompok',
    learningObjective: 'Siswa mampu menghitung nilai Mean, Median, dan Modus dari sajian tabel distribusi frekuensi.',
    learningActivities: 'Kuliah interaktif, kerja berpasangan menganalisis data tinggi badan siswa, dan presentasi hasil.',
    assessment: 'Latihan soal mandiri bergradasi.',
    status: 'Selesai',
    lastUpdate: '3 days ago',
    week: 'Week 2 (5 – 11 Mei 2024)'
  },
  {
    id: 'lp-7',
    class: 'Kelas 11 ME',
    subject: 'Matematika',
    topic: 'Teorema Sisa Polinomial',
    learningObjective: 'Siswa dapat menentukan sisa pembagian suku banyak menggunakan Teorema Sisa dan metode Horner.',
    learningActivities: 'Penalaran deduktif teorema, pengerjaan latihan terbimbing, dan kompetisi kuis kelompok.',
    assessment: 'Kuis digital menggunakan platform interaktif.',
    status: 'Selesai',
    lastUpdate: '4 days ago',
    week: 'Week 3 (12 – 18 Mei 2024)'
  },
  {
    id: 'lp-8',
    class: 'Kelas 12 AE',
    subject: 'Matematika',
    topic: 'Limit Fungsi Trigonometri',
    learningObjective: 'Siswa sanggup memecahkan limit tak tentu trigonometri menggunakan rumus dasar limit sin/tan.',
    learningActivities: 'Pembuktian rumus dasar, diskusi kelompok teknik substitusi dan penyederhanaan identitas.',
    assessment: 'Lembar kerja individu terstruktur.',
    status: 'Selesai',
    lastUpdate: '5 days ago',
    week: 'Week 3 (12 – 18 Mei 2024)'
  },
  {
    id: 'lp-9',
    class: 'Kelas 10 IPA 2',
    subject: 'Kimia',
    topic: 'Struktur Atom dan Sifat Periodik',
    learningObjective: 'Siswa memahami nomor atom, nomor massa, isotop, dan penulisan konfigurasi elektron Bohr.',
    learningActivities: 'Visualisasi awan elektron, pembuatan model atom sederhana, dan latihan konfigurasi.',
    assessment: '',
    status: 'Sedang Dikerjakan',
    lastUpdate: 'Yesterday',
    week: 'Week 4 (19 – 25 Mei 2024)'
  },
  {
    id: 'lp-10',
    class: 'Kelas 11 IPA 2',
    subject: 'Biologi',
    topic: 'Struktur Sel Hewan dan Tumbuhan',
    learningObjective: 'Siswa mampu mengidentifikasi organel sel melalui pengamatan mikroskop dan diagram banding.',
    learningActivities: 'Tanya jawab interaktif, pengamatan slide mikroskopi bawang merah dan pipi, penggambaran hasil.',
    assessment: '',
    status: 'Sedang Dikerjakan',
    lastUpdate: 'Today',
    week: 'Week 4 (19 – 25 Mei 2024)'
  },
  {
    id: 'lp-11',
    class: 'Kelas 12 IPA 1',
    subject: 'Fisika',
    topic: 'Gelombang Elektromagnetik',
    learningObjective: 'Siswa dapat mengurutkan spektrum gelombang elektromagnetik berdasarkan frekuensi/panjang gelombang.',
    learningActivities: 'Pembuatan mind map spektrum gelombang, presentasi silsilah manfaat dan bahaya radiasi.',
    assessment: '',
    status: 'Sedang Dikerjakan',
    lastUpdate: 'Today',
    week: 'Week 4 (19 – 25 Mei 2024)'
  },
  {
    id: 'lp-12',
    class: 'Kelas 10 IPS 1',
    subject: 'Geografi',
    topic: '',
    learningObjective: '',
    learningActivities: '',
    assessment: '',
    status: 'Belum Dimulai',
    lastUpdate: '-',
    week: 'Week 4 (19 – 25 Mei 2024)'
  }
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Submit Midterm Grades',
    due: 'Due Today, 5:00 PM',
    type: 'warning'
  },
  {
    id: 'rem-2',
    title: 'Department Meeting',
    due: 'Tomorrow, 10:00 AM',
    type: 'event'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    month: 'OCT',
    day: '24',
    title: 'End of Quarter 1',
    description: 'All grading periods close.'
  },
  {
    id: 'cal-2',
    month: 'NOV',
    day: '05',
    title: 'Teacher Planning Day',
    description: 'No classes for students.'
  },
  {
    id: 'cal-3',
    month: 'NOV',
    day: '12',
    title: 'Parent-Teacher Conf.',
    description: 'Afternoon sessions'
  },
  {
    id: 'cal-4',
    month: 'NOV',
    day: '25',
    title: 'Curriculum Review',
    description: 'Annual staff workshop'
  },
  {
    id: 'cal-5',
    month: 'DEC',
    day: '01',
    title: 'Winter Program',
    description: 'School-wide event'
  }
];

// Complete array of 24 teachers for the Monitoring panel list
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'Indra Bayu Muktias',
    subject: 'Matematika',
    role: 'Kepala Sekolah & Guru',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANzchcz1sHo9TehgF8AIVVKe5BUjdcYNHOZ_bdff1OxPtV3cpRVJbJGn1bpHaMZqnizghgbqw_Aohz7hpK8Nul23K-xZ6Ku3CNQAB14Rg2DPg-6lciUVxpqmOs-UA3eWUiizv2yXJr19pqmD-HUxPN9fr_3TwyD8vmbIAbOuONee21vJe_H5vn7gPamU8jIxo-PEyGAvESKmeC6KvzVHnXXyqt2k8lmfyNWCfJqqBY1YYoy2oyojp6sXvW-G-CDqbTARNBMnuhrDWC',
    totalClasses: 5,
    completed: 2,
    inProgress: 2,
    notStarted: 1,
    lessons: [
      {
        id: 't1-l1',
        class: 'Matematika 10 AE',
        subject: 'Matematika',
        topic: 'SPLDV Dua Variabel',
        learningObjective: 'Siswa memahami eliminasi',
        learningActivities: 'Latihan soal, kuis',
        assessment: 'Kuis',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't1-l2',
        class: 'Matematika 10 ME',
        subject: 'Matematika',
        topic: 'SPLDV Dua Variabel ME',
        learningObjective: 'Siswa memahami eliminasi ME',
        learningActivities: 'Latihan soal, presentasi',
        assessment: 'Pretest',
        status: 'Selesai',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't1-l3',
        class: 'Statistika 11 AE',
        subject: 'Statistika',
        topic: '',
        learningObjective: '',
        learningActivities: '',
        assessment: '',
        status: 'Belum Dimulai',
        lastUpdate: '-',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't1-l4',
        class: 'Statistika 11 ME',
        subject: 'Statistika',
        topic: 'Distribusi Frekuensi',
        learningObjective: 'Menghitung rataan data',
        learningActivities: 'Tanya jawab kelompok',
        assessment: 'Evaluasi mingguan',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Yesterday',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't1-l5',
        class: 'Matematika 11 AE',
        subject: 'Matematika',
        topic: 'Matriks Ordo 2x2',
        learningObjective: 'Menentukan determinan',
        learningActivities: 'Praktik determinasi',
        assessment: 'Uji kompetensi',
        status: 'Selesai',
        lastUpdate: '2 days ago',
        week: 'Week 4 (19 - 25 Mei 2024)'
      }
    ]
  },
  {
    id: 't-2',
    name: 'Siti Nurhaliza',
    subject: 'Fisika',
    role: 'Wakil Kurikulum & Guru',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    totalClasses: 4,
    completed: 1,
    inProgress: 2,
    notStarted: 1,
    lessons: [
      {
        id: 't2-l1',
        class: 'Fisika 10 AE',
        subject: 'Fisika',
        topic: 'Gaya Gravitasi Newtons',
        learningObjective: 'Siswa memahami percepatan gravitasi',
        learningActivities: 'Eksperimen bola jatuh',
        assessment: 'Laporan kelompok',
        status: 'Selesai',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't2-l2',
        class: 'Fisika 10 ME',
        subject: 'Fisika',
        topic: 'Gaya Sentripetal',
        learningObjective: 'Memahami fenomena melingkar',
        learningActivities: 'Kalkulasi rotasi',
        assessment: 'Kuis praktis',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Yesterday',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't2-l3',
        class: 'Fisika 11 AE',
        subject: 'Fisika',
        topic: '',
        learningObjective: '',
        learningActivities: '',
        assessment: '',
        status: 'Belum Dimulai',
        lastUpdate: '-',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't2-l4',
        class: 'Fisika 11 ME',
        subject: 'Fisika',
        topic: 'Dinamika Rotasi Tegangan Tali',
        learningObjective: 'Menghitung momen gaya',
        learningActivities: 'Grup diskusi kelompok',
        assessment: 'Tugas portofolio',
        status: 'Sedang Dikerjakan',
        lastUpdate: '3 days ago',
        week: 'Week 4 (19 - 25 Mei 2024)'
      }
    ]
  },
  {
    id: 't-3',
    name: 'Ahmad Fauzi',
    subject: 'Kimia',
    role: 'Guru Kimia Senior',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 1,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      {
        id: 't3-l1',
        class: 'Kimia 10 AE',
        subject: 'Kimia',
        topic: 'Tabel Periodik Unsur',
        learningObjective: 'Membaca konfigurasi elektron',
        learningActivities: 'Latihan konfigurasi',
        assessment: 'Ujian harian',
        status: 'Selesai',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't3-l2',
        class: 'Kimia 10 ME',
        subject: 'Kimia',
        topic: 'Ikatan Kovalen',
        learningObjective: 'Menjelaskan sebaran elektron',
        learningActivities: 'Peer teaching',
        assessment: 'Evaluasi lisan',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Yesterday',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't3-l3',
        class: 'Kimia 11 AE',
        subject: 'Kimia',
        topic: '',
        learningObjective: '',
        learningActivities: '',
        assessment: '',
        status: 'Belum Dimulai',
        lastUpdate: '-',
        week: 'Week 4 (19 - 25 Mei 2024)'
      }
    ]
  },
  {
    id: 't-4',
    name: 'Dewi Lestari',
    subject: 'Biologi',
    role: 'Guru Biologi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    totalClasses: 4,
    completed: 2,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      {
        id: 't4-l1',
        class: 'Biologi 10 ME',
        subject: 'Biologi',
        topic: 'Keanekaragaman Hayati',
        learningObjective: 'Menggolongkan jenis flora fauna',
        learningActivities: 'Kliping taksonomi',
        assessment: 'Kliping nilai',
        status: 'Selesai',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't4-l2',
        class: 'Biologi 11 ME',
        subject: 'Biologi',
        topic: 'Sistem Pencernaan',
        learningObjective: 'Memilah enzim pencernaan',
        learningActivities: 'Bagan alur proses',
        assessment: 'Lembar kerja',
        status: 'Selesai',
        lastUpdate: 'Yesterday',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't4-l3',
        class: 'Biologi 11 AE',
        subject: 'Biologi',
        topic: 'Struktur Membran Sel',
        learningObjective: 'Mendefinisikan difusi osmosis',
        learningActivities: 'Eksperimen kentang',
        assessment: 'Uji kompetensi',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't4-l4',
        class: 'Biologi 12 AE',
        subject: 'Biologi',
        topic: '',
        learningObjective: '',
        learningActivities: '',
        assessment: '',
        status: 'Belum Dimulai',
        lastUpdate: '-',
        week: 'Week 4 (19 - 25 Mei 2024)'
      }
    ]
  },
  {
    id: 't-5',
    name: 'Yusuf Mansur',
    subject: 'Bahasa Indonesia',
    role: 'Guru Sastra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 1,
    inProgress: 2,
    notStarted: 0,
    lessons: [
      {
        id: 't5-l1',
        class: 'Bahasa Indo 10 ME',
        subject: 'Bahasa Indonesia',
        topic: 'Teks Laporan Hasil Observasi',
        learningObjective: 'Menulis simpulan observasi',
        learningActivities: 'Kunjungan perpustakaan',
        assessment: 'Esai singkat',
        status: 'Selesai',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't5-l2',
        class: 'Bahasa Indo 11 ME',
        subject: 'Bahasa Indonesia',
        topic: 'Karya Tulis Ilmiah',
        learningObjective: 'Menyusun latar belakang',
        learningActivities: 'Brainstorm masalah',
        assessment: 'Proposal awal',
        status: 'Sedang Dikerjakan',
        lastUpdate: '2 days ago',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't5-l3',
        class: 'Bahasa Indo 12 AE',
        subject: 'Bahasa Indonesia',
        topic: 'Resensi Buku Fiksi',
        learningObjective: 'Menulis sinopsis kritis',
        learningActivities: 'Bedah materi novel',
        assessment: 'Review tulis',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      }
    ]
  },
  {
    id: 't-6',
    name: 'Ratih Purwasih',
    subject: 'Bahasa Inggris',
    role: 'Guru Bahasa Inggris',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 0,
    inProgress: 2,
    notStarted: 1,
    lessons: [
      {
        id: 't6-l1',
        class: 'English 10 AE',
        subject: 'Bahasa Inggris',
        topic: 'Descriptive Text on Landmarks',
        learningObjective: 'Using adjective modifiers',
        learningActivities: 'Drafting beautiful cities descriptions',
        assessment: 'Quiz 2',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Yesterday',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't6-l2',
        class: 'English 11 AE',
        subject: 'Bahasa Inggris',
        topic: 'Analytical Exposition Writing',
        learningObjective: 'Finding central thesis state',
        learningActivities: 'Developing pro-con thesis',
        assessment: 'Rubrik esai',
        status: 'Sedang Dikerjakan',
        lastUpdate: 'Today',
        week: 'Week 4 (19 - 25 Mei 2024)'
      },
      {
        id: 't6-l3',
        class: 'English 12 ME',
        subject: 'Bahasa Inggris',
        topic: '',
        learningObjective: '',
        learningActivities: '',
        assessment: '',
        status: 'Belum Dimulai',
        lastUpdate: '-',
        week: 'Week 4 (19 - 25 Mei 2024)'
      }
    ]
  },
  // Add 18 more teachers with general details for pagination (up to 24)
  {
    id: 't-7',
    name: 'Bambang Triatmojo',
    subject: 'Sejarah',
    role: 'Guru Sejarah',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 2,
    inProgress: 0,
    notStarted: 0,
    lessons: [
      { id: 't7-l1', class: 'Sejarah 10 ME', subject: 'Sejarah', topic: 'Prasejarah Nusantara', learningObjective: 'Silsilah purba', learningActivities: 'Paparan visual, tanya jawab', assessment: 'Test', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't7-l2', class: 'Sejarah 11 ME', subject: 'Sejarah', topic: 'Politik Etis Belanda', learningObjective: 'Analisis dampak tiga pilar', learningActivities: 'Analisis sejarah', assessment: 'Esai', status: 'Selesai', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-8',
    name: 'Ratna Sari',
    subject: 'Geografi',
    role: 'Guru Geografi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 1,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      { id: 't8-l1', class: 'Geografi 10 AE', subject: 'Geografi', topic: 'Litosfer Bumi', learningObjective: 'Identifikasi lempeng', learningActivities: 'Simulasi gerakan tektonik', assessment: 'Maket sederhana', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't8-l2', class: 'Geografi 11 ME', subject: 'Geografi', topic: 'Mitigasi Bencana Gempa', learningObjective: 'Skenario darurat gempa', learningActivities: 'Drill simulasi gempa', assessment: 'Evaluasi kesiapsiagaan', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't8-l3', class: 'Geografi 11 AE', subject: 'Geografi', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-9',
    name: 'Hendra Wijaya',
    subject: 'Sosiologi',
    role: 'Guru Sosiologi',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 0,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      { id: 't9-l1', class: 'Sosiologi 11 IPS 1', subject: 'Sosiologi', topic: 'Konflik Sosial Masyarakat', learningObjective: 'Resolusi konflik', learningActivities: 'Bermain peran', assessment: 'Analisis kasus', status: 'Sedang Dikerjakan', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't9-l2', class: 'Sosiologi 11 IPS 2', subject: 'Sosiologi', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-10',
    name: 'Sari Rahmawati',
    subject: 'Ekonomi',
    role: 'Guru Ekonomi',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 2,
    inProgress: 1,
    notStarted: 0,
    lessons: [
      { id: 't10-l1', class: 'Ekonomi 10 ME', subject: 'Ekonomi', topic: 'Otoritas Jasa Keuangan', learningObjective: 'Tugas wewenang OJK', learningActivities: 'Identifikasi lembaga keuangan', assessment: 'Tanya jawab', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't10-l2', class: 'Ekonomi 11 ME', subject: 'Ekonomi', topic: 'Inflasi dan Penyebabnya', learningObjective: 'Menghitung laju inflasi', learningActivities: 'Analisis indeks harga konsumen', assessment: 'Penugasan mandiri', status: 'Selesai', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't10-l3', class: 'Ekonomi 12 AE', subject: 'Ekonomi', topic: 'Akuntansi Perusahaan Dagang', learningObjective: 'Membuat jurnal penyesuaian', learningActivities: 'Pencatatan kas dan piutang', assessment: 'Exercise', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-11',
    name: 'Adi Prasetyo',
    subject: 'Pendidikan Agama',
    role: 'Guru Agama',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 1,
    inProgress: 1,
    notStarted: 0,
    lessons: [
      { id: 't11-l1', class: 'Agama 10 AE', subject: 'Pendidikan Agama', topic: 'Adab Berbuat Baik', learningObjective: 'Hikmah ihsan', learningActivities: 'Diskusi dalil', assessment: 'Hafalan ayat', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't11-l2', class: 'Agama 11 AE', subject: 'Pendidikan Agama', topic: 'Sejarah Peradaban Islam', learningObjective: 'Masa kejayaan khilafah', learningActivities: 'Timeline sejarah', assessment: 'Review', status: 'Sedang Dikerjakan', lastUpdate: '3 days ago', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-12',
    name: 'Gita Wiryawan',
    subject: 'Seni Musik',
    role: 'Guru Seni',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 1,
    inProgress: 0,
    notStarted: 1,
    lessons: [
      { id: 't12-l1', class: 'Musik 10 ME', subject: 'Seni Musik', topic: 'Notasi Balok Dasar', learningObjective: 'Membaca nada treble clef', learningActivities: 'Praktek piano mini', assessment: 'Uji solfeggio', status: 'Selesai', lastUpdate: '5 days ago', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't12-l2', class: 'Musik 11 ME', subject: 'Seni Musik', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-13',
    name: 'Lukman Hakim',
    subject: 'Olahraga',
    role: 'Guru PJOK',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 0,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      { id: 't13-l1', class: 'PJOK 10 AE', subject: 'Olahraga', topic: 'Teknik Dasar Sepak Bola', learningObjective: 'Melakukan passing lambung', learningActivities: 'Latihan di lapangan hijau', assessment: 'Praktek', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't13-l2', class: 'PJOK 11 AE', subject: 'Olahraga', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-14',
    name: 'Eka Wijaya',
    subject: 'Informatika',
    role: 'Guru TIK',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 2,
    inProgress: 1,
    notStarted: 0,
    lessons: [
      { id: 't14-l1', class: 'TIK 10 ME', subject: 'Informatika', topic: 'Pemrograman Dasar Python', learningObjective: 'Menggunakan conditionals', learningActivities: 'Menulis script kondisi', assessment: 'Lab exercises', status: 'Selesai', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't14-l2', class: 'TIK 11 ME', subject: 'Informatika', topic: 'Analisis Algoritma Sorting', learningObjective: 'Memilah bubble vs quick sort', learningActivities: 'Dry run program', assessment: 'Ujian TIK', status: 'Selesai', lastUpdate: '2 days ago', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't14-l3', class: 'TIK 12 AE', subject: 'Informatika', topic: 'Pembuatan Web Dinamis', learningObjective: 'Merancang database lokal', learningActivities: 'Coding SQL', assessment: '', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-15',
    name: 'Diana Putri',
    subject: 'Pancasila & PKN',
    role: 'Guru PKN',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a131fed10495?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 1,
    inProgress: 0,
    notStarted: 1,
    lessons: [
      { id: 't15-l1', class: 'PKN 10 AE', subject: 'PKN', topic: 'Nilai Pancasila Kehidupan', learningObjective: 'Menerapkan gotong royong', learningActivities: 'Projek sosial mini', assessment: 'Laporan projek', status: 'Selesai', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't15-l2', class: 'PKN 11 AE', subject: 'PKN', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-16',
    name: 'Wawan Gunawan',
    subject: 'Seni Rupa',
    role: 'Guru Seni Rupa',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 0,
    inProgress: 2,
    notStarted: 0,
    lessons: [
      { id: 't16-l1', class: 'Rupa 10 AE', subject: 'Seni Rupa', topic: 'Sketsa Perspektif 2 Titik', learningObjective: 'Menggambar interior', learningActivities: 'Menggambar bebas di studio', assessment: 'Hasil gambar', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't16-l2', class: 'Rupa 11 AE', subject: 'Seni Rupa', topic: 'Teori Warna Nirmana', learningObjective: 'Mencampur palet komplementer', learningActivities: 'Lukisan nirmana roda warna', assessment: 'Penilaian karya', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-17',
    name: 'Santi Marlina',
    subject: 'Fisika',
    role: 'Guru Fisika Kelas 12',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 1,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      { id: 't17-l1', class: 'Fisika 12 AE', subject: 'Fisika', topic: 'Fisika Kuantum Planck', learningObjective: 'Menghitung foton energi', learningActivities: 'Pencerahan postulat Einstein', assessment: 'Latihan kuantum', status: 'Selesai', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't17-l2', class: 'Fisika 12 ME', subject: 'Fisika', topic: 'Efek Fotoelektrik', learningObjective: 'Memahami kerja sel surya', learningActivities: 'Webinar simulasi surya', assessment: 'Review tulis', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't17-l3', class: 'Fisika 11 ME', subject: 'Fisika', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-18',
    name: 'Rian Aditama',
    subject: 'Matematika',
    role: 'Guru Matematika Kelas 12',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    totalClasses: 3,
    completed: 1,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      { id: 't18-l1', class: 'Matematika 12 AE', subject: 'Matematika', topic: 'Dimensi Tiga Jarak Titik', learningObjective: 'Menghitung diagonal ruang', learningActivities: 'Eksplorasi model kubus kayu', assessment: 'Pekerjaan rumah', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't18-l2', class: 'Matematika 12 ME', subject: 'Matematika', topic: 'Bunga Majemuk Finansial', learningObjective: 'Menghitung anuitas kredit', learningActivities: 'Studi kasus bunga bank', assessment: 'Tugas kelompok', status: 'Sedang Dikerjakan', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't18-l3', class: 'Matematika 11 ME', subject: 'Matematika', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-19',
    name: 'Intan Permatasari',
    subject: 'Pendidikan Agama',
    role: 'Guru Agama Kelas 10',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 1,
    inProgress: 1,
    notStarted: 0,
    lessons: [
      { id: 't19-l1', class: 'Agama 10 ME', subject: 'Pendidikan Agama', topic: 'Adab Guru & Murid', learningObjective: 'Tanggung jawab akhlak', learningActivities: 'Bedah kitab rujukan', assessment: 'Resume tulis', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't19-l2', class: 'Agama 10 AE', subject: 'Pendidikan Agama', topic: 'Keutamaan Menuntut Ilmu', learningObjective: 'Dalil ilmu', learningActivities: 'Berdiskusi bersama', assessment: 'Presentasi', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-20',
    name: 'Budi Hartono',
    subject: 'Ekonomi',
    role: 'Guru Akuntansi',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 2,
    inProgress: 0,
    notStarted: 0,
    lessons: [
      { id: 't20-l1', class: 'Akuntansi 12 ME', subject: 'Ekonomi', topic: 'Kertas Kerja Dagang', learningObjective: 'Menyusun laporan Laba Rugi', learningActivities: 'Pencatatan neraca lajur', assessment: 'Praktik Buku Akbar', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't20-l2', class: 'Akuntansi 12 AE', subject: 'Ekonomi', topic: 'Jurnal Penutup Dagang', learningObjective: 'Menutup rekening kas', learningActivities: 'Penyusunan jurnal tutup', assessment: 'Ujian harian', status: 'Selesai', lastUpdate: '2 days ago', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-21',
    name: 'Nia Kurnia',
    subject: 'Bahasa Inggris',
    role: 'Guru Bahasa Inggris',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 1,
    inProgress: 0,
    notStarted: 1,
    lessons: [
      { id: 't21-l1', class: 'English 10 ME', subject: 'Bahasa Inggris', topic: 'Narrative Legend Writing', learningObjective: 'Identifying narrative blocks', learningActivities: 'Reading Lake Toba legend', assessment: 'Quiz legend', status: 'Selesai', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't21-l2', class: 'English 10 AE', subject: 'Bahasa Inggris', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-22',
    name: 'Asep Saepudin',
    subject: 'Kemasyarakatan',
    role: 'Guru Geografi IPS',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 1,
    inProgress: 1,
    notStarted: 0,
    lessons: [
      { id: 't22-l1', class: 'Geografi 12 IPS 1', subject: 'Kemasyarakatan', topic: 'Peta Interaktif SIG', learningObjective: 'Menganalisis buffering SIG', learningActivities: 'Eksplorasi software peta', assessment: 'Makalah peta', status: 'Selesai', lastUpdate: '3 days ago', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't22-l2', class: 'Geografi 12 IPS 2', subject: 'Kemasyarakatan', topic: 'Pola Pemukiman Desa', learningObjective: 'Klasifikasi tipe desa', learningActivities: 'Observasi foto udara', assessment: 'Sesi kuis kelompok', status: 'Sedang Dikerjakan', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-23',
    name: 'Rina Herawati',
    subject: 'Biologi',
    role: 'Guru IPA Biologi',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 1,
    inProgress: 1,
    notStarted: 0,
    lessons: [
      { id: 't23-l1', class: 'Biologi 10 IPA 1', subject: 'Biologi', topic: 'Ekosistem Laut Alami', learningObjective: 'Rantai makanan laut', learningActivities: 'Menghubungkan rantai trofik', assessment: 'Test tulis', status: 'Selesai', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't23-l2', class: 'Biologi 10 IPA 2', subject: 'Biologi', topic: 'Interaksi Ekologi Biotik', learningObjective: 'Macam simbiosis alami', learningActivities: 'Tanya jawab interaktif', assessment: 'Lembar kerja siswa', status: 'Sedang Dikerjakan', lastUpdate: 'Today', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  },
  {
    id: 't-24',
    name: 'Taufiq Hidayat',
    subject: 'Kemasyarakatan',
    role: 'Guru Sosiologi Kebangsaan',
    avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=150',
    totalClasses: 2,
    completed: 0,
    inProgress: 1,
    notStarted: 1,
    lessons: [
      { id: 't24-l1', class: 'Sosiologi 12 IPS 1', subject: 'Kemasyarakatan', topic: 'Modernisasi Sosial Indonesia', learningObjective: 'Menelaah perubahan budaya', learningActivities: 'Analisis media massa', assessment: 'Laporan bacaan', status: 'Sedang Dikerjakan', lastUpdate: 'Yesterday', week: 'Week 4 (19 - 25 Mei 2024)' },
      { id: 't24-l2', class: 'Sosiologi 12 IPS 2', subject: 'Kemasyarakatan', topic: '', learningObjective: '', learningActivities: '', assessment: '', status: 'Belum Dimulai', lastUpdate: '-', week: 'Week 4 (19 - 25 Mei 2024)' }
    ]
  }
];
