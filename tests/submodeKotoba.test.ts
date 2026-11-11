import test from 'node:test';
import assert from 'node:assert';
import {
  extractMeaningCandidates,
  checkIsMeaningCorrect,
  checkIsMeaningTypo,
  checkIsJapaneseCorrect,
  checkIsJapaneseTypo,
  checkIsWrongModeInput,
  parseMeaningParts
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

    // Kasus koma dan garis miring (/): いいえ、まだまだです
    const madamadaMeaning = 'Tidak, belum seberapa/masih belum memuaskan';
    assert.strictEqual(checkIsMeaningCorrect('tidak, belum seberapa', madamadaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('tidak belum seberapa', madamadaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('belum seberapa', madamadaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('masih belum memuaskan', madamadaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('tidak, masih belum memuaskan', madamadaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('tidak masih belum memuaskan', madamadaMeaning), true);

    // Kasus percakapan lain: そうですか (O, begitu / Begitu ya)
    const soudesukaMeaning = 'O, begitu / Begitu ya';
    assert.strictEqual(checkIsMeaningCorrect('o, begitu', soudesukaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('o begitu', soudesukaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('begitu ya', soudesukaMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('begitu', soudesukaMeaning), true);

    // Kasus tempat/bagian penjualan: コーナー
    const cornerMeaning = 'tempat/bagian penjualan, konter';
    assert.strictEqual(checkIsMeaningCorrect('bagian penjualan', cornerMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('konter', cornerMeaning), true);

    // Kasus kata dengan garis miring di dalam kurung: 午後 (p.m. (sore/malam))
    const gogoMeaning = 'p.m. (sore/malam)';
    assert.strictEqual(checkIsMeaningCorrect('sore', gogoMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('malam', gogoMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('pm', gogoMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('p.m.', gogoMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('pagi', gogoMeaning), false);

    // Kasus kata perbankan ATM: お振り替え (pemindahbukuan / transfer internal)
    const ofurikaeMeaning = 'pemindahbukuan rekening / pemindahbukuan / transfer internal / transfer rekening / transfer';
    assert.strictEqual(checkIsMeaningCorrect('transfer internal', ofurikaeMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('Transfer internal', ofurikaeMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('transfer', ofurikaeMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('pemindahbukuan', ofurikaeMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('pemindahbukuan rekening', ofurikaeMeaning), true);

    // Kasus kata perbankan ATM: お引き出し (tarik tunai / penarikan uang tunai)
    const ohikidashiMeaning = 'tarik tunai / penarikan tunai / penarikan uang tunai / tarik uang / penarikan uang';
    assert.strictEqual(checkIsMeaningCorrect('tarik tunai', ohikidashiMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('Tarik tunai', ohikidashiMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('penarikan uang tunai', ohikidashiMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('tarik uang', ohikidashiMeaning), true);

    // Kasus kata keluarga dengan catatan kurung: ご家族, ご主人, 父
    const gokazokuMeaning = 'keluarga (orang lain)';
    assert.strictEqual(checkIsMeaningCorrect('keluarga orang lain', gokazokuMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('keluarga (orang lain)', gokazokuMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('keluarga', gokazokuMeaning), true);

    const goshujinMeaning = 'suami (orang lain)';
    assert.strictEqual(checkIsMeaningCorrect('suami orang lain', goshujinMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('suami', goshujinMeaning), true);

    const chichiMeaning = 'bapak, ayah (sendiri)';
    assert.strictEqual(checkIsMeaningCorrect('ayah sendiri', chichiMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('bapak sendiri', chichiMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('ayah', chichiMeaning), true);
    assert.strictEqual(checkIsMeaningCorrect('bapak', chichiMeaning), true);
  });

  await t.test('toleransi typo pada arti bahasa Indonesia (Levenshtein)', () => {
    const meaning = 'menutup [pintu]';
    // Typo 1 huruf
    assert.strictEqual(checkIsMeaningTypo('menutup', meaning), false); // jawaban benar bukan typo
    assert.strictEqual(checkIsMeaningTypo('menutp', meaning), true); // typo 1 huruf
    assert.strictEqual(checkIsMeaningTypo('membuka', meaning), false); // salah makna total
  });
});

test('Sub-mode meaning_to_words: Evaluasi Jawaban Jepang (Kanji & Kana - Bukan Romaji)', async (t) => {
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

  await t.test('menerima input Katakana ekuivalen', () => {
    assert.strictEqual(checkIsJapaneseCorrect('シメマス', item), true);
  });

  await t.test('menolak input Romaji karena hanya tulisan Jepang yang diperbolehkan', () => {
    assert.strictEqual(checkIsJapaneseCorrect('shimemasu', item), false);
    assert.strictEqual(checkIsJapaneseCorrect('simemasu', item), false);
    // Bukan typo Jepang jika inputnya berupa romaji
    assert.strictEqual(checkIsJapaneseTypo('shimemasu', item), false);
  });

  await t.test('mendeteksi typo pada input kana', () => {
    // 1 huruf kana salah pada kata 4 karakter kana
    assert.strictEqual(checkIsJapaneseCorrect('しめむす', item), false);
    assert.strictEqual(checkIsJapaneseTypo('しめむす', item), true);

    // Jawaban salah jauh
    assert.strictEqual(checkIsJapaneseTypo('たべます', item), false);
  });

  await t.test('menangani kata sifat-na (大丈夫な) dengan dan tanpa な sebagai 100% Benar', () => {
    const naItem = {
      character: '大丈夫な',
      kana: 'だいじょうぶ',
      romaji: ['daijoubu', 'daijobu', 'daijoubuna'],
      category_word: 'Kata Sifat-na'
    };

    // Input dengan な di akhir
    assert.strictEqual(checkIsJapaneseCorrect('だいじょうぶな', naItem), true);
    assert.strictEqual(checkIsJapaneseTypo('だいじょうぶな', naItem), false);

    // Input tanpa な di akhir
    assert.strictEqual(checkIsJapaneseCorrect('だいじょうぶ', naItem), true);
    assert.strictEqual(checkIsJapaneseTypo('だいじょうぶ', naItem), false);

    // Input kanji dengan な
    assert.strictEqual(checkIsJapaneseCorrect('大丈夫な', naItem), true);

    // Input kanji tanpa な
    assert.strictEqual(checkIsJapaneseCorrect('大丈夫', naItem), true);

    // Typo nyata pada kata sifat-na (misal kurang 'う')
    assert.strictEqual(checkIsJapaneseCorrect('だいじょぶな', naItem), false);
    assert.strictEqual(checkIsJapaneseTypo('だいじょぶな', naItem), true);
  });
});

test('Smart Intercept: Pencegahan Salah Format Mode Soal (checkIsWrongModeInput)', async (t) => {
  const wordItem = {
    character: '浴びます',
    kana: 'あびます',
    romaji: 'abimasu',
    meaning: 'mandi [シャワーを～]'
  };

  const wordWithArrayRomaji = {
    character: '下ろします',
    kana: 'おろします',
    romaji: ['oroshimasu', 'orosimasu'],
    meaning: 'menarik uang (dari bank)'
  };

  await t.test('words_meaning: mencegat ketika user mengetik Romaji kata', () => {
    // Mengetik romaji persis
    const res1 = checkIsWrongModeInput('abimasu', 'words_meaning', wordItem);
    assert.strictEqual(res1.isWrongMode, true);
    assert.match(res1.message || '', /Romaji/i);

    // Mengetik salah satu romaji alternatif
    const res2 = checkIsWrongModeInput('orosimasu', 'words_meaning', wordWithArrayRomaji);
    assert.strictEqual(res2.isWrongMode, true);

    // Mengetik typo romaji 1 huruf
    const res3 = checkIsWrongModeInput('abimasy', 'words_meaning', wordItem);
    assert.strictEqual(res3.isWrongMode, true);
  });

  await t.test('words_meaning: mencegat ketika user mengetik tulisan Jepang (Kana / Kanji)', () => {
    const resKana = checkIsWrongModeInput('あびます', 'words_meaning', wordItem);
    assert.strictEqual(resKana.isWrongMode, true);
    assert.match(resKana.message || '', /Bahasa Jepang/i);

    const resKanji = checkIsWrongModeInput('浴びます', 'words_meaning', wordItem);
    assert.strictEqual(resKanji.isWrongMode, true);
  });

  await t.test('words_meaning: TIDAK mencegat ketika user menjawab Arti Bahasa Indonesia (benar atau typo)', () => {
    // Arti benar
    const resCorrect = checkIsWrongModeInput('mandi', 'words_meaning', wordItem);
    assert.strictEqual(resCorrect.isWrongMode, false);

    // Typo arti
    const resTypo = checkIsWrongModeInput('mandii', 'words_meaning', wordItem);
    assert.strictEqual(resTypo.isWrongMode, false);

    // Arti salah total (bukan romaji/jepang kata tersebut)
    const resWrongMeaning = checkIsWrongModeInput('makan', 'words_meaning', wordItem);
    assert.strictEqual(resWrongMeaning.isWrongMode, false);
  });

  await t.test('words: mencegat ketika user mengetik Arti di mode Romaji', () => {
    const res = checkIsWrongModeInput('mandi', 'words', wordItem);
    assert.strictEqual(res.isWrongMode, true);
    assert.match(res.message || '', /Arti/i);

    // Jawaban romaji benar tidak dicegat
    const resRomaji = checkIsWrongModeInput('abimasu', 'words', wordItem);
    assert.strictEqual(resRomaji.isWrongMode, false);
  });

  await t.test('meaning_to_words: mencegat ketika user mengetik Arti di mode Jepang', () => {
    const res = checkIsWrongModeInput('mandi', 'meaning_to_words', wordItem);
    assert.strictEqual(res.isWrongMode, true);
    assert.match(res.message || '', /Arti/i);

    // Jawaban tulisan Jepang benar tidak dicegat
    const resJp = checkIsWrongModeInput('あびます', 'meaning_to_words', wordItem);
    assert.strictEqual(resJp.isWrongMode, false);
  });

  await t.test('parseMeaningParts: membersihkan arti panjang berulang menjadi judul utama & alternatif elegan', () => {
    // 1. Kasus pemindahbukuan rekening (5 variasi berulang)
    const ofurikae = parseMeaningParts('pemindahbukuan rekening / pemindahbukuan / transfer internal / transfer rekening / transfer');
    assert.strictEqual(ofurikae.primary, 'Pemindahbukuan rekening');
    assert.strictEqual(ofurikae.secondary, '(atau: transfer internal)');

    // 2. Kasus salam / sapaan
    const konnichiwa = parseMeaningParts('Halo / Selamat siang');
    assert.strictEqual(konnichiwa.primary, 'Halo');
    assert.strictEqual(konnichiwa.secondary, '(atau: Selamat siang)');

    // 3. Kasus kurung penjelasan dengan garis miring internal (tidak boleh terpotong salah)
    const futsuu = parseMeaningParts('biasa (kereta biasa / lokal)');
    assert.strictEqual(futsuu.primary, 'Biasa (kereta biasa / lokal)');
    assert.strictEqual(futsuu.secondary, '');

    // 4. Kasus tunggal tanpa variasi
    const tanbou = parseMeaningParts('sawah');
    assert.strictEqual(tanbou.primary, 'Sawah');
    assert.strictEqual(tanbou.secondary, '');
  });
});

