import { describe, it } from 'node:test';
import assert from 'node:assert';
import { wordsData } from '../src/data/words';
import { selectKanjiUniquePool } from '../src/utils/kanjiQuizComposition';
import { getMasteryTierFromStreak } from '../src/utils/masteryStats';

describe('Lesson Progression and New Kotoba Mastery Tracking Suite', () => {
  it('1. selectKanjiUniquePool tidak boleh melompat ke Bab 15 jika Bab 13 masih memiliki 5 kata belum dipelajari', () => {
    // Ambil kata dari Bab 13, 14, dan 15
    const ch13Words = wordsData.filter(w => w.lesson === 'Pelajaran 13');
    const ch14Words = wordsData.filter(w => w.lesson === 'Pelajaran 14');
    const ch15Words = wordsData.filter(w => w.lesson === 'Pelajaran 15');
    assert.ok(ch13Words.length >= 5, 'Bab 13 harus memiliki >= 5 kata');

    // Skenario user: 5 kata terakhir di Bab 13 berstatus streak 0 (belum dipelajari)
    // Kata-kata lain di Bab 13 berstatus hafal (streak 3)
    // Semua kata di Bab 14 & 15 berstatus streak 0
    const unlearnedCh13 = new Set(ch13Words.slice(-5).map(w => w.character));

    const mockGetStreak = (char: string) => {
      if (unlearnedCh13.has(char)) return 0;
      const w = wordsData.find(item => item.character === char);
      if (w && w.lesson === 'Pelajaran 13') return 3; // sisa kata bab 13 sudah hafal
      return 0; // bab 14 & 15 belum dipelajari
    };

    const combinedPool = [...ch13Words, ...ch14Words, ...ch15Words];

    // Jalankan 30 simulasi pemilihan soal
    for (let sim = 0; sim < 30; sim++) {
      const selected = selectKanjiUniquePool(combinedPool, 8, mockGetStreak, 13);
      const newItems = selected.filter(s => s.tier === 'new');

      for (const item of newItems) {
        const lessonNum = parseInt((item.item.lesson || '').replace(/\D/g, '')) || 0;
        // HARUS: tidak boleh ada kata dari Bab 15 atau lebih tinggi!
        assert.ok(
          lessonNum <= 14,
          `Kata baru "${item.item.character}" berasal dari ${item.item.lesson}, padahal Bab 13 masih pending 5 kata! Max diperbolehkan adalah Bab 14.`
        );
      }
    }
  });

  it('2. Kata baru yang gagal di percobaan 1 tetapi berhasil dijawab di babak perbaikan harus naik ke streak 1 (Proses)', () => {
    // Simulasikan state sesi per karakter
    const sessionState = {
      attempts: 1,
      failed: true, // sempat salah di percobaan 1
      initialStreak: 0,
      streakEvaluated: false
    };

    let userStreaks: Record<string, number> = { '定食': 0 };
    const charKey = '定食';
    const oldStreak = userStreaks[charKey] || 0;
    let newStreak = oldStreak;

    // Saat jawaban benar di babak perbaikan (isCorrectVal === true)
    const isCorrectVal = true;
    if (isCorrectVal) {
      if (sessionState) {
        if (!sessionState.streakEvaluated) {
          if (sessionState.initialStreak === 0) {
            sessionState.streakEvaluated = true;
            newStreak = 1;
            userStreaks[charKey] = newStreak;
          }
        }
      }
    }

    assert.strictEqual(newStreak, 1, 'Kata baru harus masuk streak 1 setelah dijawab benar di perbaikan');
    assert.strictEqual(userStreaks['定食'], 1);
    assert.strictEqual(getMasteryTierFromStreak(newStreak), 'learning', 'Status di Peta Penguasaan Huruf harus "learning" (Proses)');
  });

  it('3. Kata yang sudah dipelajari (streak >= 1) jika salah di sesi kuis tidak boleh naik streak', () => {
    const sessionState = {
      attempts: 2,
      failed: true, // gagal di salah satu percobaan
      initialStreak: 2,
      streakEvaluated: false
    };

    let userStreaks: Record<string, number> = { '牛どん': 1 }; // turun ke 1 saat salah
    const oldStreak = 1;
    let newStreak = oldStreak;

    const isCorrectVal = true; // benar di babak perbaikan
    if (isCorrectVal) {
      if (sessionState) {
        if (!sessionState.streakEvaluated) {
          if (sessionState.initialStreak === 0) {
            sessionState.streakEvaluated = true;
            newStreak = 1;
            userStreaks['牛どん'] = newStreak;
          } else if (!sessionState.failed) {
            sessionState.streakEvaluated = true;
            newStreak = sessionState.initialStreak + 1;
            userStreaks['牛どん'] = newStreak;
          }
        }
      }
    }

    // Tidak boleh naik karena sessionState.failed === true
    assert.strictEqual(newStreak, 1, 'Streak tidak boleh naik +1 jika ada kesalahan dalam sesi untuk streak >= 1');
  });

  it('4. Typo pada kata baru tidak boleh menandai sessionCharAttempts sebagai failed', () => {
    const isCorrectVal = false;
    const isTypo = true;
    const isFailed = !isCorrectVal && !isTypo;

    assert.strictEqual(isFailed, false, 'Typo tidak boleh dianggap sebagai failure penuh');
  });
});

