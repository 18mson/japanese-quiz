import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import { supabase } from '../lib/supabaseClient';
import incorrect from '../assets/sound/incorrect.wav';
import correct from '../assets/sound/correct.wav';
import {
  checkIsCorrect,
  checkIsTypo,
  getQuestionCountFromDuration,
  getFallbackLocalPool,
  buildSmartAdaptiveQuestions
} from '../utils/quizHelpers';
import { getMasteryTierFromStreak, computeCategoryMasteryStats } from '../utils/masteryStats';
import { submitLeaderboardScore } from '../services/leaderboardService';

export const useQuizStore = defineStore('quiz', () => {
  const isLoading = ref(false);
  const userStreaks = ref<Record<string, number>>({});

  const getLocalStreaks = (): Record<string, number> => {
    try {
      const stored = localStorage.getItem('japanese-quiz-streaks');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  };

  const fetchServerStreaks = async (userId: string): Promise<Record<string, number>> => {
    const { data, error } = await supabase.from('user_streaks').select('character, streak').eq('user_id', userId);
    if (error) throw error;
    const streaks: Record<string, number> = {};
    if (data) data.forEach(item => { streaks[item.character] = item.streak; });
    return streaks;
  };

  const syncLocalToServer = async (userId: string) => {
    const current = getLocalStreaks();
    const entries = Object.entries(current).filter(([_, streak]) => streak > 0);
    if (entries.length === 0) return;

    const rows = entries.map(([character, streak]) => ({
      user_id: userId,
      character,
      streak
    }));

    const { error } = await supabase.from('user_streaks').upsert(rows, { onConflict: 'user_id,character' });
    if (error) console.error('Failed to sync local streaks to server:', error);
  };

  const applyServerStreaks = (serverStreaks: Record<string, number>) => {
    userStreaks.value = serverStreaks;
    try {
      localStorage.setItem('japanese-quiz-streaks', JSON.stringify(serverStreaks));
    } catch (e) {}
  };

  const loadStreaksFromStorage = async () => {
    userStreaks.value = getLocalStreaks();
    const { useAuthStore } = await import('./authStore');
    const authStore = useAuthStore();
    if (authStore.user) {
      try {
        const serverStreaks = await fetchServerStreaks(authStore.user.id);
        if (Object.keys(serverStreaks).length > 0) {
          userStreaks.value = serverStreaks;
          localStorage.setItem('japanese-quiz-streaks', JSON.stringify(serverStreaks));
        }
      } catch (e) {
        console.error('Error fetching server streaks:', e);
      }
    }
  };

  const loadStreaksFromServer = loadStreaksFromStorage;

  const getMasteryStreak = (character: string): number => userStreaks.value[character] || 0;
  const getMasteryTier = (character: string) => getMasteryTierFromStreak(getMasteryStreak(character));

  const hiraganaMasteryStats = computed(() => computeCategoryMasteryStats(hiraganaData, userStreaks.value));
  const katakanaMasteryStats = computed(() => computeCategoryMasteryStats(katakanaData, userStreaks.value));
  const wordsMasteryStats = computed(() => computeCategoryMasteryStats(wordsData, userStreaks.value));

  const overallMasteryStats = computed(() => {
    const h = hiraganaMasteryStats.value, k = katakanaMasteryStats.value, w = wordsMasteryStats.value;
    const total = h.total + k.total + w.total, mastered = h.mastered + k.mastered + w.mastered;
    const crown = h.crown + k.crown + w.crown, learning = h.learning + k.learning + w.learning, newItems = h.newItems + k.newItems + w.newItems;
    return { total, mastered, crown, learning, newItems, percentage: total > 0 ? Math.round((mastered / total) * 100) : 0 };
  });

  const currentUserLevel = computed(() => {
    const level1Words = wordsData.filter(w => !w.lesson || w.lesson === 'Pelajaran 1');
    return level1Words.every(w => (userStreaks.value[w.character] || 0) >= 3) ? 2 : 1;
  });

  const questionType = ref('hiragana');
  const quizLevel = ref<'basic' | 'n5'>('basic');
  const targetDurationMinutes = ref<number>(1);
  const isTypingMode = computed(() => quizLevel.value === 'n5' || questionType.value === 'words');

  const userInput = ref('');
  const showReadingHint = ref(false);
  const showMeaningHint = ref(false);
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const questions = ref<any[]>([]);
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

  // Fully reactive tracking objects for Vue 3
  const masteredChars = ref<Record<string, boolean>>({});
  const attemptedChars = ref<Record<string, boolean>>({});
  const firstTryCorrectCount = ref<number>(0);

  const correctSound = new Audio(correct);
  correctSound.preload = 'auto';
  const incorrectSound = new Audio(incorrect);
  incorrectSound.preload = 'auto';

  const resetQuizSessionState = async (targetDuration: number, type: string, level: 'basic' | 'n5') => {
    isLoading.value = true; questionType.value = type; quizLevel.value = level; targetDurationMinutes.value = targetDuration;
    currentQuestionIndex.value = 0; score.value = 0; quizCompleted.value = false; selectedAnswer.value = null; isAnswerCorrect.value = null;
    userAnswers.value = []; userInput.value = ''; showReadingHint.value = false; showMeaningHint.value = false;
    newRecordAchieved.value = false; showLevelUpScreen.value = false; speedAchievement.value = null;
    masteredChars.value = {}; attemptedChars.value = {}; firstTryCorrectCount.value = 0;

    await loadStreaksFromServer();
    levelBeforeQuiz.value = currentUserLevel.value;
    quizLesson.value = `Pelajaran ${currentUserLevel.value}`;
    startTime.value = Date.now();
  };

  const startQuiz = async (targetDuration: number = 1, type: string = 'hiragana', level: 'basic' | 'n5' = 'basic') => {
    await resetQuizSessionState(targetDuration, type, level);
    const questionCount = getQuestionCountFromDuration(targetDuration);

    try {
      const { data, error } = await supabase.from('characters').select('*').eq('quiz_type', type);
      if (error || !data || data.length === 0) throw error || new Error('No data');

      const mappedData = data.map(item => ({
        character: item.character, romaji: item.romaji,
        kana: item.kana, meaning: item.meaning, type: type === 'words' ? ('word' as const) : (item.type as 'basic' | 'dakuten' | 'combination'), lesson: item.lesson
      }));

      let finalPool = [...mappedData];
      if (type === 'words') {
        const wordPool = mappedData.filter(w => {
          const cleanKana = (w.kana || '').replace(/[～ー\-?？\s]/g, '');
          return cleanKana.length > 1;
        });
        const level1Words = wordPool.filter(w => !w.lesson || w.lesson === 'Pelajaran 1');
        const level2Words = wordPool.filter(w => w.lesson === 'Pelajaran 2');
        const unmasteredLevel1 = level1Words.filter(w => (userStreaks.value[w.character] || 0) < 3);
        finalPool = unmasteredLevel1.length === 0 ? [...level1Words, ...level2Words] : [...level1Words];
      }

      questions.value = buildSmartAdaptiveQuestions(finalPool, questionCount, getMasteryStreak);
    } catch (err) {
      questions.value = buildSmartAdaptiveQuestions(getFallbackLocalPool(type, level), questionCount, getMasteryStreak);
    } finally {
      if (!questions.value || questions.value.length === 0) {
        questions.value = buildSmartAdaptiveQuestions(getFallbackLocalPool(type, level), questionCount, getMasteryStreak);
      }
      initialQuestionCount.value = questions.value.length;
      isLoading.value = false;
    }
  };

  const startWeakItemsQuiz = async (targetDuration: number = 1, type: string = 'hiragana', level: 'basic' | 'n5' = 'basic') => {
    await resetQuizSessionState(targetDuration, type, level);
    const questionCount = getQuestionCountFromDuration(targetDuration);
    const pool = getFallbackLocalPool(type, level);

    let weakPool = pool.filter(item => getMasteryStreak(item.character) < 3);
    if (weakPool.length === 0) weakPool = [...pool];
    weakPool.sort((a, b) => getMasteryStreak(a.character) - getMasteryStreak(b.character));
    const selected = weakPool.slice(0, Math.max(questionCount, weakPool.length)).sort(() => 0.5 - Math.random());
    questions.value = selected.slice(0, questionCount).map(item => ({ ...item, questionReason: 'weak', reasonLabel: '🔴 Fokus Latihan (Belum Dipelajari / Sering Salah)' }));
    initialQuestionCount.value = questions.value.length;
    isLoading.value = false;
  };

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);

  const options = computed(() => {
    if (!currentQuestion.value || isTypingMode.value) return [];
    const correctRomaji = currentQuestion.value.romaji;
    const correctRomajis = Array.isArray(correctRomaji) ? correctRomaji : [correctRomaji];
    const poolData = getFallbackLocalPool(questionType.value, quizLevel.value);
    const pool = poolData.flatMap(w => Array.isArray(w.romaji) ? w.romaji : [w.romaji]);
    
    const incorrectOptions = pool.filter(r => !correctRomajis.includes(r)).sort(() => 0.5 - Math.random()).slice(0, 5);
    return [...incorrectOptions, correctRomajis[0]].sort(() => 0.5 - Math.random());
  });

  const submitAnswer = (romaji: string) => {
    if (quizCompleted.value || selectedAnswer.value !== null) return;
    const userAnswerClean = romaji.trim().toLowerCase();
    const current = currentQuestion.value;
    let isCorrectVal = false, isTypo = false;
    let hintsUsed = (showReadingHint.value ? 1 : 0) + (showMeaningHint.value ? 1 : 0);
    
    if (current) {
      if (checkIsCorrect(userAnswerClean, current.romaji)) isCorrectVal = true;
      else if (isTypingMode.value && checkIsTypo(userAnswerClean, current.romaji)) { isCorrectVal = false; isTypo = true; }
    }
    
    selectedAnswer.value = romaji;
    isAnswerCorrect.value = isCorrectVal;
    
    let pointsEarned = 0;
    if (isCorrectVal) {
      pointsEarned = isTypingMode.value ? (hintsUsed === 1 ? 3 : hintsUsed === 2 ? 2 : 4) : 4;
      score.value += pointsEarned;
      correctSound.play().catch(() => {});
      if (current) masteredChars.value[current.character] = true;
    } else {
      if (isTypo) { pointsEarned = 1; score.value += pointsEarned; }
      incorrectSound.play().catch(() => {});
    }
    
    if (current) {
      const charKey = current.character;
      
      // Track first-attempt accuracy (ONLY first time attempting this character in session)
      if (!attemptedChars.value[charKey]) {
        attemptedChars.value[charKey] = true;
        if (isCorrectVal) firstTryCorrectCount.value++;
      }

      const newStreak = pointsEarned === 4 ? (userStreaks.value[charKey] || 0) + 1 : 0;
      userStreaks.value[charKey] = newStreak;
      try { localStorage.setItem('japanese-quiz-streaks', JSON.stringify(userStreaks.value)); } catch (e) {}
      
      import('./authStore').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        if (authStore.user) {
          supabase.from('user_streaks').upsert({
            user_id: authStore.user.id,
            character: charKey,
            streak: newStreak
          }, { onConflict: 'user_id,character' }).then();
        }
      });
        
      userAnswers.value.push({
        character: current.character, correctRomaji: Array.isArray(current.romaji) ? current.romaji.join(' / ') : current.romaji,
        userRomaji: romaji || '(skipped)', isCorrect: isCorrectVal, kana: (current as any).kana, meaning: (current as any).meaning, pointsEarned, maxPoints: 4, isTypo, hintsUsed
      });

      if (!isCorrectVal) {
        questions.value = [...questions.value, { ...current, questionReason: 'repeat', reasonLabel: '🔁 Babak Perbaikan: Ulang Sampai Benar' }];
      }
    }
  };
  
  const submitToLeaderboard = async (submissionScore: number = score.value) => {
    const { useAuthStore } = await import('./authStore');
    const authStore = useAuthStore();
    if (!authStore.user) return;
    
    const durationSeconds = (endTime.value - startTime.value) / 1000;
    const { isNewRecord } = await submitLeaderboardScore({
      userId: authStore.user.id, username: authStore.displayUsername || 'Anonymous',
      submissionScore, durationSeconds, questionType: questionType.value, quizLevel: quizLevel.value
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
    } else speedAchievement.value = { timeSavedSeconds: 0, bonusPoints: 0, isFaster: false, rankText: '🎯 Steady & Consistent' };

    submitToLeaderboard(finalSubmissionScore);
    if (currentUserLevel.value > levelBeforeQuiz.value) showLevelUpScreen.value = true;
    else quizCompleted.value = true;
  };

  const masteredCount = computed(() => Object.keys(masteredChars.value).length);

  const nextQuestion = () => {
    selectedAnswer.value = null; isAnswerCorrect.value = null; userInput.value = ''; showReadingHint.value = false; showMeaningHint.value = false;
    
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else if (masteredCount.value >= initialQuestionCount.value) {
      finishQuiz();
    } else {
      const unmastered = questions.value.filter(q => !masteredChars.value[q.character]);
      if (unmastered.length > 0) {
        questions.value = [...questions.value, ...unmastered.map(q => ({ ...q, questionReason: 'repeat', reasonLabel: '🔁 Babak Perbaikan: Ulang Sampai Benar' }))];
        currentQuestionIndex.value++;
      } else finishQuiz();
    }
  };
  
  const restartQuiz = async () => {
    await startQuiz(targetDurationMinutes.value, questionType.value, quizLevel.value);
  };
  
  const progress = computed(() => {
    const total = initialQuestionCount.value || 1;
    return Math.min(100, Math.round((masteredCount.value / total) * 100));
  });

  const finalScore = computed(() => {
    const total = initialQuestionCount.value || 1;
    return Math.min(100, Math.round((firstTryCorrectCount.value / total) * 100));
  });

  const isMistakeRound = computed(() => currentQuestionIndex.value >= initialQuestionCount.value);

  return {
    isLoading, quizLevel, questionType, isTypingMode, userInput, showReadingHint, showMeaningHint,
    currentQuestionIndex, score, questions, selectedAnswer, isAnswerCorrect, quizCompleted,
    startTime, endTime, newRecordAchieved, levelBeforeQuiz, showLevelUpScreen, quizLesson,
    speedAchievement, userAnswers, userStreaks, currentQuestion, options, progress, finalScore,
    hiraganaMasteryStats, katakanaMasteryStats, wordsMasteryStats, overallMasteryStats,
    currentUserLevel, isMistakeRound, masteredCount, initialQuestionCount, firstTryCorrectCount,
    getMasteryStreak, getMasteryTier, startQuiz, startWeakItemsQuiz, submitAnswer,
    nextQuestion, restartQuiz, loadStreaksFromServer, loadStreaksFromStorage,
    getLocalStreaks, fetchServerStreaks, syncLocalToServer, applyServerStreaks
  };
});