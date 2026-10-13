<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Layers, Compass, Languages, Table2, Sparkles } from '@lucide/vue';
import { 
  lessonGrammarBookData, 
  getLessonChapterData, 
  LessonGrammarChapter 
} from '../../data/lessonGrammarBook';
import { wordsData, JapaneseWord } from '../../data/words';
import { useQuizStore } from '../../stores/quizStore';

import type { HandbookTabId, HandbookTabItem } from './handbook/types';
import HandbookHeader from './handbook/HandbookHeader.vue';
import HandbookChapterDropdown from './handbook/HandbookChapterDropdown.vue';
import HandbookHeroBanner from './handbook/HandbookHeroBanner.vue';
import HandbookSidebar from './handbook/HandbookSidebar.vue';
import HandbookMobileNav from './handbook/HandbookMobileNav.vue';
import TabBunkei from './handbook/tabs/TabBunkei.vue';
import TabParticles from './handbook/tabs/TabParticles.vue';
import TabVocab from './handbook/tabs/TabVocab.vue';
import TabPhrases from './handbook/tabs/TabPhrases.vue';
import TabTables from './handbook/tabs/TabTables.vue';

const props = withDefaults(
  defineProps<{
    initialLesson?: number;
  }>(),
  {
    initialLesson: 1
  }
);

const emit = defineEmits<{
  (e: 'exit'): void;
}>();

const quizStore = useQuizStore();

// Current Selected Lesson (1 - 25)
const currentLessonNumber = ref<number>(
  props.initialLesson && props.initialLesson >= 1 && props.initialLesson <= 25 
    ? props.initialLesson 
    : (quizStore.currentLessonNumber || 1)
);

// Active Tab: 'bunkei' | 'particles' | 'vocab' | 'phrases' | 'tables'
const activeTab = ref<HandbookTabId>('bunkei');

// Search & Filter state
const searchQuery = ref('');
const selectedVocabCategory = ref<string>('all');
const isChapterDropdownOpen = ref(false);
const isMobileSearchOpen = ref(false);
const headerRef = ref<InstanceType<typeof HandbookHeader> | null>(null);

const toggleMobileSearch = () => {
  isMobileSearchOpen.value = !isMobileSearchOpen.value;
  if (isMobileSearchOpen.value) {
    headerRef.value?.focusSearch();
  } else {
    searchQuery.value = '';
  }
};

// Active FAB color matching currently active category
const activeFabColorClass = computed(() => {
  switch (activeTab.value) {
    case 'particles':
      return 'bg-torii border-torii-light/40 shadow-torii/40';
    case 'vocab':
      return 'bg-matcha border-matcha-light/40 shadow-matcha/40';
    case 'phrases':
      return 'bg-amber-600 border-amber-400/40 shadow-amber-600/40';
    case 'tables':
      return 'bg-cyan-600 border-cyan-400/40 shadow-cyan-600/40';
    case 'bunkei':
    default:
      return 'bg-indigo-600 border-indigo-400/40 shadow-indigo-600/40';
  }
});

// Active Chapter Data
const currentChapter = computed<LessonGrammarChapter>(() => {
  return getLessonChapterData(currentLessonNumber.value) || lessonGrammarBookData[0];
});

// Vocabulary for current lesson
const currentLessonWords = computed<JapaneseWord[]>(() => {
  const lessonKey = `Pelajaran ${currentLessonNumber.value}`;
  return wordsData.filter(w => w.lesson === lessonKey);
});

// Categories available in current lesson's vocabulary
const vocabCategories = computed<string[]>(() => {
  const cats = new Set<string>();
  currentLessonWords.value.forEach(w => {
    if (w.category_word) {
      cats.add(w.category_word);
    }
  });
  return Array.from(cats);
});

// Filtered Vocabulary
const filteredVocabulary = computed<JapaneseWord[]>(() => {
  let list = currentLessonWords.value;
  if (selectedVocabCategory.value !== 'all') {
    list = list.filter(w => w.category_word === selectedVocabCategory.value);
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;

  return list.filter(item => {
    const romajiStr = Array.isArray(item.romaji) ? item.romaji.join(' ') : (item.romaji || '');
    return (
      item.character.toLowerCase().includes(q) ||
      item.kana.toLowerCase().includes(q) ||
      romajiStr.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q)
    );
  });
});

// Filtered Bunkei items
const filteredBunkei = computed(() => {
  const list = currentChapter.value.bunkei || [];
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;

  return list.filter(b => {
    const matchesPattern = b.pattern.toLowerCase().includes(q) || b.meaning.toLowerCase().includes(q) || b.explanation.toLowerCase().includes(q);
    const matchesExamples = b.examples.some(ex => ex.japanese.toLowerCase().includes(q) || ex.meaning.toLowerCase().includes(q) || ex.romaji.toLowerCase().includes(q));
    return matchesPattern || matchesExamples;
  });
});

// Filtered Particle guides
const filteredParticles = computed(() => {
  const list = currentChapter.value.particles || [];
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return list;

  return list.filter(p => {
    return (
      p.particle.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.explanation.toLowerCase().includes(q)
    );
  });
});

// Phrases / Situational Expressions
const situationalPhrases = computed(() => {
  return currentLessonWords.value.filter(w => w.category_word === 'Ungkapan' || w.category_word === 'Kata Seru');
});

const filteredPhrases = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return situationalPhrases.value;
  return situationalPhrases.value.filter(p => {
    const romajiStr = Array.isArray(p.romaji) ? p.romaji.join(' ') : (p.romaji || '');
    return (
      p.character.toLowerCase().includes(q) ||
      p.kana.toLowerCase().includes(q) ||
      romajiStr.toLowerCase().includes(q) ||
      p.meaning.toLowerCase().includes(q)
    );
  });
});

// Sidebar & Mobile Navigation State
const scrollContainerRef = ref<HTMLElement | null>(null);
const isScrolledToBottom = ref(false);
const isMobileFilterListOpen = ref(false);

const availableTabs = computed<HandbookTabItem[]>(() => {
  const tabs: HandbookTabItem[] = [
    {
      id: 'bunkei',
      name: 'Pola & Rumus',
      jpName: '文型 · Rumus Kalimat',
      icon: Layers,
      count: currentChapter.value.bunkei?.length || 0,
      activeClass: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border-indigo-600 dark:border-indigo-500',
      color: 'indigo'
    },
    {
      id: 'particles',
      name: 'Partikel & Kaidah',
      jpName: '助詞 · Tata Bahasa',
      icon: Compass,
      count: currentChapter.value.particles?.length || 0,
      activeClass: 'bg-torii text-white shadow-md shadow-torii/30 border-torii dark:border-torii',
      color: 'torii'
    },
    {
      id: 'vocab',
      name: 'Kosakata Bab',
      jpName: '単語 · Kosakata Resmi',
      icon: Languages,
      count: currentLessonWords.value.length,
      activeClass: 'bg-matcha text-white shadow-md shadow-matcha/30 border-matcha dark:border-matcha',
      color: 'matcha'
    },
    {
      id: 'phrases',
      name: 'Ungkapan & Percakapan',
      jpName: '会話 · Kaiwa & Frasa',
      icon: Sparkles,
      count: situationalPhrases.value.length,
      activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border-amber-600 dark:border-amber-500',
      color: 'amber'
    }
  ];

  if (currentChapter.value.tables && currentChapter.value.tables.length > 0) {
    tabs.push({
      id: 'tables',
      name: 'Lampiran Khusus',
      jpName: '付録 · Tabel Ringkasan',
      icon: Table2,
      count: currentChapter.value.tables.length,
      activeClass: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border-cyan-600 dark:border-cyan-500',
      color: 'cyan'
    });
  }

  return tabs;
});

const activeTabInfo = computed<HandbookTabItem>(() => {
  return availableTabs.value.find(t => t.id === activeTab.value) || availableTabs.value[0];
});

const handleScroll = () => {
  const el = scrollContainerRef.value;
  let scrollTop = 0;
  let scrollHeight = 0;
  let clientHeight = 0;

  if (el && el.scrollHeight > el.clientHeight) {
    scrollTop = el.scrollTop;
    scrollHeight = el.scrollHeight;
    clientHeight = el.clientHeight;
  } else if (typeof window !== 'undefined') {
    scrollTop = window.scrollY || document.documentElement.scrollTop;
    scrollHeight = document.documentElement.scrollHeight;
    clientHeight = window.innerHeight;
  }

  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  
  if (scrollHeight > clientHeight + 80) {
    isScrolledToBottom.value = distanceFromBottom <= 140;
  } else {
    isScrolledToBottom.value = false;
  }
};

const selectTab = (tabId: HandbookTabId) => {
  activeTab.value = tabId;
  isMobileFilterListOpen.value = false;
  scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
  isScrolledToBottom.value = false;
};

// Navigation Handlers
const goToPreviousLesson = () => {
  if (currentLessonNumber.value > 1) {
    currentLessonNumber.value--;
    searchQuery.value = '';
    selectedVocabCategory.value = 'all';
    scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
    isScrolledToBottom.value = false;
  }
};

const goToNextLesson = () => {
  if (currentLessonNumber.value < 25) {
    currentLessonNumber.value++;
    searchQuery.value = '';
    selectedVocabCategory.value = 'all';
    scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
    isScrolledToBottom.value = false;
  }
};

const selectLesson = (num: number) => {
  currentLessonNumber.value = num;
  isChapterDropdownOpen.value = false;
  searchQuery.value = '';
  selectedVocabCategory.value = 'all';
  scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
  isScrolledToBottom.value = false;
};

// Sync when props change
watch(() => props.initialLesson, (newVal) => {
  if (newVal && newVal >= 1 && newVal <= 25) {
    currentLessonNumber.value = newVal;
  }
});

onMounted(() => {
  scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div 
    ref="scrollContainerRef"
    @scroll="handleScroll"
    class="w-full h-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col overflow-y-auto select-none transition-colors duration-200 relative"
  >
    <!-- TOP STICKY APP BAR / HEADER -->
    <HandbookHeader
      ref="headerRef"
      :current-lesson-number="currentLessonNumber"
      :is-chapter-dropdown-open="isChapterDropdownOpen"
      :search-query="searchQuery"
      :is-mobile-search-open="isMobileSearchOpen"
      @exit="emit('exit')"
      @update:search-query="(val) => searchQuery = val"
      @toggle-chapter-dropdown="isChapterDropdownOpen = !isChapterDropdownOpen"
      @prev-lesson="goToPreviousLesson"
      @next-lesson="goToNextLesson"
      @toggle-mobile-search="toggleMobileSearch"
    />

    <!-- Chapter Grid Modal Dropdown -->
    <HandbookChapterDropdown
      :is-open="isChapterDropdownOpen"
      :current-lesson-number="currentLessonNumber"
      @select="selectLesson"
      @close="isChapterDropdownOpen = false"
    />

    <!-- HERO CHAPTER HEADER (FULL WIDTH) -->
    <HandbookHeroBanner :chapter="currentChapter" />

    <!-- BODY WRAPPER: DESKTOP SIDEBAR + MAIN CONTENT -->
    <div class="w-full px-3 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-start gap-5 lg:gap-6">
      
      <!-- DESKTOP SIDEBAR (md:flex) -->
      <HandbookSidebar
        :tabs="availableTabs"
        :active-tab="activeTab"
        :current-lesson-number="currentLessonNumber"
        @select-tab="selectTab"
      />

      <!-- MAIN BODY CONTENT -->
      <main class="flex-1 min-w-0 w-full flex flex-col gap-6 pb-28 md:pb-16">
        <TabBunkei 
          v-if="activeTab === 'bunkei'" 
          :items="filteredBunkei" 
        />
        <TabParticles 
          v-else-if="activeTab === 'particles'" 
          :items="filteredParticles" 
          :grammar-notes="currentChapter.grammarNotes"
        />
        <TabVocab 
          v-else-if="activeTab === 'vocab'" 
          :words="filteredVocabulary"
          :categories="vocabCategories"
          :selected-category="selectedVocabCategory"
          :total-words-count="currentLessonWords.length"
          @select-category="(cat) => selectedVocabCategory = cat"
        />
        <TabPhrases 
          v-else-if="activeTab === 'phrases'" 
          :phrases="filteredPhrases" 
        />
        <TabTables 
          v-else-if="activeTab === 'tables'" 
          :tables="currentChapter.tables" 
        />
      </main>
    </div>

    <!-- MOBILE NAVIGATION (Floating button, staggered popup, and bottom bar) -->
    <HandbookMobileNav
      :tabs="availableTabs"
      :active-tab="activeTab"
      :active-tab-info="activeTabInfo"
      :active-fab-color-class="activeFabColorClass"
      :is-open="isMobileFilterListOpen"
      :is-scrolled-to-bottom="isScrolledToBottom"
      @toggle-open="isMobileFilterListOpen = !isMobileFilterListOpen"
      @close="isMobileFilterListOpen = false"
      @select-tab="selectTab"
    />
  </div>
</template>

<style scoped>
.expand-search-enter-active,
.expand-search-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.expand-search-enter-from,
.expand-search-leave-to {
  opacity: 0;
  transform: scaleX(0.85);
  transform-origin: right center;
}

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

.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.97);
}
.dropdown-slide-enter-to,
.dropdown-slide-leave-from {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
