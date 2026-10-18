<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Circle, Sparkles } from '@lucide/vue';
import type { HandbookTabItem, HandbookTabId } from './types';
import { useLessonStore } from '../../../stores/lessonStore';
import { useQuizStore } from '../../../stores/quizStore';
import { wordsData } from '../../../data/words';

const props = defineProps<{
  lessonNumber: number;
  activeTab: HandbookTabId;
  activeTabInfo: HandbookTabItem;
}>();

const lessonStore = useLessonStore();
const quizStore = useQuizStore();

const isCompleted = computed(() => {
  return lessonStore.isCategoryCompleted(props.lessonNumber, props.activeTab);
});

// Telemetri khusus untuk tab kosakata
const vocabSyncStats = computed(() => {
  if (props.activeTab !== 'vocab') return null;
  const lessonKey = `Pelajaran ${props.lessonNumber}`;
  const words = wordsData.filter(w => w.lesson === lessonKey);
  if (words.length === 0) return null;

  const attemptedCount = words.filter(w => {
    const streak = quizStore.getMasteryStreak(w.character);
    return streak > 0 || !!quizStore.introducedChars[w.character];
  }).length;

  const masteredCount = words.filter(w => {
    return quizStore.getMasteryStreak(w.character) >= 3;
  }).length;

  const pct = Math.round((attemptedCount / words.length) * 100);

  return {
    total: words.length,
    attempted: attemptedCount,
    mastered: masteredCount,
    pct,
    isAllAttempted: attemptedCount >= words.length
  };
});

const handleToggle = () => {
  lessonStore.toggleCategoryCompletion(props.lessonNumber, props.activeTab);
};
</script>

<template>
  <div 
    class="w-full p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-xs select-none"
    :class="[
      isCompleted 
        ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-teal-950/30 border-emerald-500/30 dark:border-emerald-500/30'
        : 'bg-white/90 dark:bg-slate-850/90 border-gray-200/90 dark:border-slate-800'
    ]"
  >
    <!-- Left Info: Tab label & status -->
    <div class="flex items-center gap-3 min-w-0">
      <div 
        class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300"
        :class="[
          isCompleted 
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
            : 'bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
        ]"
      >
        <CheckCircle2 v-if="isCompleted" class="w-5 h-5 animate-scaleIn" />
        <component v-else :is="activeTabInfo.icon" class="w-5 h-5" />
      </div>

      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
            {{ activeTabInfo.name }}
          </span>
          <span 
            class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-colors shrink-0"
            :class="[
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            ]"
          >
            {{ isCompleted ? 'Sudah Dipelajari' : 'Belum Selesai' }}
          </span>
        </div>

        <!-- Subtitle: Kosakata Kotoba Sync vs Standard description -->
        <div v-if="vocabSyncStats" class="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <Sparkles class="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Kotoba Sync:</span>
          </span>
          <span>{{ vocabSyncStats.attempted }}/{{ vocabSyncStats.total }} kata dipelajari ({{ vocabSyncStats.pct }}%)</span>
        </div>
        <span v-else class="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
          {{ isCompleted ? 'Materi ini telah Anda tandai sebagai dimengerti.' : 'Pelajari materi ini, lalu tandai jika sudah memahami isinya.' }}
        </span>
      </div>
    </div>

    <!-- Right Action Button: Check / Uncheck Toggle -->
    <button
      type="button"
      @click="handleToggle"
      :class="[
        'w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.97] shrink-0 border select-none',
        isCompleted
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/25 hover:shadow-emerald-600/40'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700'
      ]"
      :title="isCompleted ? 'Klik untuk membatalkan tanda selesai' : 'Klik untuk menandai materi sudah dimengerti'"
    >
      <CheckCircle2 v-if="isCompleted" class="w-4 h-4 text-emerald-100" />
      <Circle v-else class="w-4 h-4 text-slate-400" />
      <span>{{ isCompleted ? 'Sudah Dimengerti' : 'Tandai Sudah Dipelajari' }}</span>
    </button>
  </div>
</template>

<style scoped>
@keyframes scaleIn {
  0% { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scaleIn {
  animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
