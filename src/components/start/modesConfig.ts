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
    id: 'multiple_choice',
    title: 'Pilihan Ganda',
    levelTag: 'Dasar',
    level: 'basic',
    defaultType: 'hiragana',
    desc: 'Latihan pilihan ganda huruf Kana (Hiragana, Katakana, Mix Kana) secara cepat & interaktif.',
    subTypes: [
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'katakana', label: 'Katakana' },
      { key: 'mix', label: 'Mix Kana' },
    ],
    icon: Layers,
    discGradient: 'from-aizome via-slate-800 to-aizome-hover dark:from-torii dark:via-rose-600 dark:to-amber-700',
    discShadow: 'shadow-aizome/25 dark:shadow-torii/25',
    discPulse: 'bg-aizome-light dark:bg-torii',
  },
  {
    id: 'keyboard_typing',
    title: 'Ketik Kana',
    levelTag: 'Mengetik',
    level: 'n5',
    defaultType: 'hiragana',
    desc: 'Ketik huruf Kana (Hiragana, Katakana, Mix Kana) dengan keyboard presisi.',
    subTypes: [
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'katakana', label: 'Katakana' },
      { key: 'mix', label: 'Mix Kana' },
    ],
    icon: Keyboard,
    discGradient: 'from-slate-800 via-aizome to-slate-900 dark:from-rose-600 dark:via-torii dark:to-orange-600',
    discShadow: 'shadow-aizome/25 dark:shadow-torii/25',
    discPulse: 'bg-aizome-light dark:bg-torii',
  },
  {
    id: 'writing',
    title: 'Tulis Huruf',
    levelTag: 'Goresan',
    level: 'basic',
    defaultType: 'hiragana',
    desc: 'Latihan menggambar langsung huruf Kana dan Kanji N5 dengan urutan goresan di layar.',
    subTypes: [
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'katakana', label: 'Katakana' },
      { key: 'mix', label: 'Mix Kana' },
      { key: 'kanji', label: 'Kanji N5' },
    ],
    icon: PenTool,
    discGradient: 'from-matcha-dark via-matcha to-emerald-700',
    discShadow: 'shadow-matcha/25',
    discPulse: 'bg-matcha',
  },
  {
    id: 'sentence_typing',
    title: 'Kotoba & Pola',
    levelTag: 'N5 Menengah',
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
    id: 'hitungan',
    title: 'Hitungan (数字)',
    levelTag: 'Angka & Counter',
    level: 'basic',
    defaultType: 'angka',
    desc: 'Latihan angka dan kata bantu hitung (counter) bahasa Jepang dengan sistem wave bertahap dan mode bolak-balik.',
    subTypes: [
      { key: 'angka', label: 'Angka' },
      { key: 'counter', label: 'Counter' },
      { key: 'campuran', label: 'Campuran' },
    ],
    icon: Calculator,
    discGradient: 'from-matcha via-emerald-600 to-teal-700',
    discShadow: 'shadow-matcha/25',
    discPulse: 'bg-matcha',
  },
  {
    id: 'battleground',
    title: 'Duel Online',
    levelTag: 'Multiplayer',
    level: 'battleground',
    defaultType: 'battleground',
    desc: 'Bermain online multiplayer realtime (2–8 Pemain). Pilih mode Adu Ketik atau Quiz Blitz.',
    subTypes: [
      { key: 'quiz_blitz', label: 'Quiz Blitz' },
      { key: 'battleground', label: 'Adu Ketik' },
    ],
    icon: Swords,
    discGradient: 'from-rose-700 via-red-600 to-slate-900 dark:from-torii dark:via-rose-600 dark:to-red-700',
    discShadow: 'shadow-torii/30',
    discPulse: 'bg-torii',
  },
];

export function getModeDescription(mode: QuizModeDef, characterType: string, hitunganTab: string): string {
  if (mode.id === 'daily') {
    return 'Latihan 5–10 kalimat acak harian dengan input suara & ketik.';
  }
  if (mode.id === 'sentence_typing') {
    if (characterType === 'words') return 'Latihan mengetik kosakata berhuruf Kanji';
    if (characterType === 'renshuu') return 'Latihan pola kalimat — substitusi, drill gambar, dan role-play';
    if (characterType === 'kaiwa') return 'Latihan mengetik dialog percakapan situasional N5';
  } else if (mode.id === 'hitungan') {
    if (hitunganTab === 'angka') return 'Latihan angka dasar 1-10, puluhan, ratusan, dan ribuan bertahap.';
    if (hitunganTab === 'counter') return 'Latihan kata bantu hitung (counter) seperti 本, 杯, 匹, 個, dll.';
    if (hitunganTab === 'campuran') return 'Review gabungan dari seluruh wave yang sudah dipelajari polanya.';
  }
  return mode.desc;
}
