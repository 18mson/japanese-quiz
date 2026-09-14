// Mock import.meta.env and localStorage before importing modules
(import.meta as any).env = {
  VITE_SUPABASE_URL: 'https://dummy.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'dummy_key'
};

const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  length: 0,
  key: () => null
} as any;

global.WebSocket = class {} as any;
(global as any).window = { AudioContext: class { createOscillator() { return { connect() {}, start() {}, stop() {} }; } createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; } destination: {} } } as any;

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

// Case 3: Word 2 (streak 2 / 2x strike) -> must be clicked first
quizStore.nextQuestion();
quizStore.userStreaks['せんせい'] = 2;
quizStore.initQuestionHints();

assert(quizStore.showMeaningHint === false, 'Streak 2: Petunjuk arti tertutup / harus di-click dulu (showMeaningHint === false)');
assert(quizStore.isMeaningHintAutoOpened === false, 'Streak 2: isMeaningHintAutoOpened === false');

// If user does not click hint and answers correctly
quizStore.submitAnswer('sensei');
assert(quizStore.userAnswers[2].hintsUsed === 0, 'Streak 2: hintsUsed is 0 when answer submitted without clicking hint');
assert(quizStore.userAnswers[2].pointsEarned === 4, 'Streak 2: pointsEarned is 4');

// Case 4: Word 3 (streak 3 / >= 2 strike) -> user clicks hint
quizStore.nextQuestion();
quizStore.userStreaks['がくせい'] = 3;
quizStore.initQuestionHints();

assert(quizStore.showMeaningHint === false, 'Streak 3: Petunjuk arti tertutup initially');

// User manually opens hint
quizStore.openMeaningHint();
assert(quizStore.showMeaningHint === true, 'Streak 3: showMeaningHint is now true after openMeaningHint()');
assert(quizStore.isMeaningHintAutoOpened === false, 'Streak 3: isMeaningHintAutoOpened is false (manually opened)');

quizStore.submitAnswer('gakusei');
assert(quizStore.userAnswers[3].hintsUsed === 1, 'Streak 3: hintsUsed is 1 because hint was manually opened');
assert(quizStore.userAnswers[3].pointsEarned === 3, 'Streak 3: pointsEarned is 3 (1 point deduction for manual hint)');

console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
