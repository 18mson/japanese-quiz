<script setup lang="ts">
import { Search, SkipForward } from '@lucide/vue';
import SpeakerButton from '../../../SpeakerButton.vue';
import type { JapaneseWord } from '../../../../data/words';
import { useQuizStore } from '../../../../stores/quizStore';

defineProps<{
  phrases: JapaneseWord[];
}>();

const quizStore = useQuizStore();
</script>

<template>
  <section class="flex flex-col gap-4">
    <div v-if="phrases.length === 0" class="py-12 px-4 text-center bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-60" aria-hidden="true" />
      <p class="text-sm font-bold text-slate-800 dark:text-slate-100">Tidak ada frasa atau ungkapan yang cocok.</p>
      <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Coba gunakan kata kunci lain atau hapus teks pencarian.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <article
        v-for="(phrase, phIdx) in phrases"
        :key="phIdx"
        :class="[
          'border rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3.5 transition-colors',
          quizStore.isWordSkipped?.(phrase.character)
            ? 'bg-slate-50/70 dark:bg-slate-850/60 border-dashed border-slate-300 dark:border-slate-700 opacity-80'
            : 'bg-white dark:bg-slate-850 border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40'
        ]"
      >
        <div class="flex flex-col gap-1 min-w-0 flex-1">
          <div class="flex items-center flex-wrap gap-2">
            <span class="text-base sm:text-lg font-bold font-jp text-slate-900 dark:text-white leading-snug break-words">
              {{ phrase.character }}
            </span>
            <span 
              v-if="quizStore.isWordSkipped?.(phrase.character)"
              class="px-2 py-0.5 rounded-md text-[11px] font-bold border border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 shrink-0"
            >
              <SkipForward class="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
              <span>Dilewati</span>
            </span>
          </div>
          <div class="text-xs font-mono text-slate-600 dark:text-slate-300 break-words">
            {{ Array.isArray(phrase.romaji) ? phrase.romaji[0] : phrase.romaji }}
          </div>
          <div class="text-[15px] font-medium text-indigo-800 dark:text-indigo-200 mt-1 leading-snug break-words">
            {{ phrase.meaning }}
          </div>
        </div>
        <SpeakerButton :text="phrase.kana || phrase.character" size="sm" class="shrink-0" />
      </article>
    </div>
  </section>
</template>
