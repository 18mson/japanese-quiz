import test from 'node:test';
import assert from 'node:assert';
import {
  extractMeaningCandidates,
  checkIsMeaningCorrect,
  checkIsMeaningTypo,
  checkIsJapaneseCorrect,
  checkIsJapaneseTypo
} from '../src/utils/quizHelpers';

test('Sub-mode words_meaning: Evaluasi Arti Bahasa Indonesia', async (t) => {
  await t.test('ekstraksi kandidat arti dari string kompleks', () => {
    const candidates = extractMeaningCandidates('menutup [ドアを～] / menutup pintu');
    assert.ok(candidates.includes('menutup'));
    assert.ok(candidates.includes('menutup pintu'));
  });

  await t.test('evaluasi jawaban arti yang tepat', () => {
    const meaning = 'bujangan, belum menikah';
    assert.strictEqual(checkIsMeaningCorrect('bujangan', meaning), true);
    assert.strictEqual(checkIsMeaningCorrect('belum menikah', meaning), true);
    assert.strictEqual(checkIsMeaningCorrect('sudah menikah', meaning), false);
  });

  await t.test('toleransi typo pada arti bahasa Indonesia (Levenshtein)', () => {
    const meaning = 'menutup [pintu]';
    // Typo 1 huruf
    assert.strictEqual(checkIsMeaningTypo('menutup', meaning), false); // jawaban benar bukan typo
    assert.strictEqual(checkIsMeaningTypo('menutp', meaning), true); // typo 1 huruf
    assert.strictEqual(checkIsMeaningTypo('membuka', meaning), false); // salah makna total
  });
});

test('Sub-mode meaning_to_words: Evaluasi Jawaban Jepang (Kanji, Kana, Romaji)', async (t) => {
  const item = {
    character: '閉めます',
    kana: 'しめます',
    romaji: ['shimemasu', 'simemasu']
  };

  await t.test('menerima input Kanji yang tepat', () => {
    assert.strictEqual(checkIsJapaneseCorrect('閉めます', item), true);
  });

  await t.test('menerima input Hiragana yang tepat', () => {
    assert.strictEqual(checkIsJapaneseCorrect('しめます', item), true);
  });

  await t.test('menerima input Romaji Hepburn & Kunrei-shiki yang tepat', () => {
    assert.strictEqual(checkIsJapaneseCorrect('shimemasu', item), true);
    assert.strictEqual(checkIsJapaneseCorrect('simemasu', item), true);
  });

  await t.test('menerima input Katakana ekuivalen', () => {
    assert.strictEqual(checkIsJapaneseCorrect('シメマス', item), true);
  });

  await t.test('mendeteksi typo pada input romaji/kana', () => {
    // chimemasu bukan jawaban benar tapi typo dekat dengan shimemasu
    assert.strictEqual(checkIsJapaneseCorrect('chimemasu', item), false);
    assert.strictEqual(checkIsJapaneseTypo('chimemasu', item), true);

    // Jawaban salah jauh
    assert.strictEqual(checkIsJapaneseTypo('tabemasu', item), false);
  });
});

