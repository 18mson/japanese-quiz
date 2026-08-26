<script setup lang="ts">
import { useQuizStore } from '../../stores/quizStore';

defineProps<{
  item: any;
  category: 'hiragana' | 'katakana' | 'words';
}>();

defineEmits(['click']);

const quizStore = useQuizStore();
</script>

<template>
  <div 
    @click="$emit('click', item)"
    :class="[
      'rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center border transition-all duration-200 relative group select-none text-center min-h-[72px] sm:min-h-[84px] cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-95',
      quizStore.getMasteryTier(item.character) === 'crown' 
        ? 'bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 border-indigo-300 dark:border-indigo-700 shadow-sm ring-1 ring-indigo-400/30' 
        : quizStore.getMasteryTier(item.character) === 'mastered'
        ? 'bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/80 dark:to-teal-950/80 border-emerald-300 dark:border-emerald-700 shadow-sm'
        : quizStore.getMasteryTier(item.character) === 'learning'
        ? 'bg-gradient-to-b from-amber-50 to-yellow-50 dark:from-amber-950/80 dark:to-yellow-950/80 border-amber-300 dark:border-amber-700 shadow-sm'
        : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-400 opacity-75 hover:opacity-100'
    ]"
  >
    <!-- Compact Top Right Mastery Badge -->
    <div class="absolute top-1 right-1.5 flex items-center gap-0.5">
      <span 
        v-if="quizStore.getMasteryTier(item.character) === 'crown'" 
        class="text-xs" 
        title="Crown (Streak 5+)"
      >💎</span>
      <span 
        v-else-if="quizStore.getMasteryTier(item.character) === 'mastered'" 
        class="text-[9px] sm:text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/90 px-1 py-0.2 rounded-md border border-emerald-200 dark:border-emerald-800" 
        title="Hafal"
      >✓ {{ quizStore.getMasteryStreak(item.character) }}</span>
      <span 
        v-else-if="quizStore.getMasteryTier(item.character) === 'learning'" 
        class="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/90 px-1 py-0.2 rounded-md border border-amber-200 dark:border-amber-800" 
        title="Proses"
      >{{ quizStore.getMasteryStreak(item.character) }}</span>
    </div>

    <!-- Main Character Display -->
    <span 
      :class="[
        'font-bold tracking-tight text-center leading-tight my-0.5 font-jp',
        category === 'words' ? 'text-base sm:text-lg text-gray-800 dark:text-slate-100' : 'text-2xl sm:text-3xl text-gray-800 dark:text-slate-100',
        quizStore.getMasteryTier(item.character) === 'crown' ? 'text-indigo-900 dark:text-indigo-100 drop-shadow-xs' : '',
        quizStore.getMasteryTier(item.character) === 'mastered' ? 'text-emerald-950 dark:text-emerald-100' : '',
        quizStore.getMasteryTier(item.character) === 'learning' ? 'text-amber-950 dark:text-amber-100' : '',
        quizStore.getMasteryTier(item.character) === 'new' ? 'text-gray-400 dark:text-slate-400' : ''
      ]"
    >
      {{ item.character }}
    </span>

    <!-- Romaji Subtitle -->
    <span class="text-xs font-semibold text-gray-500 dark:text-slate-300 truncate max-w-full">
      {{ Array.isArray(item.romaji) ? item.romaji[0] : item.romaji }}
    </span>

    <!-- Words Meaning (Only for words category) -->
    <span 
      v-if="category === 'words' && item.meaning"
      class="text-[11px] text-gray-400 dark:text-slate-400 truncate max-w-full font-medium"
    >
      {{ item.meaning }}
    </span>
  </div>
</template>
