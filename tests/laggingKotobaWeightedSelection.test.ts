import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  parseLessonNumber,
  getHighestActiveLessonNumber,
  calculateLearningItemWeight,
  pickWeightedLearningItem,
  getMaxNewUniquePerSession,
  buildKanjiSessionQuestions,
  getKanjiTierWeights,
  getKanjiRepeatWeights,
  type KanjiItem
} from '../src/utils/kanjiQuizComposition';

describe('Lagging Kotoba Adaptive Weighted Selection Suite', () => {
  test('1. parseLessonNumber mengekstrak nomor bab dengan tepat', () => {
    assert.strictEqual(parseLessonNumber('Pelajaran 1'), 1);
    assert.strictEqual(parseLessonNumber('Pelajaran 5'), 5);
    assert.strictEqual(parseLessonNumber('Pelajaran 10'), 10);
    assert.strictEqual(parseLessonNumber('Bab 25'), 25);
    assert.strictEqual(parseLessonNumber(undefined), 1);
    assert.strictEqual(parseLessonNumber(''), 1);
  });

  test('2. getHighestActiveLessonNumber mendeteksi bab tertinggi yang aktif dipelajari', () => {
    const mockPool: KanjiItem[] = [
      { character: '本', lesson: 'Pelajaran 1', romaji: 'hon' },
      { character: '駅', lesson: 'Pelajaran 5', romaji: 'eki' },
      { character: '町', lesson: 'Pelajaran 10', romaji: 'machi' },
      { character: '車', lesson: 'Pelajaran 15', romaji: 'kuruma' }
    ];

    const streaks: Record<string, number> = {
      '本': 3,
      '駅': 1,
      '町': 2,
      '車': 0 // Belum pernah dipelajari
    };

    const highest = getHighestActiveLessonNumber(mockPool, char => streaks[char] || 0, 1);
    assert.strictEqual(highest, 10, 'Bab tertinggi dengan streak > 0 seharusnya Bab 10');
  });

  test('3. calculateLearningItemWeight memberikan bobot power-law lebih tinggi pada bab yang tertinggal', () => {
    const currentLesson = 10;
    const itemBab5: KanjiItem = { character: '駅', lesson: 'Pelajaran 5', romaji: 'eki' };
    const itemBab7: KanjiItem = { character: '切符', lesson: 'Pelajaran 7', romaji: 'kippu' };
    const itemBab9: KanjiItem = { character: '歌', lesson: 'Pelajaran 9', romaji: 'uta' };
    const itemBab10: KanjiItem = { character: '町', lesson: 'Pelajaran 10', romaji: 'machi' };

    // Lag: Bab 5 = 5, Bab 7 = 3, Bab 9 = 1, Bab 10 = 0
    // Weight formula: Math.pow(1 + lag, 3) * streakMultiplier
    const weightBab5Streak1 = calculateLearningItemWeight(itemBab5, currentLesson, 1); // (1 + 5)^3 * 1.5 = 216 * 1.5 = 324
    const weightBab5Streak2 = calculateLearningItemWeight(itemBab5, currentLesson, 2); // (1 + 5)^3 * 1.0 = 216
    const weightBab7Streak2 = calculateLearningItemWeight(itemBab7, currentLesson, 2); // (1 + 3)^3 * 1.0 = 64
    const weightBab9Streak2 = calculateLearningItemWeight(itemBab9, currentLesson, 2); // (1 + 1)^3 * 1.0 = 8
    const weightBab10Streak2 = calculateLearningItemWeight(itemBab10, currentLesson, 2); // (1 + 0)^3 * 1.0 = 1

    assert.ok(weightBab5Streak1 > weightBab5Streak2, 'Streak 1 (urgensi tinggi) harus berbobot lebih besar dari streak 2');
    assert.ok(weightBab5Streak2 > weightBab7Streak2, 'Bab 5 harus berbobot lebih besar dari Bab 7');
    assert.ok(weightBab7Streak2 > weightBab9Streak2, 'Bab 7 harus berbobot lebih besar dari Bab 9');
    assert.ok(weightBab9Streak2 > weightBab10Streak2, 'Bab 9 harus berbobot lebih besar dari Bab 10');

    // Bobot Bab 5 (streak 1) adalah 324x lipat dibanding Bab 10 (streak 2)
    assert.strictEqual(weightBab5Streak1, 324);
    assert.strictEqual(weightBab10Streak2, 1);
    assert.ok(weightBab5Streak1 >= 300 * weightBab10Streak2);
  });

  test('4. pickWeightedLearningItem: Monte Carlo Simulation (10.000 iterasi) membuktikan distribusi probabilitas persentase adaptif', () => {
    const currentLesson = 10;
    const testItems: KanjiItem[] = [
      { character: 'kata_bab_5', lesson: 'Pelajaran 5', romaji: 'b5' },
      { character: 'kata_bab_7', lesson: 'Pelajaran 7', romaji: 'b7' },
      { character: 'kata_bab_9', lesson: 'Pelajaran 9', romaji: 'b9' },
      { character: 'kata_bab_10', lesson: 'Pelajaran 10', romaji: 'b10' }
    ];

    const streaks: Record<string, number> = {
      'kata_bab_5': 1, // lag 5, W = (1 + 5)^3 * 1.5 = 324
      'kata_bab_7': 2, // lag 3, W = (1 + 3)^3 * 1.0 = 64
      'kata_bab_9': 2, // lag 1, W = (1 + 1)^3 * 1.0 = 8
      'kata_bab_10': 2 // lag 0, W = (1 + 0)^3 * 1.0 = 1
    };
    // Total weight = 324 + 64 + 8 + 1 = 397
    // Ekspektasi teori:
    // Bab 5  : 324 / 397 ≈ 81.6%
    // Bab 7  :  64 / 397 ≈ 16.1%
    // Bab 9  :   8 / 397 ≈  2.0%
    // Bab 10 :   1 / 397 ≈  0.25%

    const counts: Record<string, number> = {
      kata_bab_5: 0,
      kata_bab_7: 0,
      kata_bab_9: 0,
      kata_bab_10: 0
    };

    const TOTAL_TRIALS = 10000;
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      const cloned = [...testItems];
      const picked = pickWeightedLearningItem(cloned, currentLesson, char => streaks[char] || 0);
      assert.ok(picked, 'Item harus berhasil terpilih');
      counts[picked.character]++;
    }

    const pctBab5 = (counts.kata_bab_5 / TOTAL_TRIALS) * 100;
    const pctBab7 = (counts.kata_bab_7 / TOTAL_TRIALS) * 100;
    const pctBab9 = (counts.kata_bab_9 / TOTAL_TRIALS) * 100;
    const pctBab10 = (counts.kata_bab_10 / TOTAL_TRIALS) * 100;

    // 1. Urutan frekuensi harus strictly descending sesuai ketertinggalan
    assert.ok(counts.kata_bab_5 > counts.kata_bab_7, `Bab 5 (${pctBab5}%) harus lebih sering dari Bab 7 (${pctBab7}%)`);
    assert.ok(counts.kata_bab_7 > counts.kata_bab_9, `Bab 7 (${pctBab7}%) harus lebih sering dari Bab 9 (${pctBab9}%)`);
    assert.ok(counts.kata_bab_9 > counts.kata_bab_10, `Bab 9 (${pctBab9}%) harus lebih sering dari Bab 10 (${pctBab10}%)`);

    // 2. Bab 10 tetap memiliki probabilitas nyata
    assert.ok(counts.kata_bab_10 > 0, 'Bab 10 tidak boleh 0 (tetap berbasis persentase)');

    // 3. Bab 5 mendominasi dengan persentase mayoritas (78% - 85%)
    assert.ok(pctBab5 >= 78.0 && pctBab5 <= 85.0, `Persentase Bab 5 (${pctBab5}%) harus berada di rentang 78% - 85%`);
  });

  test('5. Integrasi buildKanjiSessionQuestions dengan 100+ kata nyata: membuktikan kata Bab 5 pasti muncul dalam percobaan 5x', () => {
    // Membangun pool realistis yang merefleksikan kondisi akun user sebenarnya:
    // - Bab 5: 3 kata di "Proses" (streak 1-2, salah satunya typo)
    // - Bab 7: 1 kata proses
    // - Bab 8: 6 kata proses
    // - Bab 9: 45 kata proses
    // - Bab 10: 51 kata proses
    // - Bab 11: 7 kata proses (aktif)
    // - Puluhan kata mastered & new
    const realisticPool: KanjiItem[] = [];
    const streaks: Record<string, number> = {};

    // Bab 5: 3 kata tertinggal
    const bab5Words = ['人', '彼', '去年'];
    bab5Words.forEach((w, idx) => {
      realisticPool.push({ character: w, lesson: 'Pelajaran 5', romaji: w });
      streaks[w] = idx === 0 ? 1 : 2; // '人' streak 1, lainnya streak 2
    });

    // Bab 7: 1 kata
    realisticPool.push({ character: '切符', lesson: 'Pelajaran 7', romaji: 'kippu' });
    streaks['切符'] = 1;

    // Bab 8: 6 kata
    for (let i = 1; i <= 6; i++) {
      const char = `b8_word_${i}`;
      realisticPool.push({ character: char, lesson: 'Pelajaran 8', romaji: char });
      streaks[char] = 1;
    }

    // Bab 9: 45 kata
    for (let i = 1; i <= 45; i++) {
      const char = `b9_word_${i}`;
      realisticPool.push({ character: char, lesson: 'Pelajaran 9', romaji: char });
      streaks[char] = (i % 2) + 1; // streak 1 atau 2
    }

    // Bab 10: 50 kata
    for (let i = 1; i <= 50; i++) {
      const char = `b10_word_${i}`;
      realisticPool.push({ character: char, lesson: 'Pelajaran 10', romaji: char });
      streaks[char] = (i % 2) + 1;
    }

    // Bab 11: 10 kata (aktif)
    for (let i = 1; i <= 10; i++) {
      const char = `b11_word_${i}`;
      realisticPool.push({ character: char, lesson: 'Pelajaran 11', romaji: char });
      streaks[char] = (i % 2) + 1;
    }

    // Mastered words Bab 1 - 4 (10 kata)
    for (let i = 1; i <= 10; i++) {
      const char = `mastered_${i}`;
      realisticPool.push({ character: char, lesson: 'Pelajaran 2', romaji: char });
      streaks[char] = 4;
    }

    const currentLesson = 11;
    const BATCHES = 100; // Jalankan 100 percobaan "5x sesi kuis berturut-turut"
    let batchesWhereBab5Appeared = 0;

    for (let b = 0; b < BATCHES; b++) {
      let appearedInThis5Batch = false;

      // Percobaan 5x sesi kuis berturut-turut
      for (let sessionIndex = 0; sessionIndex < 5; sessionIndex++) {
        const session = buildKanjiSessionQuestions(realisticPool, 8, char => streaks[char] || 0, currentLesson);
        assert.strictEqual(session.length, 8, 'Setiap sesi harus 8 soal');

        // Verifikasi spacing constraint
        for (let j = 0; j < session.length - 1; j++) {
          assert.notStrictEqual(
            session[j].character,
            session[j + 1].character,
            `Slot ${j} dan ${j + 1} tidak boleh duplikat berturut-turut`
          );
        }

        const hasBab5 = session.some(q => bab5Words.includes(q.character));
        if (hasBab5) {
          appearedInThis5Batch = true;
        }
      }

      if (appearedInThis5Batch) {
        batchesWhereBab5Appeared++;
      }
    }

    const successRate = (batchesWhereBab5Appeared / BATCHES) * 100;
    // Kata Bab 5 harus muncul di minimal 90% dari percobaan 5x kuis
    assert.ok(
      successRate >= 90.0,
      `Dalam percobaan 5x kuis, Bab 5 harus muncul minimal 90% kesempatan. Hasil simulasi: ${successRate}% (${batchesWhereBab5Appeared}/${BATCHES})`
    );
  });

  test('6. getMaxNewUniquePerSession mematuhi ambang batas antrean proses (>30, >15, <=15)', () => {
    // 1. > 30 kata: TIDAK MASUK POOL (0 kata)
    assert.strictEqual(getMaxNewUniquePerSession(8, 31), 0, 'Jika antrean proses 31 (>30), kata baru harus 0');
    assert.strictEqual(getMaxNewUniquePerSession(8, 50), 0, 'Jika antrean proses 50 (>30), kata baru harus 0');
    assert.strictEqual(getMaxNewUniquePerSession(8, 113), 0, 'Jika antrean proses 113 (>30), kata baru harus 0');
    assert.strictEqual(getMaxNewUniquePerSession(24, 40), 0, 'Untuk durasi berapapun, jika >30 maka kata baru harus 0');

    // 2. > 15 kata (16 - 30): MASUK BERTAHAP (max 1 kata untuk sesi 8 soal)
    assert.strictEqual(getMaxNewUniquePerSession(8, 16), 1, 'Jika antrean proses 16 (>15), kata baru harus 1');
    assert.strictEqual(getMaxNewUniquePerSession(8, 25), 1, 'Jika antrean proses 25 (>15), kata baru harus 1');
    assert.strictEqual(getMaxNewUniquePerSession(8, 30), 1, 'Jika antrean proses 30 (>15), kata baru harus 1');

    // 3. <= 15 kata: NORMAL UNDIAN (2 - 3 kata)
    assert.strictEqual(getMaxNewUniquePerSession(8, 15), 3, 'Jika antrean proses 15 (<=15), kata baru normal 3');
    assert.strictEqual(getMaxNewUniquePerSession(8, 10), 3, 'Jika antrean proses 10 (<=15), kata baru normal 3');
    assert.strictEqual(getMaxNewUniquePerSession(8, 0), 3, 'Jika antrean proses 0, kata baru normal 3');
  });

  test('7. Integrasi: Saat antrean proses > 30, kuis 100% memblokir kata baru dan didominasi oleh kata Proses', () => {
    const testPool: KanjiItem[] = [];
    const streaks: Record<string, number> = {};

    // 40 kata dalam antrean proses (> 30)
    for (let i = 1; i <= 40; i++) {
      const char = `learning_item_${i}`;
      testPool.push({ character: char, lesson: 'Pelajaran 5', romaji: char });
      streaks[char] = (i % 2) + 1; // streak 1 atau 2
    }

    // 50 kata baru (belum pernah dipelajari, streak 0)
    for (let i = 1; i <= 50; i++) {
      const char = `new_item_${i}`;
      testPool.push({ character: char, lesson: 'Pelajaran 6', romaji: char });
      streaks[char] = 0;
    }

    // 10 kata hafal (streak 4)
    for (let i = 1; i <= 10; i++) {
      const char = `mastered_item_${i}`;
      testPool.push({ character: char, lesson: 'Pelajaran 2', romaji: char });
      streaks[char] = 4;
    }

    const SESSIONS = 50;
    let totalQuestions = 0;
    let totalLearningQuestions = 0;
    let totalNewQuestions = 0;

    for (let s = 0; s < SESSIONS; s++) {
      const session = buildKanjiSessionQuestions(testPool, 8, char => streaks[char] || 0, 6);
      assert.strictEqual(session.length, 8);

      session.forEach(q => {
        totalQuestions++;
        if (q.tier === 'learning') {
          totalLearningQuestions++;
        }
        if (q.tier === 'new') {
          totalNewQuestions++;
        }
      });
    }

    // 1. Kata baru harus mutlak 0 (tidak masuk pool sama sekali)
    assert.strictEqual(totalNewQuestions, 0, 'Kata baru harus 0% saat antrean proses > 30');

    // 2. Kategori proses harus sangat mendominasi (>= 80% dari total soal)
    const learningRatio = (totalLearningQuestions / totalQuestions) * 100;
    assert.ok(
      learningRatio >= 80.0,
      `Kategori proses harus mendominasi >= 80%. Hasil simulasi: ${learningRatio}% (${totalLearningQuestions}/${totalQuestions})`
    );
  });

  test('8. Saat antrean proses di bawah 10 (< 10), pool kata Hafal (mastered) diperbanyak signifikan', () => {
    // 1. Verifikasi bobot tier dinamis
    const weightsNormal = getKanjiTierWeights(15);
    assert.strictEqual(weightsNormal.learning, 55, 'Normal: learning = 55');
    assert.strictEqual(weightsNormal.mastered, 15, 'Normal: mastered = 15');

    const weightsLow = getKanjiTierWeights(5);
    assert.strictEqual(weightsLow.mastered, 50, 'Low (< 10): mastered dinaikkan ke 50 (tertinggi)');
    assert.strictEqual(weightsLow.learning, 25, 'Low (< 10): learning = 25');

    // 2. Verifikasi bobot repetisi
    const repeatWeightsLow = getKanjiRepeatWeights(5);
    assert.strictEqual(repeatWeightsLow.mastered, 2.5, 'Low (< 10): repetisi mastered dinaikkan ke 2.5');

    // 3. Uji integrasi sesi: pool dengan hanya 4 kata proses (< 10), 20 kata hafal (streak 3-4), 30 kata baru
    const testPool: KanjiItem[] = [];
    const streaks: Record<string, number> = {};

    // 4 kata proses (< 10)
    for (let i = 1; i <= 4; i++) {
      const char = `learning_item_${i}`;
      testPool.push({ character: char, lesson: 'Pelajaran 5', romaji: char });
      streaks[char] = (i % 2) + 1; // streak 1 atau 2
    }

    // 20 kata hafal
    for (let i = 1; i <= 20; i++) {
      const char = `mastered_item_${i}`;
      testPool.push({ character: char, lesson: 'Pelajaran 3', romaji: char });
      streaks[char] = 3;
    }

    // 30 kata baru
    for (let i = 1; i <= 30; i++) {
      const char = `new_item_${i}`;
      testPool.push({ character: char, lesson: 'Pelajaran 6', romaji: char });
      streaks[char] = 0;
    }

    const SESSIONS = 50;
    let totalQuestions = 0;
    let totalMasteredQuestions = 0;
    let totalMasteredUniqueCount = 0;

    for (let s = 0; s < SESSIONS; s++) {
      const session = buildKanjiSessionQuestions(testPool, 8, char => streaks[char] || 0, 5);
      assert.strictEqual(session.length, 8);

      const uniqueInSession = new Set<string>();
      session.forEach(q => {
        totalQuestions++;
        uniqueInSession.add(q.character);
        if (q.tier === 'mastered') {
          totalMasteredQuestions++;
        }
      });

      const masteredUniqueInSession = [...uniqueInSession].filter(c => streaks[c] === 3).length;
      totalMasteredUniqueCount += masteredUniqueInSession;
      // Setiap sesi harus memuat minimal 2 kata unik dari pool hafal
      assert.ok(masteredUniqueInSession >= 2, `Setiap sesi minimal memuat 2 kata hafal. Sesi ini: ${masteredUniqueInSession}`);
    }

    // Kata hafal harus mendominasi porsi soal (>= 50% dari total soal)
    const masteredRatio = (totalMasteredQuestions / totalQuestions) * 100;
    const avgUniqueMastered = totalMasteredUniqueCount / SESSIONS;

    assert.ok(
      masteredRatio >= 50.0,
      `Kata hafal harus muncul >= 50% saat proses < 10. Hasil: ${masteredRatio.toFixed(1)}% (${totalMasteredQuestions}/${totalQuestions})`
    );
    assert.ok(
      avgUniqueMastered >= 2.5,
      `Rata-rata kata hafal per sesi harus >= 2.5. Hasil: ${avgUniqueMastered.toFixed(2)}`
    );
  });
});
