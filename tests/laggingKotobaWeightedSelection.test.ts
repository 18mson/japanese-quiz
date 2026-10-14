import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  parseLessonNumber,
  getHighestActiveLessonNumber,
  calculateLearningItemWeight,
  pickWeightedLearningItem,
  buildKanjiSessionQuestions,
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

  test('3. calculateLearningItemWeight memberikan bobot linier lebih tinggi pada bab yang tertinggal', () => {
    const currentLesson = 10;
    const itemBab5: KanjiItem = { character: '駅', lesson: 'Pelajaran 5', romaji: 'eki' };
    const itemBab7: KanjiItem = { character: '切符', lesson: 'Pelajaran 7', romaji: 'kippu' };
    const itemBab9: KanjiItem = { character: '歌', lesson: 'Pelajaran 9', romaji: 'uta' };
    const itemBab10: KanjiItem = { character: '町', lesson: 'Pelajaran 10', romaji: 'machi' };

    // Lag: Bab 5 = 5, Bab 7 = 3, Bab 9 = 1, Bab 10 = 0
    // Weight formula: (1 + lag * 2.0) * streakMultiplier
    const weightBab5Streak1 = calculateLearningItemWeight(itemBab5, currentLesson, 1); // (1 + 10) * 1.25 = 13.75
    const weightBab5Streak2 = calculateLearningItemWeight(itemBab5, currentLesson, 2); // (1 + 10) * 1.0 = 11.0
    const weightBab7Streak2 = calculateLearningItemWeight(itemBab7, currentLesson, 2); // (1 + 6) * 1.0 = 7.0
    const weightBab9Streak2 = calculateLearningItemWeight(itemBab9, currentLesson, 2); // (1 + 2) * 1.0 = 3.0
    const weightBab10Streak2 = calculateLearningItemWeight(itemBab10, currentLesson, 2); // (1 + 0) * 1.0 = 1.0

    assert.ok(weightBab5Streak1 > weightBab5Streak2, 'Streak 1 (urgensi tinggi) harus berbobot lebih besar dari streak 2');
    assert.ok(weightBab5Streak2 > weightBab7Streak2, 'Bab 5 harus berbobot lebih besar dari Bab 7');
    assert.ok(weightBab7Streak2 > weightBab9Streak2, 'Bab 7 harus berbobot lebih besar dari Bab 9');
    assert.ok(weightBab9Streak2 > weightBab10Streak2, 'Bab 9 harus berbobot lebih besar dari Bab 10');

    // Bobot Bab 5 (streak 1) harus lebih dari 10x lipat dibanding Bab 10 (streak 2)
    assert.strictEqual(weightBab5Streak1, 13.75);
    assert.strictEqual(weightBab10Streak2, 1.0);
    assert.ok(weightBab5Streak1 >= 10 * weightBab10Streak2);
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
      'kata_bab_5': 1, // lag 5, W = (1 + 10) * 1.25 = 13.75
      'kata_bab_7': 2, // lag 3, W = (1 + 6) * 1.0 = 7.0
      'kata_bab_9': 2, // lag 1, W = (1 + 2) * 1.0 = 3.0
      'kata_bab_10': 2 // lag 0, W = (1 + 0) * 1.0 = 1.0
    };
    // Total weight = 13.75 + 7.0 + 3.0 + 1.0 = 24.75
    // Ekspektasi teori:
    // Bab 5  : 13.75 / 24.75 ≈ 55.5%
    // Bab 7  :  7.00 / 24.75 ≈ 28.3%
    // Bab 9  :  3.00 / 24.75 ≈ 12.1%
    // Bab 10 :  1.00 / 24.75 ≈  4.0%

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

    // 2. Bab 10 tetap memiliki probabilitas nyata (> 2% dan < 8%)
    assert.ok(counts.kata_bab_10 > 0, 'Bab 10 tidak boleh 0 (tetap berbasis persentase)');
    assert.ok(pctBab10 >= 2.0 && pctBab10 <= 8.0, `Persentase Bab 10 (${pctBab10}%) harus berada di rentang 2% - 8%`);

    // 3. Bab 5 mendominasi dengan persentase mayoritas (50% - 62%)
    assert.ok(pctBab5 >= 50.0 && pctBab5 <= 62.0, `Persentase Bab 5 (${pctBab5}%) harus berada di rentang 50% - 62%`);
  });

  test('5. Integrasi buildKanjiSessionQuestions memasukkan kata tertinggal ke sesi kuis', () => {
    // Simulasi dataset kata seperti kondisi akun user:
    // Bab 1-4 sudah streak 3-5 (Hafal/Mahkota)
    // Bab 5: 1 kata tertinggal streak 1 (Proses)
    // Bab 6-9: streak 3
    // Bab 10: kata aktif streak 1-2
    const mockWordsPool: KanjiItem[] = [
      { character: '私', lesson: 'Pelajaran 1', romaji: 'watashi', meaning: 'saya' },
      { character: 'これ', lesson: 'Pelajaran 2', romaji: 'kore', meaning: 'ini' },
      { character: 'ここ', lesson: 'Pelajaran 3', romaji: 'koko', meaning: 'di sini' },
      { character: '今', lesson: 'Pelajaran 4', romaji: 'ima', meaning: 'sekarang' },
      // Kata tertinggal di Bab 5:
      { character: '飛行機', lesson: 'Pelajaran 5', romaji: ['hikouki', 'hikoki'], meaning: 'pesawat terbang' },
      // Kata aktif di Bab 10:
      { character: '町', lesson: 'Pelajaran 10', romaji: 'machi', meaning: 'kota' },
      { character: '店', lesson: 'Pelajaran 10', romaji: 'mise', meaning: 'toko' },
      { character: '公園', lesson: 'Pelajaran 10', romaji: 'kouen', meaning: 'taman' },
      { character: '病院', lesson: 'Pelajaran 10', romaji: 'byouin', meaning: 'rumah sakit' }
    ];

    const streaks: Record<string, number> = {
      '私': 4,
      'これ': 3,
      'ここ': 4,
      '今': 5,
      '飛行機': 1, // Kategori Proses di Bab 5!
      '町': 2,
      '店': 1,
      '公園': 2,
      '病院': 0 // new
    };

    let hikoukiIncludedCount = 0;
    const SESSIONS_RUN = 50;

    for (let i = 0; i < SESSIONS_RUN; i++) {
      const session = buildKanjiSessionQuestions(mockWordsPool, 8, char => streaks[char] || 0, 10);
      assert.strictEqual(session.length, 8, 'Setiap sesi kuis harus memiliki tepat 8 soal');

      // Verifikasi kendala jarak (spacing constraint: tidak ada 2 kata berturut-turut sama)
      for (let j = 0; j < session.length - 1; j++) {
        assert.notStrictEqual(
          session[j].character,
          session[j + 1].character,
          `Slot ${j} dan ${j + 1} tidak boleh memiliki karakter yang sama persis`
        );
      }

      if (session.some(q => q.character === '飛行機')) {
        hikoukiIncludedCount++;
      }
    }

    // Karena bobotnya tinggi, kata tertinggal '飛行機' harus sering masuk ke dalam sesi kuis
    assert.ok(
      hikoukiIncludedCount >= SESSIONS_RUN * 0.7,
      `Kata Bab 5 yang tertinggal harus muncul di minimal 70% sesi kuis (Muncul: ${hikoukiIncludedCount}/${SESSIONS_RUN})`
    );
  });
});
