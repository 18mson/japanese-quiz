import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';

export type GoalType = 'questions' | 'minutes';

export const useGoalsStore = defineStore('goals', () => {
  const dailyTargetMinutes = ref<number>(10);
  const dailyTargetQuestions = ref<number>(10);
  const goalType = ref<GoalType>('questions');

  const questionsAnswered = ref<number>(0);
  const minutesSpent = ref<number>(0);
  const goalCompleted = ref<boolean>(false);
  const showCelebration = ref<boolean>(false);

  const getTodayDateString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const targetValue = computed(() => {
    return goalType.value === 'questions' ? dailyTargetQuestions.value : dailyTargetMinutes.value;
  });

  const currentValue = computed(() => {
    return goalType.value === 'questions' ? questionsAnswered.value : minutesSpent.value;
  });

  const progressPercentage = computed(() => {
    if (targetValue.value <= 0) return 100;
    return Math.min(100, Math.round((currentValue.value / targetValue.value) * 100));
  });

  // Load goals and daily progress from LocalStorage or Supabase
  const loadGoalsAndProgress = async (userId?: string) => {
    const todayKey = `japanese-quiz-daily-progress-${getTodayDateString()}`;
    const goalSettingsKey = 'japanese-quiz-goal-settings';

    // 1. Load goal settings from localStorage fallback
    try {
      const savedSettings = localStorage.getItem(goalSettingsKey);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        dailyTargetMinutes.value = parsed.dailyTargetMinutes ?? 10;
        dailyTargetQuestions.value = parsed.dailyTargetQuestions ?? 10;
        goalType.value = parsed.goalType ?? 'questions';
      }

      const savedProgress = localStorage.getItem(todayKey);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        questionsAnswered.value = parsed.questionsAnswered ?? 0;
        minutesSpent.value = parsed.minutesSpent ?? 0;
        goalCompleted.value = parsed.goalCompleted ?? false;
        hasCelebratedToday.value = parsed.hasCelebratedToday ?? (parsed.goalCompleted ? true : false);
      }
    } catch (e) {}

    // 2. Fetch from Supabase if logged in
    if (userId) {
      try {
        const { data: goalData } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (goalData) {
          dailyTargetMinutes.value = goalData.daily_target_minutes;
          dailyTargetQuestions.value = goalData.daily_target_questions;
          goalType.value = goalData.goal_type as GoalType;
        }

        const { data: progData } = await supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('progress_date', getTodayDateString())
          .single();

        if (progData) {
          questionsAnswered.value = Math.max(questionsAnswered.value, progData.questions_answered);
          minutesSpent.value = Math.max(minutesSpent.value, progData.minutes_spent);
          if (progData.goal_completed) {
            goalCompleted.value = true;
            hasCelebratedToday.value = true;
          }
        }
      } catch (e) {}
    }
  };

  const saveToLocal = () => {
    try {
      const todayKey = `japanese-quiz-daily-progress-${getTodayDateString()}`;
      const goalSettingsKey = 'japanese-quiz-goal-settings';

      localStorage.setItem(goalSettingsKey, JSON.stringify({
        dailyTargetMinutes: dailyTargetMinutes.value,
        dailyTargetQuestions: dailyTargetQuestions.value,
        goalType: goalType.value
      }));

      localStorage.setItem(todayKey, JSON.stringify({
        questionsAnswered: questionsAnswered.value,
        minutesSpent: minutesSpent.value,
        goalCompleted: goalCompleted.value,
        hasCelebratedToday: hasCelebratedToday.value
      }));
    } catch (e) {}
  };

  const syncToSupabase = async (userId: string) => {
    try {
      await supabase.from('user_goals').upsert({
        user_id: userId,
        daily_target_minutes: dailyTargetMinutes.value,
        daily_target_questions: dailyTargetQuestions.value,
        goal_type: goalType.value,
        updated_at: new Date().toISOString()
      });

      await supabase.from('daily_progress').upsert({
        user_id: userId,
        progress_date: getTodayDateString(),
        questions_answered: questionsAnswered.value,
        minutes_spent: minutesSpent.value,
        goal_completed: goalCompleted.value,
        completed_at: goalCompleted.value ? new Date().toISOString() : null
      }, { onConflict: 'user_id,progress_date' });
    } catch (e) {}
  };

  const updateGoalSettings = (
    newMinutes: number,
    newQuestions: number,
    newType: GoalType,
    userId?: string
  ) => {
    dailyTargetMinutes.value = newMinutes;
    dailyTargetQuestions.value = newQuestions;
    goalType.value = newType;

    saveToLocal();
    if (userId) syncToSupabase(userId);
  };

  const hasCelebratedToday = ref<boolean>(false);

  // Optimistically record progress when answering questions
  const recordAnswer = (count: number = 1, secondsSpent: number = 0, userId?: string) => {
    questionsAnswered.value += count;
    if (secondsSpent > 0) {
      minutesSpent.value += Math.round(secondsSpent / 60);
    }

    if (!goalCompleted.value && currentValue.value >= targetValue.value) {
      goalCompleted.value = true;
    }

    saveToLocal();
    if (userId) {
      syncToSupabase(userId);
    }
  };

  const checkAndTriggerCelebration = () => {
    if (goalCompleted.value && !hasCelebratedToday.value) {
      showCelebration.value = true;
      hasCelebratedToday.value = true;
      saveToLocal();
    }
  };

  const dismissCelebration = () => {
    showCelebration.value = false;
  };

  return {
    dailyTargetMinutes,
    dailyTargetQuestions,
    goalType,
    questionsAnswered,
    minutesSpent,
    goalCompleted,
    hasCelebratedToday,
    showCelebration,
    targetValue,
    currentValue,
    progressPercentage,
    loadGoalsAndProgress,
    updateGoalSettings,
    recordAnswer,
    checkAndTriggerCelebration,
    dismissCelebration
  };
});
