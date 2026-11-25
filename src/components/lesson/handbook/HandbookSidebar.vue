<script setup lang="ts">
import { CheckCircle2 } from '@lucide/vue';
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
  <aside class="hidden md:flex flex-col w-60 lg:w-68 shrink-0 sticky top-[76px] z-20 bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl p-3 gap-2">
    <div class="px-2 py-1 flex items-center justify-between">
      <span class="text-xs font-bold text-slate-600 dark:text-slate-300">Daftar Bagian</span>
      <span class="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
        Bab {{ currentLessonNumber }}
      </span>
    </div>

    <nav aria-label="Daftar Bagian Materi" class="flex flex-col gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="emit('selectTab', tab.id)"
        :aria-current="activeTab === tab.id ? 'page' : undefined"
        :class="[
          'w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-between group cursor-pointer border focus-visible:ring-2 focus-visible:ring-indigo-500',
          activeTab === tab.id
            ? tab.activeClass
            : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent'
        ]"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div :class="['w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white']">
            <component :is="tab.icon" class="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="truncate font-bold text-[13px]">{{ tab.name }}</span>
            <span :class="['text-[11px] font-medium truncate', activeTab === tab.id ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400']">{{ tab.jpName }}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 ml-1">
          <CheckCircle2
            v-if="tab.isCompleted"
            :class="[
              'w-3.5 h-3.5',
              activeTab === tab.id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
            ]"
            aria-label="Sudah dipelajari"
          />
          <span
            v-if="tab.count !== undefined"
            :class="[
              'px-2 py-0.5 rounded-md text-[11px] font-bold',
              activeTab === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            ]"
          >
            {{ tab.count }}
          </span>
        </div>
      </button>
    </nav>
  </aside>
</template>
