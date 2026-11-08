// tests/dailyGrammarRewind.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setActivePinia, createPinia } from 'pinia';
import { useLessonStore } from '../src/stores/lessonStore';
import { useDailyGrammarRewind, hashDateKey } from '../src/composables/useDailyGrammarRewind';

test('1. hashDateKey menghasilkan integer deterministik', () => {
  const hash1 = hashDateKey('2026-11-08');
  const hash2 = hashDateKey('2026-11-08');
  const hash3 = hashDateKey('2026-11-09');

  assert.strictEqual(hash1, hash2, 'Hash untuk tanggal yang sama harus identik');
  assert.notStrictEqual(hash1, hash3, 'Hash untuk tanggal berbeda harus berbeda');
  assert.ok(hash1 >= 0, 'Hash harus non-negatif');
});

test('2. useDailyGrammarRewind TIDAK aktif jika belum ada bab yang dicentang', () => {
  setActivePinia(createPinia());
  const lessonStore = useLessonStore();
  lessonStore.completedCategories = {};

  const { hasLearnedLessons, dailyHighlight } = useDailyGrammarRewind();

  assert.strictEqual(hasLearnedLessons.value, false, 'hasLearnedLessons harus false saat belum ada bab dicentang');
  assert.strictEqual(dailyHighlight.value, null, 'dailyHighlight harus null saat belum ada bab dicentang');
});

test('3. useDailyGrammarRewind HANYA menghasilkan materi dari bab yang sudah dicentang', () => {
  setActivePinia(createPinia());
  const lessonStore = useLessonStore();

  // User mencentang Bab 2 saja
  lessonStore.completedCategories = {
    '2_bunkei': true
  };

  const { hasLearnedLessons, learnedLessonNumbers, dailyHighlight } = useDailyGrammarRewind();

  assert.strictEqual(hasLearnedLessons.value, true, 'hasLearnedLessons harus true saat Bab 2 dicentang');
  assert.deepStrictEqual(learnedLessonNumbers.value, [2], 'learnedLessonNumbers harus hanya berisi [2]');
  assert.ok(dailyHighlight.value !== null, 'dailyHighlight harus ter-generate');
  assert.strictEqual(dailyHighlight.value?.lessonNumber, 2, 'Materi harus berasal dari Bab 2');
  assert.ok(dailyHighlight.value?.pattern, 'Harus memiliki pola kalimat');
  assert.ok(dailyHighlight.value?.example.japanese, 'Harus memiliki contoh kalimat bahasa Jepang');
  assert.ok(dailyHighlight.value?.example.meaning, 'Harus memiliki arti contoh kalimat');
});

test('4. Ketika banyak bab dicentang, materi selalu berada dalam subset bab terpelajari', () => {
  setActivePinia(createPinia());
  const lessonStore = useLessonStore();

  // User mencentang Bab 1, 3, dan 7
  lessonStore.completedCategories = {
    '1_bunkei': true,
    '3_bunkei': true,
    '7_bunkei': true
  };

  const { hasLearnedLessons, learnedLessonNumbers, dailyHighlight } = useDailyGrammarRewind();

  assert.strictEqual(hasLearnedLessons.value, true);
  assert.deepStrictEqual(learnedLessonNumbers.value, [1, 3, 7]);
  assert.ok(dailyHighlight.value !== null);
  assert.ok([1, 3, 7].includes(dailyHighlight.value?.lessonNumber as number), 'Materi terpilih harus termasuk dalam Bab 1, 3, atau 7');
});
