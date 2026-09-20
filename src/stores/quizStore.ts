import { defineStore } from 'pinia';
import { ref, computed, watch, toRef } from 'vue';
import { kanjiN5Data } from '../data/kanji';
import { playCorrectSound, playIncorrectSound } from '../utils/battleSoundManager';
import { checkIsCorrect, checkIsTypo, getFallbackLocalPool, buildRepeatedQuestion } from '../utils/quizHelpers';
import { submitLeaderboardScore } from '../services/leaderboardService';
import { useGoalsStore } from './goalsStore';
import { useMasteryStore } from './masteryStore';
import { useLessonStore } from './lessonStore';
import { useHitunganStore } from './hitunganStore';
import { prepareStandardQuestions, prepareWeakItemsQuestions } from '../utils/quizSessionBuilder';
import { useQuizPreview } from '../composables/useQuizPreview';
import { useKanjiLessonPanel } from '../composables/useKanjiLessonPanel';
import { useBadgeStore } from './badgeStore';

export const useQuizStore = defineStore('quiz', () => {
  const masteryStore = useMasteryStore();
  const lessonStore = useLessonStore();
  const hitunganStore = useHitunganStore();

  const isLoading = ref(false);
  const sentenceStats = ref<{ wpm: number; cpm: number; accuracy: number; errorCount: number; totalKeystrokes: number } | null>(null);

  // ── Quiz Configuration State ────────────────────────────────
  const questionType = ref('hiragana');
  const quizLevel = ref<'basic' | 'n5'>('basic');
  const targetDurationMinutes = ref<number>(1);
  const selectedKanaCategory = ref<'all' | 'basic' | 'dakuten' | 'combination'>('all');
  const selectedMode = ref<'multiple_choice' | 'keyboard_typing' | 'writing' | 'sentence_typing' | 'hitungan'>('multiple_choice');
  const isTypingMode = computed(() => selectedMode.value === 'keyboard_typing' || quizLevel.value === 'n5' || questionType.value === 'words' || questionType.value === 'sentences' || questionType.value === 'renshuu' || questionType.value === 'kaiwa');

  // ── Kanji Lesson Panel ──────────────────────────────────────
  const {
    selectedKanjiLessonNumber,
    activeKanjiLessonNumber,
    currentKanjiLessonLabel,
    currentKanjiLessonStats
  } = useKanjiLessonPanel(masteryStore.getMasteryStreak);

  // ── Quiz Session State ──────────────────────────────────────
  const userInput = ref('');
  const showReadingHint = ref(false);
  const showMeaningHint = ref(false);
  const isMeaningHintAutoOpened = ref(false);
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const questions = ref<any[]>([]);
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);

  const openMeaningHint = () => {
    showMeaningHint.value = true;
    isMeaningHintAutoOpened.value = false;
  };

  const initQuestionHints = () => {
    showReadingHint.value = false;
    isMeaningHintAutoOpened.value = false;

    const current = currentQuestion.value;
    if (current && (questionType.value === 'words' || current.type === 'word') && isTypingMode.value) {
      const streak = masteryStore.getMasteryStreak(current.character);
      if (streak < 2) {
        showMeaningHint.value = true;
        isMeaningHintAutoOpened.value = true;
      } else {
        showMeaningHint.value = false;
      }
    } else {
      showMeaningHint.value = false;
    }
  };

  const initialQuestionCount = ref<number>(0);
  const selectedAnswer = ref<string | null>(null);
  const isAnswerCorrect = ref<boolean | null>(null);
  const quizCompleted = ref(false);
  const startTime = ref(0);
  const endTime = ref(0);
  const newRecordAchieved = ref(false);
  const levelBeforeQuiz = ref(1);
  const showLevelUpScreen = ref(false);
  const quizLesson = ref<string>('Pelajaran 1');
  const speedAchievement = ref<{ timeSavedSeconds: number; bonusPoints: number; isFaster: boolean; rankText: string; } | null>(null);
  const userAnswers = ref<any[]>([]);

  const masteredChars = ref<Record<string, boolean>>({});
  const attemptedChars = ref<Record<string, boolean>>({});
  const firstTryCorrectCount = ref<number>(0);
  const sessionCharAttempts = ref<Record<string, { attempts: number; failed: boolean; initialStreak: number; streakEvaluated: boolean }>>({});

  // ── Wave Preview Composable ─────────────────────────────────
  const {
    previewMode,
    justClosedPreview,
    previewClosedTimestamp,
    previewedItems,
    fullWaveBatches,
    currentWaveIndex,
    isWavePreviewActive,
    currentWaveItems,
    microPreviewItem,
    showMicroPreviewModal,
    completeWavePreview,
    completeMicroPreview
  } = useQuizPreview(masteryStore, () => {
    startTime.value = Date.now();
    initQuestionHints();
  });

  const initHitunganSession = (totalQuestions: number = 10) => {
    selectedMode.value = 'hitungan';
    currentQuestionIndex.value = 0;
    initialQuestionCount.value = totalQuestions;
    score.value = 0;
    userAnswers.value = [];
    quizCompleted.value = false;
    hitunganStore.isHitunganFinished = false;
  };

  const resetQuizSessionState = async (targetDuration: number, type: string, level: 'basic' | 'n5') => {
    isLoading.value = true;
    questionType.value = type;
    quizLevel.value = level;
    targetDurationMinutes.value = targetDuration;
    currentQuestionIndex.value = 0;
    score.value = 0;
    quizCompleted.value = false;
    selectedAnswer.value = null;
    isAnswerCorrect.value = null;
    userAnswers.value = [];
    userInput.value = '';
    showReadingHint.value = false;
    showMeaningHint.value = false;
    isMeaningHintAutoOpened.value = false;
    questions.value = [];
    startTime.value = Date.now();
    endTime.value = 0;
    newRecordAchieved.value = false;
    levelBeforeQuiz.value = masteryStore.currentUserLevel;
    showLevelUpScreen.value = false;
    speedAchievement.value = null;
    masteredChars.value = {};
    attemptedChars.value = {};
    firstTryCorrectCount.value = 0;
    masteryStore.latestTierTransition = null;
    masteryStore.sessionTierChanges = [];
    sessionCharAttempts.value = {};

    lessonStore.resetLessonSession();
  };

  // ── Start Quiz Gameplay ─────────────────────────────────────
  const startQuiz = async (
    targetDuration: number = 1,
    type: string = 'hiragana',
    level: 'basic' | 'n5' = 'basic',
    kanaCategory: 'all' | 'basic' | 'dakuten' | 'combination' = selectedKanaCategory.value
  ) => {
    selectedKanaCategory.value = kanaCategory;
    await resetQuizSessionState(targetDuration, type, level);

    if (type === 'kaiwa') {
      const data = await lessonStore.startKaiwaSession(lessonStore.currentLessonNumber);
      initialQuestionCount.value = data.lines.length;
      isLoading.value = false;
      return;
    }

    if (type === 'renshuu') {
      const sessionData = await lessonStore.startRenshuuSession(lessonStore.currentLessonNumber);
      initialQuestionCount.value = sessionData.questions.length;
      isLoading.value = false;
      return;
    }

    const res = await prepareStandardQuestions({
      targetDuration,
      type,
      level,
      selectedKanaCategory: selectedKanaCategory.value,
      selectedKanjiLessonNumber: selectedKanjiLessonNumber.value,
      activeKanjiLessonNumber: activeKanjiLessonNumber.value,
      getMasteryStreak: masteryStore.getMasteryStreak,
      userStreaks: masteryStore.userStreaks,
      introducedChars: masteryStore.introducedChars
    });

    questions.value = res.questions;
    previewMode.value = res.previewMode;
    isWavePreviewActive.value = res.isWavePreviewActive;
    currentWaveItems.value = res.currentWaveItems;
    currentWaveIndex.value = 0;
    initialQuestionCount.value = res.initialQuestionCount;
    isLoading.value = false;
    initQuestionHints();
  };

  const startWeakItemsQuiz = async (
    targetDuration: number = 1,
    type: string = 'hiragana',
    level: 'basic' | 'n5' = 'basic',
    kanaCategory: 'all' | 'basic' | 'dakuten' | 'combination' = selectedKanaCategory.value
  ) => {
    selectedKanaCategory.value = kanaCategory;
    await resetQuizSessionState(targetDuration, type, level);

    const res = await prepareWeakItemsQuestions({
      targetDuration,
      type,
      level,
      selectedKanaCategory: selectedKanaCategory.value,
      getMasteryStreak: masteryStore.getMasteryStreak,
      introducedChars: masteryStore.introducedChars
    });

    questions.value = res.questions;
    initialQuestionCount.value = res.initialQuestionCount;
    isLoading.value = false;
    initQuestionHints();
  };

  const options = computed(() => {
    if (!currentQuestion.value || isTypingMode.value) return [];
    const correctRomaji = currentQuestion.value.romaji;
    const correctRomajis = Array.isArray(correctRomaji) ? correctRomaji : [correctRomaji];

    let poolData = getFallbackLocalPool(questionType.value, quizLevel.value);
    if (['hiragana', 'katakana', 'mix'].includes(questionType.value) && selectedKanaCategory.value !== 'all') {
      const filtered = poolData.filter(w => w.type === selectedKanaCategory.value);
      if (filtered.length >= 6) poolData = filtered;
    }
    const pool = poolData.flatMap(w => Array.isArray(w.romaji) ? w.romaji : [w.romaji]);
    const incorrectOptions = Array.from(new Set(pool.filter(r => !correctRomajis.includes(r)))).sort(() => 0.5 - Math.random()).slice(0, 5);
    return [...incorrectOptions, correctRomajis[0]].sort(() => 0.5 - Math.random());
  });

  // ── Answer Submission & Scoring ─────────────────────────────
  const submitAnswer = (romaji: string) => {
    if (quizCompleted.value || selectedAnswer.value !== null) return;
    const userAnswerClean = romaji.trim().toLowerCase();
    const current = currentQuestion.value;
    let isCorrectVal = false, isTypo = false;

    if (current) {
      isCorrectVal = checkIsCorrect(userAnswerClean, current.romaji);
      isTypo = isTypingMode.value && checkIsTypo(userAnswerClean, current.romaji);

      let hintsUsed = 0;
      if (showMeaningHint.value && !isMeaningHintAutoOpened.value) hintsUsed++;
      if (showReadingHint.value) hintsUsed++;

      const isFirstTry = !attemptedChars.value[current.character];
      attemptedChars.value[current.character] = true;

      let pointsEarned = 0;
      if (isCorrectVal) {
        playCorrectSound();
        if (hintsUsed === 0) pointsEarned = 4;
        else if (hintsUsed === 1) pointsEarned = 3;
        else pointsEarned = 2;

        if (isFirstTry) {
          firstTryCorrectCount.value++;
          masteredChars.value[current.character] = true;
        }
      } else {
        playIncorrectSound();
        pointsEarned = isTypo ? 1 : 0;
        delete masteredChars.value[current.character];
      }

      score.value += pointsEarned;
      selectedAnswer.value = romaji;
      isAnswerCorrect.value = isCorrectVal;

      const charKey = current.character;
      const oldStreak = masteryStore.userStreaks[charKey] || 0;

      if (!sessionCharAttempts.value[charKey]) {
        sessionCharAttempts.value[charKey] = {
          attempts: 1,
          failed: !isCorrectVal,
          initialStreak: oldStreak,
          streakEvaluated: false
        };
      } else {
        sessionCharAttempts.value[charKey].attempts++;
        if (!isCorrectVal) {
          sessionCharAttempts.value[charKey].failed = true;
        }
      }

      const isWordOrKanji = questionType.value === 'words' || current.type === 'word' || current.type === 'kanji';
      masteryStore.recordAnswerStreak(
        charKey,
        isWordOrKanji,
        isCorrectVal,
        pointsEarned,
        sessionCharAttempts.value[charKey],
        isTypo
      );

      const goalsStore = useGoalsStore();
      import('./authStore').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        goalsStore.recordAnswer(1, 0, authStore.user?.id);
      });

      userAnswers.value.push({
        character: current.character,
        correctRomaji: Array.isArray(current.romaji) ? current.romaji.join(' / ') : current.romaji,
        userRomaji: romaji || '(skipped)',
        isCorrect: isCorrectVal,
        kana: (current as any).kana,
        meaning: (current as any).meaning,
        pointsEarned,
        maxPoints: 4,
        isTypo,
        hintsUsed
      });

      if (!isCorrectVal) {
        questions.value = [...questions.value, buildRepeatedQuestion(current)];
      }
    }
  };

  const submitToLeaderboard = async (submissionScore: number = score.value) => {
    const { useAuthStore } = await import('./authStore');
    const authStore = useAuthStore();
    if (!authStore.user) return;

    const durationSeconds = (endTime.value - startTime.value) / 1000;
    const { isNewRecord } = await submitLeaderboardScore({
      userId: authStore.user.id,
      username: authStore.displayUsername || 'Anonymous',
      submissionScore,
      durationSeconds,
      questionType: questionType.value,
      quizLevel: quizLevel.value
    });
    if (isNewRecord) newRecordAchieved.value = true;
  };

  const finishQuiz = () => {
    endTime.value = Date.now();
    const durationSeconds = Math.round((endTime.value - startTime.value) / 1000);
    const timeSavedSeconds = (targetDurationMinutes.value * 60) - durationSeconds;
    const finalSubmissionScore = score.value + (timeSavedSeconds > 0 ? Math.round(timeSavedSeconds * 0.5) : 0);

    if (timeSavedSeconds > 0) {
      const bonusPoints = Math.round(timeSavedSeconds * 0.5);
      let rankText = timeSavedSeconds >= 60 ? '🚀 Speed Demon!' : timeSavedSeconds >= 30 ? '⚡ Lightning Fast!' : '⚡ Selesai Lebih Cepat!';
      speedAchievement.value = { timeSavedSeconds, bonusPoints, isFaster: true, rankText };
    } else {
      speedAchievement.value = { timeSavedSeconds: 0, bonusPoints: 0, isFaster: false, rankText: '🎯 Steady & Consistent' };
    }

    submitToLeaderboard(finalSubmissionScore);

    const goalsStore = useGoalsStore();
    goalsStore.checkAndTriggerCelebration();

    const badgeStore = useBadgeStore();
    if (masteryStore.currentUserLevel > badgeStore.highestLevelReached) {
      showLevelUpScreen.value = true;
    } else {
      quizCompleted.value = true;
    }
  };

  const masteredCount = computed(() => Object.keys(masteredChars.value).length);

  const nextQuestion = () => {
    selectedAnswer.value = null;
    isAnswerCorrect.value = null;
    userInput.value = '';
    showReadingHint.value = false;
    showMeaningHint.value = false;
    isMeaningHintAutoOpened.value = false;
    masteryStore.latestTierTransition = null;

    const totalAnswered = userAnswers.value.length;
    const isSessionComplete = totalAnswered >= initialQuestionCount.value;

    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
      initQuestionHints();
    } else if (isSessionComplete || masteredCount.value >= initialQuestionCount.value) {
      finishQuiz();
    } else {
      const unmastered = questions.value.filter(q => !masteredChars.value[q.character]);
      if (unmastered.length > 0) {
        questions.value = [...questions.value, ...unmastered.map(q => ({ ...q, questionReason: 'repeat', reasonLabel: '🔁 Babak Perbaikan: Ulang Sampai Benar', isFirstAppearance: false }))];
        currentQuestionIndex.value++;
        initQuestionHints();
      } else {
        finishQuiz();
      }
    }
  };

  watch(
    () => [currentQuestionIndex.value, questions.value],
    () => {
      if (!quizCompleted.value && currentQuestion.value) {
        initQuestionHints();
      }
    }
  );

  const restartQuiz = async () => {
    await startQuiz(targetDurationMinutes.value, questionType.value, quizLevel.value, selectedKanaCategory.value);
  };

  const progress = computed(() => {
    const total = initialQuestionCount.value || 1;
    return Math.min(100, Math.round((userAnswers.value.length / total) * 100));
  });

  const finalScore = computed(() => {
    const total = initialQuestionCount.value || 1;
    return Math.min(100, Math.round((firstTryCorrectCount.value / total) * 100));
  });

  const isMistakeRound = computed(() => currentQuestionIndex.value >= initialQuestionCount.value);

  const finishSentenceQuiz = (stats: { wpm: number; cpm: number; accuracy: number; errorCount: number; totalKeystrokes: number }) => {
    sentenceStats.value = stats;
    firstTryCorrectCount.value = Math.round((stats.accuracy / 100) * (initialQuestionCount.value || 1));
    score.value = Math.round(stats.accuracy);
    finishQuiz();
  };

  return {
    // Configuration & Meta
    isLoading,
    quizLevel,
    questionType,
    selectedKanaCategory,
    selectedMode,
    isTypingMode,
    userInput,
    showReadingHint,
    showMeaningHint,
    isMeaningHintAutoOpened,
    openMeaningHint,
    initQuestionHints,

    // Active Quiz Session
    currentQuestionIndex,
    score,
    questions,
    selectedAnswer,
    isAnswerCorrect,
    quizCompleted,
    startTime,
    endTime,
    newRecordAchieved,
    levelBeforeQuiz,
    showLevelUpScreen,
    quizLesson,
    targetDurationMinutes,
    speedAchievement,
    userAnswers,
    currentQuestion,
    options,
    progress,
    finalScore,
    isMistakeRound,
    masteredCount,
    initialQuestionCount,
    firstTryCorrectCount,
    sentenceStats,

    // Kanji Lesson Panels
    selectedKanjiLessonNumber,
    activeKanjiLessonNumber,
    currentKanjiLessonLabel,
    currentKanjiLessonStats,
    kanjiN5Data,

    // Wave Preview
    previewMode,
    previewedItems,
    fullWaveBatches,
    currentWaveIndex,
    isWavePreviewActive,
    currentWaveItems,
    microPreviewItem,
    showMicroPreviewModal,
    justClosedPreview,
    previewClosedTimestamp,
    completeWavePreview,
    completeMicroPreview,

    // Core Actions
    startQuiz,
    startWeakItemsQuiz,
    submitAnswer,
    finishSentenceQuiz,
    nextQuestion,
    restartQuiz,

    // Delegated to Mastery Store
    userStreaks: toRef(masteryStore, 'userStreaks'),
    introducedChars: toRef(masteryStore, 'introducedChars'),
    latestTierTransition: toRef(masteryStore, 'latestTierTransition'),
    sessionTierChanges: toRef(masteryStore, 'sessionTierChanges'),
    hiraganaMasteryStats: toRef(masteryStore, 'hiraganaMasteryStats'),
    katakanaMasteryStats: toRef(masteryStore, 'katakanaMasteryStats'),
    wordsMasteryStats: toRef(masteryStore, 'wordsMasteryStats'),
    kanjiMasteryStats: toRef(masteryStore, 'kanjiMasteryStats'),
    overallMasteryStats: toRef(masteryStore, 'overallMasteryStats'),
    currentUserLevel: toRef(masteryStore, 'currentUserLevel'),
    getMasteryStreak: masteryStore.getMasteryStreak,
    getMasteryTier: masteryStore.getMasteryTier,
    bulkUpdateMasteryTier: masteryStore.bulkUpdateMasteryTier,
    loadStreaksFromServer: masteryStore.loadStreaksFromServer,
    loadStreaksFromStorage: masteryStore.loadStreaksFromStorage,
    getLocalStreaks: masteryStore.getLocalStreaks,
    fetchServerStreaks: masteryStore.fetchServerStreaks,
    syncLocalToServer: masteryStore.syncLocalToServer,
    applyServerStreaks: masteryStore.applyServerStreaks,

    // Delegated to Lesson Store
    currentLessonNumber: toRef(lessonStore, 'currentLessonNumber'),
    bunkeiList: toRef(lessonStore, 'bunkeiList'),
    kaiwaData: toRef(lessonStore, 'kaiwaData'),
    renshuuSessionQuestions: toRef(lessonStore, 'renshuuSessionQuestions'),
    renshuuProgressStats: toRef(lessonStore, 'renshuuProgressStats'),
    showLessonMaterial: toRef(lessonStore, 'showLessonMaterial'),
    isLessonMaterialCompleted: toRef(lessonStore, 'isLessonMaterialCompleted'),
    loadRenshuuProgress: lessonStore.loadRenshuuProgress,
    recordRenshuuAnswer: lessonStore.recordRenshuuAnswer,

    // Delegated to Hitungan Store
    selectedHitunganWave: toRef(hitunganStore, 'selectedHitunganWave'),
    selectedHitunganDirection: toRef(hitunganStore, 'selectedHitunganDirection'),
    hitunganProgressMap: toRef(hitunganStore, 'hitunganProgressMap'),
    unlockedHitunganWaveKeys: toRef(hitunganStore, 'unlockedHitunganWaveKeys'),
    loadHitunganProgress: hitunganStore.loadHitunganProgress,
    isHitunganFinished: toRef(hitunganStore, 'isHitunganFinished'),
    initHitunganSession
  };
});