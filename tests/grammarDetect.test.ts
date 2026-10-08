import test from 'node:test';
import assert from 'node:assert';
import kuromoji from 'kuromoji';
import { LESSONS, getAllowedTagsForLesson } from '../scripts/grammar/tags.mjs';
import { detectTags } from '../scripts/grammar/detect.mjs';

function buildTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tokenizer) => {
      if (err) reject(err);
      else resolve(tokenizer);
    });
  });
}

test('Grammar Detector Suite', async (t) => {
  const tokenizer = await buildTokenizer();

  await t.test('1. Validasi Semua 79 book_examples Bab 1 s.d. 25 Minna no Nihongo', () => {
    let checked = 0;
    for (const lesson of LESSONS) {
      const allowed = getAllowedTagsForLesson(lesson.lesson);
      for (const example of lesson.book_examples) {
        const tokens = tokenizer.tokenize(example);
        const { tags, unknown } = detectTags(tokens as any);

        assert.deepStrictEqual(
          unknown,
          [],
          `book_example Bab ${lesson.lesson} "${example}" memiliki unknown: ${unknown.join(', ')}`
        );

        const disallowed = Array.from(tags).filter(tag => !allowed.has(tag));
        assert.deepStrictEqual(
          disallowed,
          [],
          `book_example Bab ${lesson.lesson} "${example}" mendeteksi tag di luar kurikulum bab: ${disallowed.join(', ')}`
        );
        checked++;
      }
    }
    assert.strictEqual(checked, 79, 'Harus memvalidasi tepat 79 contoh kalimat resmi');
  });

  await t.test('2. Unit Test Spesifik: Pembedaan ADJ_I vs ADJ_NA', () => {
    // Kata sifat-i
    const resI = detectTags(tokenizer.tokenize('ケーキはおいしいです') as any);
    assert.ok(resI.tags.has('ADJ_I'), 'おいしい harus terdeteksi sebagai ADJ_I');
    assert.ok(!resI.tags.has('ADJ_NA'), 'おいしい TIDAK boleh terdeteksi sebagai ADJ_NA');

    // Kata sifat-na
    const resNa = detectTags(tokenizer.tokenize('ここは静かです') as any);
    assert.ok(resNa.tags.has('ADJ_NA'), '静か harus terdeteksi sebagai ADJ_NA');
    assert.ok(!resNa.tags.has('ADJ_I'), '静か TIDAK boleh terdeteksi sebagai ADJ_I');
  });

  await t.test('3. Unit Test Spesifik: Pembedaan DEM_THING vs DEM_ADNOM', () => {
    const resThing = detectTags(tokenizer.tokenize('これは辞書です') as any);
    assert.ok(resThing.tags.has('DEM_THING'), 'これ harus terdeteksi sebagai DEM_THING');
    assert.ok(!resThing.tags.has('DEM_ADNOM'), 'これ bukan DEM_ADNOM');

    const resAdnom = detectTags(tokenizer.tokenize('この傘はわたしのです') as any);
    assert.ok(resAdnom.tags.has('DEM_ADNOM'), 'この harus terdeteksi sebagai DEM_ADNOM');
    assert.ok(!resAdnom.tags.has('DEM_THING'), 'この bukan DEM_THING');
  });

  await t.test('4. Unit Test Spesifik: Pembedaan VERB_MASU vs VERB_MASHITA vs VERB_MASEN', () => {
    const resMasu = detectTags(tokenizer.tokenize('わたしは働きます') as any);
    assert.ok(resMasu.tags.has('VERB_MASU'));
    assert.ok(!resMasu.tags.has('VERB_MASHITA'));

    const resMashita = detectTags(tokenizer.tokenize('わたしは働きました') as any);
    assert.ok(resMashita.tags.has('VERB_MASHITA'));
    assert.ok(!resMashita.tags.has('VERB_MASU'));

    const resMasen = detectTags(tokenizer.tokenize('わたしは働きません') as any);
    assert.ok(resMasen.tags.has('VERB_MASEN'));
  });

  await t.test('5. Penolakan Konservatif: Konstruksi di Luar N5 Masuk ke Unknown', () => {
    // Pasif (れる / られる)
    const resPassive = detectTags(tokenizer.tokenize('魚が猫に食べられた') as any);
    assert.ok(resPassive.unknown.some(u => u.includes('passive_form')), 'Bentuk pasif harus ditolak');

    // Kausatif (せる / させる)
    const resCausative = detectTags(tokenizer.tokenize('母が子どもに本を読ませる') as any);
    assert.ok(resCausative.unknown.some(u => u.includes('causative_form')), 'Bentuk kausatif harus ditolak');

    // Ba-conditional (安ければ)
    const resBa = detectTags(tokenizer.tokenize('安ければ買います') as any);
    assert.ok(resBa.unknown.some(u => u.includes('ba_conditional')), 'Bentuk -ba harus ditolak');

    // Perintah kasar (行け)
    const resImp = detectTags(tokenizer.tokenize('早く行け') as any);
    assert.ok(resImp.unknown.some(u => u.includes('imperative_form')), 'Perintah kasar harus ditolak');
  });

  await t.test('6. Pembedaan PARTICLE_NI_TIME vs PARTICLE_NI_RECIPIENT', () => {
    const res = detectTags(tokenizer.tokenize('ミラーさんに花をあげます') as any);
    assert.ok(res.tags.has('PARTICLE_NI_RECIPIENT'), 'Harus mendeteksi PARTICLE_NI_RECIPIENT untuk penerima');
    assert.ok(!res.tags.has('PARTICLE_NI_TIME'), 'TIDAK boleh mendeteksi PARTICLE_NI_TIME pada penerima');
    assert.ok(res.tags.has('GIVE_AGEMASU'), 'Harus mendeteksi GIVE_AGEMASU');

    const resTime = detectTags(tokenizer.tokenize('わたしは7時に起きます') as any);
    assert.ok(resTime.tags.has('PARTICLE_NI_TIME'), 'Harus mendeteksi PARTICLE_NI_TIME pada waktu');
    assert.ok(!resTime.tags.has('PARTICLE_NI_RECIPIENT'), 'TIDAK boleh mendeteksi PARTICLE_NI_RECIPIENT pada waktu');
  });

  await t.test('7. Unit Test Spesifik: Keberadaan います (ARIMASU_IMASU & LOCATION_NI_EXIST) vs Progresif', () => {
    // あそこに佐藤さんがいます -> harus lolos ARIMASU_IMASU & LOCATION_NI_EXIST
    const resSato = detectTags(tokenizer.tokenize('あそこに佐藤さんがいます') as any);
    assert.ok(resSato.tags.has('ARIMASU_IMASU'), 'あそこに佐藤さんがいます harus memiliki ARIMASU_IMASU');
    assert.ok(resSato.tags.has('LOCATION_NI_EXIST'), 'あそこに佐藤さんがいます harus memiliki LOCATION_NI_EXIST');

    // 教室に先生がいます -> harus lolos ARIMASU_IMASU & LOCATION_NI_EXIST
    const resSensei = detectTags(tokenizer.tokenize('教室に先生がいます') as any);
    assert.ok(resSensei.tags.has('ARIMASU_IMASU'), '教室に先生がいます harus memiliki ARIMASU_IMASU');
    assert.ok(resSensei.tags.has('LOCATION_NI_EXIST'), '教室に先生がいます harus memiliki LOCATION_NI_EXIST');

    // 猫は公園にいます -> harus lolos ARIMASU_IMASU & LOCATION_NI_EXIST
    const resNeko = detectTags(tokenizer.tokenize('猫は公園にいます') as any);
    assert.ok(resNeko.tags.has('ARIMASU_IMASU'), '猫は公園にいます harus memiliki ARIMASU_IMASU');
    assert.ok(resNeko.tags.has('LOCATION_NI_EXIST'), '猫は公園にいます harus memiliki LOCATION_NI_EXIST');

    // 勉強しています -> TIDAK boleh ARIMASU_IMASU (ini bentuk progresif bab 14)
    const resBenkyou = detectTags(tokenizer.tokenize('勉強しています') as any);
    assert.ok(!resBenkyou.tags.has('ARIMASU_IMASU'), '勉強しています TIDAK boleh memiliki ARIMASU_IMASU');
    assert.ok(resBenkyou.tags.has('TE_IMASU_PROGRESSIVE'), '勉強しています harus memiliki TE_IMASU_PROGRESSIVE');
  });

  await t.test('8. Unit Test Spesifik: Negatif Lampau N/Na-adj dan Adj-i', () => {
    // きのうは雨じゃありませんでした -> PAST_NOUN_NA (+ NEG_JA_ARIMASEN), TANPA VERB_MASENDESHITA
    const resAme = detectTags(tokenizer.tokenize('きのうは雨じゃありませんでした') as any);
    assert.ok(resAme.tags.has('PAST_NOUN_NA'), 'きのうは雨じゃありませんでした harus memiliki PAST_NOUN_NA');
    assert.ok(resAme.tags.has('NEG_JA_ARIMASEN'), 'きのうは雨じゃありませんでした harus memiliki NEG_JA_ARIMASEN');
    assert.ok(!resAme.tags.has('VERB_MASENDESHITA'), 'きのうは雨じゃありませんでした TIDAK boleh memiliki VERB_MASENDESHITA');
    assert.ok(!resAme.tags.has('ARIMASU_IMASU'), 'きのうは雨じゃありませんでした TIDAK boleh memiliki ARIMASU_IMASU');

    // 先週は楽しくなかったです -> PAST_ADJ_I (+ ADJ_NEG), TANPA COPULA_DESU
    const resTanoshii = detectTags(tokenizer.tokenize('先週は楽しくなかったです') as any);
    assert.ok(resTanoshii.tags.has('PAST_ADJ_I'), '先週は楽しくなかったです harus memiliki PAST_ADJ_I');
    assert.ok(resTanoshii.tags.has('ADJ_NEG'), '先週は楽しくなかったです harus memiliki ADJ_NEG');
    assert.ok(!resTanoshii.tags.has('COPULA_DESU'), '先週は楽しくなかったです TIDAK boleh memiliki COPULA_DESU');

    // Varian ku arimasendeshita
    const resTanoshiiAlt = detectTags(tokenizer.tokenize('先週は楽しくありませんでした') as any);
    assert.ok(resTanoshiiAlt.tags.has('PAST_ADJ_I'), '先週は楽しくありませんでした harus memiliki PAST_ADJ_I');
    assert.ok(resTanoshiiAlt.tags.has('ADJ_NEG'), '先週は楽しくありませんでした harus memiliki ADJ_NEG');
    assert.ok(!resTanoshiiAlt.tags.has('COPULA_DESU'), '先週は楽しくありませんでした TIDAK boleh memiliki COPULA_DESU');
    assert.ok(!resTanoshiiAlt.tags.has('VERB_MASENDESHITA'), '先週は楽しくありませんでした TIDAK boleh memiliki VERB_MASENDESHITA');
  });

  await t.test('9. Unit Test Spesifik: Kata Kana-Saja (かたかな) Tidak Boleh Menghasilkan QUESTION_KA', () => {
    const res = detectTags(tokenizer.tokenize('ミラーさんはかたかながよくわかります') as any);
    assert.ok(!res.tags.has('QUESTION_KA'), 'かたかな TIDAK boleh menghasilkan QUESTION_KA');
    assert.ok(res.tags.has('PARTICLE_GA_OBJ'));
    assert.ok(res.tags.has('ADV_AMOUNT'));
  });
});

