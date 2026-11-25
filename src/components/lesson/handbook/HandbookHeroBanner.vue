<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Trophy, CheckCircle2 } from '@lucide/vue';
import type { LessonGrammarChapter } from '../../../data/lessonGrammarBook';
import { getChapterTheme } from '../../../data/chapterThemes';
import { useLessonStore } from '../../../stores/lessonStore';

const props = defineProps<{
  chapter: LessonGrammarChapter;
}>();

const lessonStore = useLessonStore();
const theme = computed(() => getChapterTheme(props.chapter.lessonNumber));
const imageLoadFailed = ref(false);
const isSummaryExpanded = ref(false);

const completionStats = computed(() => {
  return lessonStore.getChapterCompletedStats(props.chapter.lessonNumber);
});

watch(() => props.chapter.lessonNumber, () => {
  imageLoadFailed.value = false;
  isSummaryExpanded.value = false;
});

const onImageError = () => {
  imageLoadFailed.value = true;
};
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1">
    <div 
      class="w-full bg-white dark:bg-slate-850 border rounded-2xl p-4 sm:p-6 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200"
      :class="[
        completionStats.isFullyCompleted
          ? 'border-emerald-500/50 dark:border-emerald-500/40'
          : 'border-gray-200 dark:border-slate-800'
      ]"
    >
      <!-- ================= THEMATIC BACKGROUND ILLUSTRATION LAYER (sm+ only for clean mobile contrast) ================= -->
      <div class="hidden sm:block absolute inset-y-0 right-0 sm:w-2/3 md:w-1/2 lg:w-[44%] pointer-events-none select-none overflow-hidden z-0">
        <!-- Smooth Horizontal Gradient Overlays to preserve text readability (>= 4.5:1) -->
        <div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:hidden z-10 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-slate-850 via-slate-850/80 to-transparent hidden dark:block z-10 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-white/40 dark:from-slate-850/95 dark:via-transparent dark:to-slate-850/40 z-10 pointer-events-none"></div>

        <!-- Chapter Illustration Image -->
        <transition name="illustration-fade" mode="out-in">
          <img
            v-if="!imageLoadFailed"
            :key="theme.illustrationUrl"
            :src="theme.illustrationUrl"
            :alt="theme.themeTitle"
            @error="onImageError"
            class="w-full h-full object-cover object-right transition-opacity duration-500 opacity-65 md:opacity-75 dark:opacity-35 dark:md:opacity-45 dark:mix-blend-luminosity"
          />
          <div 
            v-else 
            :key="'fallback-' + chapter.lessonNumber"
            class="w-full h-full flex items-center justify-end pr-12 opacity-15 dark:opacity-10 text-indigo-900 dark:text-indigo-200"
          >
            <div class="text-9xl font-black font-jp select-none tracking-widest">
              {{ chapter.lessonNumber }}
            </div>
          </div>
        </transition>
      </div>

      <!-- Completed badge (Desktop) -->
      <div 
        v-if="completionStats.isFullyCompleted" 
        class="hidden sm:flex absolute top-4 right-5 z-20 items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white border border-emerald-600"
      >
        <Trophy class="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" aria-hidden="true" />
        <span class="text-xs font-bold tracking-wide">Bab Dikuasai</span>
        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-100 shrink-0" aria-hidden="true" />
      </div>

      <!-- ================= FOREGROUND CONTENT LAYER ================= -->
      <div class="flex flex-col gap-1.5 sm:gap-2 relative z-20 max-w-2xl">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-md bg-torii/10 dark:bg-torii/20 text-torii dark:text-torii-light border border-torii/25 dark:border-torii/30 text-xs font-bold font-jp">
            第 {{ chapter.lessonNumber }} 課
          </span>

          <span
            v-if="completionStats.isFullyCompleted"
            class="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/35 text-xs font-bold flex items-center gap-1"
          >
            <Trophy class="w-3.5 h-3.5 text-amber-600 fill-amber-500 sm:hidden shrink-0" aria-hidden="true" />
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 hidden sm:inline shrink-0" aria-hidden="true" />
            <span class="sm:hidden">Bab Dikuasai ({{ completionStats.completed }}/{{ completionStats.total }})</span>
            <span class="hidden sm:inline">Semua Materi Selesai ({{ completionStats.completed }}/{{ completionStats.total }})</span>
          </span>
          <span
            v-else-if="completionStats.completed > 0"
            class="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            {{ completionStats.completed }}/{{ completionStats.total }} Selesai
          </span>

          <span class="text-xs font-bold text-indigo-700 dark:text-indigo-300">Minna no Nihongo I</span>
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
            · {{ theme.themeTitle }}
          </span>
        </div>

        <h1 class="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
          {{ chapter.title }}
        </h1>

        <p class="text-sm font-semibold text-indigo-800 dark:text-indigo-300 leading-relaxed">
          {{ chapter.subTitle }}
        </p>

        <!-- Summary: Tap to expand on mobile, clean editorial block on sm+ -->
        <button
          type="button"
          @click="isSummaryExpanded = !isSummaryExpanded"
          class="sm:hidden text-left text-sm text-slate-700 dark:text-slate-200 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-900/90 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span :class="isSummaryExpanded ? '' : 'line-clamp-2'">
            <strong class="text-slate-900 dark:text-white">Ringkasan:</strong> {{ chapter.summary }}
          </span>
          <span class="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-1 inline-block">
            {{ isSummaryExpanded ? 'Sembunyikan' : 'Baca selengkapnya' }}
          </span>
        </button>

        <p class="hidden sm:block text-sm text-slate-700 dark:text-slate-200 mt-1 leading-[1.65] border-l-2 border-indigo-500/70 pl-3.5 py-0.5 max-w-[65ch]">
          <strong class="text-slate-900 dark:text-white font-bold">Ringkasan:</strong> {{ chapter.summary }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.illustration-fade-enter-active,
.illustration-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.illustration-fade-enter-from {
  opacity: 0;
  transform: scale(0.96) translateX(12px);
}
.illustration-fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
