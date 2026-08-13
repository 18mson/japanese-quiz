<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Sparkles, X } from '@lucide/vue';
import { getRandomCorrectFeedback, getRandomRetryFeedback } from '../utils/feedbackMessages';

const quizStore = useQuizStore();
const focusedIndex = ref(0);
const feedbackText = ref('');

watch(() => quizStore.selectedAnswer, (newVal) => {
  if (newVal !== null) {
    if (quizStore.isAnswerCorrect) {
      feedbackText.value = getRandomCorrectFeedback();
    } else {
      feedbackText.value = getRandomRetryFeedback();
    }
  }
});

// Reset focused index when current question index changes
watch(() => quizStore.currentQuestionIndex, () => {
  focusedIndex.value = 0;
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
      focusedIndex.value = (focusedIndex.value + 1) % numOptions;
    }
  } else if (event.key === 'ArrowLeft') {
    if (quizStore.selectedAnswer === null) {
      event.preventDefault();
      focusedIndex.value = (focusedIndex.value - 1 + numOptions) % numOptions;
    }
  } else if (event.key === 'ArrowDown') {
    if (quizStore.selectedAnswer === null) {
      event.preventDefault();
      focusedIndex.value = (focusedIndex.value + 3) % numOptions;
    }
  } else if (event.key === 'ArrowUp') {
    if (quizStore.selectedAnswer === null) {
      event.preventDefault();
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
      focusedIndex.value = num;
      const chosen = quizStore.options[num];
      if (chosen) submitOption(chosen);
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const getOptionClass = (option: string, index: number) => {
  if (quizStore.selectedAnswer === null) {
    if (index === focusedIndex.value) {
      return 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/70 dark:bg-slate-700/80 ring-4 ring-indigo-400/50 dark:ring-indigo-500/50 scale-[1.02] shadow-md z-10';
    }
    return '';
  }
  
  const correctRomaji = quizStore.currentQuestion?.romaji;
  const isCorrect = Array.isArray(correctRomaji)
    ? correctRomaji.includes(option)
    : correctRomaji === option;
  
  if (isCorrect) {
    return 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-500 font-extrabold';
  }
  
  if (option === quizStore.selectedAnswer && !isCorrect) {
    return 'border-rose-500 bg-rose-100 text-rose-900 dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-500 font-extrabold';
  }
  
  return 'opacity-50 dark:opacity-40 cursor-not-allowed';
};
</script>

<template>
  <div class="w-full">
    <!-- Options Grid -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-3 w-full">
      <button 
        v-for="(option, index) in quizStore.options" 
        :key="option"
        class="relative p-4 text-lg font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-gray-200 dark:border-slate-700/80 rounded-xl cursor-pointer transition-all duration-150 flex justify-center items-center min-h-16 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-750 focus:outline-none shadow-xs"
        :class="getOptionClass(option, index)"
        @click="focusedIndex = index; submitOption(option);"
        @mouseenter="focusedIndex = index"
        :disabled="quizStore.selectedAnswer !== null"
      >
        <!-- Shortcut Badge -->
        <span 
          v-if="quizStore.selectedAnswer === null"
          class="absolute top-1.5 left-2 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded transition-colors"
          :class="index === focusedIndex ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400'"
        >
          {{ index + 1 }}
        </span>

        <span>{{ option }}</span>
      </button>
    </div>

    <!-- Post Answer Feedback Banner -->
    <div class="w-full" v-if="quizStore.selectedAnswer !== null">
      <div class="pb-4">
        <div v-if="quizStore.isAnswerCorrect" class="text-base sm:text-lg font-bold p-3.5 rounded-xl w-full text-center bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 animate-fadeIn flex items-center justify-center gap-2 shadow-xs">
          <Sparkles class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{{ feedbackText || 'Benar! 🌟' }}</span>
        </div>
        <div v-else class="text-base sm:text-lg font-bold p-3.5 rounded-xl w-full text-center bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-200 dark:border-rose-800 animate-fadeIn flex items-center justify-center gap-2 shadow-xs">
          <X class="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>Salah. Jawaban yang benar adalah "{{ Array.isArray(quizStore.currentQuestion?.romaji) ? quizStore.currentQuestion?.romaji.join(' atau ') : quizStore.currentQuestion?.romaji }}"</span>
        </div>
      </div>
    </div>
  </div>
</template>
