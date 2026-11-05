// tests/scrambleGenerator.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  splitKanaIntoMorae, 
  splitMeaningIntoChunks, 
  calculateDistractorCount, 
  generateScrambleTiles,
  extractCleanMeanings
} from '../src/utils/scrambleGenerator';
import { checkIsMeaningCorrect } from '../src/utils/quizHelpers';

test('1. splitKanaIntoMorae correctly handles normal kana and youon', () => {
  const result1 = splitKanaIntoMorae('きょうしつ');
  assert.deepStrictEqual(result1, ['きょ', 'う', 'し', 'つ']);

  const result2 = splitKanaIntoMorae('いそぎます');
  assert.deepStrictEqual(result2, ['い', 'そ', 'ぎ', 'ま', 'す']);

  const result3 = splitKanaIntoMorae('がっこう', true);
  assert.deepStrictEqual(result3, ['が', 'っこ', 'う']);
});

test('2. splitMeaningIntoChunks splits phrases by word and single words by letter', () => {
  const phrase = splitMeaningIntoChunks('Belok kanan di lampu lalu lintas');
  assert.strictEqual(phrase.isMultiWord, true);
  assert.deepStrictEqual(phrase.chunks, ['belok', 'kanan', 'di', 'lampu', 'lalu', 'lintas']);

  const singleWord = splitMeaningIntoChunks('buku');
  assert.strictEqual(singleWord.isMultiWord, false);
  assert.deepStrictEqual(singleWord.chunks, ['b', 'u', 'k', 'u']);
});

test('3. calculateDistractorCount dynamically fills tall bubble area', () => {
  // Long target (>= 14 chunks): 0 distractors
  assert.strictEqual(calculateDistractorCount(14), 0);
  assert.strictEqual(calculateDistractorCount(15), 0);

  // Medium (6 chunks): 5 distractors -> 11 tiles total
  assert.strictEqual(calculateDistractorCount(6), 5);

  // 4 chunks: 6 distractors -> 10 tiles total
  assert.strictEqual(calculateDistractorCount(4), 6);

  // 1-2 chunks: 8 distractors -> 9-10 tiles total
  assert.strictEqual(calculateDistractorCount(2), 8);
  assert.strictEqual(calculateDistractorCount(1), 8);
});

test('4. generateScrambleTiles produces valid tiles for sentence romaji', () => {
  const res = generateScrambleTiles('shingou o migi e magatte kudasai', 'romaji');
  assert.strictEqual(res.isMultiWord, true);
  assert.strictEqual(res.targetChunks.length, 6);
  // Total tiles should equal 6 + 5 distractors = 11 tiles
  assert.strictEqual(res.tiles.length, 11);
  const texts = res.tiles.map(t => t.text);
  assert.ok(texts.includes('shingou'));
  assert.ok(texts.includes('migi'));
  assert.ok(texts.includes('kudasai'));
});

test('5. generateScrambleTiles produces valid tiles and distractors for short kana', () => {
  const res = generateScrambleTiles('ほん', 'kana');
  assert.strictEqual(res.isMultiWord, false);
  assert.deepStrictEqual(res.targetChunks, ['ほ', 'ん']);
  // 2 chunks + 8 distractors = 10 tiles total
  assert.strictEqual(res.tiles.length, 10);
  const targetMatches = res.tiles.filter(t => !t.isDistractor);
  assert.strictEqual(targetMatches.length, 2);
  const distractorMatches = res.tiles.filter(t => t.isDistractor);
  assert.strictEqual(distractorMatches.length, 8);
});

test('6. generateScrambleTiles for Indonesian provides rich letter suggestions', () => {
  const res = generateScrambleTiles('buku', 'meaning');
  assert.strictEqual(res.isMultiWord, false);
  assert.deepStrictEqual(res.targetChunks, ['b', 'u', 'k', 'u']);
  // 4 letters + 6 distractors = 10 tiles
  assert.strictEqual(res.tiles.length, 10);
  const targetTexts = res.tiles.map(t => t.text);
  assert.ok(targetTexts.includes('b'));
  assert.ok(targetTexts.includes('u'));
  assert.ok(targetTexts.includes('k'));
});

test('7. extractCleanMeanings isolates clean alternative meanings', () => {
  const clean1 = extractCleanMeanings('teras, balkon, beranda');
  assert.deepStrictEqual(clean1, ['teras', 'balkon', 'beranda']);

  const clean2 = extractCleanMeanings('ingin, mau (benda)');
  assert.deepStrictEqual(clean2, ['ingin', 'mau']);

  const clean3 = extractCleanMeanings('menyalakan, memasang [でんきを～]');
  assert.deepStrictEqual(clean3, ['menyalakan', 'memasang']);

  const clean4 = extractCleanMeanings('sendiri-sendiri, masing-masing (bayar terpisah)');
  assert.deepStrictEqual(clean4, ['sendiri-sendiri', 'masing-masing']);
});

test('8. Indonesian answers can be answered with any single meaning', () => {
  const rawMeaning = 'teras, balkon, beranda';
  assert.strictEqual(checkIsMeaningCorrect('teras', rawMeaning), true);
  assert.strictEqual(checkIsMeaningCorrect('balkon', rawMeaning), true);
  assert.strictEqual(checkIsMeaningCorrect('beranda', rawMeaning), true);

  const rawMeaning2 = 'sendiri-sendiri, masing-masing (bayar terpisah)';
  assert.strictEqual(checkIsMeaningCorrect('sendiri-sendiri', rawMeaning2), true);
  assert.strictEqual(checkIsMeaningCorrect('sendiri sendiri', rawMeaning2), true);
  assert.strictEqual(checkIsMeaningCorrect('sendiri', rawMeaning2), true);
  assert.strictEqual(checkIsMeaningCorrect('masing-masing', rawMeaning2), true);
  assert.strictEqual(checkIsMeaningCorrect('masing masing', rawMeaning2), true);

  const rawMeaning3 = 'pasar swalayan, supermarket';
  assert.strictEqual(checkIsMeaningCorrect('pasar swalayan', rawMeaning3), true);
  assert.strictEqual(checkIsMeaningCorrect('supermarket', rawMeaning3), true);
});
