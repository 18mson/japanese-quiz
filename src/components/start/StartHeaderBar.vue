<script setup lang="ts">
import { Target, BookOpen, Trophy } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import DailyGoalProgressBar from '../goals/DailyGoalProgressBar.vue';

defineProps<{
  isKeyboardNav: boolean;
  focusedSection: string;
  focusedHeaderTarget: 'grid' | 'leaderboard';
  selectedLevel: 'basic' | 'n5' | 'battleground';
}>();

const emit = defineEmits<{
  (e: 'openMasteryGrid'): void;
  (e: 'openLeaderboard'): void;
  (e: 'openFuroku'): void;
  (e: 'openReference'): void;
  (e: 'interact'): void;
}>();

const quizStore = useQuizStore();

const onAction = (action: () => void) => {
  emit('interact');
  action();
};
</script>

<template>
  <div 
    @click="emit('interact')"
    :class="[
      'w-full max-w-3xl mb-4 sm:mb-6 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 transition-all duration-200 flex items-center justify-between gap-2.5 sm:gap-4 flex-shrink-0 cursor-pointer',
      isKeyboardNav && focusedSection === 'header'
        ? 'border-aizome dark:border-torii/70 shadow-md ring-2 ring-aizome/40 dark:ring-torii/40 border'
        : 'border border-slate-200 dark:border-slate-800 shadow-sm'
    ]"
  >
    <!-- Mastery Grid Stats Display -->
    <div 
      @click.stop="onAction(() => emit('openMasteryGrid'))"
      class="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer flex-1 hover:opacity-90 transition-opacity"
    >
      <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-aizome/10 dark:bg-torii/15 border border-aizome/25 dark:border-torii/30 flex items-center justify-center text-aizome dark:text-torii flex-shrink-0">
        <Target class="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div class="truncate">
        <div class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Peta penguasaan huruf</div>
        <div class="text-xs sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
          {{ quizStore.overallMasteryStats.mastered }} / {{ quizStore.overallMasteryStats.total }}
          <span class="text-aizome dark:text-torii-light font-extrabold ml-1 sm:ml-1.5">({{ quizStore.overallMasteryStats.percentage }}%)</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons: Daily Target, Referensi, Peringkat & Grid -->
    <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
      <DailyGoalProgressBar class="hidden xs:flex" />

      <button 
        v-if="selectedLevel === 'n5'"
        type="button"
        @click.stop="onAction(() => emit('openReference'))"
        class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-gray-200/80 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 shadow-2xs"
        title="Lihat Kosakata & Referensi Resmi Bab"
      >
        <BookOpen class="w-4 h-4 text-torii flex-shrink-0" />
        <span class="hidden sm:inline">Referensi Bab</span>
      </button>


      <button 
        type="button"
        @click.stop="onAction(() => emit('openLeaderboard'))"
        :class="[
          'px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs',
          isKeyboardNav && focusedSection === 'header' && focusedHeaderTarget === 'leaderboard'
            ? 'ring-2 ring-amber-400/80 dark:ring-amber-500/80 bg-amber-100/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-400 scale-[1.02]'
            : 'bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-slate-700 hover:bg-amber-100'
        ]"
        title="Lihat Papan Peringkat"
      >
        <Trophy class="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span class="hidden sm:inline">Peringkat</span>
      </button>

      <button 
        type="button"
        @click.stop="onAction(() => emit('openMasteryGrid'))"
        :class="[
          'px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border',
          isKeyboardNav && focusedSection === 'header' && focusedHeaderTarget === 'grid'
            ? 'ring-2 ring-torii/80 bg-torii/20 text-torii border-torii scale-[1.02]'
            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-gray-200/80 dark:border-slate-700'
        ]"
      >
        <span>Grid</span>
      </button>
    </div>
  </div>
</template>
