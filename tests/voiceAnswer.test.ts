import test from 'node:test';
import assert from 'node:assert';
import {
  wibDayStartUtc,
  nextWibDayStartUtc,
  isHallucination,
  normalizeTranscript
} from '../supabase/functions/transcribe/utils.ts';
import { checkAnswerWithDetails } from '../src/utils/answerChecker.ts';

// Setup mock window, localStorage & WebSocket for Node environment
class MockLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = new MockLocalStorage();
if (!(globalThis as any).WebSocket) {
  (globalThis as any).WebSocket = class MockWebSocket {};
}

// Dynamically import useVoiceAnswer after WebSocket polyfill
const {
  useVoiceAnswer,
  buildVocabPrompt,
  getSttLogs,
  saveSttLog,
  updateLastSttLogMatch
} = await import('../src/composables/useVoiceAnswer.ts');

test('Voice Answer & Whisper Transcribe Test Suite', async (t) => {
  t.beforeEach(() => {
    (globalThis as any).localStorage.clear();
  });

  // ============================================================
  // 1. buildVocabPrompt: Chapter Keywords & Anti-Leakage
  // ============================================================
  await t.test('1.1 buildVocabPrompt menghasilkan kata dari chapter yang sesuai', () => {
    const prompt = buildVocabPrompt(1);
    assert.ok(prompt.length > 0, 'Prompt tidak boleh kosong untuk chapter 1');
    const words = prompt.split(' ');
    assert.ok(words.length <= 30, `Jumlah kata harus <= 30, actual: ${words.length}`);
    // Kata-kata umum bab 1 seperti こんにちは atau わたし
    assert.ok(words.some(w => ['こんにちは', 'ありがとう', 'すみません', 'わたし'].includes(w)), 'Harus mengandung kosakata bab 1');
  });

  await t.test('1.2 buildVocabPrompt STRICTLY mengecualikan kunci jawaban target', () => {
    const excludeAnswers = ['こんにちは', 'わたしはがくせいです'];
    const prompt = buildVocabPrompt(1, excludeAnswers);
    const words = prompt.split(' ');

    assert.ok(!words.includes('こんにちは'), 'Kunci jawaban "こんにちは" tidak boleh bocor ke prompt');
    assert.ok(!words.includes('わたし'), 'Kata yang merupakan bagian dari kunci jawaban "わたし" tidak boleh bocor ke prompt');
  });

  await t.test('1.3 buildVocabPrompt mengembalikan string kosong jika chapterId tidak valid', () => {
    const prompt = buildVocabPrompt(undefined);
    assert.strictEqual(prompt, '', 'Harus string kosong jika chapterId undefined');
  });

  // ============================================================
  // 2. STT Compare Log & LocalStorage Management (max 200 items)
  // ============================================================
  await t.test('2.1 saveSttLog menyimpan log dan getSttLogs membaca dengan benar', () => {
    saveSttLog({
      mode: 'whisper',
      transcript: 'わたしはがくせいです',
      duration_ms: 1200,
      chapter_id: 1
    });

    const logs = getSttLogs();
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].mode, 'whisper');
    assert.strictEqual(logs[0].transcript, 'わたしはがくせいです');
    assert.strictEqual(logs[0].duration_ms, 1200);
    assert.ok(logs[0].timestamp, 'Timestamp harus terisi otomatis');
  });

  await t.test('2.2 saveSttLog membatasi log maksimal 200 entri (FIFO)', () => {
    for (let i = 0; i < 210; i++) {
      saveSttLog({
        mode: 'whisper',
        transcript: `test ${i}`,
        duration_ms: 1000
      });
    }

    const logs = getSttLogs();
    assert.strictEqual(logs.length, 200, 'Jumlah log harus dipotong menjadi maksimal 200');
    // Yang paling awal harus 'test 10' karena 0..9 terhapus
    assert.strictEqual(logs[0].transcript, 'test 10');
    assert.strictEqual(logs[logs.length - 1].transcript, 'test 209');
  });

  await t.test('2.3 updateLastSttLogMatch mengupdate isMatch pada log terbaru', () => {
    saveSttLog({
      mode: 'whisper',
      transcript: 'あさごはんをたべます',
      duration_ms: 1500
    });

    updateLastSttLogMatch(true);

    const logs = getSttLogs();
    assert.strictEqual(logs[logs.length - 1].isMatch, true);
  });

  // ============================================================
  // 3. Edge Function Utils: WIB Calculation & Hallucination Guard
  // ============================================================
  await t.test('3.1 wibDayStartUtc dan nextWibDayStartUtc menghitung batas waktu WIB (UTC+7)', () => {
    // 2026-10-14T20:00:00Z -> jam 03:00 WIB tgl 15 -> start WIB adalah 2026-10-14T17:00:00.000Z
    const d1 = new Date('2026-10-14T20:00:00Z');
    assert.strictEqual(wibDayStartUtc(d1).toISOString(), '2026-10-14T17:00:00.000Z');
    assert.strictEqual(nextWibDayStartUtc(d1).toISOString(), '2026-10-15T17:00:00.000Z');

    // 2026-10-14T16:59:59Z -> jam 23:59 WIB tgl 14 -> start WIB adalah 2026-10-13T17:00:00.000Z
    const d2 = new Date('2026-10-14T16:59:59Z');
    assert.strictEqual(wibDayStartUtc(d2).toISOString(), '2026-10-13T17:00:00.000Z');
    assert.strictEqual(nextWibDayStartUtc(d2).toISOString(), '2026-10-14T17:00:00.000Z');
  });

  await t.test('3.2 isHallucination mendeteksi teks halusinasi audio pendek (< 1500ms)', () => {
    assert.strictEqual(isHallucination('ご視聴ありがとうございました', 800), true);
    assert.strictEqual(isHallucination('ありがとうございました', 1000), true);
    assert.strictEqual(isHallucination('', 500), true);
    assert.strictEqual(isHallucination('わたしはがくせいです', 1000), false);
    // Jika durasi normal (> 1500ms), ucapan riil "ありがとうございました" tidak dianggap halusinasi
    assert.strictEqual(isHallucination('ありがとうございました', 2500), false);
  });

  await t.test('3.3 normalizeTranscript membersihkan whitespace dan menormalkan NFKC', () => {
    assert.strictEqual(normalizeTranscript('  わたしは がくせいです。  '), 'わたしは がくせいです。');
    assert.strictEqual(normalizeTranscript(''), '');
  });

  // ============================================================
  // 4. Local Answer Evaluation Integration (checkAnswerWithDetails)
  // ============================================================
  await t.test('4.1 checkAnswerWithDetails mengevaluasi jawaban suara secara toleran', () => {
    const accepted = ['わたしはがくせいです。'];
    
    // Suara tanpa tanda baca titik
    const res1 = checkAnswerWithDetails('わたしはがくせいです', accepted, 'voice');
    assert.strictEqual(res1.isMatch, true, 'Harus match meski tanpa tanda baca titik');

    // Suara dengan spasi antar kata
    const res2 = checkAnswerWithDetails('わたし は がくせい です', accepted, 'voice');
    assert.strictEqual(res2.isMatch, true, 'Harus match meski ada spasi pengucapan');

    // Jawaban salah total
    const res3 = checkAnswerWithDetails('これはぺんです', accepted, 'voice');
    assert.strictEqual(res3.isMatch, false, 'Harus false jika kalimat sama sekali berbeda');
  });

  // ============================================================
  // 5. Behavioral Tests: useVoiceAnswer (2.a - 2.g)
  // ============================================================
  await t.test('5.a respons 429 -> fallback ke Web Speech, label "mode cepat", pesan "Batas cek teliti hari ini habis", percobaan tidak berkurang', async () => {
    let attemptsCount = 0;
    const voice = useVoiceAnswer({
      invokeFn: async () => {
        return { data: null, error: { status: 429, message: 'daily_limit' } };
      }
    });

    // Simulasi memproses rekaman audio valid (1200ms) dengan peak RMS 0.05
    await voice.processRecordedAudio(1200, 0.05);

    assert.strictEqual(voice.mode.value, 'webspeech', 'Mode harus beralih ke webspeech');
    assert.strictEqual(voice.modeLabel.value, 'mode cepat', 'Label mode harus "mode cepat"');
    assert.strictEqual(voice.error.value, 'Batas cek teliti hari ini habis');
    assert.strictEqual(voice.transcript.value, '', 'Transcript tidak boleh terisi jika 429');
    assert.strictEqual(attemptsCount, 0, 'Percobaan tidak boleh berkurang');
  });

  await t.test('5.b respons 500/503/504 -> fallback ke Web Speech, tanpa menghitung salah', async () => {
    let wrongCount = 0;
    for (const status of [500, 503, 504]) {
      const voice = useVoiceAnswer({
        invokeFn: async () => ({ data: null, error: { status, message: 'Server error' } })
      });

      await voice.processRecordedAudio(1200, 0.05);

      assert.strictEqual(voice.mode.value, 'webspeech');
      assert.strictEqual(voice.modeLabel.value, 'mode cepat');
      assert.ok(voice.error.value?.includes('Layanan cek suara sedang sibuk'));
      assert.strictEqual(voice.transcript.value, '');
      assert.strictEqual(wrongCount, 0, 'Tidak boleh menghitung salah');
    }
  });

  await t.test('5.c offline (fetch gagal) -> fallback ke Web Speech, tanpa menghitung salah', async () => {
    let wrongCount = 0;
    const voice = useVoiceAnswer({
      invokeFn: async () => {
        throw new TypeError('Failed to fetch (network offline)');
      }
    });

    await voice.processRecordedAudio(1200, 0.05);

    assert.strictEqual(voice.mode.value, 'webspeech');
    assert.strictEqual(voice.modeLabel.value, 'mode cepat');
    assert.strictEqual(voice.transcript.value, '');
    assert.strictEqual(wrongCount, 0, 'Tidak boleh menghitung salah saat offline');
  });

  await t.test('5.d rekaman < 500 ms -> tidak dikirim, tidak mengurangi percobaan', async () => {
    let invokeCalled = false;
    let attemptsCount = 0;
    const voice = useVoiceAnswer({
      invokeFn: async () => {
        invokeCalled = true;
        return { data: { text: 'test' }, error: null };
      }
    });

    await voice.processRecordedAudio(450, 0.05);

    assert.strictEqual(invokeCalled, false, 'Edge Function TIDAK boleh dipanggil jika audio < 500ms');
    assert.strictEqual(voice.error.value, 'Audio terlalu pendek. Coba bicara lagi.');
    assert.strictEqual(attemptsCount, 0, 'Percobaan tidak berkurang');
  });

  await t.test('5.e respons {empty:true} -> "Suara tidak terdengar", tidak mengurangi percobaan', async () => {
    let attemptsCount = 0;
    const voice = useVoiceAnswer({
      invokeFn: async () => {
        return { data: { text: '', empty: true }, error: null };
      }
    });

    await voice.processRecordedAudio(1200, 0.05);

    assert.strictEqual(voice.error.value, 'Suara tidak terdengar');
    assert.strictEqual(voice.transcript.value, '', 'Transcript kosong');
    assert.strictEqual(attemptsCount, 0, 'Percobaan tidak berkurang');
  });

  await t.test('5.f sunyi (peak RMS < 0.01) -> ditolak sebelum dikirim', async () => {
    let invokeCalled = false;
    const voice = useVoiceAnswer({
      invokeFn: async () => {
        invokeCalled = true;
        return { data: { text: 'test' }, error: null };
      }
    });
    // Peak RMS rendah (< 0.01)
    await voice.processRecordedAudio(1200, 0.005);
    assert.strictEqual(invokeCalled, false, 'Tidak boleh dikirim jika peak RMS < 0.01');
    assert.strictEqual(voice.error.value, 'Suara tidak terdengar, coba lagi.');
    assert.strictEqual(voice.transcript.value, '');
  });

  await t.test('5.g sukses {text} -> evaluasi jawaban dipanggil dengan teks Whisper tsb', async () => {
    const voice = useVoiceAnswer({
      invokeFn: async () => {
        return { data: { text: 'わたしはがくせいです', empty: false }, error: null };
      }
    });

    await voice.processRecordedAudio(1500, 0.05);

    assert.strictEqual(voice.transcript.value, 'わたしはがくせいです');
    assert.strictEqual(voice.error.value, null);

    // Cek evaluasi lokal dengan teks hasil Whisper
    const result = voice.evaluateAnswer(voice.transcript.value, ['私は学生です。']);
    assert.strictEqual(result.isMatch, true, 'Jawaban Whisper harus cocok dengan kunci jawaban');
  });

  // ============================================================
  // 6. useAnswerCheck: Kanonisasi Kana & Weighted Edit Distance
  // ============================================================
  await t.test('6.1 useAnswerCheck melakukan kanonisasi kanji via readings.json', async () => {
    const { useAnswerCheck } = await import('../src/composables/useAnswerCheck.ts');
    const { canonicalizeToKana } = useAnswerCheck();

    assert.strictEqual(canonicalizeToKana('私は学生です。'), 'わたしはがくせいです');
    assert.strictEqual(canonicalizeToKana('先生は教室にいます'), 'せんせいはきょうしつにいます');
    assert.strictEqual(canonicalizeToKana('ミラーさんは アメリカ人 です'), 'みらーさんはあめりかじんです');
  });

  await t.test('6.2 useAnswerCheck mematuhi batas lolos clamp(panjang * 0.12, 0.6, 3)', async () => {
    const { useAnswerCheck } = await import('../src/composables/useAnswerCheck.ts');
    const { check, calculateMaxAllowedDistance } = useAnswerCheck();

    // Kalimat pendek (5 huruf): 5 * 0.12 = 0.60 -> clamp batas 0.6
    assert.strictEqual(calculateMaxAllowedDistance(5), 0.6);

    // Kalimat panjang (30 huruf): 30 * 0.12 = 3.60 -> clamp batas 3.0
    assert.strictEqual(calculateMaxAllowedDistance(30), 3.0);

    // Substitusi partikel (wa/ha) berbiaya 0.2 <= batas 0.6 -> LOLOS dengan toleransi
    const res1 = check('わたしわがくせいです', ['私は学生です']);
    assert.strictEqual(res1.isMatch, true);
    assert.strictEqual(res1.isTolerance, true);

    // Beda jauh (jarak > batas) -> TIDAK LOLOS
    const res2 = check('これはペンです', ['私は学生です']);
    assert.strictEqual(res2.isMatch, false);
  });

  // ============================================================
  // 7. Manual Voice Send & Cancellation Control
  // ============================================================
  await t.test('7.1 useVoiceAnswer menginisialisasi hasSpoken=false dan cancelRecording mereset state dengan bersih', async () => {
    const { useVoiceAnswer } = await import('../src/composables/useVoiceAnswer.ts');
    let invokeCalled = false;
    const voice = useVoiceAnswer({
      invokeFn: async () => {
        invokeCalled = true;
        return { data: { text: 'test' }, error: null };
      }
    });

    assert.strictEqual(voice.hasSpoken.value, false, 'hasSpoken harus false saat inisialisasi');
    assert.strictEqual(voice.isRecording.value, false);

    // Panggil cancelRecording
    voice.cancelRecording();

    assert.strictEqual(voice.hasSpoken.value, false);
    assert.strictEqual(voice.isRecording.value, false);
    assert.strictEqual(voice.transcript.value, '');
    assert.strictEqual(voice.error.value, null);
    assert.strictEqual(invokeCalled, false, 'Audio tidak boleh dikirim saat dibatalkan');
  });

  await t.test('7.2 furiganaDict memetakan kata-kata berawalan o (お国, お仕事, お手洗い) dan kata 雑誌 dengan benar', async () => {
    const { FURIGANA_DICT } = await import('../src/utils/furiganaDict.ts');
    const { parseFuriganaSegments } = await import('../src/utils/furiganaParser.ts');

    assert.strictEqual(FURIGANA_DICT['雑誌'], 'ざっし');
    assert.strictEqual(FURIGANA_DICT['お手洗い'], 'おてあらい');
    assert.strictEqual(FURIGANA_DICT['お国'], 'おくに');
    assert.strictEqual(FURIGANA_DICT['お仕事'], 'おしごと');
    assert.strictEqual(FURIGANA_DICT['夜'], 'よる');

    const segments = parseFuriganaSegments('この雑誌はあなたのです。');
    const zasshiSeg = segments.find(s => s.text === '雑誌');
    assert.ok(zasshiSeg, 'Segmen 雑誌 harus ditemukan');
    assert.strictEqual(zasshiSeg?.reading, 'ざっし');
    assert.strictEqual(zasshiSeg?.isRuby, true);
  });
});

test.after(() => {
  setImmediate(() => process.exit(0));
});


