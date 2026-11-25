<script setup lang="ts">
import { Search, AlertCircle, Lightbulb } from '@lucide/vue';
import SpeakerButton from '../../../SpeakerButton.vue';
import type { ParticleGuideItem, LessonGrammarChapter } from '../../../../data/lessonGrammarBook';

defineProps<{
  items: ParticleGuideItem[];
  grammarNotes?: LessonGrammarChapter['grammarNotes'];
}>();
</script>

<template>
  <section class="flex flex-col gap-5">
    <div v-if="items.length === 0" class="py-12 px-4 text-center bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-60" aria-hidden="true" />
      <p class="text-sm font-bold text-slate-800 dark:text-slate-100">Tidak ada panduan partikel yang cocok.</p>
      <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">Coba gunakan kata kunci lain atau hapus teks pencarian.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article
        v-for="(p, pIdx) in items"
        :key="pIdx"
        class="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4"
      >
        <!-- Particle Badge & Role -->
        <div class="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800 min-w-0">
          <div class="w-11 h-11 rounded-xl bg-torii/10 dark:bg-torii/20 text-torii dark:text-torii-light border border-torii/25 dark:border-torii/40 flex items-center justify-center font-black font-jp text-lg shrink-0">
            {{ p.particle.split(' ')[0] }}
          </div>
          <div class="min-w-0">
            <h3 class="text-[15px] font-bold text-slate-900 dark:text-white break-words">{{ p.particle }}</h3>
            <span class="text-xs font-semibold text-torii dark:text-torii-light break-words">{{ p.role }}</span>
          </div>
        </div>

        <!-- Explanation -->
        <p class="text-[15px] text-slate-700 dark:text-slate-200 leading-[1.7]">
          {{ p.explanation }}
        </p>

        <!-- Examples -->
        <div v-if="p.examples && p.examples.length > 0" class="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Contoh</span>
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            <div 
              v-for="(ex, exIdx) in p.examples"
              :key="exIdx"
              class="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
            >
              <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                <span class="text-sm sm:text-base font-bold font-jp text-slate-900 dark:text-white break-words">{{ ex.japanese }}</span>
                <span class="text-[13px] text-slate-600 dark:text-slate-300 break-words">{{ ex.meaning }}</span>
              </div>
              <SpeakerButton :text="ex.japanese" size="sm" class="shrink-0" />
            </div>
          </div>
        </div>

        <!-- Caution -->
        <div v-if="p.caution" class="pl-3.5 pr-3 py-2.5 rounded-r-xl bg-red-50/80 dark:bg-red-950/30 border-l-4 border-red-500 text-red-900 dark:text-red-200 text-sm flex items-start gap-2.5 leading-relaxed mt-auto">
          <AlertCircle class="w-4 h-4 flex-shrink-0 mt-1 text-red-600 dark:text-red-400" aria-hidden="true" />
          <span>{{ p.caution }}</span>
        </div>
      </article>
    </div>

    <!-- Additional Grammar & Cultural Notes -->
    <div v-if="grammarNotes && grammarNotes.length > 0" class="mt-2 flex flex-col gap-3">
      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <Lightbulb class="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>Catatan Tata Bahasa Tambahan</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div
          v-for="(gn, gnIdx) in grammarNotes"
          :key="gnIdx"
          class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 flex flex-col gap-1.5"
        >
          <h4 class="text-sm font-bold text-indigo-800 dark:text-indigo-300">{{ gn.title }}</h4>
          <p class="text-sm text-slate-700 dark:text-slate-200 leading-[1.65]">{{ gn.content }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
