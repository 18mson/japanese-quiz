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
});

