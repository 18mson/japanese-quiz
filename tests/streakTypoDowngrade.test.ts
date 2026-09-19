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

console.log('=== TEST SUITE: Penurunan 1 Tingkat Saat Typo (Hiragana, Kotoba, & Kanji) ===\n');

// ─────────────────────────────────────────────────────────────
// TEST GROUP 1: Hiragana di Mode Typing
// ─────────────────────────────────────────────────────────────
console.log('--- 1. HIRAGANA TYPING MODE ---');
{
  setActivePinia(createPinia());
  const quizStore = useQuizStore();
  const masteryStore = useMasteryStore();

  quizStore.selectedMode = 'keyboard_typing';
  quizStore.questionType = 'hiragana';
  quizStore.quizLevel = 'basic';
  quizStore.questions = [
    { character: 'か', romaji: 'ka', kana: 'か', type: 'basic' },
    { character: 'さ', romaji: 'sa', kana: 'さ', type: 'basic' },
    { character: 'た', romaji: 'ta', kana: 'た', type: 'basic' }
  ];
  quizStore.currentQuestionIndex = 0;

  // Case 1.1: Hiragana Mahkota (streak 5) -> typo 'ko' (dist 1) -> harus turun ke Hafal (streak 4), bukan 0!
  masteryStore.userStreaks['か'] = 5;
  quizStore.submitAnswer('ko');
  assert(masteryStore.userStreaks['か'] === 4, 'Hiragana Mahkota (streak 5) typo 1 huruf -> streak turun ke 4 (Hafal)');
  assert(quizStore.userAnswers[0].isTypo === true, 'userAnswers mencatat isTypo === true');
  assert(quizStore.userAnswers[0].pointsEarned === 1, 'Jawaban typo mendapat 1 poin');

  // Case 1.2: Hiragana Hafal (streak 3) -> typo 'so' (dist 1) -> harus turun ke Proses (streak 2), bukan 0!
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 1;
  masteryStore.userStreaks['さ'] = 3;
  quizStore.submitAnswer('so');
  assert(masteryStore.userStreaks['さ'] === 2, 'Hiragana Hafal (streak 3) typo 1 huruf -> streak turun ke 2 (Proses)');

  // Case 1.3: Hiragana Mahkota (streak 5) -> Salah total 'xyz' (bukan typo) -> reset ke 0
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 2;
  masteryStore.userStreaks['た'] = 5;
  quizStore.submitAnswer('xyz');
  assert(masteryStore.userStreaks['た'] === 0, 'Hiragana Mahkota (streak 5) salah total (xyz) -> streak reset ke 0');
}

// ─────────────────────────────────────────────────────────────
// TEST GROUP 2: Kotoba (Words) di Mode Typing
// ─────────────────────────────────────────────────────────────
console.log('\n--- 2. KOTOBA (WORDS) TYPING MODE ---');
{
  setActivePinia(createPinia());
  const quizStore = useQuizStore();
  const masteryStore = useMasteryStore();

  quizStore.selectedMode = 'sentence_typing';
  quizStore.questionType = 'words';
  quizStore.quizLevel = 'n5';
  quizStore.questions = [
    { character: 'わたし', romaji: 'watashi', kana: 'わたし', meaning: 'saya', type: 'word' },
    { character: 'あなた', romaji: 'anata', kana: 'あなた', meaning: 'kamu', type: 'word' },
    { character: 'せんせい', romaji: 'sensei', kana: 'せんせい', meaning: 'guru', type: 'word' }
  ];
  quizStore.currentQuestionIndex = 0;

  // Case 2.1: Kotoba Mahkota (streak 5) -> typo 'watshi' (dist 1) -> turun ke 4 (Hafal)
  masteryStore.userStreaks['わたし'] = 5;
  quizStore.submitAnswer('watshi');
  assert(masteryStore.userStreaks['わたし'] === 4, 'Kotoba Mahkota (streak 5) typo 1 huruf -> streak turun ke 4 (Hafal)');
  assert(quizStore.userAnswers[0].isTypo === true, 'Kotoba isTypo === true');

  // Case 2.2: Kotoba Hafal (streak 4) -> typo 'anat' (dist 1) -> turun ke 2 (Proses)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 1;
  masteryStore.userStreaks['あなた'] = 4;
  quizStore.submitAnswer('anat');
  assert(masteryStore.userStreaks['あなた'] === 2, 'Kotoba Hafal (streak 4) typo 1 huruf -> streak turun ke 2 (Proses)');

  // Case 2.3: Kotoba Mahkota (streak 6) -> Salah total 'arigatou' -> reset ke 0
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 2;
  masteryStore.userStreaks['せんせい'] = 6;
  quizStore.submitAnswer('arigatou');
  assert(masteryStore.userStreaks['せんせい'] === 0, 'Kotoba Mahkota (streak 6) salah total -> streak reset ke 0');
}

// ─────────────────────────────────────────────────────────────
// TEST GROUP 3: Kanji di Mode Typing
// ─────────────────────────────────────────────────────────────
console.log('\n--- 3. KANJI TYPING MODE ---');
{
  setActivePinia(createPinia());
  const quizStore = useQuizStore();
  const masteryStore = useMasteryStore();

  quizStore.selectedMode = 'keyboard_typing';
  quizStore.questionType = 'kanji';
  quizStore.quizLevel = 'n5';
  quizStore.questions = [
    { character: '日', romaji: 'hi', kana: 'ひ', meaning: 'matahari', type: 'kanji' },
    { character: '月', romaji: 'tsuki', kana: 'つき', meaning: 'bulan', type: 'kanji' },
    { character: '水', romaji: 'mizu', kana: 'みず', meaning: 'air', type: 'kanji' }
  ];
  quizStore.currentQuestionIndex = 0;

  // Case 3.1: Kanji Mahkota (streak 5) -> typo 'hii' (dist 1) -> turun ke 4 (Hafal)
  masteryStore.userStreaks['日'] = 5;
  quizStore.submitAnswer('hii');
  assert(masteryStore.userStreaks['日'] === 4, 'Kanji Mahkota (streak 5) typo 1 huruf -> streak turun ke 4 (Hafal)');

  // Case 3.2: Kanji Hafal (streak 3) -> typo 'tuki' -> wait 'tuki' is correct variant for tsuki, let's use 'tuki2' or 'tsuk' (dist 1)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 1;
  masteryStore.userStreaks['月'] = 3;
  quizStore.submitAnswer('tsuk');
  assert(masteryStore.userStreaks['月'] === 2, 'Kanji Hafal (streak 3) typo 1 huruf -> streak turun ke 2 (Proses)');

  // Case 3.3: Kanji Mahkota (streak 5) -> salah total 'ki' -> reset ke 0
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 2;
  masteryStore.userStreaks['水'] = 5;
  quizStore.submitAnswer('ki');
  assert(masteryStore.userStreaks['水'] === 0, 'Kanji Mahkota (streak 5) salah total -> streak reset ke 0');
}

// ─────────────────────────────────────────────────────────────
// TEST GROUP 4: Edge Cases (Skip/Empty & Multiple Choice)
// ─────────────────────────────────────────────────────────────
console.log('\n--- 4. EDGE CASES (EMPTY/SKIP & MULTIPLE CHOICE) ---');
{
  setActivePinia(createPinia());
  const quizStore = useQuizStore();
  const masteryStore = useMasteryStore();

  // Case 4.1: Jawaban kosong / skip tidak boleh dianggap typo
  quizStore.selectedMode = 'keyboard_typing';
  quizStore.questionType = 'hiragana';
  quizStore.quizLevel = 'basic';
  quizStore.questions = [
    { character: 'あ', romaji: 'a', kana: 'あ', type: 'basic' }
  ];
  quizStore.currentQuestionIndex = 0;
  masteryStore.userStreaks['あ'] = 5;
  quizStore.submitAnswer('');
  assert(masteryStore.userStreaks['あ'] === 0, 'Skip/jawaban kosong pada huruf 1 karakter (あ) -> reset ke 0 (bukan typo)');
  assert(quizStore.userAnswers[0].isTypo === false, 'isTypo adalah false untuk input kosong');

  // Case 4.2: Mode Pilihan Ganda (multiple_choice) tidak menerapkan toleransi typo
  quizStore.selectedAnswer = null;
  quizStore.selectedMode = 'multiple_choice';
  quizStore.questions = [
    { character: 'か', romaji: 'ka', kana: 'か', type: 'basic' }
  ];
  quizStore.currentQuestionIndex = 0;
  masteryStore.userStreaks['か'] = 5;
  // Memilih 'ko' pada pilihan ganda
  quizStore.submitAnswer('ko');
  assert(masteryStore.userStreaks['か'] === 0, 'Mode Pilihan Ganda salah pilih -> reset ke 0 (typo tidak aktif)');
  assert(quizStore.userAnswers[1].isTypo === false, 'isTypo adalah false pada mode pilihan ganda');
}

console.log(`\n========================================`);
console.log(`Hasil Test: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
