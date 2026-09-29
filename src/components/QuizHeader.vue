<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { RotateCcw } from '@lucide/vue';

const quizStore = useQuizStore();

const questionNumber = computed(() => {
  return quizStore.currentQuestionIndex + 1;
});
</script>

<template>
  <header class="py-3 px-4 text-center relative w-full flex flex-col gap-2 md:hidden">
    <!-- Top Row: Question Info & Score -->
    <div class="flex flex-wrap justify-between items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold">
      <span class="flex items-center gap-1.5 flex-wrap">
        <span>Soal {{ questionNumber }} (Selesai: {{ Math.min(quizStore.initialQuestionCount, quizStore.userAnswers.length) }}/{{ quizStore.initialQuestionCount }})</span>
        <span v-if="quizStore.isMistakeRound" class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800/70 select-none">
          <RotateCcw class="w-2.5 h-2.5 text-rose-500 dark:text-rose-400 shrink-0" />
          <span>Babak Perbaikan</span>
        </span>
      </span>

      <span class="font-extrabold text-indigo-600 dark:text-torii">Score: {{ quizStore.score }}</span>
    </div>

    <!-- Session Progress Bar -->
    <div class="w-full h-2.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
      <div class="h-full bg-indigo-600 dark:bg-matcha transition-all duration-300 ease-in-out rounded-full" :style="{ width: `${quizStore.progress}%` }"></div>
    </div>
  </header>
</template>