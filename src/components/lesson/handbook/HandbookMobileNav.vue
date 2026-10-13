<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from '@lucide/vue';
import type { HandbookTabItem, HandbookTabId } from './types';

const props = defineProps<{
  tabs: HandbookTabItem[];
  activeTab: HandbookTabId;
  activeTabInfo: HandbookTabItem;
  activeFabColorClass: string;
  isOpen: boolean;
  isScrolledToBottom: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggleOpen'): void;
  (e: 'close'): void;
  (e: 'selectTab', tabId: HandbookTabId): void;
}>();

const mobileNavRef = ref<HTMLElement | null>(null);

watch(() => props.activeTab, () => {
  if (props.isScrolledToBottom && mobileNavRef.value) {
    const activeEl = mobileNavRef.value.querySelector('[data-active-tab="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }
});
</script>

<template>
  <!-- ======================================================== -->
  <!-- MOBILE FLOATING ACTION BUTTON (Belum scroll ke bawah)     -->
  <!-- ======================================================== -->
  <Transition name="fab-fade">
    <div 
      v-if="!isScrolledToBottom" 
      class="fixed bottom-5 right-4 z-50 md:hidden"
    >
      <button
        type="button"
        @click="emit('toggleOpen')"
        :class="[
          'text-white backdrop-blur-md border shadow-2xl rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center cursor-pointer select-none active:scale-85',
          activeFabColorClass,
          isOpen
            ? 'px-4 py-2.5 scale-105 gap-2'
            : 'w-12 h-12 p-0 hover:scale-105'
        ]"
        title="Filter Kategori Materi"
      >
        <!-- Icon: rotasi halus saat aktif -->
        <div 
          class="relative w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 transition-transform duration-300"
          :class="[isOpen ? 'rotate-90 bg-white/20' : 'bg-transparent']"
        >
          <X v-if="isOpen" class="w-4 h-4" />
          <template v-else>
            <component :is="activeTabInfo.icon" class="w-5 h-5" />
            <!-- Number kecil di atas pojok kanan icon di dalam tombol, hanya nomor dengan warna putih saja (hanya ketika list menu hilang) -->
            <span 
              v-if="activeTabInfo.count !== undefined" 
              class="absolute -top-1 -right-1 text-[8px] font-black text-white leading-none pointer-events-none select-none drop-shadow-xs"
            >
              {{ activeTabInfo.count }}
            </span>
          </template>
        </div>

        <!-- Text Kategori Materi: HANYA muncul ketika tombol filter aktif (tanpa badge nomor) -->
        <Transition name="expand-text">
          <div 
            v-if="isOpen" 
            class="flex items-center text-xs font-black whitespace-nowrap overflow-hidden"
          >
            <span>Kategori Materi</span>
          </div>
        </Transition>
      </button>
    </div>
  </Transition>

  <!-- ======================================================== -->
  <!-- MOBILE FILTER LIST POPUP (Di atas tombol filter)          -->
  <!-- ======================================================== -->
  <!-- 1. Backdrop Overlay Gelap -->
  <Transition name="fade-overlay">
    <div
      v-if="isOpen && !isScrolledToBottom"
      class="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-xs md:hidden"
      @click="emit('close')"
    />
  </Transition>

  <!-- 2. List Tombol Filter (Tanpa Card, Mengambang di Atas Tombol Filter, Bergeser Keluar Satu-satu) -->
  <div
    class="fixed bottom-[74px] right-4 z-50 md:hidden flex flex-col items-end gap-2.5"
    :class="[isOpen && !isScrolledToBottom ? 'pointer-events-auto' : 'pointer-events-none']"
  >
    <TransitionGroup name="stagger-filter">
      <button
        v-for="(tab, index) in (isOpen && !isScrolledToBottom ? tabs : [])"
        :key="tab.id"
        type="button"
        @click="emit('selectTab', tab.id)"
        :style="{
          '--enter-delay': tabs.length - 1 - index,
          '--leave-delay': index
        }"
        :class="[
          'flex items-center gap-3 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl border cursor-pointer select-none active:scale-90',
          activeTab === tab.id
            ? tab.activeClass + ' ring-2 ring-white/40 shadow-indigo-600/30'
            : 'bg-white/95 dark:bg-slate-850/95 text-slate-800 dark:text-slate-100 border-gray-200/90 dark:border-slate-750/90 hover:bg-white dark:hover:bg-slate-800 shadow-slate-950/30'
        ]"
      >
        <div :class="['w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300']">
          <component :is="tab.icon" class="w-3.5 h-3.5" />
        </div>
        <div class="flex flex-col text-left min-w-0">
          <span class="font-extrabold text-xs tracking-tight">{{ tab.name }}</span>
          <span class="text-[10px] opacity-75 font-medium">{{ tab.jpName }}</span>
        </div>
        <span
          v-if="tab.count !== undefined"
          :class="[
            'px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ml-1',
            activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-slate-750 text-slate-600 dark:text-slate-400'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </TransitionGroup>
  </div>

  <!-- ======================================================== -->
  <!-- MOBILE BOTTOM NAVBAR (Ketika scroll sampai di bawah)      -->
  <!-- ======================================================== -->
  <Transition name="fab-fade">
    <div
      v-if="isScrolledToBottom"
      ref="mobileNavRef"
      class="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200/90 dark:border-slate-800/90 px-3 py-2.5 shadow-2xl flex items-center gap-2 overflow-x-auto no-scrollbar"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :data-active-tab="activeTab === tab.id"
        type="button"
        @click="emit('selectTab', tab.id)"
        :class="[
          'px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 border active:scale-90',
          activeTab === tab.id
            ? tab.activeClass + ' scale-102 shadow-md'
            : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700'
        ]"
      >
        <component :is="tab.icon" class="w-3.5 h-3.5" />
        <span v-if="activeTab === tab.id">{{ tab.name }}</span>
        <span
          v-if="tab.count !== undefined"
          :class="[
            'px-1.5 py-0.2 rounded-full text-[10px] font-black',
            activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.fab-fade-enter-from,
.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.95);
}
.fab-fade-enter-to,
.fab-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Animasi stagger list tombol filter */
.stagger-filter-enter-active {
  transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--enter-delay, 0) * 45ms);
}
.stagger-filter-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1), transform 0.2s cubic-bezier(0.4, 0, 1, 1);
  transition-delay: calc(var(--leave-delay, 0) * 35ms);
}

.stagger-filter-enter-from {
  opacity: 0;
  transform: translateX(45px) scale(0.9);
}
.stagger-filter-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.85);
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

.expand-text-enter-active,
.expand-text-leave-active {
  transition: all 0.25s ease;
}
.expand-text-enter-from,
.expand-text-leave-to {
  opacity: 0;
  max-width: 0;
  transform: scaleX(0.8);
}
.expand-text-enter-to,
.expand-text-leave-from {
  opacity: 1;
  max-width: 200px;
  transform: scaleX(1);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
