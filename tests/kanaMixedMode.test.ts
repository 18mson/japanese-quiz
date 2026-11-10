// Mock import.meta.env and localStorage before importing modules
(import.meta as any).env = {
  VITE_SUPABASE_URL: 'https://dummy.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'dummy_key'
};

const mockStorage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  length: 0,
  key: () => null
} as any;

(globalThis as any).WebSocket = class {} as any;
const mockGain = {
  setValueAtTime() {},
  exponentialRampToValueAtTime() {}
};
(globalThis as any).window = { 
  AudioContext: class { 
    currentTime = 0;
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: mockGain }; } 
    createGain() { return { connect() {}, gain: mockGain }; } 
    destination = {};
  },
  innerWidth: 375
} as any;

import test from 'node:test';
import assert from 'node:assert';
import { setActivePinia, createPinia } from 'pinia';
import { buildHurufSessionQuestions } from '../src/utils/hurufQuizComposition';
import { hiraganaData } from '../src/data/hiragana';
import { katakanaData } from '../src/data/katakana';
import { modesList, getModeDescription } from '../src/components/start/modesConfig';
import { useQuizStore } from '../src/stores/quizStore';

test('Mode Hiragana & Katakana Gabungan (kana_mixed) Khusus Mobile App', async (t) => {
  await t.test('1. Deskripsi mode Hiragana dan Katakana dibuat umum', () => {
    const hiraganaMode = modesList.find(m => m.id === 'hiragana')!;
    const katakanaMode = modesList.find(m => m.id === 'katakana')!;

    assert.ok(hiraganaMode, 'Mode hiragana harus ada');
    assert.ok(katakanaMode, 'Mode katakana harus ada');

    const descHira = getModeDescription(hiraganaMode, 'multiple_choice', 'angka');
    const descKata = getModeDescription(katakanaMode, 'multiple_choice', 'angka');

    assert.ok(descHira.includes('pilihan ganda') && descHira.includes('ketik') && descHira.includes('goresan'), 'Deskripsi hiragana mencakup latihan variasi umum');
    assert.ok(descKata.includes('pilihan ganda') && descKata.includes('ketik') && descKata.includes('goresan'), 'Deskripsi katakana mencakup latihan variasi umum');
  });

  await t.test('2. buildHurufSessionQuestions dengan sessionMode "kana_mixed" menghasilkan variasi questionMode', () => {
    const questions = buildHurufSessionQuestions(
      hiraganaData,
      12,
      () => 0,
      {},
      'kana_mixed'
    );

    assert.strictEqual(questions.length, 12, 'Harus menghasilkan 12 soal');

    const modes = questions.map(q => q.questionMode);
    const hasMultipleChoice = modes.includes('multiple_choice');
    const hasKeyboardTyping = modes.includes('keyboard_typing');
    const hasWriting = modes.includes('writing');

    assert.ok(hasMultipleChoice, 'Harus ada soal multiple_choice (Pilihan Ganda)');
    assert.ok(hasKeyboardTyping, 'Harus ada soal keyboard_typing (Ketik Kana)');
    assert.ok(hasWriting, 'Harus ada soal writing (Tulis Huruf)');
  });

  await t.test('3. buildHurufSessionQuestions untuk Katakana juga menghasilkan variasi questionMode', () => {
    const questions = buildHurufSessionQuestions(
      katakanaData,
      12,
      () => 0,
      {},
      'kana_mixed'
    );

    assert.strictEqual(questions.length, 12, 'Harus menghasilkan 12 soal');

    const modes = new Set(questions.map(q => q.questionMode));
    assert.ok(modes.has('multiple_choice'), 'Harus ada soal multiple_choice');
    assert.ok(modes.has('keyboard_typing'), 'Harus ada soal keyboard_typing');
    assert.ok(modes.has('writing'), 'Harus ada soal writing');
  });

  await t.test('4. quizStore dengan selectedMode "kana_mixed" menyesuaikan activeQuestionMode & isTypingMode per soal', () => {
    setActivePinia(createPinia());
    const store = useQuizStore();

    store.selectedMode = 'kana_mixed';
    store.questions = [
      { character: 'あ', romaji: 'a', questionMode: 'multiple_choice' },
      { character: 'い', romaji: 'i', questionMode: 'keyboard_typing' },
      { character: 'う', romaji: 'u', questionMode: 'writing' }
    ];

    // Soal 1: multiple_choice
    store.currentQuestionIndex = 0;
    assert.strictEqual(store.activeQuestionMode, 'multiple_choice');
    assert.strictEqual(store.isTypingMode, false);

    // Soal 2: keyboard_typing
    store.currentQuestionIndex = 1;
    assert.strictEqual(store.activeQuestionMode, 'keyboard_typing');
    assert.strictEqual(store.isTypingMode, true);

    // Soal 3: writing
    store.currentQuestionIndex = 2;
    assert.strictEqual(store.activeQuestionMode, 'writing');
    assert.strictEqual(store.isTypingMode, false);
  });
});
