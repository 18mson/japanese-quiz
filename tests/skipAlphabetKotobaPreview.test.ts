// tests/skipAlphabetKotobaPreview.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wordsData } from '../src/data/words';
import { isAlphabetOnlyWord, hasJapaneseCharacters } from '../src/utils/quizHelpers';
import { prepareStandardQuestions } from '../src/utils/quizSessionBuilder';

test('1. Validasi deteksi kata murni abjad Latin pada dataset wordsData', () => {
  const alphabetWords = wordsData.filter(w => isAlphabetOnlyWord(w.character));

  // Tepat 4 kata tanpa karakter Jepang (3 kata murni abjad Latin + 1 simbol angka)
  assert.strictEqual(alphabetWords.length, 4, 'Harus ada tepat 4 kata non-Jepang di wordsData');

  const chars = alphabetWords.map(w => w.character);
  assert.ok(chars.includes('CD'), 'CD harus terdeteksi sebagai kata abjad');
  assert.ok(chars.includes('ATM'), 'ATM harus terdeteksi sebagai kata abjad');
  assert.ok(chars.includes('JR'), 'JR harus terdeteksi sebagai kata abjad');
  assert.ok(chars.includes('２、３～'), '２、３～ harus terdeteksi sebagai kata non-Jepang');

  // Pastikan kata Jepang normal TIDAK dianggap kata abjad
  assert.strictEqual(isAlphabetOnlyWord('本'), false, '本 memiliki kanji');
  assert.strictEqual(isAlphabetOnlyWord('食べる'), false, '食べる memiliki kanji dan hiragana');
  assert.strictEqual(isAlphabetOnlyWord('コーヒー'), false, 'コーヒー memiliki katakana');
  assert.strictEqual(isAlphabetOnlyWord('ジェイアール'), false, 'ジェイアール memiliki katakana');
});

test('2. prepareStandardQuestions men-skip kata abjad dari wave preview flashcard', async () => {
  const userStreaks: Record<string, number> = {};
  const introducedChars: Record<string, boolean> = {};

  // Simulasi sesi Pelajaran 16 dengan slot cukup untuk mencakup seluruh kata bab 16
  const result = await prepareStandardQuestions({
    targetDuration: 60,
    type: 'words',
    level: 'n5',
    selectedKanaCategory: 'all',
    selectedKanjiLessonNumber: 0,
    activeKanjiLessonNumber: 0,
    currentLessonNumber: 16,
    selectedWordLessonNumber: 16,
    userStreaks,
    introducedChars,
    getMasteryStreak: (c) => userStreaks[c] || 0,
    questionCount: 60
  });

  // Pastikan kata JR tidak pernah masuk ke currentWaveItems
  const waveChars = result.currentWaveItems.map(item => item.character);
  assert.ok(!waveChars.includes('JR'), 'JR tidak boleh muncul di currentWaveItems flashcard');

  // Jika JR terpilih dalam soal kuis, ia harus otomatis di-mark introduced: true
  const questionChars = result.questions.map(q => q.character);
  if (questionChars.includes('JR')) {
    assert.strictEqual(introducedChars['JR'], true, 'JR harus otomatis di-mark introduced: true saat muncul di sesi');
  }
});

