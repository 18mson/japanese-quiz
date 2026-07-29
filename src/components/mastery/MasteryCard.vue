<script setup lang="ts">
import { CheckCircle2, Flame } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';

defineProps<{
  item: any;
  category: 'hiragana' | 'katakana' | 'words';
}>();

const quizStore = useQuizStore();
</script>

<template>
  <div 
    :class="[
      'rounded-2xl p-3 flex flex-col items-center justify-between border transition-all duration-200 relative group hover:-translate-y-1 hover:shadow-md select-none',
      quizStore.getMasteryTier(item.character) === 'crown' 
        ? 'bg-gradient-to-b from-indigo-50 to-purple-50 border-indigo-300 shadow-sm ring-1 ring-indigo-400/30' 
        : quizStore.getMasteryTier(item.character) === 'mastered'
        ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300 shadow-sm'
        : quizStore.getMasteryTier(item.character) === 'learning'
        ? 'bg-gradient-to-b from-amber-50 to-yellow-50 border-amber-300 shadow-sm'
        : 'bg-white border-gray-200 text-gray-400 opacity-80 hover:opacity-100'
    ]"
  >
    <!-- Mastery Badge Top Corner -->
    <div class="absolute top-1.5 right-1.5 flex items-center gap-0.5">
      <span 
        v-if="quizStore.getMasteryTier(item.character) === 'crown'" 
        class="text-xs drop-shadow-sm" 
        title="Crown Mastered (Streak 5+)"
      >💎</span>
      <CheckCircle2 
        v-else-if="quizStore.getMasteryTier(item.character) === 'mastered'" 
        class="w-3.5 h-3.5 text-emerald-600" 
        title="Mastered (Streak 3-4)"
      />
      <span 
        v-else-if="quizStore.getMasteryTier(item.character) === 'learning'" 
        class="w-2 h-2 rounded-full bg-amber-500 animate-pulse" 
        title="Learning (Streak 1-2)"
      ></span>
    </div>

    <!-- Main Character Display -->
    <span 
      :class="[
        'font-bold tracking-tight text-center my-1',
        category === 'words' ? 'text-lg sm:text-xl text-gray-800' : 'text-2xl sm:text-3xl',
        quizStore.getMasteryTier(item.character) === 'crown' ? 'text-indigo-900 drop-shadow-sm' : '',
        quizStore.getMasteryTier(item.character) === 'mastered' ? 'text-emerald-950' : '',
        quizStore.getMasteryTier(item.character) === 'learning' ? 'text-amber-950' : '',
        quizStore.getMasteryTier(item.character) === 'new' ? 'text-gray-400' : ''
      ]"
    >
      {{ item.character }}
    </span>

    <!-- Romaji / Kana Subtitle -->
    <span class="text-xs font-semibold text-gray-500 truncate max-w-full">
      {{ Array.isArray(item.romaji) ? item.romaji[0] : item.romaji }}
    </span>

    <!-- Words Meaning (Only for words category) -->
    <span 
      v-if="category === 'words' && item.meaning"
      class="text-[10px] text-gray-400 truncate max-w-full mt-0.5 font-medium"
    >
      {{ item.meaning }}
    </span>

    <!-- Streak Counter Bottom Badge -->
    <div 
      class="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border"
      :class="[
        quizStore.getMasteryStreak(item.character) >= 5
          ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
          : quizStore.getMasteryStreak(item.character) >= 3
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
          : quizStore.getMasteryStreak(item.character) >= 1
          ? 'bg-amber-100 text-amber-700 border-amber-200'
          : 'bg-gray-100 text-gray-500 border-gray-200'
      ]"
    >
      <Flame class="w-2.5 h-2.5" />
      <span>Streak {{ quizStore.getMasteryStreak(item.character) }}</span>
    </div>
  </div>
</template>
