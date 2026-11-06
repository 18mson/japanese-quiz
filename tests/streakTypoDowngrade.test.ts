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

console.log('=== TEST SUITE: Penurunan 1 Tingkat Saat Typo (Hiragana, Kotoba, & Kanji) - Mahkota Streak 6 ===\n');

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

  // Case 1.1: Hiragana Mahkota (streak 6) -> typo 'ko' (dist 1) -> harus turun ke Hafal (streak 5), bukan 0!
  masteryStore.userStreaks['か'] = 6;
  quizStore.submitAnswer('ko');
  assert(masteryStore.userStreaks['か'] === 5, 'Hiragana Mahkota (streak 6) typo 1 huruf -> streak turun ke 5 (Hafal)');
  assert(quizStore.userAnswers[0].isTypo === true, 'userAnswers mencatat isTypo === true');
  assert(quizStore.userAnswers[0].pointsEarned === 3, 'Jawaban typo mendapat 3 poin');

  // Case 1.2: Hiragana Hafal (streak 5) -> typo 'so' (dist 1) -> streak < 6 tidak berubah (tetap 5)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 1;
  masteryStore.userStreaks['さ'] = 5;
  quizStore.submitAnswer('so');
  assert(masteryStore.userStreaks['さ'] === 5, 'Hiragana Hafal (streak 5) typo 1 huruf -> streak tidak berubah (tetap 5)');

  // Case 1.3: Hiragana Mahkota (streak 6) -> Salah total 'xyz' (bukan typo) -> turun ke Level Proses (streak 2)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 2;
  masteryStore.userStreaks['た'] = 6;
  quizStore.submitAnswer('xyz');
  assert(masteryStore.userStreaks['た'] === 2, 'Hiragana Mahkota (streak 6) salah total (xyz) -> turun ke Level Proses (streak 2)');
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

  // Case 2.1: Kotoba Mahkota (streak 6) -> typo 'watshi' (dist 1) -> turun ke 5 (Hafal)
  masteryStore.userStreaks['わたし'] = 6;
  quizStore.submitAnswer('watshi');
  assert(masteryStore.userStreaks['わたし'] === 5, 'Kotoba Mahkota (streak 6) typo 1 huruf -> streak turun ke 5 (Hafal)');
  assert(quizStore.userAnswers[0].isTypo === true, 'Kotoba isTypo === true');

  // Case 2.2: Kotoba Hafal (streak 5) -> typo 'anat' (dist 1) -> streak < 6 tidak berubah (tetap 5)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 1;
  masteryStore.userStreaks['あなた'] = 5;
  quizStore.submitAnswer('anat');
  assert(masteryStore.userStreaks['あなた'] === 5, 'Kotoba Hafal (streak 5) typo 1 huruf -> streak tidak berubah (tetap 5)');

  // Case 2.3: Kotoba Mahkota (streak 7) -> Salah total 'arigatou' -> turun ke Level Proses (streak 2)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 2;
  masteryStore.userStreaks['せんせい'] = 7;
  quizStore.submitAnswer('arigatou');
  assert(masteryStore.userStreaks['せんせい'] === 2, 'Kotoba Mahkota (streak 7) salah total -> turun ke Level Proses (streak 2)');
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

  // Case 3.1: Kanji Mahkota (streak 6) -> typo 'hii' (dist 1) -> turun ke 5 (Hafal)
  masteryStore.userStreaks['日'] = 6;
  quizStore.submitAnswer('hii');
  assert(masteryStore.userStreaks['日'] === 5, 'Kanji Mahkota (streak 6) typo 1 huruf -> streak turun ke 5 (Hafal)');

  // Case 3.2: Kanji Hafal (streak 5) -> typo 'tsuk' (dist 1) -> streak < 6 tidak berubah (tetap 5)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 1;
  masteryStore.userStreaks['月'] = 5;
  quizStore.submitAnswer('tsuk');
  assert(masteryStore.userStreaks['月'] === 5, 'Kanji Hafal (streak 5) typo 1 huruf -> streak tidak berubah (tetap 5)');

  // Case 3.3: Kanji Mahkota (streak 6) -> salah total 'ki' -> turun ke Level Proses (streak 2)
  quizStore.selectedAnswer = null;
  quizStore.currentQuestionIndex = 2;
  masteryStore.userStreaks['水'] = 6;
  quizStore.submitAnswer('ki');
  assert(masteryStore.userStreaks['水'] === 2, 'Kanji Mahkota (streak 6) salah total -> turun ke Level Proses (streak 2)');
}

// ─────────────────────────────────────────────────────────────
// TEST GROUP 4: Edge Cases (Skip/Empty & Multiple Choice)
// ─────────────────────────────────────────────────────────────
console.log('\n--- 4. EDGE CASES (EMPTY/SKIP & MULTIPLE CHOICE) ---');
{
  setActivePinia(createPinia());
  const quizStore = useQuizStore();
  const masteryStore = useMasteryStore();

  // Case 4.1: Jawaban kosong / skip tidak boleh dianggap typo, streak 6 turun ke Level Proses (streak 2)
  quizStore.selectedMode = 'keyboard_typing';
  quizStore.questionType = 'hiragana';
  quizStore.quizLevel = 'basic';
  quizStore.questions = [
    { character: 'あ', romaji: 'a', kana: 'あ', type: 'basic' }
  ];
  quizStore.currentQuestionIndex = 0;
  masteryStore.userStreaks['あ'] = 6;
  quizStore.submitAnswer('');
  assert(masteryStore.userStreaks['あ'] === 2, 'Skip/jawaban kosong pada huruf 1 karakter (あ) -> turun ke Level Proses (streak 2, bukan typo)');
  assert(quizStore.userAnswers[0].isTypo === false, 'isTypo adalah false untuk input kosong');

  // Case 4.2: Mode Pilihan Ganda (multiple_choice) tidak menerapkan toleransi typo
  quizStore.selectedAnswer = null;
  quizStore.selectedMode = 'multiple_choice';
  quizStore.questions = [
    { character: 'か', romaji: 'ka', kana: 'か', type: 'basic' }
  ];
  quizStore.currentQuestionIndex = 0;
  masteryStore.userStreaks['か'] = 6;
  // Memilih 'ko' pada pilihan ganda
  quizStore.submitAnswer('ko');
  assert(masteryStore.userStreaks['か'] === 2, 'Mode Pilihan Ganda salah pilih -> turun ke Level Proses (streak 2, typo tidak aktif)');
  assert(quizStore.userAnswers[1].isTypo === false, 'isTypo adalah false pada mode pilihan ganda');
}

console.log(`\n========================================`);
console.log(`Hasil Test: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
