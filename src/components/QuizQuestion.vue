<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Lightbulb, BookOpen, RotateCcw, Volume2 } from '@lucide/vue';
import { useTextToSpeech } from '../composables/useTextToSpeech';

const quizStore = useQuizStore();
const { speak } = useTextToSpeech();

const showReadingHint = computed({
  get: () => quizStore.showReadingHint,
  set: (val) => quizStore.showReadingHint = val
});
const showMeaningHint = computed({
  get: () => quizStore.showMeaningHint,
  set: (val) => {
    if (val) quizStore.openMeaningHint();
    else quizStore.showMeaningHint = false;
  }
});

const character = computed(() => {
  return quizStore.currentQuestion?.character || '';
});

const isWord = computed(() => {
  return quizStore.currentQuestion?.type === 'word';
});

const currentKana = computed(() => {
  return (quizStore.currentQuestion as any)?.kana || '';
});

const hasValidReadingHint = computed(() => {
  const kana = currentKana.value.trim();
  if (!kana) return false;
  // Hide hint if it contains any Latin characters (Romaji)
  return !/[a-zA-Z]/.test(kana);
});

const currentMeaning = computed(() => {
  return (quizStore.currentQuestion as any)?.meaning || '';
});

const firstCharKana = computed(() => {
  const kana = currentKana.value || character.value;
  return kana ? kana.charAt(0) : '';
});

const firstCharRomaji = computed(() => {
  const rom = Array.isArray(quizStore.currentQuestion?.romaji) 
    ? quizStore.currentQuestion.romaji[0] 
    : quizStore.currentQuestion?.romaji || '';
  return rom ? rom.charAt(0).toUpperCase() : '';
});

const playWordAudio = () => {
  const text = currentKana.value || character.value;
  if (text) speak(text);
};

const reasonLabel = computed(() => {
  return (quizStore.currentQuestion as any)?.reasonLabel || '';
});

const questionReason = computed(() => {
  return (quizStore.currentQuestion as any)?.questionReason || 'weak';
});

const correctRomajiDisplay = computed(() => {
  const current = quizStore.currentQuestion;
  if (!current) return '';
  return Array.isArray(current.romaji) 
    ? current.romaji.join(' or ') 
    : (current.romaji || '');
});

const isTypo = computed(() => {
  return quizStore.isAnswerTypo;
});

const instructionText = computed(() => {
  if (quizStore.questionType === 'words_meaning') {
    return 'Ketik arti bahasa Indonesia dari kata ini!';
  }
  if (quizStore.questionType === 'meaning_to_words') {
    return 'Ketik dalam bahasa Jepang (Kanji, Kana, atau Romaji)!';
  }
  if (quizStore.isTypingMode) {
    return isWord.value 
      ? 'Ketik romaji dari kata ini!' 
      : 'Ketik romaji dari karakter ini!';
  } else {
    return 'Pilih romaji yang tepat untuk karakter ini!';
  }
});
</script>

<template>
  <div class="flex flex-col items-center my-2 w-full flex-shrink-0">
    <!-- Reason Badge (Only shown for retry/perbaikan questions) -->
    <div 
      v-if="questionReason === 'repeat' && reasonLabel" 
      class="mb-2 px-3 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 border bg-white/95 text-rose-700 border-rose-300/90 dark:bg-slate-900/95 dark:text-rose-300 dark:border-rose-700/80 animate-fadeIn select-none"
    >
      <RotateCcw class="w-3.5 h-3.5 text-rose-500 shrink-0" />
      <span>{{ reasonLabel.replace(/^[\p{Emoji}\p{Symbol}\s]+/gu, '') }}</span>
    </div>

    <!-- Question Character / Word Area -->
    <div
      :class="[
        'flex flex-col items-center justify-center bg-transparent border-0 shadow-none mb-3 px-4 py-2 transition-all duration-300 min-h-[90px] sm:min-h-[110px]',
        isWord 
          ? 'w-full max-w-md' 
          : 'w-full max-w-xs sm:max-w-sm'
      ]"
    >
      <transition name="question-blur" mode="out-in">
        <div :key="quizStore.currentQuestionIndex" class="flex flex-col items-center text-center w-full">
          <!-- Mode 1: Meaning to Words (Prompt is the Indonesian Meaning) -->
          <template v-if="quizStore.questionType === 'meaning_to_words'">
            <span class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight leading-snug select-none px-2 max-w-lg">
              {{ currentMeaning }}
            </span>

            <!-- Hints for Meaning to Words Mode -->
            <div class="mt-3 sm:mt-4 flex gap-2.5 sm:gap-3 flex-wrap justify-center items-center min-h-[36px]">
              <template v-if="quizStore.selectedAnswer === null">
                <!-- Audio Speech Hint -->
                <button 
                  type="button"
                  class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 shadow-xs cursor-pointer hover:shadow focus:outline-none flex items-center gap-1.5 active:scale-95"
                  @click="playWordAudio"
                  title="Dengarkan pelafalan bahasa Jepang"
                >
                  <Volume2 class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                  <span>Dengar Pelafalan</span>
                </button>

                <!-- First Letter Hint -->
                <button 
                  v-if="!showReadingHint"
                  type="button"
                  class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 shadow-xs cursor-pointer hover:shadow focus:outline-none flex items-center gap-1.5 active:scale-95"
                  @click="showReadingHint = true"
                >
                  <Lightbulb class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                  <span>Petunjuk Huruf</span>
                </button>
                <span v-else class="text-xs sm:text-sm font-bold text-indigo-700 dark:text-torii-light bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full animate-hintPop shadow-xs">
                  Awal: <span class="font-jp">{{ firstCharKana }}</span> ({{ firstCharRomaji }}...)
                </span>
              </template>
            </div>
          </template>

          <!-- Mode 2 & Standard: Display Japanese Character/Word -->
          <template v-else>
            <span 
              :class="[
                'text-gray-900 dark:text-slate-100 font-black tracking-wide transition-all duration-300 leading-none font-jp drop-shadow-xs whitespace-nowrap select-none',
                isWord 
                  ? (character.length > 6 ? 'text-3xl sm:text-4xl' : (character.length > 3 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'))
                  : (character.length >= 2 ? 'text-5xl sm:text-6xl' : 'text-6xl sm:text-7xl')
              ]"
            >
              {{ character }}
            </span>
            
            <!-- Interactive Hints (Only for Words when not answered yet) -->
            <div v-if="isWord" class="mt-3 sm:mt-4 flex gap-2.5 sm:gap-3 flex-wrap justify-center items-center min-h-[36px]">
              <template v-if="quizStore.selectedAnswer === null">
                <!-- Reading Hint Button/Pill (Available in both words and words_meaning) -->
                <template v-if="hasValidReadingHint">
                  <button 
                    v-if="!showReadingHint"
                    class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 shadow-xs cursor-pointer hover:shadow focus:outline-none flex items-center gap-1.5 active:scale-95"
                    @click="showReadingHint = true"
                  >
                    <Lightbulb class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                    <span>Reading Hint</span>
                  </button>
                  <span v-else class="text-xs sm:text-sm font-bold text-indigo-700 dark:text-torii-light bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full animate-hintPop shadow-xs">
                    Reading: <span class="font-jp">{{ currentKana }}</span>
                  </span>
                </template>

                <!-- Meaning Hint Button/Pill (Only in standard words mode, NOT words_meaning) -->
                <template v-if="currentMeaning && quizStore.questionType !== 'words_meaning'">
                  <button 
                    v-if="!showMeaningHint"
                    class="text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 shadow-xs cursor-pointer hover:shadow focus:outline-none flex items-center gap-1.5 active:scale-95"
                    @click="quizStore.openMeaningHint()"
                  >
                    <BookOpen class="w-4 h-4 text-indigo-600 dark:text-torii shrink-0" />
                    <span>Petunjuk Arti</span>
                  </button>
                  <span v-else class="text-xs sm:text-sm font-bold text-teal-800 dark:text-matcha bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full animate-hintPop shadow-xs">
                    Arti: {{ currentMeaning }}
                  </span>
                </template>
              </template>
            </div>
          </template>
        </div>
      </transition>
    </div>
    
    <!-- Answer Feedback directly below the question (Shown on incorrect or typo, hidden on correct answer) -->
    <div 
      v-if="quizStore.selectedAnswer !== null && (!quizStore.isAnswerCorrect || isTypo)" 
      class="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center px-4 animate-fadeIn"
    >
      <template v-if="quizStore.questionType === 'words_meaning'">
        <span class="text-sm sm:text-base font-semibold text-gray-700 dark:text-slate-200">Arti yang benar:</span>
        <span class="text-sm sm:text-base font-bold bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg text-indigo-700 dark:text-torii-light shadow-xs">
          {{ currentMeaning }}
        </span>
      </template>

      <template v-else-if="quizStore.questionType === 'meaning_to_words'">
        <span class="text-sm sm:text-base font-semibold text-gray-700 dark:text-slate-200">Jawaban yang benar:</span>
        <div class="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <span class="text-base font-bold bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg text-indigo-700 dark:text-torii-light shadow-xs font-jp">
            {{ character }}
          </span>
          <span v-if="currentKana && currentKana !== character" class="text-sm text-gray-500 dark:text-slate-400 font-jp">
            （{{ currentKana }}）
          </span>
          <span class="text-xs sm:text-sm font-mono text-indigo-600 dark:text-torii-light">
            / {{ correctRomajiDisplay }}
          </span>
        </div>
      </template>

      <template v-else>
        <span class="text-sm sm:text-base font-semibold text-gray-700 dark:text-slate-200">Romaji yang benar:</span>
        <span class="text-sm sm:text-base font-mono font-bold bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg text-indigo-700 dark:text-torii-light shadow-xs">
          {{ correctRomajiDisplay }}
        </span>
      </template>
    </div>

    <!-- Instruction Text (Only visible before answering / submitting) -->
    <p 
      v-else-if="quizStore.selectedAnswer === null" 
      class="text-sm text-gray-500 dark:text-slate-400 m-0 text-center font-medium"
    >
      {{ instructionText }}
    </p>
  </div>
</template>

<style scoped>
@keyframes hintPop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-hintPop {
  animation: hintPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
