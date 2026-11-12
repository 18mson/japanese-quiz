<script setup lang="ts">
import { ref, watch } from 'vue';
import { CheckCircle2 } from '@lucide/vue';
import type { HandbookTabItem, HandbookTabId } from './types';

const props = defineProps<{
  tabs: HandbookTabItem[];
  activeTab: HandbookTabId;
}>();

const emit = defineEmits<{
  (e: 'selectTab', tabId: HandbookTabId): void;
}>();

const mobileNavRef = ref<HTMLElement | null>(null);

watch(() => props.activeTab, () => {
  if (mobileNavRef.value) {
    const activeEl = mobileNavRef.value.querySelector('[data-active-tab="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }
});
</script>

<template>
  <!-- Sticky Horizontal Tab Bar for Mobile (< md) -->
  <nav
    ref="mobileNavRef"
    aria-label="Kategori Materi"
    class="sticky top-[60px] z-30 md:hidden w-full bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :data-active-tab="activeTab === tab.id"
      type="button"
      @click="emit('selectTab', tab.id)"
      :class="[
        'min-h-[44px] px-3.5 py-2 rounded-xl font-bold text-xs transition-colors duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 border active:scale-95',
        activeTab === tab.id
          ? tab.activeClass
          : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800'
      ]"
    >
      <component :is="tab.icon" class="w-4 h-4 shrink-0" />
      <span class="font-extrabold">{{ tab.name }}</span>
      <CheckCircle2
        v-if="tab.isCompleted"
        :class="[
          'w-3.5 h-3.5 shrink-0',
          activeTab === tab.id ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'
        ]"
      />
      <span
        v-if="tab.count !== undefined"
        :class="[
          'px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none',
          activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        ]"
      >
        {{ tab.count }}
      </span>
    </button>
  </nav>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
