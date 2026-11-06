import test from 'node:test';
import assert from 'node:assert';
import { 
  decomposeWordToSegments, 
  decomposeWordToKanjiUnits,
  parseFuriganaSegments, 
  renderFuriganaHtml 
} from '../src/utils/furiganaParser';

test('Furigana Parser Suite', async (t) => {
  await t.test('1. decomposeWordToSegments memisahkan okurigana dari kanji inti', () => {
    // Kata kanji murni tanpa okurigana
    const segsKaishain = decomposeWordToSegments('会社員', 'かいしゃいん');
    assert.deepStrictEqual(segsKaishain, [
      { text: '会社員', reading: 'かいしゃいん', isRuby: true }
    ]);

    // Kata kerja dengan okurigana di belakang
    const segsTabemasu = decomposeWordToSegments('食べます', 'たべます');
    assert.deepStrictEqual(segsTabemasu, [
      { text: '食', reading: 'た', isRuby: true },
      { text: 'べます', isRuby: false }
    ]);

    // Kata dengan prefix kana di depan
    const segsOcha = decomposeWordToSegments('お茶', 'おちゃ');
    assert.deepStrictEqual(segsOcha, [
      { text: 'お', isRuby: false },
      { text: '茶', reading: 'ちゃ', isRuby: true }
    ]);

    // Kata kana murni tanpa kanji
    const segsAnata = decomposeWordToSegments('あなた', 'あなた');
    assert.deepStrictEqual(segsAnata, [
      { text: 'あなた', isRuby: false }
    ]);
  });

  await t.test('2. parseFuriganaSegments mem-parse kalimat lengkap dengan tepat', () => {
    const s1 = parseFuriganaSegments('あなたは会社員ですか。');
    assert.strictEqual(s1[0].text, 'あなたは');
    assert.strictEqual(s1[0].isRuby, false);
    assert.strictEqual(s1[1].text, '会社員');
    assert.strictEqual(s1[1].reading, 'かいしゃいん');
    assert.strictEqual(s1[1].isRuby, true);
    assert.strictEqual(s1[2].text, 'ですか。');
    assert.strictEqual(s1[2].isRuby, false);

    const s2 = parseFuriganaSegments('私は学生じゃありません。');
    const rubyWords = s2.filter(seg => seg.isRuby);
    assert.strictEqual(rubyWords.length, 2);
    assert.strictEqual(rubyWords[0].text, '私');
    assert.strictEqual(rubyWords[0].reading, 'わたし');
    assert.strictEqual(rubyWords[1].text, '学生');
    assert.strictEqual(rubyWords[1].reading, 'がくせい');

    const s3 = parseFuriganaSegments('きのう本を買いました。');
    const ruby3 = s3.filter(seg => seg.isRuby);
    assert.strictEqual(ruby3[0].text, '本');
    assert.strictEqual(ruby3[0].reading, 'ほん');
    assert.strictEqual(ruby3[1].text, '買');
    assert.strictEqual(ruby3[1].reading, 'か');
  });

  await t.test('3. renderFuriganaHtml menghasilkan tag ruby dan rt yang valid', () => {
    const html = renderFuriganaHtml('あなたは会社員ですか。', 'test-rt');
    assert.ok(html.includes('<ruby class="ruby-word">会社員<rt class="test-rt">かいしゃいん</rt></ruby>'));
    assert.ok(html.startsWith('あなたは'));
    assert.ok(html.endsWith('ですか。'));
  });

  await t.test('4. Kalimat 100% Hiragana tidak memunculkan tag ruby', () => {
    const segments = parseFuriganaSegments('これはペンです。');
    const rubyCount = segments.filter(s => s.isRuby).length;
    assert.strictEqual(rubyCount, 0);
  });

  await t.test('5. decomposeWordToKanjiUnits mendekomposisi kata per-karakter kanji', () => {
    // Multi-kanji compound: 市役所
    const shiyakusho = decomposeWordToKanjiUnits('市役所', 'しやくしょ');
    assert.deepStrictEqual(shiyakusho, [
      { text: '市', reading: 'し', isKanji: true },
      { text: '役', reading: 'やく', isKanji: true },
      { text: '所', reading: 'しょ', isKanji: true }
    ]);

    // Multi-kanji compound: 図書館
    const toshokan = decomposeWordToKanjiUnits('図書館', 'としょかん');
    assert.deepStrictEqual(toshokan, [
      { text: '図', reading: 'と', isKanji: true },
      { text: '書', reading: 'しょ', isKanji: true },
      { text: '館', reading: 'かん', isKanji: true }
    ]);

    // Kanji majemuk dengan okurigana di tengah & akhir: 乗り換えます
    const norikaemasu = decomposeWordToKanjiUnits('乗り換えます', 'のりかえます');
    assert.deepStrictEqual(norikaemasu, [
      { text: '乗', reading: 'の', isKanji: true },
      { text: 'り', isKanji: false },
      { text: '換', reading: 'か', isKanji: true },
      { text: 'えます', isKanji: false }
    ]);

    // Single kanji dengan okurigana di akhir: 浴びます
    const abimasu = decomposeWordToKanjiUnits('浴びます', 'あびます');
    assert.deepStrictEqual(abimasu, [
      { text: '浴', reading: 'あ', isKanji: true },
      { text: 'びます', isKanji: false }
    ]);

    // Single kanji dengan okurigana di akhir: 下ろします
    const oroshimasu = decomposeWordToKanjiUnits('下ろします', 'おろします');
    assert.deepStrictEqual(oroshimasu, [
      { text: '下', reading: 'お', isKanji: true },
      { text: 'ろします', isKanji: false }
    ]);

    // Non-kanji
    const anata = decomposeWordToKanjiUnits('あなた', 'あなた');
    assert.deepStrictEqual(anata, [
      { text: 'あなた', isKanji: false }
    ]);
  });
});
