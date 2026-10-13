<script setup lang="ts">
import { Search } from '@lucide/vue';
import SpeakerButton from '../../../SpeakerButton.vue';
import type { JapaneseWord } from '../../../../data/words';

defineProps<{
  phrases: JapaneseWord[];
}>();
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
        class="bg-white dark:bg-slate-850/90 border border-gray-200/90 dark:border-slate-800 hover:border-amber-400/60 rounded-2xl p-4 shadow-2xs flex items-start justify-between gap-3 transition"
      >
        <div class="flex flex-col gap-1">
          <div class="text-base sm:text-lg font-bold font-jp text-amber-700 dark:text-amber-200">
            {{ phrase.character }}
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
