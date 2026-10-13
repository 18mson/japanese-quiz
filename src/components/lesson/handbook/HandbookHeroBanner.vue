<script setup lang="ts">
import type { LessonGrammarChapter } from '../../../data/lessonGrammarBook';

defineProps<{
  chapter: LessonGrammarChapter;
}>();
</script>

<template>
  <div class="w-full px-3 sm:px-6 lg:px-8 pt-4 pb-2">
    <div class="w-full bg-gradient-to-br from-indigo-50/90 via-white to-white dark:from-indigo-950/40 dark:via-slate-850 dark:to-slate-850 border border-indigo-100 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs dark:shadow-md relative overflow-hidden text-slate-800 dark:text-slate-100">
      <!-- Glow accents -->
      <div class="absolute -top-16 -right-16 w-48 h-48 bg-torii/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col gap-2 relative z-10">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-lg bg-torii/10 dark:bg-torii/20 text-torii dark:text-torii-light border border-torii/25 dark:border-torii/30 text-[11px] font-extrabold font-jp tracking-wider">
            第 {{ chapter.lessonNumber }} 課
          </span>
          <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Minna no Nihongo Shokyu I</span>
        </div>

        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          {{ chapter.title }}
        </h1>

        <p class="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 leading-relaxed">
          {{ chapter.subTitle }}
        </p>

        <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed bg-indigo-50/50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100/80 dark:border-slate-800">
          💡 <strong class="text-slate-800 dark:text-slate-200">Ringkasan:</strong> {{ chapter.summary }}
        </p>
      </div>
    </div>
  </div>
</template>
