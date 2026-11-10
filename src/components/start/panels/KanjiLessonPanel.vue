<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, Sparkles } from '@lucide/vue';
import { useQuizStore } from '../../../stores/quizStore';
import { kanjiLessonList } from '../../../data/kanjiWritingPrompts';

const emit = defineEmits<{
  (e: 'interact'): void;
}>();

const quizStore = useQuizStore();

// Responsive screen detection
const isMobile = ref(false);
const isSmallScreen = ref(false);

const updateResponsive = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640;
    isSmallScreen.value = window.innerWidth < 420;
  }
};

onMounted(() => {
  updateResponsive();
  window.addEventListener('resize', updateResponsive);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive);
});

// Kanji Lesson Pagination State (2 bab per view agar teks jelas dan tidak terpotong)
const kanjiLessonStartIndex = ref(0);
const kanjiPageSize = computed(() => 2);

const visibleKanjiLessons = computed(() => {
  return kanjiLessonList.slice(
    kanjiLessonStartIndex.value,
    kanjiLessonStartIndex.value + kanjiPageSize.value
  );
});

const canPrevKanjiLessons = computed(() => kanjiLessonStartIndex.value > 0);
const canNextKanjiLessons = computed(() => {
  return kanjiLessonStartIndex.value + kanjiPageSize.value < kanjiLessonList.length;
});

const prevKanjiLessons = () => {
  emit('interact');
  kanjiLessonStartIndex.value = Math.max(0, kanjiLessonStartIndex.value - kanjiPageSize.value);
};

const nextKanjiLessons = () => {
  emit('interact');
  if (canNextKanjiLessons.value) {
    kanjiLessonStartIndex.value = Math.min(
      kanjiLessonList.length - kanjiPageSize.value,
      kanjiLessonStartIndex.value + kanjiPageSize.value
    );
  }
};

const selectLesson = (lessonNumber: number) => {
  emit('interact');
  quizStore.selectedKanjiLessonNumber = lessonNumber;
};

// Auto scroll pagination to keep selected lesson in view if selected elsewhere
watch(
  () => quizStore.selectedKanjiLessonNumber,
  (newVal) => {
    if (newVal > 0) {
      const idx = kanjiLessonList.findIndex(l => l.lessonNumber === newVal);
      if (idx !== -1) {
        if (idx < kanjiLessonStartIndex.value || idx >= kanjiLessonStartIndex.value + kanjiPageSize.value) {
          kanjiLessonStartIndex.value = Math.floor(idx / kanjiPageSize.value) * kanjiPageSize.value;
        }
      }
    }
  }
);

watch(kanjiPageSize, (newSize) => {
  if (kanjiLessonStartIndex.value + newSize > kanjiLessonList.length) {
    kanjiLessonStartIndex.value = Math.max(0, kanjiLessonList.length - newSize);
  }
});
</script>

<template>
  <!-- Lesson Selector: Sticky "Semua" + Paginated Lessons with Prev/Next buttons (Tanpa Border/Header Box) -->
  <div class="flex items-center gap-1 sm:gap-1.5 w-full pt-1 animate-fadeIn">
    <!-- Sticky "Semua" Pill -->
    <button
      type="button"
      @click.stop="selectLesson(0)"
      :class="[
        'py-2 px-2 sm:px-3 rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs active:scale-95',
        quizStore.selectedKanjiLessonNumber === 0
          ? 'bg-emerald-600 dark:bg-matcha text-white border-emerald-500 dark:border-matcha font-black shadow-xs scale-[1.02]'
          : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
      ]"
    >
      <span class="whitespace-nowrap flex items-center gap-1">
        <Sparkles class="w-3.5 h-3.5 shrink-0" />
        <span>Semua</span>
      </span>
      <span class="hidden sm:inline text-[10px] opacity-80">(1–25)</span>
    </button>

    <div class="w-px h-6 bg-gray-200 dark:bg-slate-700 shrink-0 mx-0.5"></div>

    <!-- Prev Button -->
    <button
      type="button"
      @click.stop="prevKanjiLessons"
      :disabled="!canPrevKanjiLessons"
      class="p-2 sm:p-2 rounded-xl border border-gray-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-2xs flex items-center justify-center active:scale-95"
      title="Pelajaran Sebelumnya"
    >
      <ChevronLeft class="w-3.5 h-3.5" />
    </button>

    <!-- Paginated Visible Lessons -->
    <div class="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
      <button
        v-for="les in visibleKanjiLessons"
        :key="les.lessonNumber"
        type="button"
        @click.stop="selectLesson(les.lessonNumber)"
        :class="[
          'flex-1 py-2 px-1 sm:px-2 rounded-xl text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1 shadow-2xs min-w-0 active:scale-95',
          quizStore.selectedKanjiLessonNumber === les.lessonNumber
            ? 'bg-emerald-600 dark:bg-matcha text-white border-emerald-500 dark:border-matcha font-black shadow-xs scale-[1.02]'
            : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
        ]"
      >
        <span class="truncate font-semibold text-[10px] xs:text-[11px] sm:text-xs">
          {{ isMobile ? `Pel. ${les.lessonNumber}` : les.lesson }}
        </span>
        <span class="text-[9px] xs:text-[10px] opacity-80 shrink-0">({{ les.count }})</span>
      </button>
    </div>

    <!-- Next Button -->
    <button
      type="button"
      @click.stop="nextKanjiLessons"
      :disabled="!canNextKanjiLessons"
      class="p-2 sm:p-2 rounded-xl border border-gray-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-2xs flex items-center justify-center active:scale-95"
      title="Pelajaran Berikutnya"
    >
      <ChevronRight class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
