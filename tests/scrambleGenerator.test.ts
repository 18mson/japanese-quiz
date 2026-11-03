// tests/scrambleGenerator.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  splitKanaIntoMorae, 
  splitMeaningIntoChunks, 
  calculateDistractorCount, 
  generateScrambleTiles 
} from '../src/utils/scrambleGenerator';

test('1. splitKanaIntoMorae correctly handles normal kana and youon', () => {
  const result1 = splitKanaIntoMorae('きょうしつ');
  assert.deepStrictEqual(result1, ['きょ', 'う', 'し', 'つ']);

  const result2 = splitKanaIntoMorae('いそぎます');
  assert.deepStrictEqual(result2, ['い', 'そ', 'ぎ', 'ま', 'す']);

  const result3 = splitKanaIntoMorae('がっこう', true);
  assert.deepStrictEqual(result3, ['が', 'っこ', 'う']);
});

test('2. splitMeaningIntoChunks splits phrases by word', () => {
  const chunks = splitMeaningIntoChunks('Belok kanan di lampu lalu lintas');
  assert.deepStrictEqual(chunks, ['Belok', 'kanan', 'di', 'lampu', 'lalu', 'lintas']);
});

test('3. calculateDistractorCount dynamically limits distractors to avoid crowded mobile screens', () => {
  // Long sentence (>= 6 chunks): 0 distractors
  assert.strictEqual(calculateDistractorCount(6), 0);
  assert.strictEqual(calculateDistractorCount(7), 0);

  // Medium (4-5 chunks): 1 distractor
  assert.strictEqual(calculateDistractorCount(4), 1);
  assert.strictEqual(calculateDistractorCount(5), 1);

  // 3 chunks: 2 distractors
  assert.strictEqual(calculateDistractorCount(3), 2);

  // 1-2 chunks: 2 distractors
  assert.strictEqual(calculateDistractorCount(2), 2);
  assert.strictEqual(calculateDistractorCount(1), 2);
});

test('4. generateScrambleTiles produces valid tiles for sentence romaji', () => {
  const res = generateScrambleTiles('shingou o migi e magatte kudasai', 'romaji');
  assert.strictEqual(res.isMultiWord, true);
  assert.strictEqual(res.targetChunks.length, 6);
  // Total tiles should equal 6 since >= 6 has 0 distractors
  assert.strictEqual(res.tiles.length, 6);
  const texts = res.tiles.map(t => t.text);
  assert.ok(texts.includes('shingou'));
  assert.ok(texts.includes('migi'));
  assert.ok(texts.includes('kudasai'));
});

test('5. generateScrambleTiles produces valid tiles and distractors for short kana', () => {
  const res = generateScrambleTiles('ほん', 'kana');
  assert.strictEqual(res.isMultiWord, false);
  assert.deepStrictEqual(res.targetChunks, ['ほ', 'ん']);
  // 2 chunks + 2 distractors = 4 tiles total
  assert.strictEqual(res.tiles.length, 4);
  const targetMatches = res.tiles.filter(t => !t.isDistractor);
  assert.strictEqual(targetMatches.length, 2);
  const distractorMatches = res.tiles.filter(t => t.isDistractor);
  assert.strictEqual(distractorMatches.length, 2);
});

