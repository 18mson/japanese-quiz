// tests/kanjiBedahExpansion.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import { KANJI_CATALOG_DATA } from '../src/data/kanjiCatalogData';
import { getRelatedKotobaForKanji, getMinimalFallbackDetail } from '../src/services/kanjiInfoService';
import { kanjiN5Data } from '../src/data/kanji';
import { kanjiN4Data } from '../src/data/kanjiN4';

test('Kanji Catalog Expansion Test Suite', async (t) => {
  await t.test('1. Ukuran katalog kanji harus mencakup lebih dari 700 kanji', () => {
    const total = Object.keys(KANJI_CATALOG_DATA).length;
    console.log(`Total kanji di KANJI_CATALOG_DATA: ${total}`);
    assert(total >= 700, `Katalog harus memiliki >= 700 kanji, ditemukan: ${total}`);
  });

  await t.test('2. Semua kanji N5 dan N4 harus tercakup di dalam katalog', () => {
    let missingN5 = 0;
    for (const k of kanjiN5Data) {
      if (!KANJI_CATALOG_DATA[k.character]) {
        missingN5++;
      }
    }
    assert.strictEqual(missingN5, 0, 'Semua kanji N5 harus ada di dalam katalog');

    let missingN4 = 0;
    for (const k of kanjiN4Data) {
      if (!KANJI_CATALOG_DATA[k.character]) {
        missingN4++;
      }
    }
    assert.strictEqual(missingN4, 0, 'Semua kanji N4 harus ada di dalam katalog');
  });

  await t.test('3. Kanji penting seperti 私, 誰, 鳥, 力, 飯, 生 harus memiliki data lengkap', () => {
    const targetKeys = ['私', '誰', '鳥', '力', '飯', '生', '日'];
    for (const k of targetKeys) {
      const item = KANJI_CATALOG_DATA[k];
      assert(item, `Kanji ${k} harus ada di katalog`);
      assert(Array.isArray(item.meaning) && item.meaning.length > 0, `Kanji ${k} harus punya meaning`);
      assert(item.mnemonic_id, `Kanji ${k} harus punya mnemonic_id`);
      assert(typeof item.stroke_count === 'number', `Kanji ${k} harus punya stroke_count`);
    }

    // Kanji majemuk harus memiliki komponen pembentuk
    for (const k of ['私', '誰', '鳥', '飯']) {
      const item = KANJI_CATALOG_DATA[k];
      assert(Array.isArray(item.components) && item.components.length > 0, `Kanji majemuk ${k} harus punya komponen`);
    }
  });

  await t.test('4. getRelatedKotobaForKanji menghasilkan daftar kosakata dengan nomor Bab terstruktur', () => {
    // Uji kanji 生
    const wordsSei = getRelatedKotobaForKanji('生');
    assert(wordsSei.length >= 5, `生 harus muncul di >= 5 kosakata, ditemukan: ${wordsSei.length}`);
    const hasSensei = wordsSei.find(w => w.jp === '先生');
    assert(hasSensei, '生 harus mencakup 先生');
    assert(hasSensei.lesson?.includes('1'), '先生 harus ada di Bab 1');

    // Uji kanji 飯
    const wordsMeshi = getRelatedKotobaForKanji('飯');
    assert(wordsMeshi.length >= 3, `飯 harus muncul di >= 3 kosakata, ditemukan: ${wordsMeshi.length}`);
    const hasGohan = wordsMeshi.find(w => w.jp === 'ご飯');
    assert(hasGohan, '飯 harus mencakup ご飯');
    assert(hasGohan.lesson?.includes('6'), 'ご飯 harus ada di Bab 6');

    // Uji kanji 私
    const wordsWatashi = getRelatedKotobaForKanji('私');
    assert(wordsWatashi.length >= 1, `私 harus mencakup kosakata`);
    const hasWatashi = wordsWatashi.find(w => w.jp === '私');
    assert(hasWatashi, 'Harus mencakup 私');
    assert(hasWatashi.lesson?.includes('1'), '私 harus ada di Bab 1');

    // Uji kanji 誰
    const wordsDare = getRelatedKotobaForKanji('誰');
    assert(wordsDare.length >= 1, `誰 harus mencakup kosakata`);
    const hasDare = wordsDare.find(w => w.jp === '誰');
    assert(hasDare, 'Harus mencakup 誰');
    assert(hasDare.lesson?.includes('1'), '誰 harus ada di Bab 1');

    // Uji pengurutan berdasarkan Bab
    for (let i = 0; i < wordsSei.length - 1; i++) {
      const babA = parseInt((wordsSei[i].lesson || '').replace(/\D/g, ''), 10) || 999;
      const babB = parseInt((wordsSei[i + 1].lesson || '').replace(/\D/g, ''), 10) || 999;
      assert(babA <= babB, `Daftar kata harus terurut berdasarkan nomor Bab: ${babA} <= ${babB}`);
    }
  });

  await t.test('5. getMinimalFallbackDetail memuat data katalog langsung saat offline', () => {
    const detail = getMinimalFallbackDetail('私');
    assert.strictEqual(detail.kanji, '私');
    assert(detail.meaning.includes('saya') || detail.meaning.includes('pribadi'));
    assert(detail.words && detail.words.length > 0, 'Harus memiliki daftar kata terkait beserta bab');
    assert(detail.words.some(w => w.lesson?.includes('Bab 1')), 'Kata harus mencantumkan Bab 1');
  });
});
