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
  } 
} as any;

import { setActivePinia, createPinia } from 'pinia';
import { checkIsCorrect, checkIsTypo } from '../src/utils/quizHelpers';

let passCount = 0;
let failCount = 0;

const assert = (condition: boolean, msg: string) => {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failCount++;
  }
};

console.log('=== TEST SUITE: Multi-Variant Romaji & Streak Progression (中国 / Chuugoku / Chugoku) ===\n');

// ─────────────────────────────────────────────────────────────
// TEST 1: checkIsTypo must NOT flag valid variants as typo
// ─────────────────────────────────────────────────────────────
console.log('--- 1. checkIsTypo Function Verification ---');
{
  const target = ['chuugoku', 'chugoku'];

  // Valid variant 1: 'chugoku'
  assert(checkIsCorrect('chugoku', target) === true, "'chugoku' is correct for ['chuugoku', 'chugoku']");
  assert(checkIsTypo('chugoku', target) === false, "'chugoku' is NOT a typo (was previously bugged as true!)");

  // Valid variant 2: 'chuugoku'
  assert(checkIsCorrect('chuugoku', target) === true, "'chuugoku' is correct for ['chuugoku', 'chugoku']");
  assert(checkIsTypo('chuugoku', target) === false, "'chuugoku' is NOT a typo");

  // Actual typo: 'chugok' (missing 1 letter)
  assert(checkIsCorrect('chugok', target) === false, "'chugok' is not correct");
  assert(checkIsTypo('chugok', target) === true, "'chugok' is recognized as a typo");

  // Completely wrong: 'cina'
  assert(checkIsCorrect('cina', target) === false, "'cina' is not correct romaji");
  assert(checkIsTypo('cina', target) === false, "'cina' is not a typo (distance > 1)");
}

// ─────────────────────────────────────────────────────────────
// TEST 2: Streak Progression in QuizStore for '中国'
// ─────────────────────────────────────────────────────────────
console.log('\n--- 2. QuizStore & MasteryStore Streak Progression for 中国 ---');
{
  setActivePinia(createPinia());
  const { useQuizStore } = await import('../src/stores/quizStore');
  const { useMasteryStore } = await import('../src/stores/masteryStore');

  const quizStore = useQuizStore();
  const masteryStore = useMasteryStore();

  quizStore.selectedMode = 'keyboard_typing';
  quizStore.questionType = 'words';
  quizStore.quizLevel = 'n5';
  quizStore.initialQuestionCount = 1;
  quizStore.questions = [
    { character: '中国', kana: 'ちゅうごく', romaji: ['chuugoku', 'chugoku'], meaning: 'Cina', type: 'word', lesson: 'Pelajaran 1' }
  ];

  // Initial streak is 0 ('new' tier / belum dipelajari)
  masteryStore.userStreaks['中国'] = 0;
  quizStore.currentQuestionIndex = 0;
  quizStore.selectedAnswer = null;

  // Player types 'chugoku'
  quizStore.submitAnswer('chugoku');

  const ans = quizStore.userAnswers[0];
  assert(ans.isCorrect === true, 'Jawaban tercatat benar');
  assert(ans.isTypo === false, 'Jawaban TIDAK tercatat sebagai typo');
  assert(ans.pointsEarned === 4, 'Mendapatkan 4 poin penuh (bukan 3 poin typo)');
  assert(masteryStore.userStreaks['中国'] === 1, `Streak naik dari 0 ke 1! (streak = ${masteryStore.userStreaks['中国']})`);
  assert(masteryStore.getMasteryTier('中国') === 'learning', "Tier berubah dari 'new' (belum) ke 'learning' (sedang dipelajari)");
}

console.log(`\n========================================`);
console.log(`Hasil Test: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
