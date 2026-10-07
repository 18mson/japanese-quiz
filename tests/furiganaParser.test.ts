import test from 'node:test';
import assert from 'node:assert';
import { 
  decomposeWordToSegments, 
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
});
