// src/components/start/modesConfig.ts
import type { Component } from 'vue';
import { 
  Layers, Keyboard, PenTool, BookOpen, Calculator, Swords 
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
    discGradient: 'from-indigo-500 via-indigo-600 to-violet-600',
    discShadow: 'shadow-indigo-500/25',
    discPulse: 'bg-indigo-400',
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
    discGradient: 'from-blue-500 via-indigo-600 to-indigo-700',
    discShadow: 'shadow-blue-500/25',
    discPulse: 'bg-blue-400',
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
    discGradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    discShadow: 'shadow-emerald-500/25',
    discPulse: 'bg-emerald-400',
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
    discGradient: 'from-violet-500 via-purple-600 to-indigo-600',
    discShadow: 'shadow-violet-500/25',
    discPulse: 'bg-violet-400',
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
    discGradient: 'from-amber-500 via-orange-600 to-rose-600',
    discShadow: 'shadow-amber-500/25',
    discPulse: 'bg-amber-400',
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
    discGradient: 'from-red-500 via-rose-500 to-amber-600',
    discShadow: 'shadow-rose-500/25',
    discPulse: 'bg-rose-500',
  },
];

export function getModeDescription(mode: QuizModeDef, characterType: string, hitunganTab: string): string {
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
