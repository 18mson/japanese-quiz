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
  <div class="w-full px-3 sm:px-6 lg:px-8 pt-4 pb-2">
    <div 
      class="w-full bg-gradient-to-br from-indigo-50/90 via-white to-white dark:from-indigo-950/40 dark:via-slate-850 dark:to-slate-850 border rounded-3xl p-4 sm:p-6 sm:py-7 shadow-xs dark:shadow-md relative overflow-hidden text-slate-800 dark:text-slate-100 transition-all duration-300"
      :class="[
        completionStats.isFullyCompleted
          ? 'border-emerald-400/50 dark:border-emerald-500/40 ring-2 ring-emerald-500/25 dark:ring-emerald-500/20 shadow-emerald-500/10'
          : 'border-indigo-100 dark:border-slate-800'
      ]"
    >
      <!-- Completed celebration glow -->
      <div 
        v-if="completionStats.isFullyCompleted" 
        class="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
      ></div>
      <!-- Glow ambient accents -->
      <div class="absolute -top-16 -right-16 w-56 h-56 bg-torii/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- ================= THEMATIC BACKGROUND ILLUSTRATION LAYER ================= -->
      <div class="absolute inset-y-0 right-0 w-full sm:w-2/3 md:w-1/2 lg:w-[48%] pointer-events-none select-none overflow-hidden z-0">
        <!-- Smooth Horizontal Gradient Overlays to preserve text readability -->
        <!-- Light Mode Fader -->
        <div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent sm:via-white/60 dark:hidden z-10 pointer-events-none"></div>
        <!-- Dark Mode Fader -->
        <div class="absolute inset-0 bg-gradient-to-r from-slate-850 via-slate-850/85 to-transparent sm:via-slate-850/60 hidden dark:block z-10 pointer-events-none"></div>

        <!-- Vertical Vignette -->
        <div class="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/30 dark:from-slate-850/90 dark:via-transparent dark:to-slate-850/30 z-10 pointer-events-none"></div>

        <!-- Chapter Illustration Image -->
        <transition name="illustration-fade" mode="out-in">
          <img
            v-if="!imageLoadFailed"
            :key="theme.illustrationUrl"
            :src="theme.illustrationUrl"
            :alt="theme.themeTitle"
            @error="onImageError"
            class="w-full h-full object-cover object-center sm:object-right transition-all duration-700 opacity-25 sm:opacity-75 md:opacity-90 dark:opacity-20 dark:sm:opacity-45 dark:md:opacity-60 dark:mix-blend-luminosity filter saturate-[1.12]"
          />
          <!-- Artistic Decorative Fallback if image is not loaded -->
          <div 
            v-else 
            :key="'fallback-' + chapter.lessonNumber"
            class="w-full h-full flex items-center justify-end pr-8 sm:pr-12 opacity-15 sm:opacity-25 dark:opacity-10 text-indigo-900 dark:text-indigo-200"
          >
            <div class="text-8xl sm:text-9xl font-black font-japanese select-none tracking-widest">
              {{ chapter.lessonNumber }}
            </div>
          </div>
        </transition>
      </div>

      <!-- Penanda Khusus jika semua materi bab sudah dipelajari: Floating Badge di pojok kanan atas -->
      <div 
        v-if="completionStats.isFullyCompleted" 
        class="absolute top-3.5 right-3.5 sm:top-5 sm:right-6 z-20 flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-600/90 dark:bg-emerald-500/90 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/60 backdrop-blur-md"
      >
        <Trophy class="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
        <span class="text-[11px] font-black tracking-wide uppercase">Bab Dikuasai</span>
        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-200 shrink-0" />
      </div>

      <!-- ================= FOREGROUND CONTENT LAYER ================= -->
      <div class="flex flex-col gap-2 relative z-20 max-w-xl md:max-w-2xl lg:max-w-3xl">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-lg bg-torii/10 dark:bg-torii/20 text-torii dark:text-torii-light border border-torii/25 dark:border-torii/30 text-[11px] font-extrabold font-jp tracking-wider shadow-2xs">
            第 {{ chapter.lessonNumber }} 課
          </span>

          <!-- Penanda Khusus jika semua materi sudah dipelajari -->
          <span
            v-if="completionStats.isFullyCompleted"
            class="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 text-[11px] font-black flex items-center gap-1.5 shadow-2xs"
          >
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
            <span>Semua Materi Selesai ({{ completionStats.completed }}/{{ completionStats.total }})</span>
          </span>
          <span
            v-else-if="completionStats.completed > 0"
            class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-bold"
          >
            {{ completionStats.completed }}/{{ completionStats.total }} Selesai
          </span>

          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Minna no Nihongo Shokyu I</span>
          <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
            • {{ theme.themeTitle }}
          </span>
        </div>

        <h1 class="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-snug">
          {{ chapter.title }}
        </h1>

        <p class="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 leading-relaxed">
          {{ chapter.subTitle }}
        </p>

        <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-indigo-100/80 dark:border-slate-800 shadow-2xs max-w-2xl">
          💡 <strong class="text-slate-800 dark:text-slate-200">Ringkasan:</strong> {{ chapter.summary }}
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
