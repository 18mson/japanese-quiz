import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatKunyomi,
  formatOnyomi,
  formatKanjiExamples,
  filterKanjiForWorksheet,
  getGroupLabel,
  getStrokeStartPoints
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

  it('extracts stroke start points for stroke order indicators', () => {
    const mockPaths = [
      'M32.25,18.75c1.09,0.5,1.74,2.25,1.96,3.25',
      'M55.5,35.0c0.8,0.4,1.5,1.8,1.5,3.0'
    ];
    const points = getStrokeStartPoints(mockPaths);
    assert.strictEqual(points.length, 2);
    assert.strictEqual(points[0].index, 1);
    assert.strictEqual(points[0].x, 32.25);
    assert.strictEqual(points[0].y, 18.75);
    assert.strictEqual(points[1].index, 2);
    assert.strictEqual(points[1].x, 55.5);
    assert.strictEqual(points[1].y, 35.0);
  });
});
