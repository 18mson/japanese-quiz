<script setup lang="ts">
import type { HandbookTabItem, HandbookTabId } from './types';

defineProps<{
  tabs: HandbookTabItem[];
  activeTab: HandbookTabId;
  currentLessonNumber: number;
}>();

const emit = defineEmits<{
  (e: 'selectTab', tabId: HandbookTabId): void;
}>();
</script>

<template>
  <aside class="hidden md:flex flex-col w-60 lg:w-72 shrink-0 sticky top-[72px] z-20 bg-white dark:bg-slate-850/90 border border-gray-200/90 dark:border-slate-800 rounded-3xl p-3.5 shadow-xs dark:shadow-md gap-2.5">
    <div class="px-2 py-1 flex items-center justify-between">
      <span class="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Kategori Materi</span>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold border border-indigo-200/60 dark:border-indigo-800/40">
        Bab {{ currentLessonNumber }}
      </span>
    </div>

    <nav class="flex flex-col gap-1.5">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="emit('selectTab', tab.id)"
        :class="[
          'w-full text-left px-3 py-2.5 rounded-2xl font-bold text-xs transition flex items-center justify-between group cursor-pointer border',
          activeTab === tab.id
            ? tab.activeClass
            : 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
        ]"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div :class="['w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200']">
            <component :is="tab.icon" class="w-3.5 h-3.5" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="truncate font-extrabold text-xs">{{ tab.name }}</span>
            <span class="text-[10px] opacity-75 font-medium truncate">{{ tab.jpName }}</span>
          </div>
        </div>
        <span
          v-if="tab.count !== undefined"
          :class="[
            'px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ml-1',
            activeTab === tab.id
              ? 'bg-white/25 text-white'
              : 'bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </nav>
  </aside>
</template>
