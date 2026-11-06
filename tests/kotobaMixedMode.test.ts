// Mock import.meta.env and localStorage before importing modules
(import.meta as any).env = {
  VITE_SUPABASE_URL: 'https://dummy.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'dummy_key'
};

const mockStorage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  length: 0,
  key: () => null
} as any;

(globalThis as any).WebSocket = class {} as any;
const mockGain = {
  setValueAtTime() {},
  exponentialRampToValueAtTime() {}
};
(globalThis as any).window = { 
  AudioContext: class { 
    currentTime = 0;
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: mockGain }; } 
    createGain() { return { connect() {}, gain: mockGain }; } 
    destination = {};
  } 
} as any;

import test from 'node:test';
import assert from 'node:assert';
import { setActivePinia, createPinia } from 'pinia';
import { buildKanjiSessionQuestions } from '../src/utils/kanjiQuizComposition';
import { useQuizStore } from '../src/stores/quizStore';
import { useMasteryStore } from '../src/stores/masteryStore';
import { getMasteryTierFromStreak } from '../src/utils/masteryStats';
import { getTierFromStreak } from '../src/utils/quizHelpers';

test('Kotoba Mixed Mode (words_mixed) & Crown Streak 6', async (t) => {
  await t.test('Crown tier requires streak 6 (not 5)', () => {
    assert.strictEqual(getMasteryTierFromStreak(5), 'mastered');
    assert.strictEqual(getMasteryTierFromStreak(6), 'crown');
    assert.strictEqual(getMasteryTierFromStreak(7), 'crown');

    assert.strictEqual(getTierFromStreak(5), 'mastered');
    assert.strictEqual(getTierFromStreak(6), 'crown');
  });

  await t.test('buildKanjiSessionQuestions generates dynamic questionType in words_mixed', () => {
    const samplePool = [
      { character: '本', romaji: 'hon', kana: 'ほん', meaning: 'buku', lesson: 'Pelajaran 1' },
      { character: '辞書', romaji: 'jisho', kana: 'じしょ', meaning: 'kamus', lesson: 'Pelajaran 1' },
      { character: '雑誌', romaji: 'zasshi', kana: 'ざっし', meaning: 'majalah', lesson: 'Pelajaran 1' },
      { character: '新聞', romaji: 'shinbun', kana: 'しんぶん', meaning: 'koran', lesson: 'Pelajaran 1' },
      { character: 'ノート', romaji: 'nooto', kana: 'ノート', meaning: 'buku catatan', lesson: 'Pelajaran 1' },
    ];

    const questions = buildKanjiSessionQuestions(
      samplePool,
      8,
      () => 1, // all in learning tier to induce repetition
      1,
      'words_mixed'
    );

    assert.strictEqual(questions.length, 8);

    const validSubModes = ['words', 'words_meaning', 'meaning_to_words'];
    const seenModes = new Set<string>();

    questions.forEach(q => {
      assert.ok(q.questionType, 'Setiap soal harus memiliki questionType terdefinisi');
      assert.ok(validSubModes.includes(q.questionType!), `questionType harus valid: ${q.questionType}`);
      seenModes.add(q.questionType!);
    });

    // In an 8-question session with words_mixed, multiple modes should be represented
    assert.ok(seenModes.size >= 2, `Harus ada variasi sub-mode dalam sesi kuis: didapat ${Array.from(seenModes).join(', ')}`);
  });

  await t.test('Repeated characters in words_mixed get alternating sub-modes', () => {
    const samplePool = [
      { character: '学校', romaji: 'gakkou', kana: 'がっこう', meaning: 'sekolah', lesson: 'Pelajaran 1' },
      { character: '先生', romaji: 'sensei', kana: 'せんせい', meaning: 'guru', lesson: 'Pelajaran 1' },
    ];

    const questions = buildKanjiSessionQuestions(
      samplePool,
      6,
      () => 1,
      1,
      'words_mixed'
    );

    // Group questions by character
    const byChar: Record<string, string[]> = {};
    questions.forEach(q => {
      if (!byChar[q.character]) byChar[q.character] = [];
      byChar[q.character].push(q.questionType!);
    });

    for (const [char, modes] of Object.entries(byChar)) {
      if (modes.length > 1) {
        // First 2 appearances should ideally have different modes
        const uniqueModesForChar = new Set(modes);
        assert.ok(
          uniqueModesForChar.size > 1,
          `Kata yang berulang (${char}) harus divariasikan sub-mode latihannya, didapat: ${modes.join(', ')}`
        );
      }
    }
  });

  await t.test('quizStore evaluates correctly per-question according to activeQuestionType', () => {
    setActivePinia(createPinia());
    const quizStore = useQuizStore();
    const masteryStore = useMasteryStore();

    quizStore.questionType = 'words_mixed';
    quizStore.selectedMode = 'sentence_typing';

    quizStore.questions = [
      // Q0: words_meaning (Jepang -> Indo)
      {
        character: '辞書',
        romaji: ['jisho'],
        kana: 'じしょ',
        meaning: 'kamus',
        questionType: 'words_meaning',
        type: 'word'
      },
      // Q1: meaning_to_words (Indo -> Jepang)
      {
        character: '本',
        romaji: ['hon'],
        kana: 'ほん',
        meaning: 'buku',
        questionType: 'meaning_to_words',
        type: 'word'
      },
      // Q2: words (Jepang -> Romaji)
      {
        character: '新聞',
        romaji: ['shinbun', 'sinbun'],
        kana: 'しんぶん',
        meaning: 'koran',
        questionType: 'words',
        type: 'word'
      }
    ];

    // --- Soal 0: words_meaning (menjawab arti Indonesia) ---
    quizStore.currentQuestionIndex = 0;
    assert.strictEqual(quizStore.activeQuestionType, 'words_meaning');
    quizStore.submitAnswer('kamus');
    assert.strictEqual(quizStore.isAnswerCorrect, true, 'Jawaban arti Indonesia "kamus" harus benar');
    assert.strictEqual(quizStore.userAnswers[0].correctRomaji, 'kamus');

    // --- Soal 1: meaning_to_words (menjawab dalam Kanji/Kana/Romaji) ---
    quizStore.selectedAnswer = null;
    quizStore.currentQuestionIndex = 1;
    assert.strictEqual(quizStore.activeQuestionType, 'meaning_to_words');
    quizStore.submitAnswer('ほん'); // Menjawab dengan Hiragana
    assert.strictEqual(quizStore.isAnswerCorrect, true, 'Jawaban Hiragana "ほん" harus benar');

    // Coba juga jawaban Romaji pada meaning_to_words
    quizStore.selectedAnswer = null;
    quizStore.currentQuestionIndex = 1;
    quizStore.submitAnswer('hon'); // Menjawab dengan Romaji
    assert.strictEqual(quizStore.isAnswerCorrect, true, 'Jawaban Romaji "hon" harus benar untuk meaning_to_words');

    // --- Soal 2: words (menjawab Romaji) ---
    quizStore.selectedAnswer = null;
    quizStore.currentQuestionIndex = 2;
    assert.strictEqual(quizStore.activeQuestionType, 'words');
    quizStore.submitAnswer('shinbun');
    assert.strictEqual(quizStore.isAnswerCorrect, true, 'Jawaban Romaji "shinbun" harus benar untuk words');
  });
});
