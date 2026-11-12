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
    <div v-if="items.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
      <Search class="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p class="text-sm font-bold">Tidak ada panduan partikel yang cocok.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article
        v-for="(p, pIdx) in items"
        :key="pIdx"
        class="bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 hover:border-torii/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors"
      >
        <!-- Particle Badge & Role -->
        <div class="flex items-center gap-3 pb-2.5 border-b border-gray-100 dark:border-slate-800 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-torii/10 dark:bg-torii/20 text-torii dark:text-torii-light border border-torii/25 dark:border-torii/40 flex items-center justify-center font-black font-jp text-base shrink-0">
            {{ p.particle.split(' ')[0] }}
          </div>
          <div class="min-w-0">
            <h3 class="text-sm font-black text-slate-900 dark:text-slate-100 break-words">{{ p.particle }}</h3>
            <span class="text-xs font-semibold text-torii dark:text-torii-light break-words">{{ p.role }}</span>
          </div>
        </div>

        <!-- Explanation -->
        <p class="text-[13px] sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {{ p.explanation }}
        </p>

        <!-- Examples -->
        <div v-if="p.examples && p.examples.length > 0" class="flex flex-col gap-2 pt-1">
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contoh</span>
          <div class="divide-y divide-gray-100 dark:divide-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-gray-200/80 dark:border-slate-800">
            <div 
              v-for="(ex, exIdx) in p.examples"
              :key="exIdx"
              class="p-2.5 flex items-center justify-between gap-2"
            >
              <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                <span class="text-xs sm:text-sm font-bold font-jp text-slate-900 dark:text-slate-100 break-words">{{ ex.japanese }}</span>
                <span class="text-[11px] text-slate-600 dark:text-slate-400 break-words">{{ ex.meaning }}</span>
              </div>
              <SpeakerButton :text="ex.japanese" size="sm" class="shrink-0" />
            </div>
          </div>
        </div>

        <!-- Caution -->
        <div v-if="p.caution" class="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 text-red-900 dark:text-red-300 text-xs flex items-start gap-2 leading-relaxed">
          <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <span>{{ p.caution }}</span>
        </div>
      </article>
    </div>

    <!-- Additional Grammar & Cultural Notes -->
    <div v-if="grammarNotes && grammarNotes.length > 0" class="mt-2 flex flex-col gap-3">
      <h3 class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Lightbulb class="w-4 h-4 text-amber-500 dark:text-amber-400" />
        Catatan Tata Bahasa Tambahan
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="(gn, gnIdx) in grammarNotes"
          :key="gnIdx"
          class="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 flex flex-col gap-1.5"
        >
          <h4 class="text-xs font-black text-amber-700 dark:text-amber-300">{{ gn.title }}</h4>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{{ gn.content }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
