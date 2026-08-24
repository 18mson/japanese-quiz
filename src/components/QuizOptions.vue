<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Sparkles, X, ArrowRight } from '@lucide/vue';
import { getRandomCorrectFeedback, getRandomRetryFeedback } from '../utils/feedbackMessages';

const quizStore = useQuizStore();
const focusedIndex = ref(0);
const isKeyboardNav = ref(false);
const feedbackText = ref('');

const deactivateKeyboardNav = () => {
  isKeyboardNav.value = false;
};

watch(() => quizStore.selectedAnswer, (newVal) => {
  if (newVal !== null) {
    if (quizStore.isAnswerCorrect) {
      feedbackText.value = getRandomCorrectFeedback();
    } else {
      feedbackText.value = getRandomRetryFeedback();
    }
  }
});

// Reset focused index & keyboard nav when current question index changes
watch(() => quizStore.currentQuestionIndex, () => {
  focusedIndex.value = 0;
  isKeyboardNav.value = false;
});

const submitOption = (option: string) => {
  quizStore.submitAnswer(option);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (quizStore.isTypingMode || quizStore.quizCompleted || quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal || quizStore.justClosedPreview) return;
  if (Date.now() - quizStore.previewClosedTimestamp < 500) {
    event.preventDefault();
    return;
  }
  const numOptions = quizStore.options.length;
  if (numOptions === 0) return;

  if (event.key === 'ArrowRight') {
    if (quizStore.selectedAnswer === null) {
      event.preventDefault();
      isKeyboardNav.value = true;
      focusedIndex.value = (focusedIndex.value + 1) % numOptions;
    }
  } else if (event.key === 'ArrowLeft') {
    if (quizStore.selectedAnswer === null) {
      event.preventDefault();
      isKeyboardNav.value = true;
      focusedIndex.value = (focusedIndex.value - 1 + numOptions) % numOptions;
    }
  } else if (event.key === 'ArrowDown') {
    if (quizStore.selectedAnswer === null) {
      event.preventDefault();
      isKeyboardNav.value = true;
      focusedIndex.value = (focusedIndex.value + 3) % numOptions;
    }
  } else if (event.key === 'ArrowUp') {
    if (quizStore.selectedAnswer === null) {
      event.preventDefault();
      isKeyboardNav.value = true;
      focusedIndex.value = (focusedIndex.value - 3 + numOptions) % numOptions;
    }
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (quizStore.selectedAnswer === null) {
      const chosen = quizStore.options[focusedIndex.value];
      if (chosen) submitOption(chosen);
    } else {
      quizStore.nextQuestion();
    }
  } else if (/^[1-9]$/.test(event.key)) {
    const num = parseInt(event.key, 10) - 1;
    if (num < numOptions && quizStore.selectedAnswer === null) {
      event.preventDefault();
      isKeyboardNav.value = true;
      focusedIndex.value = num;
      const chosen = quizStore.options[num];
      if (chosen) submitOption(chosen);
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('pointerdown', deactivateKeyboardNav);
  window.addEventListener('touchstart', deactivateKeyboardNav);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('pointerdown', deactivateKeyboardNav);
  window.removeEventListener('touchstart', deactivateKeyboardNav);
});

const getOptionClass = (option: string, index: number) => {
  if (quizStore.selectedAnswer === null) {
    if (isKeyboardNav.value && index === focusedIndex.value) {
      return 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/70 dark:bg-slate-700/80 ring-4 ring-indigo-400/50 dark:ring-indigo-500/50 scale-[1.02] shadow-md z-10';
    }
    return '';
  }
  
  const correctRomaji = quizStore.currentQuestion?.romaji;
  const isCorrect = Array.isArray(correctRomaji)
    ? correctRomaji.includes(option)
    : correctRomaji === option;
  
  if (isCorrect) {
    return 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-500 font-extrabold shadow-sm';
  }
  
  if (option === quizStore.selectedAnswer && !isCorrect) {
    return 'border-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-500 font-extrabold shadow-sm';
  }
  
  return 'opacity-50 dark:opacity-40 cursor-not-allowed';
};

const isLastQuestion = computed(() => {
  return quizStore.currentQuestionIndex >= quizStore.questions.length - 1;
});
</script>

<template>
  <div class="w-full">
    <!-- Desktop Options Grid (Shown on sm: and up inside the card) -->
    <div class="hidden sm:block w-full">
      <div class="grid grid-cols-3 gap-2.5 sm:gap-4 mb-3 w-full">
        <button 
          v-for="(option, index) in quizStore.options" 
          :key="'desktop-' + option"
          class="relative p-3 sm:p-4 text-base sm:text-lg font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-gray-200 dark:border-slate-700/80 rounded-xl cursor-pointer transition-all duration-150 flex justify-center items-center min-h-14 sm:min-h-16 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-750 focus:outline-none shadow-xs"
          :class="getOptionClass(option, index)"
          @click="deactivateKeyboardNav(); submitOption(option);"
          :disabled="quizStore.selectedAnswer !== null"
        >
          <!-- Shortcut Badge -->
          <span 
            v-if="quizStore.selectedAnswer === null"
            class="absolute top-1.5 left-2 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded transition-colors"
            :class="isKeyboardNav && index === focusedIndex ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400'"
          >
            {{ index + 1 }}
          </span>

          <span>{{ option }}</span>
        </button>
      </div>

      <!-- Desktop Post Answer Feedback Banner -->
      <div class="w-full" v-if="quizStore.selectedAnswer !== null">
        <div class="pb-4">
          <div v-if="quizStore.isAnswerCorrect" class="text-sm sm:text-lg font-bold p-3 sm:p-3.5 rounded-xl w-full text-center bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 animate-fadeIn flex items-center justify-center gap-2 shadow-xs">
            <Sparkles class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{{ feedbackText || 'Benar! 🌟' }}</span>
          </div>
          <div v-else class="text-sm sm:text-lg font-bold p-3 sm:p-3.5 rounded-xl w-full text-center bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-200 dark:border-rose-800 animate-fadeIn flex items-center justify-center gap-2 shadow-xs">
            <X class="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Salah. Jawaban yang benar adalah "{{ Array.isArray(quizStore.currentQuestion?.romaji) ? quizStore.currentQuestion?.romaji.join(' atau ') : quizStore.currentQuestion?.romaji }}"</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Fixed Bottom Options Dock (Thumb reach zone on screens < sm) -->
    <div class="block sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200/90 dark:border-slate-800/90 p-2.5 pb-6 shadow-2xl animate-fadeIn">
      <div class="max-w-md mx-auto w-full flex flex-col gap-2">
        <!-- Post-answer Feedback Banner on Mobile -->
        <div v-if="quizStore.selectedAnswer !== null" class="w-full animate-fadeIn">
          <div v-if="quizStore.isAnswerCorrect" class="text-xs font-bold py-1.5 px-3 rounded-xl w-full text-center bg-emerald-100 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800 flex items-center justify-center gap-1.5 shadow-xs">
            <Sparkles class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{{ feedbackText || 'Benar! 🌟' }}</span>
          </div>
          <div v-else class="text-xs font-bold py-1.5 px-3 rounded-xl w-full text-center bg-rose-100 text-rose-900 dark:bg-rose-950/90 dark:text-rose-200 border border-rose-300/80 dark:border-rose-800 flex items-center justify-center gap-1.5 shadow-xs">
            <X class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Jawaban benar: {{ Array.isArray(quizStore.currentQuestion?.romaji) ? quizStore.currentQuestion?.romaji.join(' / ') : quizStore.currentQuestion?.romaji }}</span>
          </div>
        </div>

        <!-- Options Grid on Mobile (Thumb reach zone) -->
        <div class="grid grid-cols-3 gap-2 w-full">
          <button 
            v-for="(option, index) in quizStore.options" 
            :key="'mobile-' + option"
            class="relative py-3.5 px-2 text-lg font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-gray-200 dark:border-slate-700/80 rounded-2xl cursor-pointer transition-all duration-100 flex justify-center items-center min-h-[62px] active:scale-95 active:bg-indigo-50 dark:active:bg-slate-700 focus:outline-none shadow-xs"
            :class="getOptionClass(option, index)"
            @click="deactivateKeyboardNav(); submitOption(option);"
            :disabled="quizStore.selectedAnswer !== null"
          >
            <!-- Shortcut Badge -->
            <span 
              v-if="quizStore.selectedAnswer === null"
              class="absolute top-1.5 left-2 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
              :class="isKeyboardNav && index === focusedIndex ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400'"
            >
              {{ index + 1 }}
            </span>

            <span class="truncate">{{ option }}</span>
          </button>
        </div>

        <!-- Next Question Action Button on Mobile when answered -->
        <div v-if="quizStore.selectedAnswer !== null" class="w-full pt-0.5 animate-fadeIn">
          <button 
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-3 px-4 shadow-md hover:shadow-lg transition duration-150 flex justify-center items-center gap-2 cursor-pointer text-base active:scale-98"
            @click="quizStore.nextQuestion"
          >
            <span>{{ isLastQuestion ? 'Lihat Hasil' : 'Soal Berikutnya' }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
