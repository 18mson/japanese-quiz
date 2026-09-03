// src/composables/useMenulisQuiz.ts
import { ref, computed, watch, onMounted } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { getTierFromStreak, type MasteryTierKey } from '../utils/quizHelpers';
import { useTextToSpeech } from './useTextToSpeech';

export interface MenulisCharacterItem {
  character: string;
  romaji: string;
  type: 'basic' | 'dakuten' | 'combination';
  category: 'hiragana' | 'katakana';
  meaning?: string;
  kana?: string;
}

export function useMenulisQuiz() {
  const quizStore = useQuizStore();
  const { speak } = useTextToSpeech();

  // State
  const isQuestionFinished = ref(false);
  const isCurrentCorrect = ref<boolean | null>(null);
  const consecutiveCorrect = ref(0);
  const totalWritten = ref(0);
  const totalCorrect = ref(0);
  const currentMistakesCount = ref(0);
  const lastGradedResult = ref<{ accuracy: number; passed: boolean; totalMistakes: number } | null>(null);

  /**
   * Current active character synchronized directly with quizStore.currentQuestion
   * Ensures identical question selection, Gojūon ordering, and wave preview consistency
   */
  const currentChar = computed<MenulisCharacterItem | null>(() => {
    const q = quizStore.currentQuestion;
    if (!q) return null;
    const romajiStr = Array.isArray(q.romaji) ? q.romaji[0] : (q.romaji || '');
    return {
      character: q.character,
      romaji: romajiStr,
      type: (q.type as any) || 'basic',
      category: (q.category as any) || (quizStore.questionType as any) || 'hiragana',
      meaning: q.meaning,
      kana: q.kana
    };
  });

  /**
   * Current character mastery tier
   */
  const currentTier = computed<MasteryTierKey>(() => {
    if (!currentChar.value) return 'new';
    const streak = quizStore.userStreaks[currentChar.value.character] || 0;
    return getTierFromStreak(streak);
  });

  // Automatically reset question state and play sound clue on character change
  watch(
    () => currentChar.value?.character,
    (newChar) => {
      isQuestionFinished.value = false;
      isCurrentCorrect.value = null;
      lastGradedResult.value = null;
      currentMistakesCount.value = 0;
      if (newChar) {
        setTimeout(() => {
          speak(newChar);
        }, 220);
      }
    },
    { immediate: true }
  );

  /**
   * Handle individual stroke mistake from KanaQuizTarget
   */
  const handleMistake = (_data: { strokeNum: number }) => {
    currentMistakesCount.value++;
  };

  /**
   * Handle correct stroke progression from KanaQuizTarget
   */
  const handleCorrectStroke = (_data: { strokeNum: number; totalStrokes: number }) => {
    // Progress tracked in real-time by KanaQuizTarget
  };

  /**
   * Handle complete event from KanaQuizTarget
   * Character completed correctly. Waits for user to click "Selanjutnya".
   */
  const handleCharacterComplete = async (payload: { totalMistakes: number; character: string }) => {
    if (!currentChar.value || isQuestionFinished.value) return;

    isQuestionFinished.value = true;
    isCurrentCorrect.value = true;
    totalWritten.value++;
    totalCorrect.value++;
    consecutiveCorrect.value++;

    const accuracy = Math.max(0.6, Number((1 - (payload.totalMistakes * 0.1)).toFixed(2)));
    lastGradedResult.value = {
      passed: true,
      accuracy,
      totalMistakes: payload.totalMistakes
    };

    // Submit answer to quizStore as correct
    const romajiStr = currentChar.value.romaji;
    quizStore.submitAnswer(romajiStr);
    // User must click "Selanjutnya" to advance to the next question
  };

  /**
   * Handle fail event after reaching max 5 mistakes
   * Marks answer as incorrect and enqueues to mistake round at the end of the session
   */
  const handleFailMaxMistakes = async (payload: { totalMistakes: number; character: string }) => {
    if (!currentChar.value || isQuestionFinished.value) return;

    isQuestionFinished.value = true;
    isCurrentCorrect.value = false;
    totalWritten.value++;
    consecutiveCorrect.value = 0;

    lastGradedResult.value = {
      passed: false,
      accuracy: 0,
      totalMistakes: payload.totalMistakes
    };

    // Submit empty string so quizStore resets streak and appends character to repeat at end of session
    quizStore.submitAnswer('');
    // User must click "Selanjutnya" to advance to the next question
  };

  /**
   * User explicitly clicks "Selanjutnya" to proceed to the next question
   */
  const proceedToNextQuestion = () => {
    isQuestionFinished.value = false;
    isCurrentCorrect.value = null;
    lastGradedResult.value = null;
    currentMistakesCount.value = 0;
    quizStore.nextQuestion();
  };

  /**
   * Skip current character (submits empty string and proceeds to next question)
   */
  const skipCharacter = () => {
    if (!currentChar.value || isQuestionFinished.value) return;
    consecutiveCorrect.value = 0;
    quizStore.submitAnswer('');
    proceedToNextQuestion();
  };

  onMounted(async () => {
    if (quizStore.questions.length === 0) {
      await quizStore.startQuiz(
        1,
        quizStore.questionType || 'hiragana',
        quizStore.quizLevel || 'basic',
        quizStore.selectedKanaCategory || 'all'
      );
    }
  });

  return {
    currentChar,
    currentTier,
    isQuestionFinished,
    isCurrentCorrect,
    currentMistakesCount,
    consecutiveCorrect,
    totalWritten,
    totalCorrect,
    lastGradedResult,
    handleCharacterComplete,
    handleFailMaxMistakes,
    handleMistake,
    handleCorrectStroke,
    proceedToNextQuestion,
    skipCharacter
  };
}
