import { sentencesData } from '../data/sentences';
import { supabase } from '../lib/supabaseClient';
import { getQuestionCountFromDuration, getFallbackLocalPool } from './quizHelpers';
import { buildHurufSessionQuestions } from './hurufQuizComposition';
import { buildKanjiSessionQuestions } from './kanjiQuizComposition';
import { buildKanjiWritingSessionQuestions } from './kanjiWritingComposition';
import { sortInGojuonOrder } from '../data/gojuonOrder';
import { kanjiWritingEntries } from '../data/kanjiWritingPrompts';

export interface PreparedQuestionsResult {
  questions: any[];
  previewMode: 'none' | 'full_wave';
  isWavePreviewActive: boolean;
  currentWaveItems: any[];
  initialQuestionCount: number;
}

export async function prepareStandardQuestions(params: {
  targetDuration: number;
  type: string;
  level: 'basic' | 'n5';
  selectedKanaCategory: 'all' | 'basic' | 'dakuten' | 'combination';
  selectedKanjiLessonNumber: number;
  activeKanjiLessonNumber: number;
  getMasteryStreak: (char: string) => number;
  userStreaks: Record<string, number>;
  introducedChars: Record<string, boolean>;
}): Promise<PreparedQuestionsResult> {
  const {
    targetDuration,
    type,
    level,
    selectedKanaCategory,
    selectedKanjiLessonNumber,
    activeKanjiLessonNumber,
    getMasteryStreak,
    userStreaks,
    introducedChars
  } = params;

  if (type === 'sentences') {
    const sentenceCount = getQuestionCountFromDuration(targetDuration, type);
    const shuffled = [...sentencesData].sort(() => 0.5 - Math.random()).slice(0, sentenceCount);
    const questions = shuffled.map(s => ({
      id: s.id,
      character: s.japanese,
      japanese: s.japanese,
      romaji_variants: s.romaji_variants,
      meaning: s.meaning_id,
      romaji: s.romaji_variants.map(v => v[0]).join('')
    }));
    return {
      questions,
      previewMode: 'none',
      isWavePreviewActive: false,
      currentWaveItems: [],
      initialQuestionCount: questions.length
    };
  }

  const questionCount = getQuestionCountFromDuration(targetDuration, type);
  let finalPool = getFallbackLocalPool(type, level);

  try {
    let query = type === 'mix'
      ? supabase.from('quiz_items').select('*').in('category', ['hiragana', 'katakana'])
      : supabase.from('quiz_items').select('*').eq('category', type);

    if (['hiragana', 'katakana', 'mix'].includes(type) && selectedKanaCategory !== 'all') {
      query = query.eq('type', selectedKanaCategory);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      finalPool = data.map(item => ({
        character: item.character,
        romaji: item.romaji,
        kana: item.kana,
        meaning: item.meaning,
        type: type === 'words' ? ('word' as const) : (item.type as 'basic' | 'dakuten' | 'combination'),
        lesson: item.lesson
      }));
    }
  } catch (err) { }

  if (['hiragana', 'katakana', 'mix'].includes(type) && selectedKanaCategory !== 'all') {
    const filtered = finalPool.filter(item => item.type === selectedKanaCategory);
    if (filtered.length > 0) finalPool = filtered;
  }

  if (type === 'words') {
    finalPool = finalPool.filter(w => !!w.character && w.character.trim().length > 0);
    finalPool.sort((a, b) => {
      const numA = parseInt((a.lesson || 'Pelajaran 1').replace(/\D/g, '')) || 1;
      const numB = parseInt((b.lesson || 'Pelajaran 1').replace(/\D/g, '')) || 1;
      return numA - numB;
    });

    const kanjiQuestions = buildKanjiSessionQuestions(finalPool, questionCount, getMasteryStreak);

    const uniqueUnlearnedInSession: any[] = [];
    const seenChars = new Set<string>();
    kanjiQuestions.forEach(q => {
      if (!seenChars.has(q.character)) {
        seenChars.add(q.character);
        const streak = userStreaks[q.character] || 0;
        const isIntroduced = !!introducedChars[q.character];
        if (streak === 0 && !isIntroduced) {
          uniqueUnlearnedInSession.push(q);
        }
      }
    });

    const hasPreview = uniqueUnlearnedInSession.length > 0;
    return {
      questions: kanjiQuestions,
      previewMode: hasPreview ? 'full_wave' : 'none',
      isWavePreviewActive: hasPreview,
      currentWaveItems: uniqueUnlearnedInSession,
      initialQuestionCount: questionCount
    };
  }

  if (type === 'kanji') {
    let candidatePool: typeof kanjiWritingEntries = [];
    if (selectedKanjiLessonNumber > 0) {
      const currentLessonEntries = kanjiWritingEntries.filter(e => e.primaryLessonNumber === selectedKanjiLessonNumber);
      const previousLessonEntries = kanjiWritingEntries.filter(e => e.primaryLessonNumber < selectedKanjiLessonNumber);
      candidatePool = [...currentLessonEntries, ...previousLessonEntries];
    } else {
      candidatePool = kanjiWritingEntries.filter(e => e.primaryLessonNumber <= activeKanjiLessonNumber);
    }

    const sessionResult = buildKanjiWritingSessionQuestions(
      candidatePool,
      questionCount,
      getMasteryStreak,
      introducedChars
    );

    const hasPreview = sessionResult.newKanjiEntries.length > 0;
    return {
      questions: sessionResult.questions,
      previewMode: hasPreview ? 'full_wave' : 'none',
      isWavePreviewActive: hasPreview,
      currentWaveItems: sessionResult.newKanjiEntries,
      initialQuestionCount: sessionResult.questions.length
    };
  }

  // Mode Huruf (Hiragana / Katakana / Mix)
  const hurufQuestions = buildHurufSessionQuestions(finalPool, questionCount, getMasteryStreak, introducedChars);

  const uniqueUnlearnedInSession: any[] = [];
  const seenChars = new Set<string>();
  hurufQuestions.forEach(q => {
    if (!seenChars.has(q.character)) {
      seenChars.add(q.character);
      const streak = userStreaks[q.character] || 0;
      const isIntroduced = !!introducedChars[q.character];
      if (streak === 0 && !isIntroduced) {
        uniqueUnlearnedInSession.push(q);
      }
    }
  });

  const hasPreview = uniqueUnlearnedInSession.length > 0;
  return {
    questions: hurufQuestions,
    previewMode: hasPreview ? 'full_wave' : 'none',
    isWavePreviewActive: hasPreview,
    currentWaveItems: sortInGojuonOrder(uniqueUnlearnedInSession),
    initialQuestionCount: hurufQuestions.length
  };
}

export async function prepareWeakItemsQuestions(params: {
  targetDuration: number;
  type: string;
  level: 'basic' | 'n5';
  selectedKanaCategory: 'all' | 'basic' | 'dakuten' | 'combination';
  getMasteryStreak: (char: string) => number;
  introducedChars: Record<string, boolean>;
}): Promise<{ questions: any[]; initialQuestionCount: number }> {
  const { targetDuration, type, level, selectedKanaCategory, getMasteryStreak, introducedChars } = params;
  const questionCount = getQuestionCountFromDuration(targetDuration, type);
  let pool = getFallbackLocalPool(type, level);

  if (['hiragana', 'katakana', 'mix'].includes(type) && selectedKanaCategory !== 'all') {
    const filtered = pool.filter(item => item.type === selectedKanaCategory);
    if (filtered.length > 0) pool = filtered;
  }

  let weakPool = pool.filter(item => getMasteryStreak(item.character) < 3);
  if (weakPool.length === 0) weakPool = [...pool];

  let questions: any[] = [];
  if (type === 'words') {
    questions = buildKanjiSessionQuestions(weakPool, questionCount, getMasteryStreak);
  } else if (type === 'kanji') {
    const weakEntries = kanjiWritingEntries.filter(e => getMasteryStreak(e.kanji) < 3);
    const poolEntries = weakEntries.length > 0 ? weakEntries : kanjiWritingEntries;
    const sessionResult = buildKanjiWritingSessionQuestions(
      poolEntries,
      questionCount,
      getMasteryStreak,
      introducedChars,
      { maxNewOverride: 0 }
    );
    questions = sessionResult.questions;
  } else {
    questions = buildHurufSessionQuestions(weakPool, questionCount, getMasteryStreak, introducedChars);
  }

  return {
    questions,
    initialQuestionCount: questions.length
  };
}
