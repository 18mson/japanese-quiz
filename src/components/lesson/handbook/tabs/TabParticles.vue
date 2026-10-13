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

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <article
        v-for="(p, pIdx) in items"
        :key="pIdx"
        class="bg-white dark:bg-slate-850/90 border border-gray-200/90 dark:border-slate-800 hover:border-torii/40 rounded-3xl p-4 sm:p-5 shadow-xs dark:shadow-md flex flex-col gap-3 transition"
      >
        <!-- Particle Badge & Role -->
        <div class="flex items-center gap-3 pb-2.5 border-b border-gray-100 dark:border-slate-800/80">
          <div class="w-10 h-10 rounded-2xl bg-torii/10 dark:bg-torii/20 text-torii dark:text-torii-light border border-torii/25 dark:border-torii/40 flex items-center justify-center font-black font-jp text-base shadow-2xs">
            {{ p.particle.split(' ')[0] }}
          </div>
          <div>
            <h3 class="text-sm font-black text-slate-900 dark:text-slate-100">{{ p.particle }}</h3>
            <span class="text-xs font-semibold text-torii dark:text-torii-light">{{ p.role }}</span>
          </div>
        </div>

        <!-- Explanation -->
        <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {{ p.explanation }}
        </p>

        <!-- Examples -->
        <div v-if="p.examples && p.examples.length > 0" class="flex flex-col gap-2 pt-1">
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contoh:</span>
          <div 
            v-for="(ex, exIdx) in p.examples"
            :key="exIdx"
            class="p-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-900/70 border border-gray-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-xs sm:text-sm font-bold font-jp text-slate-900 dark:text-slate-100">{{ ex.japanese }}</span>
              <span class="text-[11px] text-slate-600 dark:text-slate-400">{{ ex.meaning }}</span>
            </div>
            <SpeakerButton :text="ex.japanese" size="sm" />
          </div>
        </div>

        <!-- Caution -->
        <div v-if="p.caution" class="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 text-red-900 dark:text-red-300 text-xs flex items-start gap-2">
          <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <span>{{ p.caution }}</span>
        </div>
      </article>
    </div>

    <!-- Additional Grammar & Cultural Notes -->
    <div v-if="grammarNotes && grammarNotes.length > 0" class="mt-4 flex flex-col gap-3">
      <h3 class="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Lightbulb class="w-4 h-4 text-amber-500 dark:text-amber-400" />
        Catatan Tata Bahasa Tambahan
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="(gn, gnIdx) in grammarNotes"
          :key="gnIdx"
          class="p-4 rounded-2xl bg-white dark:bg-slate-850/90 border border-gray-200/90 dark:border-slate-800 flex flex-col gap-1.5 shadow-2xs"
        >
          <h4 class="text-xs font-black text-amber-700 dark:text-amber-300">{{ gn.title }}</h4>
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{{ gn.content }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
