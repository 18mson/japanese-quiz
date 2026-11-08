// tests/skipKotobaMastery.test.ts
import test, { before } from 'node:test';
import assert from 'node:assert/strict';

// Setup global mocks for Node environment
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class MockWebSocket {};
}

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

let createPinia: typeof import('pinia').createPinia;
let setActivePinia: typeof import('pinia').setActivePinia;
let useMasteryStore: typeof import('../src/stores/masteryStore').useMasteryStore;
let useLessonStore: typeof import('../src/stores/lessonStore').useLessonStore;
let prepareStandardQuestions: typeof import('../src/utils/quizSessionBuilder').prepareStandardQuestions;
let prepareWeakItemsQuestions: typeof import('../src/utils/quizSessionBuilder').prepareWeakItemsQuestions;
let wordsData: typeof import('../src/data/words').wordsData;

before(async () => {
  const pinia = await import('pinia');
  createPinia = pinia.createPinia;
  setActivePinia = pinia.setActivePinia;

  const masteryStoreModule = await import('../src/stores/masteryStore');
  useMasteryStore = masteryStoreModule.useMasteryStore;

  const lessonStoreModule = await import('../src/stores/lessonStore');
  useLessonStore = lessonStoreModule.useLessonStore;

  const quizSessionBuilderModule = await import('../src/utils/quizSessionBuilder');
  prepareStandardQuestions = quizSessionBuilderModule.prepareStandardQuestions;
  prepareWeakItemsQuestions = quizSessionBuilderModule.prepareWeakItemsQuestions;

  const wordsModule = await import('../src/data/words');
  wordsData = wordsModule.wordsData;
});

test('1. Mastery store can toggle and bulk set skipped words with local persistence', async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const masteryStore = useMasteryStore();

  const testWord = 'わたし';
  assert.strictEqual(masteryStore.isWordSkipped(testWord), false);

  // Toggle on
  const toggled = masteryStore.toggleSkipWord(testWord);
  assert.strictEqual(toggled, true);
  assert.strictEqual(masteryStore.isWordSkipped(testWord), true);

  // Toggle off
  const toggledOff = masteryStore.toggleSkipWord(testWord);
  assert.strictEqual(toggledOff, false);
  assert.strictEqual(masteryStore.isWordSkipped(testWord), false);

  // Bulk set
  await masteryStore.bulkSetSkipWords(['わたし', 'あなた', 'あのひと'], true);
  assert.strictEqual(masteryStore.isWordSkipped('わたし'), true);
  assert.strictEqual(masteryStore.isWordSkipped('あなた'), true);
  assert.strictEqual(masteryStore.isWordSkipped('あのひと'), true);

  // Bulk unset
  await masteryStore.bulkSetSkipWords(['わたし', 'あなた'], false);
  assert.strictEqual(masteryStore.isWordSkipped('わたし'), false);
  assert.strictEqual(masteryStore.isWordSkipped('あなた'), false);
  assert.strictEqual(masteryStore.isWordSkipped('あのひと'), true);
});

test('2. Skipped words reduce total target in wordsMasteryStats and overallMasteryStats', async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const masteryStore = useMasteryStore();

  const initialWordsTotal = masteryStore.wordsMasteryStats.total;
  const initialOverallTotal = masteryStore.overallMasteryStats.total;
  assert.strictEqual(initialWordsTotal, wordsData.length);

  // Skip 2 words
  await masteryStore.bulkSetSkipWords(['わたし', 'あなた'], true);

  // Active total should decrease by 2
  assert.strictEqual(masteryStore.wordsMasteryStats.total, initialWordsTotal - 2);
  assert.strictEqual(masteryStore.overallMasteryStats.total, initialOverallTotal - 2);
});

test('3. Skipped words do NOT appear in standard word quiz question pools or wave preview', async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const masteryStore = useMasteryStore();

  const lesson1Words = wordsData.filter(w => w.lesson === 'Pelajaran 1');
  assert.ok(lesson1Words.length > 0);
  const skippedWord = lesson1Words[0].character;

  await masteryStore.bulkSetSkipWords([skippedWord], true);

  const res = await prepareStandardQuestions({
    targetDuration: 1,
    type: 'words',
    level: 'n5',
    selectedKanaCategory: 'all',
    selectedKanjiLessonNumber: 1,
    activeKanjiLessonNumber: 1,
    selectedWordLessonNumber: 1,
    getMasteryStreak: masteryStore.getMasteryStreak,
    userStreaks: masteryStore.userStreaks,
    introducedChars: masteryStore.introducedChars,
    currentLessonNumber: 1,
    isWordSkipped: masteryStore.isWordSkipped
  });

  const containsSkippedInQuestions = res.questions.some(q => q.character === skippedWord);
  assert.strictEqual(containsSkippedInQuestions, false, 'Skipped word must not be in questions');

  const containsSkippedInWave = res.currentWaveItems.some(item => item.character === skippedWord);
  assert.strictEqual(containsSkippedInWave, false, 'Skipped word must not be in wave preview');
});

test('4. Skipped words do NOT appear in weak items quiz for words', async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const masteryStore = useMasteryStore();

  const skippedWord = 'わたし';
  await masteryStore.bulkSetSkipWords([skippedWord], true);

  const res = await prepareWeakItemsQuestions({
    targetDuration: 1,
    type: 'words',
    level: 'n5',
    selectedKanaCategory: 'all',
    getMasteryStreak: masteryStore.getMasteryStreak,
    introducedChars: masteryStore.introducedChars,
    currentLessonNumber: 1,
    isWordSkipped: masteryStore.isWordSkipped
  });

  const containsSkipped = res.questions.some(q => q.character === skippedWord);
  assert.strictEqual(containsSkipped, false, 'Skipped word must not be in weak items questions');
});

test('5. Skipped words do NOT hinder lesson checklist completion', async () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const masteryStore = useMasteryStore();
  const lessonStore = useLessonStore();

  const lesson1Words = wordsData.filter(w => w.lesson === 'Pelajaran 1');
  assert.ok(lesson1Words.length > 0);

  // Leave streak at 0 for all words -> initially vocab is NOT completed
  assert.strictEqual(lessonStore.isCategoryCompleted(1, 'vocab'), false);

  // Introduce / learn all except 1 word
  const remainingWord = lesson1Words[0].character;
  for (let i = 1; i < lesson1Words.length; i++) {
    masteryStore.introducedChars[lesson1Words[i].character] = true;
  }

  // Since remainingWord is not learned, vocab is still false
  assert.strictEqual(lessonStore.isCategoryCompleted(1, 'vocab'), false);

  // Now SKIP the remainingWord!
  await masteryStore.bulkSetSkipWords([remainingWord], true);

  // Vocab should now automatically be completed!
  assert.strictEqual(lessonStore.isCategoryCompleted(1, 'vocab'), true, 'Skipping remaining unlearned word must satisfy completion');
});

