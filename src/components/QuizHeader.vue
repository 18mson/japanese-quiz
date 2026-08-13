<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const questionNumber = computed(() => {
  return quizStore.currentQuestionIndex + 1;
});
</script>

<template>
  <header class="py-3 px-4 text-center relative w-full flex flex-col gap-2">
    <!-- Top Row: Question Info & Score -->
    <div class="flex flex-wrap justify-between items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold">
      <span class="flex items-center gap-1">
        Soal {{ questionNumber }} (Selesai: {{ Math.min(quizStore.initialQuestionCount, quizStore.userAnswers.length) }}/{{ quizStore.initialQuestionCount }})
        <span v-if="quizStore.isMistakeRound" class="text-rose-600 dark:text-rose-400 font-bold ml-1">🎯 (Babak Perbaikan)</span>
      </span>

      <span class="font-extrabold text-indigo-600 dark:text-indigo-400">Score: {{ quizStore.score }}</span>
    </div>

    <!-- Session Progress Bar -->
    <div class="w-full h-2.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
      <div class="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-in-out rounded-full" :style="{ width: `${quizStore.progress}%` }"></div>
    </div>
  </header>
</template>