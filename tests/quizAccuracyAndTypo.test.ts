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
const { useQuizStore } = await import('../src/stores/quizStore');
const { useMasteryStore } = await import('../src/stores/masteryStore');

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

console.log('=== TEST SUITE: Akurasi Kuis & Scoring Typo 3 Poin ===\n');

// ─────────────────────────────────────────────────────────────
// TEST 1: Sesi 8 Soal dengan 5 Kata Unik (Repetition Weight 2x)
// ─────────────────────────────────────────────────────────────
console.log('--- 1. AKURASI 100% PADA SESI DENGAN REPETISI KATA ---');
{
  setActivePinia(createPinia());
  const quizStore = useQuizStore();

  quizStore.selectedMode = 'keyboard_typing';
  quizStore.questionType = 'words';
  quizStore.quizLevel = 'n5';
  quizStore.initialQuestionCount = 8;
  
  // 5 kata unik terdistribusi ke dalam 8 slot pertanyaan (seperti di screenshot user):
  // 1. terebi, 2. mimasu, 3. gakko, 4. tokyo, 5. gakko (2x), 6. chikatetsu, 7. mimasu (2x), 8. tokyo (2x)
  quizStore.questions = [
    { character: 'テレビ', romaji: ['terebi'], kana: 'テレビ', meaning: 'televisi', type: 'word' },
    { character: '見ます', romaji: ['mimasu'], kana: 'みます', meaning: 'melihat', type: 'word' },
    { character: '学校', romaji: ['gakkou', 'gakko'], kana: 'がっこう', meaning: 'sekolah', type: 'word' },
    { character: '東京', romaji: ['tokyo', 'toukyou'], kana: 'とうきょう', meaning: 'Tokyo', type: 'word' },
    { character: '学校', romaji: ['gakkou', 'gakko'], kana: 'がっこう', meaning: 'sekolah', type: 'word' },
    { character: '地下鉄', romaji: ['chikatetsu'], kana: 'ちかてつ', meaning: 'kereta bawah tanah', type: 'word' },
    { character: '見ます', romaji: ['mimasu'], kana: 'みます', meaning: 'melihat', type: 'word' },
    { character: '東京', romaji: ['tokyo', 'toukyou'], kana: 'とうきょう', meaning: 'Tokyo', type: 'word' }
  ];

  const answers = ['terebi', 'mimasu', 'gakko', 'tokyo', 'gakko', 'chikatetsu', 'mimasu', 'tokyo'];

  for (let i = 0; i < answers.length; i++) {
    quizStore.currentQuestionIndex = i;
    quizStore.selectedAnswer = null;
    quizStore.submitAnswer(answers[i]);
  }

  assert(quizStore.firstTryCorrectCount === 8, `Semua 8 soal terjawab benar (firstTryCorrectCount = ${quizStore.firstTryCorrectCount})`);
  assert(quizStore.finalScore === 100, `Akurasi mencapai 100% (bukan 63%! finalScore = ${quizStore.finalScore}%)`);
  assert(quizStore.questions.length === 8, 'Tidak ada soal perbaikan yang ditambahkan karena semua benar');
}

// ─────────────────────────────────────────────────────────────
// TEST 2: Scoring Typo (3 Poin dan Tanpa Repeat)
// ─────────────────────────────────────────────────────────────
console.log('\n--- 2. SCORING TYPO (3 POIN & DETAIL LIST) ---');
{
  setActivePinia(createPinia());
  const quizStore = useQuizStore();
  const masteryStore = useMasteryStore();

  quizStore.selectedMode = 'keyboard_typing';
  quizStore.questionType = 'words';
  quizStore.quizLevel = 'n5';
  quizStore.initialQuestionCount = 3;

  quizStore.questions = [
    { character: 'テレビ', romaji: ['terebi'], kana: 'テレビ', meaning: 'televisi', type: 'word' },
    { character: '見ます', romaji: ['mimasu'], kana: 'みます', meaning: 'melihat', type: 'word' },
    { character: '地下鉄', romaji: ['chikatetsu'], kana: 'ちかてつ', meaning: 'kereta bawah tanah', type: 'word' }
  ];

  // Soal 1: Typo 1 huruf ('tereb' bukan 'terebi')
  quizStore.currentQuestionIndex = 0;
  quizStore.selectedAnswer = null;
  quizStore.submitAnswer('tereb'); // distance 1 = typo

  const ans1 = quizStore.userAnswers[0];
  assert(ans1.isTypo === true, 'Soal 1 tercatat sebagai typo');
  assert(ans1.pointsEarned === 3, `Soal 1 typo mendapatkan 3 poin (pointsEarned = ${ans1.pointsEarned})`);
  assert(quizStore.score === 3, `Total score bertambah 3 poin (score = ${quizStore.score})`);
  assert(quizStore.questions.length === 3, 'Soal typo tidak di-repeat ke antrian babak perbaikan');

  // Soal 2: Benar murni ('mimasu')
  quizStore.currentQuestionIndex = 1;
  quizStore.selectedAnswer = null;
  quizStore.submitAnswer('mimasu');

  const ans2 = quizStore.userAnswers[1];
  assert(ans2.isCorrect === true, 'Soal 2 tercatat benar');
  assert(ans2.pointsEarned === 4, 'Soal 2 mendapatkan 4 poin');

  // Soal 3: Salah total ('xyz')
  quizStore.currentQuestionIndex = 2;
  quizStore.selectedAnswer = null;
  quizStore.submitAnswer('xyz');

  const ans3 = quizStore.userAnswers[2];
  assert(ans3.isCorrect === false && ans3.isTypo === false, 'Soal 3 salah total');
  assert(ans3.pointsEarned === 0, 'Soal 3 mendapatkan 0 poin');
  assert(quizStore.questions.length === 4, 'Soal salah total di-repeat ke antrian babak perbaikan');

  // Akurasi: 2 benar/typo dari 3 soal awal = 67%
  assert(quizStore.firstTryCorrectCount === 2, `firstTryCorrectCount = 2`);
  assert(quizStore.finalScore === 67, `finalScore = ${quizStore.finalScore}% (Math.round(2/3 * 100))`);
}

console.log(`\n========================================`);
console.log(`Hasil Test: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
