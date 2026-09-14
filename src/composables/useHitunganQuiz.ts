// src/composables/useHitunganQuiz.ts
import { ref, computed } from 'vue';
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
  isRepeat?: boolean;
}

// Helper Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Helper random integer
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

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

  const questions = ref<HitunganQuestion[]>([]);
  const currentIndex = ref(0);
  const initialQuestionCount = ref(10);

  const currentQuestion = computed(() => questions.value[currentIndex.value] || null);
  const questionNumber = computed(() => currentIndex.value + 1);
  const totalQuestions = computed(() => initialQuestionCount.value);
  const isMistakeRound = computed(() => currentIndex.value >= initialQuestionCount.value);
  const isLastQuestion = computed(() => currentIndex.value >= questions.value.length - 1);

  const streak = ref(0);
  const correctCount = ref(0); // Tracks first-try correct count for accuracy
  const incorrectCount = ref(0);
  const userInput = ref('');
  const isAnswerChecked = ref(false);
  const isCorrect = ref(false);
  const isQuizFinished = ref(false);

  /**
   * Helper to build a question object from a number value
   */
  const buildNumberQuestion = (
    num: number,
    wave: HitunganWaveDef,
    targetDirection: 'number_to_kana' | 'kana_to_number',
    idx: number
  ): HitunganQuestion => {
    const qId = `q_${wave.wave_key}_${num}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
    const primaryKana = numberToKana(num);
    const acceptedList = getAcceptedKanaReadings(num);

    if (targetDirection === 'number_to_kana') {
      return {
        id: qId,
        waveKey: wave.wave_key,
        displayPrompt: num.toLocaleString('id-ID'),
        displaySubprompt: wave.title,
        expectedKana: primaryKana,
        acceptedKanaList: acceptedList,
        expectedNumber: String(num),
        originalValue: num,
        direction: targetDirection,
      };
    } else {
      return {
        id: qId,
        waveKey: wave.wave_key,
        displayPrompt: primaryKana,
        displaySubprompt: 'Ketikkan angka yang sesuai',
        expectedKana: primaryKana,
        acceptedKanaList: acceptedList,
        expectedNumber: String(num),
        originalValue: num,
        direction: targetDirection,
      };
    }
  };

  /**
   * Generates a wave session pool where all numbers/items are strictly UNIQUE.
   */
  const generateWaveQuestions = (
    targetWave: HitunganWaveDef,
    targetDirection: 'number_to_kana' | 'kana_to_number',
    count: number = 10
  ): HitunganQuestion[] => {
    // 1. Counter Waves: Select unique values from reference data (1 to 10)
    if (targetWave.type === 'counter' && targetWave.counter_category) {
      const categoryData = getCounterCategoryData(targetWave.counter_category);
      if (categoryData && categoryData.values.length > 0) {
        // Exclude non-numeric '?'
        const validValues = categoryData.values.filter(v => v.value !== '?');
        const shuffled = shuffle(validValues);
        const selected = shuffled.slice(0, count);

        return selected.map((picked, idx) => {
          const qId = `q_${targetWave.wave_key}_${picked.value}_${idx}`;
          const parts = picked.japanese.split('、').map(s => s.trim());
          const primaryKana = parts[0];
          const acceptedList = parts;
          const valDisplay = `${picked.value}${categoryData.counter}`;

          if (targetDirection === 'number_to_kana') {
            return {
              id: qId,
              waveKey: targetWave.wave_key,
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
              waveKey: targetWave.wave_key,
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
        });
      }
    }

    // 2. Mixed Review Wave: Pick unique questions across unlocked waves
    if (targetWave.type === 'mixed') {
      const candidates = HITUNGAN_WAVES.filter(
        w => w.wave_key !== 'mixed_review' && (unlockedWaveKeys.length === 0 || unlockedWaveKeys.includes(w.wave_key))
      );
      const wavePool = candidates.length > 0 ? candidates : HITUNGAN_WAVES.slice(0, 5);
      const result: HitunganQuestion[] = [];
      const usedPrompts = new Set<string>();

      // Try picking from different waves without duplicate prompts
      let attempts = 0;
      while (result.length < count && attempts < 100) {
        attempts++;
        const randomWave = wavePool[Math.floor(Math.random() * wavePool.length)];
        const candidateQuestions = generateWaveQuestions(randomWave, targetDirection, 1);
        if (candidateQuestions.length > 0) {
          const q = candidateQuestions[0];
          if (!usedPrompts.has(q.displayPrompt)) {
            usedPrompts.add(q.displayPrompt);
            result.push(q);
          }
        }
      }
      return result;
    }

    // 3. Number Range Waves: Select strictly UNIQUE numbers per wave
    const chosenNumbers = new Set<number>();

    if (targetWave.wave_key === 'basic_1_10') {
      // Exactly 10 distinct digits: 1 through 10
      const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      return shuffle(digits).map((num, idx) => buildNumberQuestion(num, targetWave, targetDirection, idx));
    }

    if (targetWave.wave_key === 'basic_10_99') {
      // 10 unique numbers between 10 and 99
      const teens = [11, 12, 13, 14, 15, 16, 17, 18, 19];
      const roundTens = [10, 20, 30, 40, 50, 60, 70, 80, 90];
      chosenNumbers.add(teens[Math.floor(Math.random() * teens.length)]);
      chosenNumbers.add(roundTens[Math.floor(Math.random() * roundTens.length)]);
      while (chosenNumbers.size < count) {
        chosenNumbers.add(getRandomInt(10, 99));
      }
    } else if (targetWave.wave_key === 'hundreds') {
      // 10 unique numbers including key irregulars (100, 3xx, 6xx, 8xx)
      chosenNumbers.add(100);
      const rem3 = Math.random() < 0.4 ? 0 : getRandomInt(1, 99);
      chosenNumbers.add(300 + rem3);
      const rem6 = Math.random() < 0.4 ? 0 : getRandomInt(1, 99);
      chosenNumbers.add(600 + rem6);
      const rem8 = Math.random() < 0.4 ? 0 : getRandomInt(1, 99);
      chosenNumbers.add(800 + rem8);
      while (chosenNumbers.size < count) {
        chosenNumbers.add(getRandomInt(101, 999));
      }
    } else if (targetWave.wave_key === 'thousands') {
      // 10 unique numbers including key irregulars (1000, 3xxx, 8xxx)
      chosenNumbers.add(1000);
      const rem3 = Math.random() < 0.4 ? 0 : getRandomInt(1, 999);
      chosenNumbers.add(3000 + rem3);
      const rem8 = Math.random() < 0.4 ? 0 : getRandomInt(1, 999);
      chosenNumbers.add(8000 + rem8);
      while (chosenNumbers.size < count) {
        chosenNumbers.add(getRandomInt(1001, 9999));
      }
    } else if (targetWave.wave_key === 'ten_thousands') {
      // 10 unique numbers including 10.000, 100.000, 1.000.000, and man multiples
      chosenNumbers.add(10000);
      chosenNumbers.add(100000);
      chosenNumbers.add(1000000);
      const manMultipliers = [2, 3, 5, 8, 25, 40, 50, 75];
      while (chosenNumbers.size < count) {
        const base = manMultipliers[Math.floor(Math.random() * manMultipliers.length)] * 10000;
        const rem = Math.random() < 0.5 ? 0 : getRandomInt(1, 9999);
        chosenNumbers.add(base + rem);
      }
    } else {
      const min = targetWave.min_value || 1;
      const max = targetWave.max_value || 10;
      const poolSize = max - min + 1;
      const targetCount = Math.min(count, poolSize);
      while (chosenNumbers.size < targetCount) {
        chosenNumbers.add(getRandomInt(min, max));
      }
    }

    const shuffledNumbers = shuffle(Array.from(chosenNumbers));
    return shuffledNumbers.map((num, idx) => buildNumberQuestion(num, targetWave, targetDirection, idx));
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

    // Generate unique questions pool for this wave session
    questions.value = generateWaveQuestions(currentWave.value, direction.value, 10);
    initialQuestionCount.value = questions.value.length;
    currentIndex.value = 0;

    streak.value = 0;
    correctCount.value = 0;
    incorrectCount.value = 0;
    userInput.value = '';
    isAnswerChecked.value = false;
    isCorrect.value = false;
    isQuizFinished.value = false;

    // Synchronize session with quizStore for global header progress
    quizStore.initHitunganSession(initialQuestionCount.value);

    // If kana_to_number, auto speak first prompt
    if (direction.value === 'kana_to_number' && currentQuestion.value) {
      setTimeout(() => {
        speak(currentQuestion.value!.expectedKana);
      }, 150);
    }
  };

  /**
   * Evaluates user answer and re-queues mistakes until solved.
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

    const isFirstTry = !currentQuestion.value.isRepeat;

    if (userIsCorrect) {
      if (isFirstTry) {
        correctCount.value++;
        quizStore.score += 10;
      }
      streak.value++;
    } else {
      if (isFirstTry) {
        incorrectCount.value++;
      }
      streak.value = 0;

      // Repeat at the end: Push to the end of questions array until answered correctly!
      questions.value.push({
        ...currentQuestion.value,
        id: `repeat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        isRepeat: true,
      });
    }

    quizStore.userAnswers.push({
      question: currentQuestion.value.displayPrompt,
      userAnswer: inputVal,
      isCorrect: userIsCorrect,
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
   * Advances to next question or finishes wave round when all questions are mastered.
   */
  const handleProceed = () => {
    if (currentIndex.value >= questions.value.length - 1) {
      // All questions (including any repeated mistakes) are completed
      isQuizFinished.value = true;
      quizStore.isHitunganFinished = true;
    } else {
      currentIndex.value++;
      quizStore.currentQuestionIndex = currentIndex.value;
      userInput.value = '';
      isAnswerChecked.value = false;
      isCorrect.value = false;

      // Speak prompt if kana_to_number
      if (direction.value === 'kana_to_number' && currentQuestion.value) {
        setTimeout(() => {
          speak(currentQuestion.value!.expectedKana);
        }, 100);
      }
    }
  };

  return {
    currentWave,
    direction,
    questions,
    currentIndex,
    currentQuestion,
    questionNumber,
    totalQuestions,
    isMistakeRound,
    isLastQuestion,
    streak,
    correctCount,
    incorrectCount,
    userInput,
    isAnswerChecked,
    isCorrect,
    isQuizFinished,
    startSession,
    submitAnswer,
    handleProceed,
  };
}

