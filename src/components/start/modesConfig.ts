// src/components/start/modesConfig.ts
import type { Component } from 'vue';
import {
  Layers, Keyboard, PenTool, BookOpen, Calculator, Swords, CalendarDays
} from '@lucide/vue';

export interface QuizModeSubType {
  key: string;
  label: string;
  tag?: string;
  beta?: boolean;
}

export interface QuizModeDef {
  id: string;
  title: string;
  levelTag: string;
  level: 'basic' | 'n5' | 'battleground';
  defaultType: string;
  desc: string;
  badge?: string;
  subTypes?: QuizModeSubType[];
  icon: Component;
  discGradient: string;
  discShadow: string;
  discPulse: string;
}

export const modesList: QuizModeDef[] = [
  {
    id: 'daily',
    title: 'Latihan Harian',
    levelTag: 'Harian (日課)',
    level: 'n5',
    defaultType: 'daily',
    badge: 'BETA',
    desc: 'Tantangan 5–10 kalimat acak harian dengan input suara & ketik.',
    icon: CalendarDays,
    discGradient: 'from-amber-600 via-rose-600 to-indigo-800',
    discShadow: 'shadow-amber-500/25',
    discPulse: 'bg-amber-400',
  },
  {
    id: 'hiragana',
    title: 'Hiragana',
    levelTag: 'Dasar (ひらがな)',
    level: 'basic',
    defaultType: 'multiple_choice',
    desc: 'Kuasai 46 huruf dasar Hiragana, variasi Dakuten, dan Kombinasi (Youon).',
    subTypes: [
      { key: 'multiple_choice', label: 'Pilihan Ganda' },
      { key: 'keyboard_typing', label: 'Ketik Kana' },
      { key: 'writing', label: 'Tulis Huruf' },
    ],
    icon: Layers,
    discGradient: 'from-aizome via-slate-800 to-aizome-hover dark:from-torii dark:via-rose-600 dark:to-amber-700',
    discShadow: 'shadow-aizome/25 dark:shadow-torii/25',
    discPulse: 'bg-aizome-light dark:bg-torii',
  },
  {
    id: 'katakana',
    title: 'Katakana',
    levelTag: 'Dasar (カタカナ)',
    level: 'basic',
    defaultType: 'multiple_choice',
    desc: 'Kuasai huruf Katakana untuk kata serapan asing, nama, dan istilah modern.',
    subTypes: [
      { key: 'multiple_choice', label: 'Pilihan Ganda' },
      { key: 'keyboard_typing', label: 'Ketik Kana' },
      { key: 'writing', label: 'Tulis Huruf' },
    ],
    icon: Keyboard,
    discGradient: 'from-slate-800 via-aizome to-slate-900 dark:from-rose-600 dark:via-torii dark:to-orange-600',
    discShadow: 'shadow-aizome/25 dark:shadow-torii/25',
    discPulse: 'bg-aizome-light dark:bg-torii',
  },
  {
    id: 'kanji',
    title: 'Kanji N5',
    levelTag: 'Huruf Kanji (漢字)',
    level: 'basic',
    defaultType: 'writing',
    desc: 'Latihan menulis goresan stroke order Kanji JLPT N5 per bab pelajaran.',
    subTypes: [
      { key: 'writing', label: 'Tulis Huruf (Goresan)' },
    ],
    icon: PenTool,
    discGradient: 'from-matcha-dark via-matcha to-emerald-700',
    discShadow: 'shadow-matcha/25',
    discPulse: 'bg-matcha',
  },
  {
    id: 'kotoba',
    title: 'Kotoba & Pola',
    levelTag: 'Kosakata (言葉)',
    level: 'n5',
    defaultType: 'words',
    desc: 'Latihan mengetik kosakata berhuruf Kanji, pola kalimat, & percakapan.',
    subTypes: [
      { key: 'words', label: 'Kotoba (言葉)' },
      { key: 'renshuu', label: 'Renshuu (練習)', beta: true },
      { key: 'kaiwa', label: 'Kaiwa (会話)', beta: true },
    ],
    icon: BookOpen,
    discGradient: 'from-slate-800 via-aizome-hover to-aizome dark:from-amber-600 dark:via-orange-600 dark:to-rose-700',
    discShadow: 'shadow-aizome/25 dark:shadow-amber-500/25',
    discPulse: 'bg-aizome-light dark:bg-amber-400',
  },
  {
    id: 'online_game',
    title: 'Online Game',
    levelTag: 'Multiplayer (対戦)',
    level: 'battleground',
    defaultType: 'battleground',
    desc: 'Bermain online multiplayer realtime (2–8 Pemain). Pilih mode Adu Ketik atau Quiz Blitz.',
    subTypes: [
      { key: 'battleground', label: 'Adu Ketik' },
      { key: 'quiz_blitz', label: 'Quiz Blitz' },
    ],
    icon: Swords,
    discGradient: 'from-rose-700 via-red-600 to-slate-900 dark:from-torii dark:via-rose-600 dark:to-red-700',
    discShadow: 'shadow-torii/30',
    discPulse: 'bg-torii',
  },
  {
    id: 'lainnya',
    title: 'Lainnya',
    levelTag: 'Tambahan (その他)',
    level: 'basic',
    defaultType: 'angka',
    desc: 'Latihan angka & counter bertahap, atau drill campuran Hiragana + Katakana.',
    subTypes: [
      { key: 'angka', label: 'Angka' },
      { key: 'counter', label: 'Counter' },
      { key: 'campuran', label: 'Campuran' },
      { key: 'mix', label: 'Mix Kana' },
    ],
    icon: Calculator,
    discGradient: 'from-matcha via-emerald-600 to-teal-700',
    discShadow: 'shadow-matcha/25',
    discPulse: 'bg-matcha',
  },
];

export function getModeDescription(mode: QuizModeDef, characterType: string, hitunganTab: string): string {
  if (mode.id === 'daily') {
    return 'Tantangan 5–10 kalimat acak harian dengan input suara & ketik.';
  }
  if (mode.id === 'hiragana') {
    if (characterType === 'multiple_choice') return 'Latihan pilihan ganda huruf Hiragana secara cepat & interaktif.';
    if (characterType === 'keyboard_typing') return 'Ketik huruf Hiragana dengan keyboard presisi.';
    if (characterType === 'writing') return 'Latihan menggambar langsung huruf Hiragana dengan urutan goresan di layar.';
  }
  if (mode.id === 'katakana') {
    if (characterType === 'multiple_choice') return 'Latihan pilihan ganda huruf Katakana secara cepat & interaktif.';
    if (characterType === 'keyboard_typing') return 'Ketik huruf Katakana dengan keyboard presisi.';
    if (characterType === 'writing') return 'Latihan menggambar langsung huruf Katakana dengan urutan goresan di layar.';
  }
  if (mode.id === 'kanji') {
    return 'Latihan menggambar langsung huruf Kanji N5 dengan urutan goresan di layar per bab.';
  }
  if (mode.id === 'kotoba') {
    if (characterType === 'words') return 'Latihan mengetik kosakata berhuruf Kanji';
    if (characterType === 'renshuu') return 'Latihan pola kalimat — substitusi, drill gambar, dan role-play';
    if (characterType === 'kaiwa') return 'Latihan mengetik dialog percakapan situasional N5';
  }
  if (mode.id === 'online_game') {
    if (characterType === 'quiz_blitz') return 'Adu refleks kuis cepat 10 detik per soal bersama pemain lain.';
    return 'Adu kecepatan mengetik romaji eliminasi bertahap (2–8 pemain).';
  }
  if (mode.id === 'lainnya') {
    if (characterType === 'mix') return 'Latihan campuran huruf Hiragana & Katakana secara bersamaan.';
    if (characterType === 'angka' || hitunganTab === 'angka') return 'Latihan angka dasar 1-10, puluhan, ratusan, dan ribuan bertahap.';
    if (characterType === 'counter' || hitunganTab === 'counter') return 'Latihan kata bantu hitung (counter) seperti 本, 杯, 匹, 個, dll.';
    if (characterType === 'campuran' || hitunganTab === 'campuran') return 'Review gabungan dari seluruh wave hitungan yang sudah dipelajari.';
    return 'Latihan angka dan kata bantu hitung (counter) bahasa Jepang.';
  }
  return mode.desc;
}

export function getDynamicDefaultModeId(stats: {
  hiraganaPct: number;
  katakanaPct: number;
  kanjiPct?: number;
  wordsPct?: number;
}): string {
  // 1. Default awal jika Hiragana belum 100% -> Hiragana
  if (stats.hiraganaPct < 100) return 'hiragana';
  // 2. Jika Hiragana sudah 100% -> Katakana
  if (stats.katakanaPct < 100) return 'katakana';
  // 3. Jika Katakana sudah 100% -> Kanji
  if (stats.kanjiPct !== undefined && stats.kanjiPct < 100) return 'kanji';
  // 4. Jika Kanji sudah 100% -> Kotoba
  if (stats.wordsPct !== undefined && stats.wordsPct < 100) return 'kotoba';
  // 5. Jika semua sudah 100% -> Daily Practice (atau Hiragana)
  return 'daily';
}
