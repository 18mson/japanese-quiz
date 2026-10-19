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
    <div v-if="items.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm font-bold">Tidak ada pola kalimat yang cocok dengan pencarian.</p>
    </div>

    <article
      v-for="item in items"
      :key="item.id"
      class="bg-white dark:bg-slate-850/90 border border-gray-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 rounded-3xl p-4 sm:p-6 shadow-xs dark:shadow-md transition flex flex-col gap-3.5"
    >
      <!-- Pattern Title Header -->
      <div class="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-slate-800/80">
        <span class="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
          #{{ item.pointNumber }}
        </span>
        <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
          {{ getBunkeiTitle(item) }}
        </h2>
      </div>

      <!-- Formula Visual Box -->
      <div class="p-3 rounded-2xl bg-amber-50/80 dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-500/30 flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">Rumus Struktur:</span>
        </div>
        <div class="text-xs sm:text-sm font-mono font-bold text-amber-950 dark:text-amber-200 flex flex-wrap items-center gap-1.5 leading-relaxed">
          <template v-for="(seg, sIdx) in parseFormulaTokens(item.formula)" :key="sIdx">
            <span 
              v-if="seg.isPlus" 
              class="w-5 h-5 rounded-md bg-amber-200/80 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 font-black text-xs inline-flex items-center justify-center select-none shadow-2xs"
              aria-label="ditambah"
            >
              +
            </span>
            <code 
              v-else 
              class="px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-800/90 text-amber-950 dark:text-amber-100 border border-amber-200/80 dark:border-amber-600/30 shadow-2xs font-semibold"
            >
              {{ seg.text }}
            </code>
          </template>
        </div>
      </div>

      <!-- Explanation -->
      <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {{ item.explanation }}
      </p>

      <!-- Variations (if present) -->
      <div v-if="item.variations && item.variations.length > 0" class="flex flex-col gap-2 pt-1">
        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Variasi Bentuk:</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div 
            v-for="(v, vIdx) in item.variations"
            :key="vIdx"
            class="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/70 border border-gray-200/80 dark:border-slate-800 flex flex-col gap-0.5"
          >
            <span class="text-[10px] font-black text-torii">{{ v.label }}</span>
            <span class="text-xs font-bold font-jp text-slate-900 dark:text-slate-100">{{ v.japanese }}</span>
            <span class="text-[11px] text-slate-600 dark:text-slate-400">{{ v.meaning }}</span>
          </div>
        </div>
      </div>

      <!-- Examples List -->
      <div class="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/60">
        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contoh Kalimat:</span>
        <div class="flex flex-col gap-2">
          <div
            v-for="(ex, exIdx) in item.examples"
            :key="exIdx"
            class="p-3 rounded-2xl bg-gray-50/80 dark:bg-slate-900/70 border border-gray-200/80 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 flex items-start justify-between gap-3 transition"
          >
            <div class="flex flex-col gap-0.5">
              <div class="text-sm sm:text-base font-bold font-jp text-slate-900 dark:text-slate-100">
                {{ ex.japanese }}
              </div>
              <div class="text-xs font-mono text-slate-500 dark:text-slate-400">
                {{ ex.romaji }}
              </div>
              <div class="text-xs font-medium text-indigo-700 dark:text-indigo-200/90 mt-0.5">
                {{ ex.meaning }}
              </div>
            </div>
            <SpeakerButton :text="ex.japanese" size="sm" />
          </div>
        </div>
      </div>

      <!-- Note Alert -->
      <div v-if="item.note" class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-600/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
        <Lightbulb class="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <span>{{ item.note }}</span>
      </div>
    </article>
  </section>
</template>
