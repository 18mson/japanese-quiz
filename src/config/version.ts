export interface VersionEntry {
  version: string;
  tag: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  highlights: string[];
}

export const APP_VERSION = '2.7.0';

export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '2.7.0',
    tag: 'Badge Mastery & Gamification',
    date: '20 Sep 2026',
    type: 'major',
    title: 'Sistem Koleksi Lencana, Profil Avatar & Bot Duel Online',
    highlights: [
      'Sistem Koleksi Lencana (29 Badges): Lencana progresif Bab 1–25, Shoshinsha, dan penguasaan 100% Hiragana, Katakana, serta Kanji N5 dengan efek siluet misteri.',
      'Kustomisasi Avatar Profil: Pemain dapat memilih dan memasang lencana yang telah terbuka sebagai ikon avatar profil pribadi.',
      'Pemisahan Modal Pengaturan (Settings): Halaman pengaturan baru dengan tata letak desktop 2 kolom responsif dan navigasi tab beranimasi halus (smooth sliding pill).',
      'Bot AI Arena Duel Online: Penambahan lawan bot cerdas dengan profil dan perilaku adaptif pada mode multiplayer.',
      'Visual Mahkota Penguasaan (Mastery Crown): Pembaruan ikon penguasaan karakter dan kata dengan varian mahkota emas (Crown fill) seragam.'
    ]
  },
  {
    version: '2.6.0',
    tag: 'Unified Component Architecture',
    date: '14 Sep 2026',
    type: 'minor',
    title: 'Refaktorisasi Komponen Reusable & Modal Standar',
    highlights: [
      'Standardisasi bottom navbar kuis (QuizActionNavbar) dengan shortcut Enter & mode Proceed/Typing.',
      'Shell dialog universal (BaseModal) dengan Teleport otomatis, backdrop blur, dan Escape listener terpadu.',
      'Penyatuan badge streak (StreakBadge) dan banner evaluasi jawaban (QuizFeedbackBanner).',
      'Pembersihan kode duplikat dan peningkatan performa rendering aplikasi.'
    ]
  },
  {
    version: '2.5.0',
    tag: 'Writing & Number Mastery',
    date: 'Sep 2026',
    type: 'minor',
    title: 'Mode Latihan Menulis Kanji/Kana & Kuis Hitungan',
    highlights: [
      'Mode Baru: Latihan Menulis (Handwriting) dengan engine HanziWriter & stroke order recognition.',
      'Mode Baru: Kuis Pola Hitungan Bilangan & Waktu (Kazu & Jikan) dengan native audio TTS.',
      'Smart Onscreen Number Keypad dan 2 arah kuis (Angka ⇄ Kana).',
      'Dukungan penulisan aksara Kanji N5, Hiragana, Katakana, dan huruf kombinasi (Yoon).'
    ]
  },
  {
    version: '2.4.0',
    tag: 'Dark Mode & Kanji N5',
    date: 'Agu 2026',
    type: 'minor',
    title: 'Sistem Dark Mode Terpadu & Kosakata Kanji N5',
    highlights: [
      'Implementasi tema Dark Mode penuh di seluruh layar kuis, modal, dan lobi.',
      'Integrasi dataset komprehensif Kosakata & Kanji N5 Minna no Nihongo.',
      'Kartu preview karakter interaktif dengan animasi goresan SVG.'
    ]
  },
  {
    version: '2.3.0',
    tag: 'Mobile Input & BGM',
    date: 'Agu 2026',
    type: 'minor',
    title: 'Virtual Keyboard Mobile & Wheel Selector',
    highlights: [
      'Komponen Keyboard Virtual khusus mobile untuk kemudahan pengetikan di smartphone.',
      'Tampilan menu pemilih mode format piringan putar (Disk Wheel Selector).',
      'Integrasi musik latar (BGM) di lobby room dan variasi sound effects interaktif.'
    ]
  },
  {
    version: '2.2.0',
    tag: 'Multiplayer Duel Online',
    date: 'Akhir Jul 2026',
    type: 'minor',
    title: 'Arena Duel Online Real-Time & Power-Ups',
    highlights: [
      'Arena duel multiplayer online 2–8 pemain secara real-time berbasis Supabase.',
      'Dua mode duel: Adu Ketik Eliminasi dan Quiz Blitz (adu refleks pilihan ganda).',
      'Sistem Power-Up battle (Freeze, Backward, Storm) dan Spectator Mode bagi pemain gugur.'
    ]
  },
  {
    version: '2.1.0',
    tag: 'Sentence Typing & Adaptive SRS',
    date: 'Jul 2026',
    type: 'minor',
    title: 'Mode Ketik Kalimat & Algoritma Adaptive',
    highlights: [
      'Mode pengetikan kalimat lengkap Jepang (Kotoba & Pola) dengan Wanakana parser.',
      'Algoritma Spaced Repetition (SRS) adaptif untuk memprioritaskan soal yang masih lemah.',
      'Sistem level pengguna, lencana profil, dan modal perayaan pecah rekor skor.'
    ]
  },
  {
    version: '2.0.0',
    tag: 'Project Rebirth',
    date: '4 Jul 2026',
    type: 'major',
    title: 'Kebangkitan & Modernisasi Nihongo Master',
    highlights: [
      'Reaktivasi pengembangan besar setelah jeda 408 hari (sejak Mei 2025).',
      'Perombakan antarmuka UI modern berbasis Vue 3 + Tailwind CSS.',
      'Integrasi database cloud Supabase untuk penyimpanan progress & leaderboard global.'
    ]
  },
  {
    version: '1.0.0',
    tag: 'Legacy Foundation',
    date: 'Mei 2025',
    type: 'major',
    title: 'Fondasi Awal Nihongo Master',
    highlights: [
      'Kuis pilihan ganda dasar Hiragana, Katakana, dan kombinasi huruf.',
      'Sistem audio sound effect dasar.'
    ]
  }
];
