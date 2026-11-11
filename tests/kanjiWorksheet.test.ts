import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatKunyomi,
  formatOnyomi,
  formatKanjiExamples,
  filterKanjiForWorksheet,
  getGroupLabel
} from '../src/services/kanjiWorksheetService';

describe('kanjiWorksheetService Test Suite', () => {
  it('formats Kunyomi correctly with dots replaced and cleaned', () => {
    assert.strictEqual(formatKunyomi(['わる.い', 'わる-']), 'わる・い');
    assert.strictEqual(formatKunyomi(['ひと', 'ひとつ']), 'ひと、 ひとつ');
    assert.strictEqual(formatKunyomi([]), '-');
  });

  it('formats Onyomi correctly in Katakana', () => {
    assert.strictEqual(formatOnyomi(['イチ', 'イツ']), 'イチ、 イツ');
    assert.strictEqual(formatOnyomi(['トウ']), 'トウ');
    assert.strictEqual(formatOnyomi([]), '-');
  });

  it('formats Kanji examples with filled readings in parentheses', () => {
    const examples = formatKanjiExamples('日', ['日曜日 (Minggu)', '日本 (Jepang)'], ['ひ', 'か'], ['ニチ', 'ジツ']);
    assert.ok(examples.length > 0);
    assert.ok(examples.some(ex => ex.includes('(') && ex.includes(')')));
  });

  it('filters kanji correctly by group and statusFilter', () => {
    const mockTiers: Record<string, string> = {
      '一': 'mastered',
      '二': 'learning',
      '三': 'new',
      '四': 'new'
    };
    const getMasteryTier = (char: string) => mockTiers[char] || 'new';

    // Filter N5 numbers group
    const numbersAll = filterKanjiForWorksheet({
      category: 'kanji',
      group: 'numbers',
      statusFilter: 'all',
      getMasteryTier
    });
    assert.strictEqual(numbersAll.length, 14);
    assert.strictEqual(numbersAll[0].character, '一');

    // Filter only 'new' status in numbers group
    const numbersNew = filterKanjiForWorksheet({
      category: 'kanji',
      group: 'numbers',
      statusFilter: 'new',
      getMasteryTier
    });
    assert.ok(!numbersNew.some(k => k.character === '一'));
    assert.ok(numbersNew.some(k => k.character === '三'));
    assert.ok(numbersNew.some(k => k.character === '四'));
  });

  it('returns group labels accurately', () => {
    const labelN5 = getGroupLabel('kanji', 'numbers');
    assert.ok(labelN5.includes('Angka'));

    const labelN4 = getGroupLabel('kanji_n4', 'people');
    assert.ok(labelN4.includes('Orang'));
  });
});
