<script setup lang="ts">
import { Search, SkipForward, Play } from '@lucide/vue';
import SpeakerButton from '../../../SpeakerButton.vue';
import type { JapaneseWord } from '../../../../data/words';
import { useQuizStore } from '../../../../stores/quizStore';

defineProps<{
  words: JapaneseWord[];
  categories: string[];
  selectedCategory: string;
  totalWordsCount: number;
  lessonNumber?: number;
}>();

const emit = defineEmits<{
  (e: 'selectCategory', cat: string): void;
  (e: 'startQuiz'): void;
}>();

const quizStore = useQuizStore();

const getWordStatus = (char: string) => {
  if (quizStore.isWordSkipped?.(char)) {
    return { 
      label: 'Dilewati', 
      isSkipped: true,
      class: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-dashed border-slate-300 dark:border-slate-600' 
    };
  }
  const streak = quizStore.getMasteryStreak(char);
  if (streak >= 3) {
    return { label: 'Dikuasai', isSkipped: false, class: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
  }
  if (streak >= 1 || quizStore.introducedChars[char]) {
    return { label: 'Proses', isSkipped: false, class: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' };
  }
  return { label: 'Belum', isSkipped: false, class: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
};
</script>

<template>
  <section class="flex flex-col gap-4">
    <!-- Top Controls: Category Filters + Inline Quiz CTA -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <button
          type="button"
          @click="emit('selectCategory', 'all')"
          :class="[
            'min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 active:scale-95',
            selectedCategory === 'all'
              ? 'bg-matcha text-white'
              : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-gray-200 dark:border-slate-800'
          ]"
        >
          Semua ({{ totalWordsCount }})
        </button>

        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          @click="emit('selectCategory', cat)"
          :class="[
            'min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 active:scale-95',
            selectedCategory === cat
              ? 'bg-matcha text-white'
              : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-gray-200 dark:border-slate-800'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Inline Practice Vocab Button (No floating overlap on mobile) -->
      <button
        v-if="totalWordsCount > 0"
        type="button"
        @click="emit('startQuiz')"
        class="w-full sm:w-auto min-h-[44px] sm:min-h-[38px] px-4 py-2 rounded-xl bg-matcha hover:bg-emerald-600 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
      >
        <Play class="w-3.5 h-3.5 fill-current shrink-0" />
        <span>Latihan Kotoba{{ lessonNumber ? ` Bab ${lessonNumber}` : '' }} ({{ totalWordsCount }})</span>
      </button>
    </div>

    <div v-if="words.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm font-bold">Tidak ada kosakata yang cocok.</p>
    </div>

    <!-- Vocab Cards Grid (3-step responsive: 1 col phone -> 2 cols sm/md -> 3 cols xl) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      <div
        v-for="(w, wIdx) in words"
        :key="wIdx"
        :class="[
          'border rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 transition-colors',
          quizStore.isWordSkipped?.(w.character)
            ? 'bg-slate-50/70 dark:bg-slate-850/60 border-dashed border-slate-300 dark:border-slate-700 opacity-75'
            : 'bg-white dark:bg-slate-850 border-gray-200 dark:border-slate-800 hover:border-matcha/50'
        ]"
      >
        <div class="flex items-start justify-between gap-2 min-w-0">
          <div class="flex flex-col min-w-0">
            <span class="text-base sm:text-lg font-black font-jp text-slate-900 dark:text-slate-100 break-words">
              {{ w.character }}
            </span>
            <span v-if="w.kana !== w.character" class="text-xs text-slate-500 dark:text-slate-400 font-jp break-words">
              {{ w.kana }}
            </span>
            <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-words">
              {{ Array.isArray(w.romaji) ? w.romaji[0] : w.romaji }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span 
              :class="['px-1.5 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider flex items-center gap-1', getWordStatus(w.character).class]"
            >
              <SkipForward v-if="getWordStatus(w.character).isSkipped" class="w-2.5 h-2.5 stroke-[2.5]" />
              <span>{{ getWordStatus(w.character).label }}</span>
            </span>
            <SpeakerButton :text="w.kana || w.character" size="sm" />
          </div>
        </div>

        <div class="pt-2.5 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-1.5">
          <span class="text-xs sm:text-[13px] font-semibold text-indigo-800 dark:text-indigo-200 leading-snug break-words">
            {{ w.meaning }}
          </span>
          <div v-if="w.sub_category || w.category_word" class="flex items-center flex-wrap gap-1">
            <span v-if="w.sub_category" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-matcha/10 text-matcha-dark dark:text-matcha border border-matcha/20">
              {{ w.sub_category }}
            </span>
            <span v-if="w.category_word" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700/60">
              {{ w.category_word }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
