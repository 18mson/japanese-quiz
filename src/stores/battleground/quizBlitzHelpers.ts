// src/stores/battleground/quizBlitzHelpers.ts
import { hiraganaData } from '../../data/hiragana';
import { katakanaData } from '../../data/katakana';
import { wordsData } from '../../data/words';
import { kanjiN5Data } from '../../data/kanji';
import type { QuizBlitzQuestion, QuizCategory } from './types';

/**
 * Generates a single synchronized Quiz Blitz multiple choice question for a room round.
 */
export function generateQuizBlitzQuestion(
  category: QuizCategory,
  usedIds: Set<string> = new Set()
): QuizBlitzQuestion {
  if (category === 'hiragana') {
    return pickKanaQuestion(hiraganaData, 'hiragana', usedIds);
  }
  if (category === 'katakana') {
    return pickKanaQuestion(katakanaData, 'katakana', usedIds);
  }
  if (category === 'mix') {
    const combined = [...hiraganaData, ...katakanaData];
    return pickKanaQuestion(combined, 'mix', usedIds);
  }
  // 'kotoba_kanji': 50% chance Kanji, 50% chance N5 Vocab
  return pickKotobaKanjiQuestion(usedIds);
}

function pickKanaQuestion(
  pool: any[],
  category: QuizCategory,
  usedIds: Set<string>
): QuizBlitzQuestion {
  const unused = pool.filter(item => !usedIds.has(item.character));
  const candidatePool = unused.length > 0 ? unused : pool;
  const picked = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  const correctRomaji = Array.isArray(picked.romaji) ? picked.romaji[0] : picked.romaji;
  
  // Pick 5 distinct distractor romajis
  const allRomajis = Array.from(
    new Set(
      pool.map(p => (Array.isArray(p.romaji) ? p.romaji[0] : p.romaji)).filter(r => r !== correctRomaji)
    )
  );
  const shuffledDistractors = allRomajis.sort(() => 0.5 - Math.random()).slice(0, 5);
  const allOptions = [...shuffledDistractors, correctRomaji].sort(() => 0.5 - Math.random());
  const correctIndex = allOptions.indexOf(correctRomaji);

  return {
    id: `kana_${picked.character}`,
    prompt: picked.character,
    promptType: 'character',
    questionText: 'Pilih romaji yang tepat untuk huruf ini:',
    options: allOptions,
    correctOptionIndex: correctIndex,
    correctAnswer: correctRomaji,
    category,
  };
}

function pickKotobaKanjiQuestion(usedIds: Set<string>): QuizBlitzQuestion {
  const isKanji = Math.random() < 0.5;

  if (isKanji) {
    const unused = kanjiN5Data.filter(k => !usedIds.has(`kanji_${k.character}`));
    const pool = unused.length > 0 ? unused : kanjiN5Data;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    const correctMeaning = picked.meaning;
    const distractors = Array.from(
      new Set(kanjiN5Data.map(k => k.meaning).filter(m => m !== correctMeaning))
    )
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const allOptions = [...distractors, correctMeaning].sort(() => 0.5 - Math.random());
    const readingHint = [...picked.kunyomi, ...picked.onyomi].filter(Boolean).slice(0, 2).join(' / ');

    return {
      id: `kanji_${picked.character}`,
      prompt: picked.character,
      subPrompt: readingHint ? `Bacaan: ${readingHint}` : undefined,
      promptType: 'kanji',
      questionText: 'Pilih arti bahasa Indonesia yang tepat untuk Kanji ini:',
      options: allOptions,
      correctOptionIndex: allOptions.indexOf(correctMeaning),
      correctAnswer: correctMeaning,
      meaning: correctMeaning,
      category: 'kotoba_kanji',
    };
  }

  // Vocab / Word Question
  const unused = wordsData.filter(w => !usedIds.has(`word_${w.character}`));
  const pool = unused.length > 0 ? unused : wordsData;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  const correctMeaning = picked.meaning;
  const distractors = Array.from(
    new Set(wordsData.map(w => w.meaning).filter(m => m !== correctMeaning))
  )
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const allOptions = [...distractors, correctMeaning].sort(() => 0.5 - Math.random());

  return {
    id: `word_${picked.character}`,
    prompt: picked.character,
    subPrompt: picked.kana && picked.kana !== picked.character ? picked.kana : undefined,
    promptType: 'word',
    questionText: 'Pilih arti bahasa Indonesia yang tepat untuk kosakata ini:',
    options: allOptions,
    correctOptionIndex: allOptions.indexOf(correctMeaning),
    correctAnswer: correctMeaning,
    meaning: correctMeaning,
    category: 'kotoba_kanji',
  };
}
