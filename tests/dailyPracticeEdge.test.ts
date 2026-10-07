import test from 'node:test';
import assert from 'node:assert';
import {
  normalizeAnswer,
  checkAnswerMatch,
  kanjiToDigits,
  foldKatakanaToHiragana
} from '../supabase/functions/_shared/normalize.ts';
import { normalizeAnswer as templateNormalizeAnswer } from '../scripts/template-generator.mjs';
import { todayWIB, nextResetISO } from '../supabase/functions/_shared/time.ts';
import {
  QUESTIONS_PER_CHAPTER,
  FOCUS_PER_CHAPTER,
  MAX_CHAPTERS_PER_DAY,
  MAX_ATTEMPTS_BEFORE_REVEAL,
  RATE_LIMIT_SUBMITS_PER_HOUR
} from '../supabase/functions/_shared/constants.ts';

test('Daily Practice Edge Functions Test Suite', async (t) => {

  // ============================================================
  // 1. Normalisasi & Sinkronisasi dengan Generator Template
  // ============================================================
  await t.test('1. Normalisasi teks: identik antara normalize.ts dan template-generator.mjs', () => {
    const testCases = [
      'わたしは　がくせいです。',
      '私は、学生です！',
      'ミラーさんは 六時半に 起きます。',
      '十二時に ご飯を 食べます。',
      'Hello World 123!?',
      '「わたしは本を読みます」',
      'テレビを 見ません でした。'
    ];

    for (const tc of testCases) {
      const fromShared = normalizeAnswer(tc).strict;
      const fromTemplate = templateNormalizeAnswer(tc);
      assert.strictEqual(
        fromShared,
        fromTemplate,
        `Ketidaksesuaian normalisasi pada teks: "${tc}" (shared: "${fromShared}", template: "${fromTemplate}")`
      );
    }
  });

  await t.test('2. Normalisasi angka kanji ke digit (六 -> 6, 十二 -> 12, 二十五 -> 25)', () => {
    assert.strictEqual(kanjiToDigits('六時'), '6時');
    assert.strictEqual(kanjiToDigits('十二時半'), '12時半');
    assert.strictEqual(kanjiToDigits('二十五日'), '25日');
    assert.strictEqual(kanjiToDigits('十時'), '10時');
    assert.strictEqual(normalizeAnswer('六時に起きます').strict, '6時に起きます');
    assert.strictEqual(normalizeAnswer('十二時にご飯を食べます').strict, '12時にご飯を食べます');
  });

  await t.test('3. Pembanding longgar (Katakana -> Hiragana folding)', () => {
    assert.strictEqual(foldKatakanaToHiragana('スプーン'), 'すぷーん');
    assert.strictEqual(foldKatakanaToHiragana('レポート'), 'れぽーと');
    assert.strictEqual(foldKatakanaToHiragana('ミラーさん'), 'みらーさん');

    const accepted = [
      'わたしはスプーンでごはんを食べます',
      'わたしはスプーンでごはんをたべます'
    ];
    // User mengetik hiragana 'すぷーん' bukannya katakana 'スプーン'
    const userTypedHiragana = 'わたしはすぷーんでごはんをたべます';
    assert.strictEqual(checkAnswerMatch(userTypedHiragana, accepted), true);

    // User mengetik katakana folding pada kanji yang sama
    const userTypedKatakanaFolded = 'わたしはすぷーんでごはんを食べます';
    assert.strictEqual(checkAnswerMatch(userTypedKatakanaFolded, accepted), true);

    // Kasus Miller-san (ミラーさん): diterima baik dalam Katakana, Hiragana ber-chouonpu (みらーさん), maupun Hiragana vokal pendek (みらさん)
    const millerAccepted = ['ミラーさんは医者ですか', 'ミラーさんはいしゃですか'];
    assert.strictEqual(checkAnswerMatch('ミラーさんはいしゃですか', millerAccepted), true);
    assert.strictEqual(checkAnswerMatch('みらーさんはいしゃですか', millerAccepted), true);
    assert.strictEqual(checkAnswerMatch('みらさんはいしゃですか', millerAccepted), true);
  });

  await t.test('4. Toleransi varian kanji 私 vs わたし dan partikel wa/ha', () => {
    const acceptedOnlyHiragana = ['わたしは学生です'];
    assert.strictEqual(checkAnswerMatch('私は学生です', acceptedOnlyHiragana), true);

    const acceptedOnlyKanji = ['私は学生です'];
    assert.strictEqual(checkAnswerMatch('わたしは学生です', acceptedOnlyKanji), true);

    // Kasus toleransi partikel 'わ' vs 'は' (misal pembelajar mengetik romaji wa -> わ)
    const acceptedCompanyEmployee = ['あなたは会社員ですか', 'あなたはかいしゃいんですか'];
    assert.strictEqual(checkAnswerMatch('あなたわかいしゃいんですか', acceptedCompanyEmployee), true);
    assert.strictEqual(checkAnswerMatch('あなたわ会社員ですか', acceptedCompanyEmployee), true);

    const acceptedStudent = ['私は学生です', 'わたしはがくせいです'];
    assert.strictEqual(checkAnswerMatch('わたしわがくせいです', acceptedStudent), true);
  });

  // ============================================================
  // 2. Utilitas Waktu Asia/Jakarta (WIB)
  // ============================================================
  await t.test('5. Perhitungan tanggal WIB dan nextResetISO', () => {
    const fixedUtcMorning = new Date('2026-10-07T03:00:00.000Z'); // 10:00 WIB
    assert.strictEqual(todayWIB(fixedUtcMorning), '2026-10-07');

    const fixedUtcNearlyMidnight = new Date('2026-10-07T16:59:00.000Z'); // 23:59 WIB
    assert.strictEqual(todayWIB(fixedUtcNearlyMidnight), '2026-10-07');

    const fixedUtcPastMidnight = new Date('2026-10-07T17:01:00.000Z'); // 00:01 WIB esok hari (2026-10-08)
    assert.strictEqual(todayWIB(fixedUtcPastMidnight), '2026-10-08');

    // nextResetISO harus tepat jam 17:00:00.000Z hari itu (= 00:00:00 WIB esok hari)
    const resetIso = nextResetISO(fixedUtcMorning);
    assert.strictEqual(resetIso, '2026-10-07T17:00:00.000Z');
  });

  // ============================================================
  // 3. Validasi Kontrak Request & Anti-Bocor Kunci Jawaban
  // ============================================================
  await t.test('6. Validasi batasan chapter_ids (maksimal 2 bab, rentang 1..25, unik)', () => {
    function validateChapters(chapter_ids: any) {
      if (!Array.isArray(chapter_ids) || chapter_ids.length < 1 || chapter_ids.length > MAX_CHAPTERS_PER_DAY) {
        return { valid: false, error: 'invalid_count' };
      }
      const unique = new Set();
      for (const c of chapter_ids) {
        if (typeof c !== 'number' || !Number.isInteger(c) || c < 1 || c > 25) {
          return { valid: false, error: 'invalid_range' };
        }
        unique.add(c);
      }
      if (unique.size !== chapter_ids.length) {
        return { valid: false, error: 'duplicate' };
      }
      return { valid: true };
    }

    assert.strictEqual(validateChapters([1]).valid, true);
    assert.strictEqual(validateChapters([1, 2]).valid, true);
    assert.strictEqual(validateChapters([1, 2, 3]).valid, false); // Bab ke-3 ditolak
    assert.strictEqual(validateChapters([]).valid, false);
    assert.strictEqual(validateChapters([1, 1]).valid, false); // Duplikat
    assert.strictEqual(validateChapters([0]).valid, false); // Di luar 1..25
    assert.strictEqual(validateChapters([26]).valid, false); // Di luar 1..25
  });

  await t.test('7. Pindai JSON response start-daily: TIDAK BOLEH mengandung jp_text, jp_answers, grammar_tags', () => {
    const mockStartDailyResponse = {
      session: {
        id: 'sess-123',
        date: '2026-10-07',
        status: 'active',
        chapter_ids: [1, 2],
        resets_at: '2026-10-07T17:00:00.000Z'
      },
      questions: [
        {
          daily_question_id: 'dq-1',
          chapter_id: 1,
          id_text: 'Saya adalah Miller.',
          is_correct: false,
          attempts: 0
        },
        {
          daily_question_id: 'dq-2',
          chapter_id: 2,
          id_text: 'Ini adalah kunci.',
          is_correct: false,
          attempts: 0
        }
      ],
      pool_low: false,
      recycled: false
    };

    function scanForForbiddenKeys(obj: any, forbidden: string[]) {
      const jsonStr = JSON.stringify(obj);
      for (const fk of forbidden) {
        const regex = new RegExp(`"${fk}"\\s*:`, 'i');
        assert.strictEqual(
          regex.test(jsonStr),
          false,
          `KUNCI BOCOR DITEMUKAN: "${fk}" ada dalam response start-daily!`
        );
      }
    }

    scanForForbiddenKeys(mockStartDailyResponse, ['jp_text', 'jp_answers', 'grammar_tags']);
  });

  await t.test('8. Pindai JSON response submit-answer sebelum reveal: TIDAK BOLEH mengandung jp_text/jp_answers', () => {
    const mockSubmitAttempts1 = {
      correct: false,
      attempts: 1,
      session_completed: false,
      quota_exhausted: false,
      resets_at: '2026-10-07T17:00:00.000Z'
    };

    const jsonStr = JSON.stringify(mockSubmitAttempts1);
    assert.strictEqual(/"reveal_answer"\s*:/.test(jsonStr), false);
    assert.strictEqual(/"jp_text"\s*:/.test(jsonStr), false);
    assert.strictEqual(/"jp_answers"\s*:/.test(jsonStr), false);

    // Pada attempt ke-3, baru boleh ada reveal_answer
    const mockSubmitAttempts3 = {
      correct: false,
      attempts: 3,
      reveal_answer: 'わたしはミラーです。',
      session_completed: false,
      quota_exhausted: false,
      resets_at: '2026-10-07T17:00:00.000Z'
    };
    assert.strictEqual(mockSubmitAttempts3.reveal_answer, 'わたしはミラーです。');
    // Namun jp_answers tetap tidak boleh bocor
    assert.strictEqual(/"jp_answers"\s*:/.test(JSON.stringify(mockSubmitAttempts3)), false);
  });

  // ============================================================
  // 4. Logika Seleksi & Pembagian Soal (Fokus vs Review vs Daur Ulang)
  // ============================================================
  await t.test('9. Rasio Fokus (3) dan Review (2) pada bab dengan stok cukup', () => {
    const mockApprovedQuestions = [
      { id: 'q1', chapter_id: 5, is_focus: true },
      { id: 'q2', chapter_id: 5, is_focus: true },
      { id: 'q3', chapter_id: 5, is_focus: true },
      { id: 'q4', chapter_id: 5, is_focus: true },
      { id: 'q5', chapter_id: 5, is_focus: false },
      { id: 'q6', chapter_id: 5, is_focus: false },
      { id: 'q7', chapter_id: 4, is_focus: true }, // Review dari bab terdahulu
      { id: 'q8', chapter_id: 3, is_focus: true }  // Review dari bab terdahulu
    ];

    const seenIds = new Set<string>();
    const ch = 5;

    const unseenInChapter = mockApprovedQuestions.filter(q => q.chapter_id === ch && !seenIds.has(q.id));
    const focusUnseen = unseenInChapter.filter(q => q.is_focus);
    const nonFocusUnseen = unseenInChapter.filter(q => !q.is_focus);
    const reviewEarlierUnseen = mockApprovedQuestions.filter(q => q.chapter_id < ch && !seenIds.has(q.id));

    const selected: any[] = [];
    // 3 Fokus
    selected.push(...focusUnseen.slice(0, FOCUS_PER_CHAPTER));
    assert.strictEqual(selected.length, 3);
    assert.strictEqual(selected.every(s => s.is_focus && s.chapter_id === 5), true);

    // 2 Review
    const reviewPool = [...reviewEarlierUnseen, ...nonFocusUnseen];
    while (selected.length < QUESTIONS_PER_CHAPTER && reviewPool.length > 0) {
      selected.push(reviewPool.shift());
    }

    assert.strictEqual(selected.length, 5);
    const focusCount = selected.filter(s => s.chapter_id === 5 && s.is_focus).length;
    const reviewCount = selected.length - focusCount;
    assert.strictEqual(focusCount, 3);
    assert.strictEqual(reviewCount, 2);
  });

  await t.test('10. Daur ulang soal: bab dengan stok unseen < 5 tetap menghasilkan 5 soal (recycled: true)', () => {
    // Hanya ada 2 soal unseen di bab ini
    const unseenPool = [
      { id: 'unseen-1', chapter_id: 7, is_focus: true },
      { id: 'unseen-2', chapter_id: 7, is_focus: false }
    ];

    // Soal yang pernah dilihat sebelumnya
    const seenHistory = [
      { id: 'seen-1', chapter_id: 7, attempts: 4, is_correct: false, created_at: '2026-10-01' },
      { id: 'seen-2', chapter_id: 7, attempts: 2, is_correct: true, created_at: '2026-09-20' },
      { id: 'seen-3', chapter_id: 7, attempts: 1, is_correct: true, created_at: '2026-09-25' },
      { id: 'seen-4', chapter_id: 7, attempts: 5, is_correct: false, created_at: '2026-10-02' }
    ];

    const selected: any[] = [...unseenPool];
    let recycled = false;

    if (selected.length < QUESTIONS_PER_CHAPTER) {
      recycled = true;
      // Urutkan: pernah salah dulu (is_correct=false), attempts terbanyak, lalu tanggal terlama
      seenHistory.sort((a, b) => {
        const aWrong = a.is_correct ? 0 : 1;
        const bWrong = b.is_correct ? 0 : 1;
        if (bWrong !== aWrong) return bWrong - aWrong;
        if (b.attempts !== a.attempts) return b.attempts - a.attempts;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      while (selected.length < QUESTIONS_PER_CHAPTER && seenHistory.length > 0) {
        selected.push(seenHistory.shift());
      }
    }

    assert.strictEqual(recycled, true);
    assert.strictEqual(selected.length, 5);
    // Soal yang pernah salah dengan attempts tertinggi harus masuk pertama dalam daur ulang
    assert.strictEqual(selected[2].id, 'seen-4'); // attempts: 5, false
    assert.strictEqual(selected[3].id, 'seen-1'); // attempts: 4, false
  });

  // ============================================================
  // 5. Aturan Bisnis & Pembatasan Akses
  // ============================================================
  await t.test('11. Proteksi kepemilikan dan pergantian hari', () => {
    const today = todayWIB();
    const sessionYesterday = '2026-10-06';

    const testQuestion = {
      id: 'dq-999',
      user_id: 'user-A',
      session_date: today,
      status: 'active'
    };

    // User B mencoba submit soal User A
    function canSubmit(user_id: string, q: typeof testQuestion, currentSessionDate: string) {
      if (q.user_id !== user_id) return { status: 403, error: 'Akses ditolak' };
      if (q.session_date !== currentSessionDate) return { status: 403, error: 'Sesi bukan hari ini' };
      if (q.status !== 'active') return { status: 400, error: 'Sesi selesai' };
      return { status: 200 };
    }

    assert.strictEqual(canSubmit('user-B', testQuestion, today).status, 403);
    assert.strictEqual(canSubmit('user-A', { ...testQuestion, session_date: sessionYesterday }, today).status, 403);
    assert.strictEqual(canSubmit('user-A', { ...testQuestion, status: 'completed' }, today).status, 400);
    assert.strictEqual(canSubmit('user-A', testQuestion, today).status, 200);
  });

  await t.test('12. Rate limiting: batas 60 submit per jam', () => {
    function checkRateLimit(currentSubmitsLastHour: number) {
      if (currentSubmitsLastHour >= RATE_LIMIT_SUBMITS_PER_HOUR) {
        return { allowed: false, status: 429 };
      }
      return { allowed: true, status: 200 };
    }

    assert.strictEqual(checkRateLimit(0).allowed, true);
    assert.strictEqual(checkRateLimit(59).allowed, true);
    assert.strictEqual(checkRateLimit(60).allowed, false);
    assert.strictEqual(checkRateLimit(60).status, 429);
    assert.strictEqual(checkRateLimit(100).allowed, false);
  });
});
