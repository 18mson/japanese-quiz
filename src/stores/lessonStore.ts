import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../lib/supabaseClient';
import {
  fetchLessonBunkei,
  fetchLessonKaiwa,
  buildRenshuuSession,
  fetchRenshuuProgress,
  saveRenshuuItemResult,
  DEFAULT_RENSHUU_SESSION_SIZE
} from '../services/lessonService';
import type { GrammarPoint, Kaiwa, RenshuuSessionQuestion, RenshuuProgressStats } from '../types/lesson';
import { getLessonChapterData } from '../data/lessonGrammarBook';
import { wordsData } from '../data/words';
import { useMasteryStore } from './masteryStore';

const COMPLETED_CATEGORIES_KEY = 'japanese-quiz-completed-materi';

const getLocalCompletedCategories = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(COMPLETED_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return {};
};

const saveLocalCompletedCategories = (data: Record<string, boolean>) => {
  try {
    localStorage.setItem(COMPLETED_CATEGORIES_KEY, JSON.stringify(data));
  } catch (e) { }
};

export const useLessonStore = defineStore('lesson', () => {
  const currentLessonNumber = ref<number>(1);
  const bunkeiList = ref<GrammarPoint[]>([]);
  const kaiwaData = ref<Kaiwa | null>(null);
  const renshuuSessionQuestions = ref<RenshuuSessionQuestion[]>([]);
  const renshuuProgressStats = ref<RenshuuProgressStats>({
    masteredCount: 0,
    totalCount: 45,
    progressPercent: 0
  });
  const showLessonMaterial = ref<boolean>(false);
  const isLessonMaterialCompleted = ref<boolean>(false);
  const completedCategories = ref<Record<string, boolean>>(getLocalCompletedCategories());

  // ── Completion Helper Methods ─────────────────────────────
  const isLessonVocabAutoCompleted = (lessonNumber: number): boolean => {
    const lessonKey = `Pelajaran ${lessonNumber}`;
    const words = wordsData.filter(w => w.lesson === lessonKey);
    if (words.length === 0) return false;
    const masteryStore = useMasteryStore();
    return words.every(w => {
      const streak = masteryStore.getMasteryStreak(w.character);
      return streak > 0 || !!masteryStore.introducedChars[w.character];
    });
  };

  const isCategoryCompleted = (lessonNumber: number, categoryId: string): boolean => {
    const key = `${lessonNumber}_${categoryId}`;
    if (completedCategories.value[key] !== undefined) {
      return completedCategories.value[key];
    }
    if (categoryId === 'vocab') {
      return isLessonVocabAutoCompleted(lessonNumber);
    }
    return false;
  };

  const setCategoryCompleted = (lessonNumber: number, categoryId: string, status: boolean) => {
    const key = `${lessonNumber}_${categoryId}`;
    completedCategories.value = {
      ...completedCategories.value,
      [key]: status
    };
    saveLocalCompletedCategories(completedCategories.value);
  };

  const toggleCategoryCompletion = (lessonNumber: number, categoryId: string): boolean => {
    const current = isCategoryCompleted(lessonNumber, categoryId);
    const next = !current;
    setCategoryCompleted(lessonNumber, categoryId, next);
    return next;
  };

  const getChapterCompletedStats = (lessonNumber: number): { completed: number; total: number; isFullyCompleted: boolean } => {
    const ch = getLessonChapterData(lessonNumber);
    const applicableCategories: string[] = [];

    if ((ch?.bunkei?.length || 0) > 0) applicableCategories.push('bunkei');
    if ((ch?.particles?.length || 0) > 0) applicableCategories.push('particles');
    const vocabCount = wordsData.filter(w => w.lesson === `Pelajaran ${lessonNumber}`).length;
    if (vocabCount > 0) applicableCategories.push('vocab');
    const phrasesCount = wordsData.filter(w => w.lesson === `Pelajaran ${lessonNumber}` && (w.category_word === 'Ungkapan' || w.category_word === 'Kata Seru')).length;
    if (phrasesCount > 0) applicableCategories.push('phrases');
    if ((ch?.tables?.length || 0) > 0) applicableCategories.push('tables');

    const total = applicableCategories.length || 5;
    const completed = applicableCategories.filter(cat => isCategoryCompleted(lessonNumber, cat)).length;
    return {
      completed,
      total,
      isFullyCompleted: completed >= total && total > 0
    };
  };

  const isChapterFullyCompleted = (lessonNumber: number): boolean => {
    return getChapterCompletedStats(lessonNumber).isFullyCompleted;
  };

  const getFirstUncompletedLessonNumber = (): number => {
    for (let num = 1; num <= 25; num++) {
      if (!isChapterFullyCompleted(num)) {
        return num;
      }
    }
    return 1;
  };

  const loadRenshuuProgress = async (lessonNumber: number = currentLessonNumber.value) => {
    const authUserId = (await supabase.auth.getUser()).data.user?.id || null;
    const stats = await fetchRenshuuProgress(lessonNumber, authUserId);
    renshuuProgressStats.value = stats;
  };

  const recordRenshuuAnswer = async (itemId: string, itemType: 'a' | 'b' | 'c', isCorrect: boolean) => {
    const authUserId = (await supabase.auth.getUser()).data.user?.id || null;
    await saveRenshuuItemResult(itemId, itemType, isCorrect, authUserId);
    await loadRenshuuProgress(currentLessonNumber.value);
  };

  const startKaiwaSession = async (lessonNumber: number = currentLessonNumber.value) => {
    currentLessonNumber.value = lessonNumber;
    const data = await fetchLessonKaiwa(lessonNumber);
    kaiwaData.value = data;
    showLessonMaterial.value = true;
    isLessonMaterialCompleted.value = false;
    return data;
  };

  const startRenshuuSession = async (lessonNumber: number = currentLessonNumber.value, sessionSize: number = DEFAULT_RENSHUU_SESSION_SIZE) => {
    currentLessonNumber.value = lessonNumber;
    const authUserId = (await supabase.auth.getUser()).data.user?.id || null;
    const sessionData = await buildRenshuuSession(lessonNumber, authUserId, sessionSize);
    const allBunkei = await fetchLessonBunkei(lessonNumber);

    if (sessionData.relevantBunkeiIds.length > 0) {
      const filtered = allBunkei.filter(b => b.id && sessionData.relevantBunkeiIds.includes(b.id));
      bunkeiList.value = filtered.length > 0 ? filtered : allBunkei;
    } else {
      bunkeiList.value = allBunkei;
    }

    renshuuSessionQuestions.value = sessionData.questions;
    renshuuProgressStats.value = {
      masteredCount: sessionData.totalMastered,
      totalCount: sessionData.totalAtomic,
      progressPercent: sessionData.totalAtomic > 0 ? Math.round((sessionData.totalMastered / sessionData.totalAtomic) * 100) : 0
    };

    showLessonMaterial.value = true;
    isLessonMaterialCompleted.value = false;
    return sessionData;
  };

  const resetLessonSession = () => {
    bunkeiList.value = [];
    kaiwaData.value = null;
    renshuuSessionQuestions.value = [];
    showLessonMaterial.value = false;
    isLessonMaterialCompleted.value = false;
  };

  return {
    currentLessonNumber,
    bunkeiList,
    kaiwaData,
    renshuuSessionQuestions,
    renshuuProgressStats,
    showLessonMaterial,
    isLessonMaterialCompleted,
    completedCategories,
    isCategoryCompleted,
    setCategoryCompleted,
    toggleCategoryCompletion,
    getChapterCompletedStats,
    isChapterFullyCompleted,
    getFirstUncompletedLessonNumber,
    loadRenshuuProgress,
    recordRenshuuAnswer,
    startKaiwaSession,
    startRenshuuSession,
    resetLessonSession
  };
});
