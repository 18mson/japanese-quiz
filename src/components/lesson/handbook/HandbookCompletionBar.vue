<script setup lang="ts">
import { computed } from 'vue';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Trophy 
} from '@lucide/vue';
import type { HandbookTabItem, HandbookTabId } from './types';
import { useLessonStore } from '../../../stores/lessonStore';

const props = defineProps<{
  lessonNumber: number;
  activeTab: HandbookTabId;
  activeTabInfo: HandbookTabItem;
  tabs: HandbookTabItem[];
}>();

const emit = defineEmits<{
  (e: 'selectTab', tabId: HandbookTabId): void;
  (e: 'nextLesson'): void;
}>();

const lessonStore = useLessonStore();

const isCompleted = computed(() => {
  return lessonStore.isCategoryCompleted(props.lessonNumber, props.activeTab);
});

const handleToggle = () => {
  lessonStore.toggleCategoryCompletion(props.lessonNumber, props.activeTab);
};

// Chapter overall completed stats
const chapterStats = computed(() => {
  return lessonStore.getChapterCompletedStats(props.lessonNumber);
});

const isChapterFullyCompleted = computed(() => {
  return chapterStats.value.isFullyCompleted;
});

// Tab sequence navigation
const currentIndex = computed(() => {
  return props.tabs.findIndex(t => t.id === props.activeTab);
});

const nextTab = computed<HandbookTabItem | null>(() => {
  if (currentIndex.value >= 0 && currentIndex.value < props.tabs.length - 1) {
    return props.tabs[currentIndex.value + 1];
  }
  return null;
});

const firstUncompletedTab = computed<HandbookTabItem | null>(() => {
  return props.tabs.find(t => !lessonStore.isCategoryCompleted(props.lessonNumber, t.id)) || null;
});

const handleNextAction = () => {
  if (isChapterFullyCompleted.value) {
    emit('nextLesson');
  } else if (nextTab.value) {
    emit('selectTab', nextTab.value.id);
  } else if (firstUncompletedTab.value) {
    emit('selectTab', firstUncompletedTab.value.id);
  } else {
    emit('nextLesson');
  }
};
</script>

<template>
  <div class="w-full pt-6 pb-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center sm:justify-end gap-3 sm:gap-4 select-none">
    <!-- Teks Keterangan (Di Kiri Tombol pada Desktop, Tengah pada Mobile) -->
    <div class="text-center sm:text-right px-2 sm:px-0">
      <div 
        v-if="isCompleted" 
        class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
      >
        <Trophy v-if="isChapterFullyCompleted" class="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
        <CheckCircle2 v-else class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span>
          {{ isChapterFullyCompleted 
            ? `Semua materi Bab ${lessonNumber} selesai! (${chapterStats.completed}/${chapterStats.total})` 
            : `Materi telah dipelajari (${chapterStats.completed}/${chapterStats.total} materi Bab ${lessonNumber})` 
          }}
        </span>
      </div>
      <p 
        v-else 
        class="text-xs text-slate-500 dark:text-slate-400 font-medium"
      >
        Sudah selesai membaca materi ini? Tandai sudah dipelajari untuk melanjutkan.
      </p>
    </div>

    <!-- Tombol Aksi (Rata Kanan pada Desktop, Maksimal 2 Tombol, Tombol Lanjut HANYA Muncul Saat Sudah Dicentang) -->
    <div class="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
      <!-- 1. Tombol Centang: Tandai Sudah Dipelajari / Sudah Dimengerti -->
      <button
        type="button"
        @click="handleToggle"
        :class="[
          'w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 border select-none',
          isCompleted
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/25'
            : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-2xs'
        ]"
      >
        <CheckCircle2 v-if="isCompleted" class="w-4 h-4 text-emerald-100 shrink-0" />
        <Circle v-else class="w-4 h-4 text-slate-400 shrink-0" />
        <span>{{ isCompleted ? 'Sudah Dimengerti' : 'Tandai Sudah Dipelajari' }}</span>
      </button>

      <!-- 2. Tombol Lanjut (HANYA MUNCUL KETIKA SUDAH DICENTANG) -->
      <Transition name="fade-slide">
        <button
          v-if="isCompleted"
          type="button"
          @click="handleNextAction"
          :class="[
            'w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-95 border select-none',
            isChapterFullyCompleted
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white border-emerald-400/40 shadow-emerald-600/25 ring-2 ring-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 shadow-indigo-600/25'
          ]"
        >
          <Trophy v-if="isChapterFullyCompleted" class="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
          
          <span>
            <template v-if="isChapterFullyCompleted">
              {{ lessonNumber >= 25 ? 'Semua Bab Selesai' : `Lanjut ke Bab ${lessonNumber + 1}` }}
            </template>
            <template v-else-if="nextTab">
              Kategori Berikutnya ({{ nextTab.name }})
            </template>
            <template v-else-if="firstUncompletedTab">
              Ke {{ firstUncompletedTab.name }}
            </template>
            <template v-else>
              Lanjut ke Bab {{ lessonNumber + 1 }}
            </template>
          </span>

          <ArrowRight class="w-4 h-4 shrink-0" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
