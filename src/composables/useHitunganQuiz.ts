// src/composables/useHitunganQuiz.ts
import { ref } from 'vue';
import * as wanakana from 'wanakana';
import { numberToKana, getAcceptedKanaReadings } from '../utils/numberToKana';
import { HITUNGAN_WAVES, getCounterCategoryData, type HitunganWaveDef } from '../data/hitunganWaves';
import { HitunganService } from '../services/hitunganService';
import { useAuthStore } from '../stores/authStore';
import { useQuizStore } from '../stores/quizStore';
import { useTextToSpeech } from './useTextToSpeech';

export interface HitunganQuestion {
  id: string;
  waveKey: string;
  displayPrompt: string;
  displaySubprompt?: string;
  expectedKana: string;
  acceptedKanaList: string[];
  expectedNumber: string;
  originalValue: number | string;
  counterKanji?: string;
  counterMeaning?: string;
  direction: 'number_to_kana' | 'kana_to_number';
}

export function useHitunganQuiz(
  initialWave: HitunganWaveDef,
  initialDirection: 'number_to_kana' | 'kana_to_number' = 'number_to_kana',
  unlockedWaveKeys: string[] = []
) {
  const authStore = useAuthStore();
  const quizStore = useQuizStore();
  const { speak } = useTextToSpeech();

  const currentWave = ref<HitunganWaveDef>(initialWave);
  const direction = ref<'number_to_kana' | 'kana_to_number'>(initialDirection);

  const currentQuestion = ref<HitunganQuestion | null>(null);
  const questionNumber = ref(1);
  const totalQuestions = ref(10); // Standard wave round of 10 questions

  const streak = ref(0);
  const correctCount = ref(0);
  const incorrectCount = ref(0);
  const userInput = ref('');
  const isAnswerChecked = ref(false);
  const isCorrect = ref(false);
  const isQuizFinished = ref(false);

  // Helper random integer
  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Generates 1 on-the-fly question based on the wave and direction.
   */
  const generateQuestion = (
    targetWave: HitunganWaveDef,
    targetDirection: 'number_to_kana' | 'kana_to_number'
  ): HitunganQuestion => {
    let resolvedWave = targetWave;

    // Mixed review: randomly pick from unlocked waves (excluding mixed itself)
    if (targetWave.type === 'mixed') {
      const candidates = HITUNGAN_WAVES.filter(
        w => w.wave_key !== 'mixed_review' && (unlockedWaveKeys.length === 0 || unlockedWaveKeys.includes(w.wave_key))
      );
      if (candidates.length > 0) {
        resolvedWave = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        resolvedWave = HITUNGAN_WAVES[0];
      }
    }

    const qId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Range-based question
    if (resolvedWave.type === 'number_range') {
      const min = resolvedWave.min_value || 1;
      const max = resolvedWave.max_value || 10;
      let num = 1;

      if (resolvedWave.wave_key === 'hundreds') {
        // 45% chance of irregular hundreds (3xx, 6xx, 8xx)
        if (Math.random() < 0.45) {
          const irregularHundreds = [300, 600, 800];
          const baseH = irregularHundreds[Math.floor(Math.random() * irregularHundreds.length)];
          const rem = Math.random() < 0.4 ? 0 : getRandomInt(1, 99);
          num = baseH + rem;
        } else {
          num = getRandomInt(min, max);
        }
      } else if (resolvedWave.wave_key === 'thousands') {
        // 45% chance of irregular thousands (3xxx, 8xxx)
        if (Math.random() < 0.45) {
          const irregularThousands = [3000, 8000];
          const baseT = irregularThousands[Math.floor(Math.random() * irregularThousands.length)];
          const rem = Math.random() < 0.4 ? 0 : getRandomInt(1, 999);
          num = baseT + rem;
        } else {
          num = getRandomInt(min, max);
        }
      } else if (resolvedWave.wave_key === 'ten_thousands') {
        // Realistic ten-thousand numbers (10,000, 20,000, 50,000, 100,000, 345,000, etc.)
        const manMultipliers = [1, 2, 3, 5, 8, 10, 25, 50, 100];
        const baseMan = manMultipliers[Math.floor(Math.random() * manMultipliers.length)] * 10000;
        const rem = Math.random() < 0.5 ? 0 : getRandomInt(1, 9999);
        num = baseMan + rem;
      } else {
        num = getRandomInt(min, max);
      }

      const primaryKana = numberToKana(num);
      const acceptedList = getAcceptedKanaReadings(num);

      if (targetDirection === 'number_to_kana') {
        return {
          id: qId,
          waveKey: resolvedWave.wave_key,
          displayPrompt: num.toLocaleString('id-ID'),
          displaySubprompt: resolvedWave.title,
          expectedKana: primaryKana,
          acceptedKanaList: acceptedList,
          expectedNumber: String(num),
          originalValue: num,
          direction: targetDirection,
        };
      } else {
        return {
          id: qId,
          waveKey: resolvedWave.wave_key,
          displayPrompt: primaryKana,
          displaySubprompt: 'Ketikkan angka yang sesuai',
          expectedKana: primaryKana,
          acceptedKanaList: acceptedList,
          expectedNumber: String(num),
          originalValue: num,
          direction: targetDirection,
        };
      }
    }

    // Counter-based question
    if (resolvedWave.type === 'counter' && resolvedWave.counter_category) {
      const categoryData = getCounterCategoryData(resolvedWave.counter_category);
      if (categoryData && categoryData.values.length > 0) {
        // Pick random entry from category values (exclude '?' most of the time to avoid confusion on numpad)
        const validValues = categoryData.values.filter(v => v.value !== '?');
        const picked = validValues[Math.floor(Math.random() * validValues.length)];

        const rawJapanese = picked.japanese;
        const parts = rawJapanese.split('、').map(s => s.trim());
        const primaryKana = parts[0];
        const acceptedList = parts;

        const valDisplay = `${picked.value}${categoryData.counter}`;

        if (targetDirection === 'number_to_kana') {
          return {
            id: qId,
            waveKey: resolvedWave.wave_key,
            displayPrompt: valDisplay,
            displaySubprompt: `Counter: ${categoryData.counter} (${categoryData.usage_example})`,
            expectedKana: primaryKana,
            acceptedKanaList: acceptedList,
            expectedNumber: String(picked.value),
            originalValue: picked.value,
            counterKanji: categoryData.counter,
            counterMeaning: categoryData.usage_example,
            direction: targetDirection,
          };
        } else {
          return {
            id: qId,
            waveKey: resolvedWave.wave_key,
            displayPrompt: primaryKana,
            displaySubprompt: `Berapa ${categoryData.counter} (${categoryData.usage_example})?`,
            expectedKana: primaryKana,
            acceptedKanaList: acceptedList,
            expectedNumber: String(picked.value),
            originalValue: picked.value,
            counterKanji: categoryData.counter,
            counterMeaning: categoryData.usage_example,
            direction: targetDirection,
          };
        }
      }
    }

    // Fallback default
    return {
      id: qId,
      waveKey: resolvedWave.wave_key,
      displayPrompt: '1',
      expectedKana: 'いち',
      acceptedKanaList: ['いち'],
      expectedNumber: '1',
      originalValue: 1,
      direction: targetDirection,
    };
  };

  /**
   * Initializes or restarts the quiz session.
   */
  const startSession = (
    newWave?: HitunganWaveDef,
    newDirection?: 'number_to_kana' | 'kana_to_number'
  ) => {
    if (newWave) currentWave.value = newWave;
    if (newDirection) direction.value = newDirection;

    questionNumber.value = 1;
    streak.value = 0;
    correctCount.value = 0;
    incorrectCount.value = 0;
    userInput.value = '';
    isAnswerChecked.value = false;
    isCorrect.value = false;
    isQuizFinished.value = false;

    // Synchronize session with quizStore for global header progress
    quizStore.initHitunganSession(totalQuestions.value);

    nextQuestion();
  };

  /**
   * Loads the next question or completes the quiz.
   */
  const nextQuestion = () => {
    userInput.value = '';
    isAnswerChecked.value = false;
    isCorrect.value = false;

    currentQuestion.value = generateQuestion(currentWave.value, direction.value);

    // If kana_to_number, optionally auto-speak the kana prompt
    if (direction.value === 'kana_to_number' && currentQuestion.value) {
      setTimeout(() => {
        speak(currentQuestion.value!.expectedKana);
      }, 100);
    }
  };

  /**
   * Evaluates user answer.
   */
  const submitAnswer = async (inputVal: string) => {
    if (isAnswerChecked.value || !currentQuestion.value) return;

    const raw = inputVal.trim();
    if (!raw) return;

    let userIsCorrect = false;

    if (direction.value === 'number_to_kana') {
      // User typed romaji/hiragana -> normalize with WanaKana
      const convertedHiragana = wanakana.toHiragana(raw);
      const cleanRaw = raw.replace(/\s+/g, '');
      const cleanHiragana = convertedHiragana.replace(/\s+/g, '');

      // Normalize katakana ゼロ to ぜろ
      const normalizedInputs = [
        cleanRaw,
        cleanHiragana,
        cleanRaw.replace(/ゼロ/g, 'ぜろ'),
        cleanHiragana.replace(/ゼロ/g, 'ぜろ'),
      ];

      // Check against accepted list
      userIsCorrect = currentQuestion.value.acceptedKanaList.some(accepted => {
        const cleanAccepted = accepted.replace(/\s+/g, '');
        const altAccepted = cleanAccepted.replace(/ゼロ/g, 'ぜろ');
        return normalizedInputs.includes(cleanAccepted) || normalizedInputs.includes(altAccepted);
      });
    } else {
      // kana_to_number: compare with numeric expectedNumber
      const cleanInput = raw.replace(/\s+/g, '').replace(/,/g, '').replace(/\./g, '');
      const cleanExpected = currentQuestion.value.expectedNumber.replace(/\s+/g, '').replace(/,/g, '').replace(/\./g, '');
      userIsCorrect = cleanInput === cleanExpected;
    }

    isCorrect.value = userIsCorrect;
    isAnswerChecked.value = true;

    if (userIsCorrect) {
      correctCount.value++;
      streak.value++;
      quizStore.score += 10;
    } else {
      incorrectCount.value++;
      streak.value = 0;
    }

    quizStore.userAnswers.push({
      question: currentQuestion.value.displayPrompt,
      userAnswer: inputVal,
      isCorrect: userIsCorrect
    });

    // Save progress asynchronously
    await HitunganService.saveProgress(
      currentWave.value.wave_key,
      {
        attemptsDelta: 1,
        correctDelta: userIsCorrect ? 1 : 0,
      },
      authStore.user?.id,
      currentWave.value.id
    );
  };

  /**
   * Advances to next question or finishes wave round.
   */
  const handleProceed = () => {
    if (questionNumber.value >= totalQuestions.value) {
      isQuizFinished.value = true;
      quizStore.isHitunganFinished = true;
    } else {
      questionNumber.value++;
      quizStore.currentQuestionIndex = questionNumber.value - 1;
      nextQuestion();
    }
  };

  return {
    currentWave,
    direction,
    currentQuestion,
    questionNumber,
    totalQuestions,
    streak,
    correctCount,
    incorrectCount,
    userInput,
    isAnswerChecked,
    isCorrect,
    isQuizFinished,
    startSession,
    nextQuestion,
    submitAnswer,
    handleProceed,
  };
}
