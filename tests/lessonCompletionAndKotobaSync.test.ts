// tests/lessonCompletionAndKotobaSync.test.ts
import test, { before } from 'node:test';
import assert from 'node:assert/strict';

// Setup global mocks for Node environment before module evaluation
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
let useLessonStore: typeof import('../src/stores/lessonStore').useLessonStore;
let prepareStandardQuestions: typeof import('../src/utils/quizSessionBuilder').prepareStandardQuestions;
let getLessonChapterData: typeof import('../src/data/lessonGrammarBook').getLessonChapterData;

before(async () => {
  const pinia = await import('pinia');
  createPinia = pinia.createPinia;
  setActivePinia = pinia.setActivePinia;

  const lessonStoreModule = await import('../src/stores/lessonStore');
  useLessonStore = lessonStoreModule.useLessonStore;

  const quizSessionBuilderModule = await import('../src/utils/quizSessionBuilder');
  prepareStandardQuestions = quizSessionBuilderModule.prepareStandardQuestions;

  const lessonGrammarBookModule = await import('../src/data/lessonGrammarBook');
  getLessonChapterData = lessonGrammarBookModule.getLessonChapterData;
});

test('1. Category completion toggle and persistence in lessonStore', () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const lessonStore = useLessonStore();

  // Initial state should be false
  assert.strictEqual(lessonStore.isCategoryCompleted(1, 'bunkei'), false);

  // Toggle on
  const resOn = lessonStore.toggleCategoryCompletion(1, 'bunkei');
  assert.strictEqual(resOn, true);
  assert.strictEqual(lessonStore.isCategoryCompleted(1, 'bunkei'), true);

  // Toggle off
  const resOff = lessonStore.toggleCategoryCompletion(1, 'bunkei');
  assert.strictEqual(resOff, false);
  assert.strictEqual(lessonStore.isCategoryCompleted(1, 'bunkei'), false);
});

test('2. Chapter completion detection and stats', () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const lessonStore = useLessonStore();

  const chapter1 = getLessonChapterData(1)!;
  assert.ok(chapter1, 'Chapter 1 must exist');

  // Initially chapter 1 is not fully completed
  assert.strictEqual(lessonStore.isChapterFullyCompleted(1), false);
  const initialStats = lessonStore.getChapterCompletedStats(1);
  assert.strictEqual(initialStats.completed, 0);
  assert.ok(initialStats.total > 0);

  // Mark all applicable categories as completed
  lessonStore.setCategoryCompleted(1, 'bunkei', true);
  lessonStore.setCategoryCompleted(1, 'particles', true);
  lessonStore.setCategoryCompleted(1, 'vocab', true);
  lessonStore.setCategoryCompleted(1, 'phrases', true);
  lessonStore.setCategoryCompleted(1, 'tables', true);

  // Now chapter 1 should be fully completed
  assert.strictEqual(lessonStore.isChapterFullyCompleted(1), true);
  const updatedStats = lessonStore.getChapterCompletedStats(1);
  assert.strictEqual(updatedStats.completed, updatedStats.total);
  assert.strictEqual(updatedStats.isFullyCompleted, true);
});

test('3. Smart Auto-Next: getFirstUncompletedLessonNumber() progression', () => {
  setActivePinia(createPinia());
  localStorage.clear();
  const lessonStore = useLessonStore();

  // Initially all chapters are uncompleted -> returns 1
  assert.strictEqual(lessonStore.getFirstUncompletedLessonNumber(), 1);

  // Mark chapter 1 completed
  lessonStore.setCategoryCompleted(1, 'bunkei', true);
  lessonStore.setCategoryCompleted(1, 'particles', true);
  lessonStore.setCategoryCompleted(1, 'vocab', true);
  lessonStore.setCategoryCompleted(1, 'phrases', true);
  lessonStore.setCategoryCompleted(1, 'tables', true);

  // Now chapter 1 is complete -> returns 2
  assert.strictEqual(lessonStore.getFirstUncompletedLessonNumber(), 2);

  // Mark chapter 2 completed
  lessonStore.setCategoryCompleted(2, 'bunkei', true);
  lessonStore.setCategoryCompleted(2, 'particles', true);
  lessonStore.setCategoryCompleted(2, 'vocab', true);
  lessonStore.setCategoryCompleted(2, 'phrases', true);
  lessonStore.setCategoryCompleted(2, 'tables', true);

  // Now chapter 1 and 2 are complete -> returns 3
  assert.strictEqual(lessonStore.getFirstUncompletedLessonNumber(), 3);
});

test('4. prepareStandardQuestions with selectedWordLessonNumber restricts questions strictly to that lesson', async () => {
  setActivePinia(createPinia());
  localStorage.clear();

  const mockUserStreaks: Record<string, number> = {};
  const mockIntroducedChars: Record<string, boolean> = {};

  // Request Kotoba quiz specifically for Lesson 2
  const targetLesson = 2;
  const result = await prepareStandardQuestions({
    targetDuration: 1,
    type: 'words',
    level: 'n5',
    selectedKanaCategory: 'all',
    selectedKanjiLessonNumber: 0,
    activeKanjiLessonNumber: 1,
    selectedWordLessonNumber: targetLesson,
    getMasteryStreak: () => 0,
    userStreaks: mockUserStreaks,
    introducedChars: mockIntroducedChars,
    currentLessonNumber: targetLesson
  });

  assert.ok(result.questions.length > 0, 'Must produce questions');
  const lesson2ExpectedKey = `Pelajaran ${targetLesson}`;

  // Every generated question must belong to Pelajaran 2
  for (const q of result.questions) {
    assert.strictEqual(
      q.lesson,
      lesson2ExpectedKey,
      `Question character "${q.character}" should be from ${lesson2ExpectedKey}, got: ${q.lesson}`
    );
  }
});
