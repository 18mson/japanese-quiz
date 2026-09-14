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
    loadRenshuuProgress,
    recordRenshuuAnswer,
    startKaiwaSession,
    startRenshuuSession,
    resetLessonSession
  };
});
