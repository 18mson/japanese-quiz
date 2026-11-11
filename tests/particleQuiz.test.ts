// tests/particleQuiz.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PARTICLE_QUESTIONS } from '../src/data/particleSentencesData';

describe('Particle Quiz Logic & Dataset Test Suite', () => {
  it('1. Dataset partikel memuat pertanyaan dengan struktur valid', () => {
    assert.ok(PARTICLE_QUESTIONS.length >= 30, 'Jumlah soal partikel minimal 30');
    PARTICLE_QUESTIONS.forEach(q => {
      assert.ok(q.id, 'ID harus ada');
      assert.ok(q.chapter >= 1 && q.chapter <= 25, 'Chapter harus valid (1-25)');
      assert.ok(Array.isArray(q.correctParticles), 'correctParticles harus array');
      assert.ok(q.correctParticles.length > 0, 'Harus ada minimal 1 partikel yang benar');
      assert.ok(q.meaning, 'Harus ada arti bahasa Indonesia');
      assert.ok(q.explanation, 'Harus ada penjelasan');
    });
  });

  it('2. Evaluasi variasi ganda partikel [へ / に]', () => {
    const tokyoQuestion = PARTICLE_QUESTIONS.find(q => q.sentenceBefore.includes('とうきょう') && q.sentenceAfter.includes('いきます'));
    assert.ok(tokyoQuestion, 'Soal Tokyo harus ada');
    assert.deepStrictEqual(tokyoQuestion.correctParticles, ['へ', 'に']);

    // Cek kecocokan
    const acceptsHe = tokyoQuestion.correctParticles.includes('へ');
    const acceptsNi = tokyoQuestion.correctParticles.includes('に');
    const rejectsWo = tokyoQuestion.correctParticles.includes('を');

    assert.strictEqual(acceptsHe, true, 'Harus menerima partikel へ');
    assert.strictEqual(acceptsNi, true, 'Harus menerima partikel に');
    assert.strictEqual(rejectsWo, false, 'Harus menolak partikel を');
  });

  it('3. Evaluasi variasi partikel penerima/sumber [に / から]', () => {
    const senseiQuestion = PARTICLE_QUESTIONS.find(q => q.sentenceBefore.includes('先生') && q.sentenceAfter.includes('もらいました'));
    assert.ok(senseiQuestion, 'Soal menerima dari guru harus ada');
    assert.ok(senseiQuestion.correctParticles.includes('に'));
    assert.ok(senseiQuestion.correctParticles.includes('から'));
  });

  it('4. Evaluasi variasi objek keinginan [を / が]', () => {
    const mizuQuestion = PARTICLE_QUESTIONS.find(q => q.sentenceBefore.includes('水') && q.sentenceAfter.includes('のみたいです'));
    assert.ok(mizuQuestion, 'Soal minum air harus ada');
    assert.ok(mizuQuestion.correctParticles.includes('を'));
    assert.ok(mizuQuestion.correctParticles.includes('が'));
  });

  it('5. Evaluasi format tampilan variasi [particle a / particle b]', () => {
    const formatVariationDisplay = (item: typeof PARTICLE_QUESTIONS[0]) => {
      const valid = item.correctParticles.filter(p => p.trim() !== '');
      if (valid.length <= 1) {
        return valid[0] ? `[ ${valid[0]} ]` : '[ Tanpa Partikel ]';
      }
      return `[ ${valid.join(' / ')} ]`;
    };

    const tokyoQ = PARTICLE_QUESTIONS.find(q => q.sentenceBefore.includes('とうきょう'))!;
    assert.strictEqual(formatVariationDisplay(tokyoQ), '[ へ / に ]');

    const simpleQ = PARTICLE_QUESTIONS.find(q => q.id === 'pq_1_1')!;
    assert.strictEqual(formatVariationDisplay(simpleQ), '[ は ]');
  });
});

