<script setup lang="ts">
import { Search, Lightbulb } from '@lucide/vue';
import SpeakerButton from '../../../SpeakerButton.vue';
import type { BunkeiItem } from '../../../../data/lessonGrammarBook';
import { parseFormulaTokens, getBunkeiTitle } from '../utils';

defineProps<{
  items: BunkeiItem[];
}>();
</script>

<template>
  <section class="flex flex-col gap-5">
    <div v-if="items.length === 0" class="py-12 px-4 text-center bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-60" aria-hidden="true" />
      <p class="text-sm font-bold text-slate-800 dark:text-slate-100">Tidak ada pola kalimat yang cocok dengan pencarian.</p>
      <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Coba gunakan kata kunci lain atau hapus teks pencarian.</p>
    </div>

    <article
      v-for="item in items"
      :key="item.id"
      class="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 flex flex-col gap-5"
    >
      <!-- Pattern Title Header -->
      <div class="flex items-start gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <span class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-700/50 font-bold text-xs shrink-0 mt-0.5 tabular-nums">
          Pola {{ item.pointNumber }}
        </span>
        <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug min-w-0 break-words">
          {{ getBunkeiTitle(item) }}
        </h2>
      </div>

      <!-- Formula Visual Block (Clean left-accent bar, no nested box clutter) -->
      <div class="pl-4 pr-3 py-3 rounded-r-xl bg-slate-50 dark:bg-slate-900/80 border-l-4 border-indigo-600 dark:border-indigo-400 flex flex-col gap-1.5">
        <span class="text-xs font-bold text-indigo-800 dark:text-indigo-300">Rumus Struktur</span>
        <div class="text-sm sm:text-[15px] font-mono font-semibold text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-x-2 gap-y-1.5 leading-relaxed">
          <template v-for="(seg, sIdx) in parseFormulaTokens(item.formula)" :key="sIdx">
            <span 
              v-if="seg.isPlus" 
              class="text-indigo-600 dark:text-indigo-400 font-black text-sm select-none"
              aria-label="ditambah"
            >
              +
            </span>
            <code 
              v-else 
              class="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 font-semibold break-words"
            >
              {{ seg.text }}
            </code>
          </template>
        </div>
      </div>

      <!-- Explanation (Comfortable editorial line length & line height) -->
      <p class="text-[15px] text-slate-700 dark:text-slate-200 leading-[1.7] max-w-[68ch]">
        {{ item.explanation }}
      </p>

      <!-- Variations (if present) -->
      <div v-if="item.variations && item.variations.length > 0" class="flex flex-col gap-2.5">
        <h3 class="text-xs font-bold text-slate-600 dark:text-slate-300">Variasi Bentuk</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div 
            v-for="(v, vIdx) in item.variations"
            :key="vIdx"
            class="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1 min-w-0"
          >
            <span class="text-xs font-bold text-torii dark:text-torii-light">{{ v.label }}</span>
            <span class="text-sm font-bold font-jp text-slate-900 dark:text-white break-words">{{ v.japanese }}</span>
            <span class="text-xs text-slate-600 dark:text-slate-300 break-words">{{ v.meaning }}</span>
          </div>
        </div>
      </div>

      <!-- Examples List (Airy divider-separated rows directly inside the card) -->
      <div class="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <h3 class="text-xs font-bold text-slate-600 dark:text-slate-300">Contoh Kalimat</h3>
        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          <div
            v-for="(ex, exIdx) in item.examples"
            :key="exIdx"
            class="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3"
          >
            <div class="flex flex-col gap-1 min-w-0 flex-1">
              <div class="text-base sm:text-[18px] font-bold font-jp text-slate-900 dark:text-white leading-snug break-words">
                {{ ex.japanese }}
              </div>
              <div class="text-[13px] font-mono text-slate-600 dark:text-slate-300 break-words">
                {{ ex.romaji }}
              </div>
              <div class="text-sm font-medium text-indigo-800 dark:text-indigo-200 break-words">
                {{ ex.meaning }}
              </div>
            </div>
            <SpeakerButton :text="ex.japanese" size="sm" class="shrink-0 mt-0.5" />
          </div>
        </div>
      </div>

      <!-- Note Callout -->
      <div v-if="item.note" class="pl-3.5 pr-3 py-3 rounded-r-xl bg-amber-50/70 dark:bg-amber-950/25 border-l-4 border-amber-500 text-slate-800 dark:text-amber-100 text-sm flex items-start gap-2.5 leading-relaxed">
        <Lightbulb class="w-4 h-4 flex-shrink-0 mt-1 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>{{ item.note }}</span>
      </div>
    </article>
  </section>
</template>
