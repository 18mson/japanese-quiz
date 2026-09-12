<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
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

// Kanji Lesson Pagination State (2 on narrow mobile, 3 on standard mobile, 4 on desktop)
const kanjiLessonStartIndex = ref(0);
const kanjiPageSize = computed(() => {
  if (isSmallScreen.value) return 2;
  if (isMobile.value) return 3;
  return 4;
});

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
  <div class="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 w-full animate-fadeIn">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs font-jp">
          漢
        </div>
        <div>
          <div class="text-xs font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>Target Menulis:</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              {{ quizStore.currentKanjiLessonLabel }}
            </span>
          </div>
          <div class="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
            {{ quizStore.currentKanjiLessonStats.mastered }} / {{ quizStore.currentKanjiLessonStats.total }} kanji dikuasai ({{ quizStore.currentKanjiLessonStats.percentage }}%)
          </div>
        </div>
      </div>
    </div>

    <!-- Lesson Selector: Sticky "Semua" + Paginated Lessons with Prev/Next buttons -->
    <div class="flex items-center gap-1 sm:gap-1.5 w-full pt-0.5">
      <!-- Sticky "Semua" Pill -->
      <button
        type="button"
        @click.stop="selectLesson(0)"
        :class="[
          'py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1 sm:gap-1.5 shadow-2xs',
          quizStore.selectedKanjiLessonNumber === 0
            ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-xs scale-[1.02]'
            : 'bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border-gray-200/80 dark:border-slate-700/80'
        ]"
      >
        <span class="whitespace-nowrap">✨ Semua</span>
        <span class="hidden sm:inline text-[10px] opacity-80">(1–25)</span>
      </button>

      <div class="w-px h-6 bg-gray-200 dark:bg-slate-700 shrink-0 mx-0.5"></div>

      <!-- Prev Button -->
      <button
        type="button"
        @click.stop="prevKanjiLessons"
        :disabled="!canPrevKanjiLessons"
        class="p-2 sm:p-2 rounded-xl border border-gray-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-2xs"
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
            'flex-1 py-2 px-1 sm:px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1 shadow-2xs min-w-0',
            quizStore.selectedKanjiLessonNumber === les.lessonNumber
              ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-xs scale-[1.02]'
              : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border-gray-200/80 dark:border-slate-700/80'
          ]"
        >
          <span class="truncate font-semibold text-[11px] sm:text-xs">
            {{ isMobile ? `Pel. ${les.lessonNumber}` : les.lesson }}
          </span>
          <span class="hidden sm:inline text-[10px] opacity-80 shrink-0">({{ les.count }})</span>
        </button>
      </div>

      <!-- Next Button -->
      <button
        type="button"
        @click.stop="nextKanjiLessons"
        :disabled="!canNextKanjiLessons"
        class="p-2 sm:p-2 rounded-xl border border-gray-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer shrink-0 shadow-2xs"
        title="Pelajaran Berikutnya"
      >
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
