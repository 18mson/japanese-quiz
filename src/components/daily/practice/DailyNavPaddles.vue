<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue';

defineProps<{
  questionIndex: number;
  totalQuestions: number;
  canAdvance: boolean;
  isReviewing?: boolean;
  isLastQuestion: boolean;
  allCompleted?: boolean;
}>();

const emit = defineEmits<{
  (e: 'prev'): void;
  (e: 'advance'): void;
}>();
</script>

<template>
  <div>
    <!-- Left Navigation Paddle (Fixed at Left Edge) -->
    <button
      type="button"
      @click="emit('prev')"
      :disabled="questionIndex === 0"
      class="fixed left-1.5 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/95 dark:bg-slate-800/95 shadow-md sm:shadow-2xl border border-slate-200/90 dark:border-slate-700/90 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition-all z-30 cursor-pointer backdrop-blur-md"
      title="Soal Sebelumnya"
      aria-label="Soal Sebelumnya"
    >
      <ChevronLeft class="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
    </button>

    <!-- Right Navigation Paddle (Fixed at Right Edge) -->
    <div class="fixed right-1.5 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end">
      <button
        type="button"
        @click="emit('advance')"
        :disabled="!isReviewing && questionIndex >= totalQuestions - 1 && !(isLastQuestion && allCompleted)"
        :class="[
          'w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shadow-md sm:shadow-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95',
          canAdvance
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-2 sm:ring-4 ring-emerald-400/50 shadow-emerald-500/30 border border-emerald-400'
            : 'bg-white/95 dark:bg-slate-800/95 border border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 disabled:opacity-20 disabled:pointer-events-none'
        ]"
        :title="isReviewing ? (isLastQuestion ? 'Selesai Tinjau' : 'Soal Berikutnya') : (isLastQuestion && allCompleted ? 'Selesaikan Latihan' : 'Soal Berikutnya')"
        :aria-label="isReviewing ? (isLastQuestion ? 'Selesai Tinjau' : 'Soal Berikutnya') : (isLastQuestion && allCompleted ? 'Selesaikan Latihan' : 'Soal Berikutnya')"
      >
        <ChevronRight class="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      </button>
    </div>
  </div>
</template>
