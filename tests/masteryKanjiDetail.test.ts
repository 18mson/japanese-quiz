// tests/masteryKanjiDetail.test.ts
import test, { before } from 'node:test';
import assert from 'node:assert/strict';

let getKanjiDetail: typeof import('../src/services/kanjiInfoService').getKanjiDetail;
let kanjiN5Data: typeof import('../src/data/kanji').kanjiN5Data;

before(async () => {
  const service = await import('../src/services/kanjiInfoService');
  getKanjiDetail = service.getKanjiDetail;

  const kanjiModule = await import('../src/data/kanji');
  kanjiN5Data = kanjiModule.kanjiN5Data;
});

test('1. kanjiInfoService loads detail for sample kanji with etymology and radicals', async () => {
  const detail = await getKanjiDetail('多');
  assert.ok(detail, 'Detail for 多 must exist in kanjiInfo');
  assert.strictEqual(detail.kanji, '多');
  assert.strictEqual(detail.stroke_count, 6);
  assert.strictEqual(detail.formation_type, 'compound_meaning');
  assert.ok(detail.etymology_id && detail.etymology_id.length > 0, 'Must have Indonesian etymology');
  assert.ok(detail.mnemonic_id && detail.mnemonic_id.length > 0, 'Must have Indonesian mnemonic');
  assert.ok(detail.components && detail.components.length > 0, 'Must have components');
  assert.strictEqual(detail.components[0].part, '夕');
  assert.strictEqual(detail.components[0].meaning_id, 'petang');
});

test('2. kanjiN5Data contains entries and groups', () => {
  assert.ok(kanjiN5Data.length >= 100, 'kanjiN5Data must have at least 100 entries');
  const sample = kanjiN5Data.find(k => k.character === '多');
  assert.ok(sample, 'Character 多 must exist in kanjiN5Data');
  assert.strictEqual(sample.meaning, 'Banyak');
  assert.deepStrictEqual(sample.onyomi, ['タ']);
  assert.ok(sample.kunyomi.includes('おお') || sample.kunyomi.includes('おおい'));
});

test('3. getKanjiDetail handles non-existent or unknown characters gracefully', async () => {
  const result = await getKanjiDetail('XYZ');
  assert.strictEqual(result, null, 'Unknown character should return null');
});
