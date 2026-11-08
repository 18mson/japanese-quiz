<script setup lang="ts">
import { Search } from '@lucide/vue';
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
    <div v-if="phrases.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm font-bold">Tidak ada frasa yang cocok.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <article
        v-for="(phrase, phIdx) in phrases"
        :key="phIdx"
        :class="[
          'border rounded-2xl p-4 shadow-2xs flex items-start justify-between gap-3 transition',
          quizStore.isWordSkipped?.(phrase.character)
            ? 'bg-slate-50/70 dark:bg-slate-850/60 border-dashed border-slate-300 dark:border-slate-700 opacity-75'
            : 'bg-white dark:bg-slate-850/90 border-gray-200/90 dark:border-slate-800 hover:border-amber-400/60'
        ]"
      >
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-bold font-jp text-amber-700 dark:text-amber-200">
              {{ phrase.character }}
            </span>
            <span 
              v-if="quizStore.isWordSkipped?.(phrase.character)"
              class="px-1.5 py-0.5 rounded-md text-[9px] font-black border border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              ⏭️ Dilewati
            </span>
          </div>
          <div class="text-xs font-mono text-slate-500 dark:text-slate-400">
            {{ Array.isArray(phrase.romaji) ? phrase.romaji[0] : phrase.romaji }}
          </div>
          <div class="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
            {{ phrase.meaning }}
          </div>
        </div>
        <SpeakerButton :text="phrase.kana || phrase.character" size="sm" />
      </article>
    </div>
  </section>
</template>
