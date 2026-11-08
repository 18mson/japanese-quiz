// tests/kanjiN4Mastery.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kanjiN4Data } from '../src/data/kanjiN4';
import { kanjiN5Data } from '../src/data/kanji';
import { hiraganaData } from '../src/data/hiragana';
import { katakanaData } from '../src/data/katakana';
import { wordsData } from '../src/data/words';
import { modesList } from '../src/components/start/modesConfig';
import { setActivePinia, createPinia } from 'pinia';
import { useMasteryStore } from '../src/stores/masteryStore';

test('1. kanjiN4Data dataset integrity and specifications', () => {
  assert.strictEqual(kanjiN4Data.length, 155, 'kanjiN4Data must contain exactly 155 entries');

  const charSet = new Set<string>();
  const idSet = new Set<number>();

  for (const item of kanjiN4Data) {
    assert.ok(item.character, 'Character must not be empty');
    assert.strictEqual(item.jlpt, 4, `Character ${item.character} must have jlpt: 4`);
    assert.strictEqual(item.type, 'kanji', `Character ${item.character} must have type: 'kanji'`);
    assert.ok(item.meaning && item.meaning.trim().length > 0, `Character ${item.character} must have non-empty meaning`);
    assert.ok(Array.isArray(item.onyomi), `Character ${item.character} onyomi must be an array`);
    assert.ok(Array.isArray(item.kunyomi), `Character ${item.character} kunyomi must be an array`);
    assert.ok(Array.isArray(item.examples), `Character ${item.character} examples must be an array`);

    assert.ok(!charSet.has(item.character), `Duplicate character detected: ${item.character}`);
    charSet.add(item.character);

    assert.ok(!idSet.has(item.id), `Duplicate ID detected: ${item.id}`);
    idSet.add(item.id);
  }
});

test('2. Total Mastery item count across all categories equals 1564', () => {
  const total = hiraganaData.length + katakanaData.length + kanjiN5Data.length + kanjiN4Data.length + wordsData.length;
  assert.strictEqual(hiraganaData.length, 104, 'Hiragana count should be 104');
  assert.strictEqual(katakanaData.length, 104, 'Katakana count should be 104');
  assert.strictEqual(kanjiN5Data.length, 105, 'Kanji N5 count should be 105');
  assert.strictEqual(kanjiN4Data.length, 155, 'Kanji N4 count should be 155');
  assert.strictEqual(wordsData.length, 1096, 'Words count should be 1096');
  assert.strictEqual(total, 1564, 'Combined total must be exactly 1564');
});

test('3. masteryStore accurately computes kanjiN4MasteryStats and overallMasteryStats', () => {
  setActivePinia(createPinia());
  const masteryStore = useMasteryStore();

  assert.ok(masteryStore.kanjiN4MasteryStats, 'kanjiN4MasteryStats must be defined');
  assert.strictEqual(masteryStore.kanjiN4MasteryStats.total, 155, 'kanjiN4MasteryStats.total must equal 155');
  assert.strictEqual(masteryStore.overallMasteryStats.total, 1564, 'overallMasteryStats.total must equal 1564');

  // Test streak recording for a sample N4 Kanji
  const sample = kanjiN4Data[0]; // 悪
  assert.ok(sample);
  masteryStore.userStreaks[sample.character] = 3;

  assert.strictEqual(masteryStore.getMasteryStreak(sample.character), 3);
  assert.strictEqual(masteryStore.getMasteryTier(sample.character), 'mastered');
  assert.strictEqual(masteryStore.kanjiN4MasteryStats.mastered, 1);
});

test('4. StartScreen modesConfig menu title is unified as Kanji', () => {
  const kanjiMode = modesList.find(m => m.id === 'kanji');
  assert.ok(kanjiMode, 'Kanji mode must exist');
  assert.strictEqual(kanjiMode.title, 'Kanji', 'Title must be Kanji without N5 suffix');
});

