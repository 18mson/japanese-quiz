<script setup lang="ts">
import { Search } from '@lucide/vue';
import SpeakerButton from '../../../SpeakerButton.vue';
import type { JapaneseWord } from '../../../../data/words';

defineProps<{
  words: JapaneseWord[];
  categories: string[];
  selectedCategory: string;
  totalWordsCount: number;
}>();

const emit = defineEmits<{
  (e: 'selectCategory', cat: string): void;
}>();
</script>

<template>
  <section class="flex flex-col gap-4">
    <!-- Category Filter Pills -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        @click="emit('selectCategory', 'all')"
        :class="[
          'px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap',
          selectedCategory === 'all'
            ? 'bg-matcha text-white shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-gray-200 dark:border-slate-800'
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
          'px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap',
          selectedCategory === cat
            ? 'bg-matcha text-white shadow-xs'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-gray-200 dark:border-slate-700'
        ]"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="words.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm font-bold">Tidak ada kosakata yang cocok.</p>
    </div>

    <!-- Vocab Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="(w, wIdx) in words"
        :key="wIdx"
        class="bg-white dark:bg-slate-850/90 border border-gray-200/90 dark:border-slate-800 hover:border-matcha/40 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between gap-2 transition"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-col">
            <span class="text-base sm:text-lg font-black font-jp text-slate-900 dark:text-slate-100">
              {{ w.character }}
            </span>
            <span v-if="w.kana !== w.character" class="text-xs text-slate-500 dark:text-slate-400 font-jp">
              {{ w.kana }}
            </span>
            <span class="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              {{ Array.isArray(w.romaji) ? w.romaji[0] : w.romaji }}
            </span>
          </div>
          <SpeakerButton :text="w.kana || w.character" size="sm" />
        </div>

        <div class="pt-2 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-indigo-800 dark:text-indigo-200 truncate">
            {{ w.meaning }}
          </span>
          <span v-if="w.category_word" class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700/60 flex-shrink-0">
            {{ w.category_word }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
