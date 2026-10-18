// tests/menuReorganization.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modesList, getDynamicDefaultModeId, getModeDescription } from '../src/components/start/modesConfig';

test('1. modesList has exactly 7 categories in correct learning progression order', () => {
  const expectedOrder = [
    'daily',
    'hiragana',
    'katakana',
    'kanji',
    'kotoba',
    'online_game',
    'lainnya'
  ];

  assert.strictEqual(modesList.length, 7, 'modesList must have exactly 7 modes');
  const actualOrder = modesList.map(m => m.id);
  assert.deepStrictEqual(actualOrder, expectedOrder, 'Order of modes must match requested sequence');
});

test('2. Sub-types availability per category', () => {
  const hiragana = modesList.find(m => m.id === 'hiragana')!;
  assert.ok(hiragana, 'Hiragana must exist');
  assert.deepStrictEqual(
    hiragana.subTypes?.map(s => s.key),
    ['multiple_choice', 'keyboard_typing', 'writing'],
    'Hiragana must have multiple_choice, keyboard_typing, writing'
  );

  const katakana = modesList.find(m => m.id === 'katakana')!;
  assert.ok(katakana, 'Katakana must exist');
  assert.deepStrictEqual(
    katakana.subTypes?.map(s => s.key),
    ['multiple_choice', 'keyboard_typing', 'writing'],
    'Katakana must have multiple_choice, keyboard_typing, writing'
  );

  const kanji = modesList.find(m => m.id === 'kanji')!;
  assert.ok(kanji, 'Kanji must exist');
  assert.deepStrictEqual(
    kanji.subTypes?.map(s => s.key),
    ['writing'],
    'Kanji must have writing'
  );

  const kotoba = modesList.find(m => m.id === 'kotoba')!;
  assert.ok(kotoba, 'Kotoba must exist');
  assert.deepStrictEqual(
    kotoba.subTypes?.map(s => s.key),
    ['words', 'renshuu', 'kaiwa'],
    'Kotoba must have words, renshuu, kaiwa'
  );

  const onlineGame = modesList.find(m => m.id === 'online_game')!;
  assert.ok(onlineGame, 'Online Game must exist');
  assert.deepStrictEqual(
    onlineGame.subTypes?.map(s => s.key),
    ['battleground', 'quiz_blitz'],
    'Online Game must have battleground and quiz_blitz'
  );

  const lainnya = modesList.find(m => m.id === 'lainnya')!;
  assert.ok(lainnya, 'Lainnya must exist');
  assert.deepStrictEqual(
    lainnya.subTypes?.map(s => s.key),
    ['angka', 'counter', 'campuran', 'mix'],
    'Lainnya must have angka, counter, campuran, mix'
  );
});

test('3. Dynamic Default Progression Logic', () => {
  // Case A: Fresh user (Hiragana 0%) -> Defaults to hiragana
  assert.strictEqual(
    getDynamicDefaultModeId({ hiraganaPct: 0, katakanaPct: 0, kanjiPct: 0, wordsPct: 0 }),
    'hiragana',
    'Fresh user should default to hiragana'
  );

  // Case B: Incomplete Hiragana (Hiragana 75%) -> Defaults to hiragana
  assert.strictEqual(
    getDynamicDefaultModeId({ hiraganaPct: 75, katakanaPct: 10, kanjiPct: 0, wordsPct: 0 }),
    'hiragana',
    'Incomplete hiragana should default to hiragana'
  );

  // Case C: Hiragana 100%, Katakana < 100% -> Defaults to katakana
  assert.strictEqual(
    getDynamicDefaultModeId({ hiraganaPct: 100, katakanaPct: 40, kanjiPct: 0, wordsPct: 0 }),
    'katakana',
    '100% Hiragana should advance default to katakana'
  );

  // Case D: Hiragana 100%, Katakana 100%, Kanji < 100% -> Defaults to kanji
  assert.strictEqual(
    getDynamicDefaultModeId({ hiraganaPct: 100, katakanaPct: 100, kanjiPct: 50, wordsPct: 0 }),
    'kanji',
    '100% Katakana should advance default to kanji'
  );

  // Case E: Hiragana 100%, Katakana 100%, Kanji 100%, Words < 100% -> Defaults to kotoba
  assert.strictEqual(
    getDynamicDefaultModeId({ hiraganaPct: 100, katakanaPct: 100, kanjiPct: 100, wordsPct: 80 }),
    'kotoba',
    '100% Kanji should advance default to kotoba'
  );

  // Case F: All 100% -> Defaults to daily
  assert.strictEqual(
    getDynamicDefaultModeId({ hiraganaPct: 100, katakanaPct: 100, kanjiPct: 100, wordsPct: 100 }),
    'daily',
    'All 100% should default to daily practice'
  );
});

test('4. Descriptions for all modes and sub-types', () => {
  modesList.forEach(mode => {
    if (mode.subTypes) {
      mode.subTypes.forEach(sub => {
        const desc = getModeDescription(mode, sub.key, 'angka');
        assert.ok(desc && desc.length > 5, `Description for ${mode.id} - ${sub.key} should not be empty`);
      });
    } else {
      const desc = getModeDescription(mode, '', '');
      assert.ok(desc && desc.length > 5, `Description for ${mode.id} should not be empty`);
    }
  });
});
