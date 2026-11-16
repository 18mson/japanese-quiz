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

setActivePinia(createPinia());
const quizStore = useQuizStore();

console.log('=== TEST: Mode Typing Kotoba Hint Behavior ===');

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

// Setup Kotoba questions with varying streaks
quizStore.questionType = 'words';
quizStore.quizLevel = 'n5';
quizStore.questions = [
  { character: 'わたし', romaji: 'watashi', kana: 'わたし', meaning: 'saya', type: 'word' },
  { character: 'あなた', romaji: 'anata', kana: 'あなた', meaning: 'kamu', type: 'word' },
  { character: 'せんせい', romaji: 'sensei', kana: 'せんせい', meaning: 'guru', type: 'word' },
  { character: 'がくせい', romaji: 'gakusei', kana: 'gakusei', meaning: 'siswa', type: 'word' },
];
quizStore.initialQuestionCount = 4;
quizStore.currentQuestionIndex = 0;

// Case 1: Word 0 (streak 0 / belum)
quizStore.userStreaks['わたし'] = 0;
quizStore.initQuestionHints();

assert(quizStore.showMeaningHint === true, 'Streak 0: Petunjuk arti langsung terbuka (showMeaningHint === true)');
assert(quizStore.isMeaningHintAutoOpened === true, 'Streak 0: isMeaningHintAutoOpened === true');

// Submitting without manual hint clicks should not penalize score
quizStore.submitAnswer('watashi');
assert(quizStore.userAnswers[0].hintsUsed === 0, 'Streak 0: hintsUsed is 0 because auto-opened meaning hint is not penalized');
assert(quizStore.userAnswers[0].pointsEarned === 4, 'Streak 0: pointsEarned is 4 (full points)');

// Case 2: Word 1 (streak 1 / 1 strike)
quizStore.nextQuestion();
quizStore.userStreaks['あなた'] = 1;
quizStore.initQuestionHints();

assert(quizStore.showMeaningHint === true, 'Streak 1: Petunjuk arti langsung terbuka (showMeaningHint === true)');
assert(quizStore.isMeaningHintAutoOpened === true, 'Streak 1: isMeaningHintAutoOpened === true');

quizStore.submitAnswer('anata');
assert(quizStore.userAnswers[1].hintsUsed === 0, 'Streak 1: hintsUsed is 0');
assert(quizStore.userAnswers[1].pointsEarned === 4, 'Streak 1: pointsEarned is 4');

// Case 3: Word 2 (streak 2 / Proses) -> Kata 'Proses' jika ada 2 hints, hint paling kanan selalu terbuka
quizStore.nextQuestion();
quizStore.userStreaks['せんせい'] = 2;
quizStore.initQuestionHints();

assert(quizStore.showMeaningHint === true, 'Streak 2 (Proses): Petunjuk arti langsung terbuka (showMeaningHint === true)');
assert(quizStore.isMeaningHintAutoOpened === true, 'Streak 2 (Proses): isMeaningHintAutoOpened === true');

quizStore.submitAnswer('sensei');
assert(quizStore.userAnswers[2].hintsUsed === 0, 'Streak 2: hintsUsed is 0 because auto-opened');
assert(quizStore.userAnswers[2].pointsEarned === 4, 'Streak 2: pointsEarned is 4 (full points)');

// Case 4: Word 3 (streak 3 / Kuasai) -> Petunjuk arti tertutup initially
quizStore.nextQuestion();
quizStore.userStreaks['がくせい'] = 3;
quizStore.initQuestionHints();

assert(quizStore.showMeaningHint === false, 'Streak 3 (Kuasai): Petunjuk arti tertutup initially');

// User manually opens hint
quizStore.openMeaningHint();
assert(quizStore.showMeaningHint === true, 'Streak 3: showMeaningHint is now true after openMeaningHint()');
assert(quizStore.isMeaningHintAutoOpened === false, 'Streak 3: isMeaningHintAutoOpened is false (manually opened)');

quizStore.submitAnswer('gakusei');
assert(quizStore.userAnswers[3].hintsUsed === 1, 'Streak 3: hintsUsed is 1 because hint was manually opened');
assert(quizStore.userAnswers[3].pointsEarned === 3, 'Streak 3: pointsEarned is 3 (1 point deduction for manual hint)');

// Case 5: Mode meaning_to_words (Indonesia -> Jepang)
// Ada 2 hints: Dengar Pelafalan (kiri) dan Petunjuk Huruf (kanan).
// Untuk kata 'Baru Mulai' atau 'Proses', hint paling kanan (Petunjuk Huruf) selalu terbuka otomatis!
quizStore.selectedAnswer = null;
quizStore.questions = [
  { character: 'すてます', romaji: 'sutemasu', kana: 'すてます', meaning: 'membuang', type: 'word', questionType: 'meaning_to_words' }
];
quizStore.currentQuestionIndex = 0;
quizStore.userStreaks['すてます'] = 1; // Proses
quizStore.initQuestionHints();

assert(quizStore.showReadingHint === true, 'meaning_to_words (Proses): Hint paling kanan (Petunjuk Huruf) selalu otomatis terbuka');
assert(quizStore.isReadingHintAutoOpened === true, 'meaning_to_words (Proses): isReadingHintAutoOpened === true');

quizStore.submitAnswer('すてます');
const lastAnswer = quizStore.userAnswers[quizStore.userAnswers.length - 1];
assert(lastAnswer?.hintsUsed === 0, 'meaning_to_words: hintsUsed is 0 when auto-opened');
assert(lastAnswer?.pointsEarned === 4, 'meaning_to_words: full points 4');

// Case 6: Mode words_meaning (Jepang -> Indonesia)
// Hanya ada 1 hint (Reading Hint). Sesuai aturan "kecuali hanya ada 1 hints di konversi apapun", hint tetap tertutup!
quizStore.selectedAnswer = null;
quizStore.questions = [
  { character: '病院', romaji: 'byouin', kana: 'びょういん', meaning: 'rumah sakit', type: 'word', questionType: 'words_meaning' }
];
quizStore.currentQuestionIndex = 0;
quizStore.userStreaks['病院'] = 0; // Baru Mulai
quizStore.initQuestionHints();

assert(quizStore.showReadingHint === false, 'words_meaning: Hanya 1 hint, sehingga tetap tertutup (showReadingHint === false)');
assert(quizStore.showMeaningHint === false, 'words_meaning: Petunjuk arti tidak ada (showMeaningHint === false)');

console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
