import { ref, computed } from 'vue';
import { kanjiWritingEntries, kanjiLessonList } from '../data/kanjiWritingPrompts';

export function useKanjiLessonPanel(getMasteryStreak: (char: string) => number) {
  const selectedKanjiLessonNumber = ref<number>(0);

  const activeKanjiLessonNumber = computed(() => {
    if (selectedKanjiLessonNumber.value && selectedKanjiLessonNumber.value > 0) {
      return selectedKanjiLessonNumber.value;
    }
    for (const les of kanjiLessonList) {
      const entries = kanjiWritingEntries.filter(e => e.primaryLessonNumber === les.lessonNumber);
      const allMastered = entries.every(e => getMasteryStreak(e.kanji) >= 3);
      if (!allMastered) return les.lessonNumber;
    }
    return 1;
  });

  const currentKanjiLessonLabel = computed(() => {
    if (selectedKanjiLessonNumber.value === 0) {
      return `Semua (Pelajaran ${activeKanjiLessonNumber.value})`;
    }
    return `Pelajaran ${activeKanjiLessonNumber.value}`;
  });

  const currentKanjiLessonStats = computed(() => {
    const entries = kanjiWritingEntries.filter(e => e.primaryLessonNumber === activeKanjiLessonNumber.value);
    const total = entries.length;
    const mastered = entries.filter(e => getMasteryStreak(e.kanji) >= 3).length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, percentage };
  });

  return {
    selectedKanjiLessonNumber,
    activeKanjiLessonNumber,
    currentKanjiLessonLabel,
    currentKanjiLessonStats
  };
}
