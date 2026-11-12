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

const completionStats = computed(() => {
  return lessonStore.getChapterCompletedStats(props.chapter.lessonNumber);
});

watch(() => props.chapter.lessonNumber, () => {
  imageLoadFailed.value = false;
});

const onImageError = () => {
  imageLoadFailed.value = true;
};
</script>

<template>
  <div class="w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1 sm:pb-2">
    <div 
      class="w-full bg-white dark:bg-slate-850 border rounded-2xl p-3.5 sm:p-6 relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200"
      :class="[
        completionStats.isFullyCompleted
          ? 'border-emerald-400/60 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'border-gray-200 dark:border-slate-800'
      ]"
    >
      <!-- ================= THEMATIC BACKGROUND ILLUSTRATION LAYER ================= -->
      <div class="absolute inset-y-0 right-0 w-full sm:w-2/3 md:w-1/2 lg:w-[46%] pointer-events-none select-none overflow-hidden z-0">
        <!-- Smooth Horizontal Gradient Overlays to preserve text readability -->
        <div class="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent sm:via-white/65 dark:hidden z-10 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-slate-850 via-slate-850/90 to-transparent sm:via-slate-850/65 hidden dark:block z-10 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/30 dark:from-slate-850/90 dark:via-transparent dark:to-slate-850/30 z-10 pointer-events-none"></div>

        <!-- Chapter Illustration Image -->
        <transition name="illustration-fade" mode="out-in">
          <img
            v-if="!imageLoadFailed"
            :key="theme.illustrationUrl"
            :src="theme.illustrationUrl"
            :alt="theme.themeTitle"
            @error="onImageError"
            class="w-full h-full object-cover object-center sm:object-right transition-all duration-700 opacity-20 sm:opacity-75 md:opacity-85 dark:opacity-15 dark:sm:opacity-40 dark:md:opacity-55 dark:mix-blend-luminosity"
          />
          <div 
            v-else 
            :key="'fallback-' + chapter.lessonNumber"
            class="w-full h-full flex items-center justify-end pr-6 sm:pr-12 opacity-15 dark:opacity-10 text-indigo-900 dark:text-indigo-200"
          >
            <div class="text-7xl sm:text-9xl font-black font-japanese select-none tracking-widest">
              {{ chapter.lessonNumber }}
            </div>
          </div>
        </transition>
      </div>

      <!-- Completed badge (Desktop) -->
      <div 
        v-if="completionStats.isFullyCompleted" 
        class="hidden sm:flex absolute top-4 right-5 z-20 items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white border border-emerald-500"
      >
        <Trophy class="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
        <span class="text-[11px] font-black tracking-wide uppercase">Bab Dikuasai</span>
        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-200 shrink-0" />
      </div>

      <!-- ================= FOREGROUND CONTENT LAYER ================= -->
      <div class="flex flex-col gap-1.5 sm:gap-2 relative z-20 max-w-xl md:max-w-2xl lg:max-w-3xl">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2 py-0.5 rounded-lg bg-torii/10 dark:bg-torii/20 text-torii dark:text-torii-light border border-torii/25 dark:border-torii/30 text-[11px] font-extrabold font-jp tracking-wider">
            第 {{ chapter.lessonNumber }} 課
          </span>

          <span
            v-if="completionStats.isFullyCompleted"
            class="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 text-[11px] font-black flex items-center gap-1"
          >
            <Trophy class="w-3.5 h-3.5 text-amber-500 fill-amber-500 sm:hidden shrink-0" />
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 hidden sm:inline shrink-0" />
            <span class="sm:hidden font-black">Bab Dikuasai ({{ completionStats.completed }}/{{ completionStats.total }})</span>
            <span class="hidden sm:inline">Semua Materi Selesai ({{ completionStats.completed }}/{{ completionStats.total }})</span>
          </span>
          <span
            v-else-if="completionStats.completed > 0"
            class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold"
          >
            {{ completionStats.completed }}/{{ completionStats.total }} Selesai
          </span>

          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Minna no Nihongo Shokyu I</span>
          <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
            · {{ theme.themeTitle }}
          </span>
        </div>

        <h1 class="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-snug">
          {{ chapter.title }}
        </h1>

        <p class="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 leading-relaxed">
          {{ chapter.subTitle }}
        </p>

        <p class="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50/95 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 max-w-2xl">
          <strong class="text-slate-900 dark:text-slate-100">Ringkasan:</strong> {{ chapter.summary }}
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
