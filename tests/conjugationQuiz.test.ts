// tests/conjugationQuiz.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as wanakana from 'wanakana';
import { konjugasiKataKerjaData } from '../src/data/referenceData';
import { ADJECTIVE_ITEMS } from '../src/services/adjectiveConjugationService';

describe('Conjugation Quiz Logic & Dataset Test Suite', () => {
  it('1. Dataset kata kerja memuat 154 verba lengkap dengan 5 bentuk', () => {
    const k1 = konjugasiKataKerjaData.kelompok_1.verbs;
    const k2 = konjugasiKataKerjaData.kelompok_2.verbs;
    const k3 = konjugasiKataKerjaData.kelompok_3.verbs;
    const total = k1.length + k2.length + k3.length;
    assert.strictEqual(total, 154, 'Total kata kerja harus 154');

    [...k1, ...k2, ...k3].forEach(v => {
      assert.ok(v.masu, 'Harus punya bentuk masu');
      assert.ok(v.te, 'Harus punya bentuk te');
      assert.ok(v.kamus, 'Harus punya bentuk kamus');
      assert.ok(v.nai, 'Harus punya bentuk nai');
      assert.ok(v.ta, 'Harus punya bentuk ta');
      assert.ok(v.meaning, 'Harus punya arti');
    });
  });

  it('2. Dataset kata sifat memuat 40 entri valid dengan 5 bentuk konjugasi', () => {
    assert.strictEqual(ADJECTIVE_ITEMS.length, 40, 'Total kata sifat harus 40');
    ADJECTIVE_ITEMS.forEach(a => {
      assert.ok(a.kanji, 'Harus punya kanji/dasar');
      assert.ok(a.forms.presentPositive, 'Harus punya bentuk positif');
      assert.ok(a.forms.presentNegative, 'Harus punya bentuk negatif');
      assert.ok(a.forms.pastPositive, 'Harus punya bentuk lampau');
      assert.ok(a.forms.pastNegative, 'Harus punya bentuk negatif lampau');
      assert.ok(a.forms.teForm, 'Harus punya bentuk te');
    });
  });

  it('3. Pengecualian kata sifat "いい" (bagus) terkonjugasi akurat', () => {
    const iiAdj = ADJECTIVE_ITEMS.find(a => a.kana === 'いい')!;
    assert.ok(iiAdj, 'Kata sifat ii harus ada');
    assert.strictEqual(iiAdj.forms.presentNegative, 'よくない');
    assert.strictEqual(iiAdj.forms.pastPositive, 'よかった');
    assert.strictEqual(iiAdj.forms.pastNegative, 'よくなかった');
    assert.strictEqual(iiAdj.forms.teForm, 'よくて');
  });

  it('4. Konjugasi kata sifat-na "静か" terkonjugasi akurat', () => {
    const shizukaAdj = ADJECTIVE_ITEMS.find(a => a.kanji === '静か')!;
    assert.ok(shizukaAdj, 'Kata sifat shizuka harus ada');
    assert.strictEqual(shizukaAdj.forms.presentNegative, '静かじゃない');
    assert.strictEqual(shizukaAdj.forms.pastPositive, '静かだった');
    assert.strictEqual(shizukaAdj.forms.pastNegative, '静かじゃなかった');
    assert.strictEqual(shizukaAdj.forms.teForm, '静かで');
  });

  it('5. Evaluasi pembersihan spasi kata kerja (e.g. あわ ない -> あわない)', () => {
    const auVerb = konjugasiKataKerjaData.kelompok_1.verbs.find(v => v.masu === '会います')!;
    const cleanNai = auVerb.nai.replace(/[\s－-]/g, '');
    assert.strictEqual(cleanNai, 'あわない');
  });

  it('6. Transliterasi typing input via wanakana mengubah romaji ke hiragana', () => {
    assert.strictEqual(wanakana.toHiragana('tabete'), 'たべて');
    assert.strictEqual(wanakana.toHiragana('nomimasu'), 'のみます');
    assert.strictEqual(wanakana.toHiragana('shizukade'), 'しずかで');
    assert.strictEqual(wanakana.toHiragana('omoshirokatta'), 'おもしろかった');
  });
});

