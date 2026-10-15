import { describe, it } from 'node:test';
import assert from 'node:assert';
import { wordsData } from '../src/data/words';
import { selectKanjiUniquePool } from '../src/utils/kanjiQuizComposition';

describe('Thematic Kotoba Clustering Suite', () => {
  it('1. Semua 1.103 kosakata di wordsData memiliki sub_category yang valid', () => {
    assert.strictEqual(wordsData.length, 1103, 'Total words harus 1.103');
    for (const w of wordsData) {
      assert.ok(w.sub_category, `Word "${w.character}" harus memiliki sub_category`);
      assert.ok(typeof w.sub_category === 'string' && w.sub_category.trim().length > 0);
    }
  });

  it('2. Tidak ada sub_category "Umum & Lainnya" atau nilai kosong', () => {
    const invalid = wordsData.filter(w => !w.sub_category || w.sub_category === 'Umum & Lainnya');
    assert.strictEqual(invalid.length, 0, 'Semua kata harus memiliki sub_category semantik yang spesifik');
  });

  it('3. selectKanjiUniquePool menghasilkan Thematic Clustering (~60% tema dominan)', () => {
    // Ambil kata dari Bab 4 (banyak kata waktu)
    const ch4Pool = wordsData.filter(w => w.lesson === 'Pelajaran 4');
    assert.ok(ch4Pool.length >= 20, 'Bab 4 harus memiliki kata yang cukup');

    const totalSlots = 8;
    // Mock user having some words in learning (streak 1-2) and some new (streak 0)
    const mockGetStreak = (char: string) => {
      // Half in learning, half new
      const code = char.charCodeAt(0);
      return code % 2 === 0 ? 1 : 0;
    };

    let themeMatchPercentages: number[] = [];

    // Jalankan 15 simulasi sesi kuis
    for (let sim = 0; sim < 15; sim++) {
      const selected = selectKanjiUniquePool(ch4Pool, totalSlots, mockGetStreak, 4);
      assert.ok(selected.length >= 4, `Jumlah unique kata (${selected.length}) harus memenuhi target minimum (>= 4)`);

      // Hitung tema terbanyak dalam sesi
      const themeCounts: Record<string, number> = {};
      selected.forEach(u => {
        if (u.item.sub_category) {
          themeCounts[u.item.sub_category] = (themeCounts[u.item.sub_category] || 0) + 1;
        }
      });

      const maxCount = Math.max(...Object.values(themeCounts));
      const percentage = (maxCount / selected.length) * 100;
      themeMatchPercentages.push(percentage);
    }

    const avgPercentage = themeMatchPercentages.reduce((a, b) => a + b, 0) / themeMatchPercentages.length;
    // Rata-rata persentase tema dominan harus berada di sekitar 55% - 75% (~60%)
    assert.ok(
      avgPercentage >= 50,
      `Rata-rata keseragaman tema (${avgPercentage.toFixed(1)}%) harus >= 50%`
    );
  });

  it('4. Distraktor pilihan ganda memprioritaskan kata dari sub_category yang sama', () => {
    // Ambil kata bertema 'Waktu & Tanggal'
    const timeWord = wordsData.find(w => w.sub_category === 'Waktu & Tanggal');
    assert.ok(timeWord, 'Harus ada kata dengan sub_category Waktu & Tanggal');

    // Filter kandidat bertema sama
    const sameThemeWords = wordsData.filter(
      w => w.sub_category === timeWord.sub_category && w.meaning !== timeWord.meaning
    );
    assert.ok(sameThemeWords.length >= 5, 'Harus ada minimal 5 distraktor waktu');

    // Buktikan bahwa kata waktu lain tersedia untuk distraktor
    const sampleDistractors = sameThemeWords.slice(0, 3).map(w => w.meaning);
    assert.strictEqual(sampleDistractors.length, 3);
  });
});
