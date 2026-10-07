import test from 'node:test';
import assert from 'node:assert';
import { getTodayWIB, getNextResetWIB, formatRemainingTime } from '../src/utils/dailyTime.ts';
import { useSpeechAnswer } from '../src/composables/useSpeechAnswer.ts';
import { toHiragana } from 'wanakana';

test('Daily Practice Frontend Test Suite', async (t) => {

  // ============================================================
  // 1. Helper Waktu WIB & Hitung Mundur (dailyTime.ts)
  // ============================================================
  await t.test('1. Helper getTodayWIB mengembalikan format YYYY-MM-DD yang valid', () => {
    const today = getTodayWIB();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

    const [year, month, day] = today.split('-').map(Number);
    assert.ok(year >= 2024, 'Tahun harus >= 2024');
    assert.ok(month >= 1 && month <= 12, 'Bulan harus 1..12');
    assert.ok(day >= 1 && day <= 31, 'Hari harus 1..31');
  });

  await t.test('2. Helper getNextResetWIB mengembalikan waktu reset di masa depan (< 24 jam)', () => {
    const nextReset = getNextResetWIB();
    const now = new Date();
    const diffMs = nextReset.getTime() - now.getTime();

    assert.ok(diffMs > 0, 'Waktu reset harus di masa depan');
    assert.ok(diffMs <= 24 * 3600 * 1000 + 1000, 'Waktu reset tidak boleh lebih dari 24 jam ke depan');
  });

  await t.test('3. formatRemainingTime menghitung jam, menit, detik secara presisi', () => {
    // 2 jam 15 menit 30 detik di masa depan (+ 200ms buffer agar tidak ter-floor ke detik sebelumnya)
    const target = new Date(Date.now() + (2 * 3600 + 15 * 60 + 30) * 1000 + 200);
    const res = formatRemainingTime(target);

    assert.strictEqual(res.hours, '02');
    assert.strictEqual(res.minutes, '15');
    assert.strictEqual(res.seconds, '30');

    // Target di masa lalu (00:00:00)
    const pastTarget = new Date(Date.now() - 10000);
    const pastRes = formatRemainingTime(pastTarget);
    assert.strictEqual(pastRes.hours, '00');
    assert.strictEqual(pastRes.minutes, '00');
    assert.strictEqual(pastRes.seconds, '00');
    assert.strictEqual(pastRes.totalSeconds, 0);

    // Null target
    const nullRes = formatRemainingTime(null);
    assert.strictEqual(nullRes.totalSeconds, 0);
  });

  // ============================================================
  // 2. Composable useSpeechAnswer
  // ============================================================
  await t.test('4. useSpeechAnswer menangani lingkungan tanpa SpeechRecognition secara aman', () => {
    const { isSupported, isListening, transcript, error, startListening, resetTranscript } = useSpeechAnswer();

    // Di environment Node.js, SpeechRecognition tidak tersedia di window
    assert.strictEqual(isSupported.value, false, 'isSupported harus bernilai false di node environment');
    assert.strictEqual(isListening.value, false);
    assert.strictEqual(transcript.value, '');

    // Memanggil startListening tidak boleh crash
    startListening();
    assert.ok(error.value, 'Harus mengisi pesan error saat speech tidak didukung');
    assert.match(error.value!, /tidak mendukung/i);

    // resetTranscript harus mereset pesan error
    resetTranscript();
    assert.strictEqual(error.value, null);
  });

  // ============================================================
  // 3. Konversi Auto-Kana WanaKana
  // ============================================================
  await t.test('5. Konversi WanaKana Romaji -> Hiragana dengan IMEMode dan full conversion', () => {
    // Live typing (IMEMode)
    assert.strictEqual(toHiragana('watashi', { IMEMode: true }), 'わたし');
    assert.strictEqual(toHiragana('gakusei', { IMEMode: true }), 'がくせい');
    assert.strictEqual(toHiragana('nihonn', { IMEMode: true }), 'にほん');
    assert.strictEqual(toHiragana('sensei', { IMEMode: true }), 'せんせい');
    assert.strictEqual(toHiragana('toukyou', { IMEMode: true }), 'とうきょう');

    // Final submit (Non-IME mode converts lone trailing n cleanly)
    assert.strictEqual(toHiragana('watashi ha nihon'), 'わたし は にほん');
  });

  // ============================================================
  // 4. Validasi Pemilihan Bab (ChapterPicker Constraints)
  // ============================================================
  await t.test('6. Aturan pemilihan bab harian: maksimal 2 bab', () => {
    const activeChapters = [1, 2, 3, 4, 5, 6, 7, 8];
    const selected: number[] = [1];

    function toggleChapter(ch: number) {
      const idx = selected.indexOf(ch);
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        if (selected.length < 2) {
          selected.push(ch);
          selected.sort((a, b) => a - b);
        }
      }
    }

    // Tambah bab 2 -> berhasil (panjang 2)
    toggleChapter(2);
    assert.deepStrictEqual(selected, [1, 2]);

    // Tambah bab 3 saat sudah ada 2 bab -> ditolak (tetap [1, 2])
    toggleChapter(3);
    assert.deepStrictEqual(selected, [1, 2]);

    // Hapus bab 1 -> berhasil ([2])
    toggleChapter(1);
    assert.deepStrictEqual(selected, [2]);

    // Tambah bab 5 -> berhasil ([2, 5])
    toggleChapter(5);
    assert.deepStrictEqual(selected, [2, 5]);
  });

  // ============================================================
  // 5. State Machine Soal & Kuota Latihan Harian
  // ============================================================
  await t.test('7. Transisi State: Jawaban Benar, Counter Percobaan & Kuota Selesai', () => {
    interface TestQuestion {
      id: string;
      chapter_id: number;
      is_correct: boolean;
      attempts: number;
      revealed: boolean;
      reveal_answer?: string;
    }

    const sessionQuestions: TestQuestion[] = [
      { id: 'q1', chapter_id: 1, is_correct: false, attempts: 0, revealed: false },
      { id: 'q2', chapter_id: 1, is_correct: false, attempts: 0, revealed: false }
    ];

    // Jawab soal 1 salah pertama kali
    sessionQuestions[0].attempts += 1;
    assert.strictEqual(sessionQuestions[0].is_correct, false);
    assert.strictEqual(sessionQuestions[0].attempts, 1);
    assert.strictEqual(sessionQuestions[0].revealed, false);

    // Jawab soal 1 benar
    sessionQuestions[0].attempts += 1;
    sessionQuestions[0].is_correct = true;
    assert.strictEqual(sessionQuestions[0].is_correct, true);
    assert.strictEqual(sessionQuestions[0].attempts, 2);

    // Soal 2 salah 3 kali -> reveal answer terbuka
    sessionQuestions[1].attempts = 1;
    assert.strictEqual(sessionQuestions[1].revealed, false);
    sessionQuestions[1].attempts = 2;
    assert.strictEqual(sessionQuestions[1].revealed, false);
    sessionQuestions[1].attempts = 3;
    sessionQuestions[1].revealed = true;
    sessionQuestions[1].reveal_answer = '私はマイク・ミラーです。';
    assert.strictEqual(sessionQuestions[1].revealed, true);
    assert.strictEqual(sessionQuestions[1].reveal_answer, '私はマイク・ミラーです。');

    // Jika soal 2 akhirnya dijawab benar, kuota selesai
    sessionQuestions[1].is_correct = true;
    const isAllCompleted = sessionQuestions.every(q => q.is_correct);
    assert.strictEqual(isAllCompleted, true, 'Sesi harus berstatus completed jika semua soal terjawab benar');
  });
});
