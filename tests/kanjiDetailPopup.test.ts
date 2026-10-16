import test from 'node:test';
import assert from 'node:assert';
import { validateEntry } from '../scripts/kanji/validate.mjs';
import { extractKanjiFromWord } from '../src/services/kanjiInfoService';

test('Kanji Detail & Offline Validation Suite', async (t) => {
  // Mock facts map for validation testing
  const mockFactsMap = new Map([
    [
      '休',
      {
        kanji: '休',
        meaning: ['rest', 'day off'],
        on: ['キュウ'],
        kun: ['やす.む'],
        stroke_count: 6,
        jlpt: 4,
        grade: 1,
        components: ['亻', '木'],
        words: [{ jp: '休み', kana: 'やすみ', meaning: 'libur, istirahat' }]
      }
    ]
  ]);

  await t.test('1. Validasi menolak komponen di luar KRADFILE', () => {
    const invalidEntry = {
      kanji: '休',
      formation_type: 'compound_meaning',
      components: [
        { part: '亻', role: 'meaning', meaning_id: 'orang' },
        { part: '火', role: 'meaning', meaning_id: 'api' } // '火' bukan komponen KRADFILE untuk 休
      ],
      etymology_id: 'Orang bersandar pada pohon untuk beristirahat.',
      etymology_confidence: 'established',
      mnemonic_id: 'Cara mengingat: Orang di dekat pohon beristirahat.',
      note_id: ''
    };

    const result = validateEntry(invalidEntry, mockFactsMap);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.status, 'rejected');
    assert.ok(
      result.reasons.some(r => r.includes("Komponen '火' tidak ada dalam KRADFILE")),
      'Harus mencantumkan penolakan komponen di luar KRADFILE'
    );
  });

  await t.test('2. Validasi menolak teks bertahun dan kata sejarah terlarang', () => {
    // Teks bertahun
    const entryWithYear = {
      kanji: '休',
      formation_type: 'compound_meaning',
      components: [
        { part: '亻', role: 'meaning', meaning_id: 'orang' },
        { part: '木', role: 'meaning', meaning_id: 'pohon' }
      ],
      etymology_id: 'Bentuk ini sudah ditemukan sejak tahun 1200 sebagai simbol istirahat.',
      etymology_confidence: 'established',
      mnemonic_id: 'Cara mengingat: Orang berteduh di samping pohon.',
      note_id: ''
    };

    const resYear = validateEntry(entryWithYear, mockFactsMap);
    assert.strictEqual(resYear.valid, false);
    assert.strictEqual(resYear.status, 'rejected');
    assert.ok(
      resYear.reasons.some(r => r.includes('angka tahun')),
      'Harus menolak teks dengan angka tahun'
    );

    // Teks mengandung "dinasti"
    const entryWithDynasty = {
      ...entryWithYear,
      etymology_id: 'Simbol ini populer pada masa dinasti Han di daratan Asia.'
    };
    const resDynasty = validateEntry(entryWithDynasty, mockFactsMap);
    assert.strictEqual(resDynasty.valid, false);
    assert.ok(resDynasty.reasons.some(r => r.includes('kata "dinasti"')));

    // Teks mengandung "tulang ramalan"
    const entryWithOracle = {
      ...entryWithYear,
      etymology_id: 'Ditemukan inskripsi tulang ramalan kuno yang menunjukkan pohon.'
    };
    const resOracle = validateEntry(entryWithOracle, mockFactsMap);
    assert.strictEqual(resOracle.valid, false);
    assert.ok(resOracle.reasons.some(r => r.includes('kata "tulang ramalan"')));

    // Teks mengandung "pada zaman"
    const entryWithZaman = {
      ...entryWithYear,
      etymology_id: 'Pada zaman lampau orang berteduh di pohon.'
    };
    const resZaman = validateEntry(entryWithZaman, mockFactsMap);
    assert.strictEqual(resZaman.valid, false);
    assert.ok(resZaman.reasons.some(r => r.includes('frasa "pada zaman"')));
  });

  await t.test('3. Validasi meloloskan entri yang sesuai aturan', () => {
    const validEntry = {
      kanji: '休',
      formation_type: 'compound_meaning',
      components: [
        { part: '亻', role: 'meaning', meaning_id: 'orang' },
        { part: '木', role: 'meaning', meaning_id: 'pohon' }
      ],
      etymology_id: 'Gabungan komponen orang dan pohon, menggambarkan seseorang yang bersandar di pohon untuk beristirahat.',
      etymology_confidence: 'established',
      mnemonic_id: 'Cara mengingat: Seseorang bersandar santai di samping pohon rindang untuk beristirahat.',
      note_id: 'Digunakan dalam kata yasumi.'
    };

    const result = validateEntry(validEntry, mockFactsMap);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.status, 'draft');
    assert.strictEqual(result.reasons.length, 0);
  });

  await t.test('4. Ikon "?" hanya muncul untuk jawaban salah dan kata ber-kanji', () => {
    const mockCatalog: Record<string, boolean> = {
      '休': true,
      '学': true,
      '生': true
    };

    // Helper simulasi kemunculan tombol "?" pada antarmuka
    function shouldShowKanjiButton(targetWord: string, isAnswerCorrect: boolean): boolean {
      const kanjis = extractKanjiFromWord(targetWord);
      // Jika kata tidak memiliki kanji sama sekali
      if (kanjis.length === 0) return false;

      // Jika kanji tidak ada di katalog data
      const hasSupportedKanji = kanjis.some(k => !!mockCatalog[k]);
      if (!hasSupportedKanji) return false;

      // Ikon popup detail utama hanya ditujukan saat jawaban SALAH
      // (Pada jawaban benar, jika ditampilkan hanya tombol opsional kecil terpisah)
      return !isAnswerCorrect;
    }

    // Kasus A: Kata berkategori kana-saja (tidak ada kanji), jawaban salah -> Tidak boleh muncul
    assert.strictEqual(shouldShowKanjiButton('こんにちは', false), false);
    assert.strictEqual(shouldShowKanjiButton('テレビ', false), false);

    // Kasus B: Kata ber-kanji tapi tidak ada di katalog -> Tidak boleh muncul
    assert.strictEqual(shouldShowKanjiButton('薔薇', false), false);

    // Kasus C: Kata ber-kanji terdaftar, jawaban BENAR -> Ikon popup salah tidak boleh muncul
    assert.strictEqual(shouldShowKanjiButton('休み', true), false);
    assert.strictEqual(shouldShowKanjiButton('学生', true), false);

    // Kasus D: Kata ber-kanji terdaftar, jawaban SALAH -> Ikon popup HARUS muncul
    assert.strictEqual(shouldShowKanjiButton('休み', false), true);
    assert.strictEqual(shouldShowKanjiButton('学生', false), true);
  });
});
