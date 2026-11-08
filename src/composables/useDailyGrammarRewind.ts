// src/composables/useDailyGrammarRewind.ts
import { ref, computed } from 'vue';
import { useLessonStore } from '../stores/lessonStore';
import { lessonGrammarBookData, type BunkeiItem, type BunkeiExample } from '../data/lessonGrammarBook';
import { getTodayWIB } from '../utils/dailyTime';

export interface DailyGrammarHighlight {
  lessonNumber: number;
  chapterTitle: string;
  chapterSubTitle: string;
  bunkeiId: string;
  pattern: string;
  formula: string;
  meaning: string;
  explanation: string;
  example: BunkeiExample;
  dateKey: string;
}

const STORAGE_COLLAPSED_KEY = 'nihongo_daily_rewind_collapsed';
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const getInitialCollapsed = (): boolean => {
  if (isBrowser) {
    try {
      return localStorage.getItem(STORAGE_COLLAPSED_KEY) === 'true';
    } catch (e) {}
  }
  return false;
};

/**
 * Hash string tanggal menjadi integer deterministik sederhana
 */
export function hashDateKey(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function useDailyGrammarRewind() {
  const lessonStore = useLessonStore();
  const isCollapsed = ref<boolean>(getInitialCollapsed());

  const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value;
    if (isBrowser) {
      try {
        localStorage.setItem(STORAGE_COLLAPSED_KEY, isCollapsed.value ? 'true' : 'false');
      } catch (e) {}
    }
  };

  /**
   * Mengumpulkan seluruh nomor bab (1-25) yang sudah dicentang dipelajari oleh user
   */
  const learnedLessonNumbers = computed<number[]>(() => {
    const list: number[] = [];
    for (let num = 1; num <= 25; num++) {
      // Bab dianggap dipelajari jika tab Bunkei dicentang atau bab selesai penuh
      if (lessonStore.isCategoryCompleted(num, 'bunkei') || lessonStore.isChapterFullyCompleted(num)) {
        list.push(num);
      }
    }
    return list;
  });

  const hasLearnedLessons = computed<boolean>(() => {
    return learnedLessonNumbers.value.length > 0;
  });

  /**
   * Kumpulan seluruh materi Pola Kalimat (Bunkei) dari bab yang sudah dipelajari
   */
  const candidateBunkeiPool = computed<Array<{ chapter: typeof lessonGrammarBookData[0]; bunkei: BunkeiItem }>>(() => {
    if (!hasLearnedLessons.value) return [];

    const pool: Array<{ chapter: typeof lessonGrammarBookData[0]; bunkei: BunkeiItem }> = [];
    const learnedSet = new Set(learnedLessonNumbers.value);

    for (const chapter of lessonGrammarBookData) {
      if (learnedSet.has(chapter.lessonNumber) && chapter.bunkei && chapter.bunkei.length > 0) {
        for (const b of chapter.bunkei) {
          if (b.examples && b.examples.length > 0) {
            pool.push({ chapter, bunkei: b });
          }
        }
      }
    }
    return pool;
  });

  /**
   * Materi dan contoh kalimat harian terpilih secara deterministik berdasarkan tanggal hari ini
   */
  const dailyHighlight = computed<DailyGrammarHighlight | null>(() => {
    if (candidateBunkeiPool.value.length === 0) return null;

    const todayStr = getTodayWIB();
    const seed = hashDateKey(todayStr);

    // 1. Pilih bunkei harian
    const bunkeiIndex = seed % candidateBunkeiPool.value.length;
    const selected = candidateBunkeiPool.value[bunkeiIndex];
    if (!selected) return null;

    // 2. Pilih contoh kalimat harian dari bunkei terpilih
    const exCount = selected.bunkei.examples.length;
    const exampleIndex = (seed >> 3) % exCount;
    const selectedExample = selected.bunkei.examples[exampleIndex] || selected.bunkei.examples[0];

    return {
      lessonNumber: selected.chapter.lessonNumber,
      chapterTitle: selected.chapter.title,
      chapterSubTitle: selected.chapter.subTitle,
      bunkeiId: selected.bunkei.id,
      pattern: selected.bunkei.pattern,
      formula: selected.bunkei.formula,
      meaning: selected.bunkei.meaning,
      explanation: selected.bunkei.explanation,
      example: selectedExample,
      dateKey: todayStr
    };
  });

  return {
    isCollapsed,
    toggleCollapsed,
    learnedLessonNumbers,
    hasLearnedLessons,
    candidateBunkeiPool,
    dailyHighlight
  };
}
