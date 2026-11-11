// src/stores/particleQuizStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { PARTICLE_QUESTIONS, type ParticleQuestionItem } from '../data/particleSentencesData';
import { playCorrectSound, playIncorrectSound } from '../utils/battleSoundManager';

export interface ParticleAnswerRecord {
  questionId: string;
  givenAnswer: string;
  isCorrect: boolean;
  question: ParticleQuestionItem;
}

export const useParticleQuizStore = defineStore('particleQuiz', () => {
  const questions = ref<ParticleQuestionItem[]>([]);
  const currentIndex = ref(0);
  const selectedBatch = ref<'all' | 'batch1' | 'batch2'>('all');
  const userAnswers = ref<ParticleAnswerRecord[]>([]);
  const isQuizFinished = ref(false);
  const score = ref(0);
  const streak = ref(0);
  const highestStreak = ref(0);

  const currentQuestion = computed<ParticleQuestionItem | null>(() => {
    return questions.value[currentIndex.value] || null;
  });

  const totalQuestions = computed(() => questions.value.length);
  const correctCount = computed(() => userAnswers.value.filter(a => a.isCorrect).length);
  const accuracy = computed(() => {
    if (userAnswers.value.length === 0) return 0;
    return Math.round((correctCount.value / userAnswers.value.length) * 100);
  });

  /**
   * Format variasi jawaban untuk ditampilkan, contoh: [へ / に]
   */
  function formatVariationDisplay(item: ParticleQuestionItem): string {
    const validParticles = item.correctParticles.filter(p => p.trim() !== '');
    if (validParticles.length <= 1) {
      return validParticles[0] ? `[ ${validParticles[0]} ]` : '[ Tanpa Partikel ]';
    }
    return `[ ${validParticles.join(' / ')} ]`;
  }

  /**
   * Normalisasi input romaji/kana partikel
   */
  function normalizeParticleInput(raw: string): string {
    const trimmed = (raw || '').trim().toLowerCase();
    const romajiMap: Record<string, string> = {
      wa: 'は',
      ha: 'は',
      ga: 'が',
      o: 'を',
      wo: 'を',
      ni: 'に',
      e: 'へ',
      he: 'へ',
      de: 'で',
      to: 'と',
      no: 'の',
      mo: 'も',
      ka: 'か',
      kara: 'から',
      made: 'まで',
      yori: 'より',
      te: 'て',
      ta: 'た',
      nai: 'ない',
      kute: 'くて',
      tara: 'たら'
    };
    return romajiMap[trimmed] || trimmed;
  }

  /**
   * Acak array
   */
  function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Inisialisasi sesi kuis
   */
  function initSession(batch: 'all' | 'batch1' | 'batch2' = 'all', count = 10) {
    selectedBatch.value = batch;
    currentIndex.value = 0;
    userAnswers.value = [];
    isQuizFinished.value = false;
    score.value = 0;
    streak.value = 0;
    highestStreak.value = 0;

    let pool = [...PARTICLE_QUESTIONS];
    if (batch === 'batch1') {
      pool = pool.filter(q => q.chapter <= 10);
    } else if (batch === 'batch2') {
      pool = pool.filter(q => q.chapter > 10);
    }

    questions.value = shuffle(pool).slice(0, Math.min(count, pool.length));
  }

  /**
   * Evaluasi jawaban partikel
   */
  function checkAnswer(rawInput: string): { isCorrect: boolean; variationText: string } {
    if (!currentQuestion.value) {
      return { isCorrect: false, variationText: '' };
    }

    const q = currentQuestion.value;
    const normalizedInput = normalizeParticleInput(rawInput);

    // Cek apakah jawaban pemain ada di daftar variasi sah
    const isCorrect = q.correctParticles.some(p => {
      if (p === '' && normalizedInput === '') return true;
      return p === normalizedInput || normalizeParticleInput(p) === normalizedInput;
    });

    if (isCorrect) {
      score.value += 10 + Math.min(streak.value * 2, 10);
      streak.value++;
      if (streak.value > highestStreak.value) {
        highestStreak.value = streak.value;
      }
      playCorrectSound();
    } else {
      streak.value = 0;
      playIncorrectSound();
    }

    userAnswers.value.push({
      questionId: q.id,
      givenAnswer: rawInput,
      isCorrect,
      question: q
    });

    return {
      isCorrect,
      variationText: formatVariationDisplay(q)
    };
  }

  function nextQuestion(): boolean {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++;
      return true;
    } else {
      isQuizFinished.value = true;
      return false;
    }
  }

  function restartQuiz() {
    initSession(selectedBatch.value, questions.value.length || 10);
  }

  return {
    questions,
    currentIndex,
    selectedBatch,
    userAnswers,
    isQuizFinished,
    score,
    streak,
    highestStreak,
    currentQuestion,
    totalQuestions,
    correctCount,
    accuracy,
    formatVariationDisplay,
    initSession,
    checkAnswer,
    nextQuestion,
    restartQuiz
  };
});

