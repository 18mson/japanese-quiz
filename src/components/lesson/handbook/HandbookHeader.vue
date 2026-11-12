<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Search, 
  X, 
  Sun, 
  Moon, 
  Monitor,
  CheckCircle2
} from '@lucide/vue';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useLessonStore } from '../../../stores/lessonStore';

const props = defineProps<{
  currentLessonNumber: number;
  isChapterDropdownOpen: boolean;
  searchQuery: string;
  isMobileSearchOpen: boolean;
}>();

const lessonStore = useLessonStore();
const isCurrentLessonCompleted = computed(() => {
  return lessonStore.isChapterFullyCompleted(props.currentLessonNumber);
});

const emit = defineEmits<{
  (e: 'exit'): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'toggleChapterDropdown'): void;
  (e: 'prevLesson'): void;
  (e: 'nextLesson'): void;
  (e: 'toggleMobileSearch'): void;
}>();

const settingsStore = useSettingsStore();
const searchInputRef = ref<HTMLInputElement | null>(null);

const cycleTheme = () => {
  if (settingsStore.isDarkMode) {
    settingsStore.setThemeMode('light');
  } else {
    settingsStore.setThemeMode('dark');
  }
};

defineExpose({
  focusSearch: () => {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
});
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-2.5 sm:px-4 h-[60px] min-h-[60px] flex items-center justify-between gap-1.5 sm:gap-3 flex-shrink-0">
    <!-- Left: Back Button & Breadcrumb -->
    <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
      <button
        type="button"
        @click="emit('exit')"
        class="h-10 min-w-[40px] sm:h-9 sm:min-w-0 px-2.5 sm:px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        title="Kembali ke Beranda"
      >
        <ArrowLeft class="w-4 h-4 text-torii" />
        <span class="hidden sm:inline font-extrabold">Kembali</span>
      </button>

      <div class="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
        <BookOpen class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>Buku Materi</span>
        <span class="text-slate-300 dark:text-slate-600">/</span>
        <span class="text-indigo-700 dark:text-indigo-300">Minna no Nihongo</span>
      </div>
    </div>

    <!-- Center: Chapter Selector Stepper & Trigger (Flex on mobile to prevent collisions, centered on sm+) -->
    <div 
      :class="[
        'flex items-center gap-1 sm:gap-2 shrink-0 z-10 transition-opacity duration-150 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2',
        isMobileSearchOpen 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100'
      ]"
    >
      <button
        type="button"
        @click="emit('prevLesson')"
        :disabled="currentLessonNumber <= 1"
        class="w-9 h-10 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer active:scale-95"
        title="Bab Sebelumnya"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Chapter Button Trigger -->
      <button
        id="chapter-dropdown-trigger"
        type="button"
        @click="emit('toggleChapterDropdown')"
        :class="[
          'h-10 sm:h-9 px-2.5 sm:px-3 rounded-xl border font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer active:scale-95',
          isChapterDropdownOpen
            ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500'
            : (isCurrentLessonCompleted
                ? 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700/70 text-emerald-800 dark:text-emerald-200'
                : 'bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-750 border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-200')
        ]"
      >
        <CheckCircle2 v-if="isCurrentLessonCompleted" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span :class="['font-jp font-bold', isChapterDropdownOpen ? 'text-white' : (isCurrentLessonCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-torii')]">第{{ currentLessonNumber }}課</span>
        <span class="hidden sm:inline" :class="isChapterDropdownOpen ? 'text-white' : (isCurrentLessonCompleted ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-800 dark:text-slate-100')">· Bab {{ currentLessonNumber }}</span>
        <ChevronDown :class="['w-3.5 h-3.5 transition-transform duration-200 shrink-0', isChapterDropdownOpen ? 'text-white rotate-180' : 'text-indigo-500 dark:text-indigo-400']" />
      </button>

      <button
        type="button"
        @click="emit('nextLesson')"
        :disabled="currentLessonNumber >= 25"
        class="w-9 h-10 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer active:scale-95"
        title="Bab Berikutnya"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Right: Search Input Bar & Theme Switcher -->
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 sm:ml-auto z-10">
      <!-- Mobile Search Overlay (Melebar dan fokus aktif saat diklik) -->
      <Transition name="expand-search">
        <div
          v-if="isMobileSearchOpen"
          class="sm:hidden absolute inset-x-2.5 top-2 bottom-2 z-20 bg-white dark:bg-slate-900 flex items-center gap-2 px-3 rounded-xl border border-indigo-400 dark:border-indigo-500 shadow-lg"
        >
          <Search class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref="searchInputRef"
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Cari pola, partikel, kosakata..."
            class="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
            @keydown.esc="emit('toggleMobileSearch')"
          />
          <button
            type="button"
            @click="emit('toggleMobileSearch')"
            class="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
            title="Tutup Pencarian"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </Transition>

      <!-- Mobile Search Button -->
      <button
        type="button"
        @click="emit('toggleMobileSearch')"
        class="sm:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer active:scale-90 shrink-0"
        :class="{ 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700': searchQuery }"
        title="Cari Materi"
      >
        <Search class="w-4 h-4" />
      </button>

      <!-- Desktop Search Bar (Persisten) -->
      <div class="hidden sm:block relative sm:w-44 md:w-56 shrink-0">
        <input
          :value="searchQuery"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Cari materi..."
          class="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-2.5 pl-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden transition"
        />
        <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <button
          v-if="searchQuery"
          type="button"
          @click="emit('update:searchQuery', '')"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Mobile Single Theme Toggle -->
      <button
        type="button"
        @click="cycleTheme"
        class="sm:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer active:scale-90 shrink-0"
        :title="`Tema: ${settingsStore.isDarkMode ? 'Dark' : 'Light'} (Klik untuk berganti)`"
      >
        <Moon v-if="settingsStore.isDarkMode" class="w-4 h-4 text-indigo-400" />
        <Sun v-else class="w-4 h-4 text-amber-500" />
      </button>

      <!-- Desktop Segmented Theme Switcher (Auto / Dark / Light) with Sliding Pill Indicator -->
      <div class="hidden sm:grid grid-cols-3 relative p-0.5 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200/80 dark:border-slate-700/80 shadow-2xs shrink-0 select-none">
        <!-- Sliding Pill Indicator -->
        <div 
          class="absolute inset-y-0.5 rounded-lg bg-white dark:bg-slate-700 border border-gray-200/90 dark:border-slate-600 shadow-xs transition-transform duration-200 ease-out pointer-events-none"
          :style="{
            width: 'calc((100% - 4px) / 3)',
            left: '2px',
            transform: `translateX(${
              settingsStore.themeMode === 'auto' ? '0%' :
              settingsStore.themeMode === 'dark' ? '100%' : '200%'
            })`
          }"
        ></div>

        <button
          id="theme-auto-btn"
          type="button"
          @click="settingsStore.setThemeMode('auto')"
          class="relative z-10 px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors duration-150"
          :class="settingsStore.themeMode === 'auto'
            ? 'text-indigo-600 dark:text-torii-light font-extrabold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          title="Ikuti Sistem / Auto"
        >
          <Monitor class="w-3.5 h-3.5 shrink-0" />
          <span class="hidden md:inline">Auto</span>
        </button>

        <button
          id="theme-dark-btn"
          type="button"
          @click="settingsStore.setThemeMode('dark')"
          class="relative z-10 px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors duration-150"
          :class="settingsStore.themeMode === 'dark'
            ? 'text-indigo-600 dark:text-torii-light font-extrabold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          title="Mode Gelap / Dark"
        >
          <Moon class="w-3.5 h-3.5 shrink-0" />
          <span class="hidden md:inline">Dark</span>
        </button>

        <button
          id="theme-light-btn"
          type="button"
          @click="settingsStore.setThemeMode('light')"
          class="relative z-10 px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors duration-150"
          :class="settingsStore.themeMode === 'light'
            ? 'text-indigo-600 dark:text-torii-light font-extrabold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'"
          title="Mode Terang / Light"
        >
          <Sun class="w-3.5 h-3.5 shrink-0" />
          <span class="hidden md:inline">Light</span>
        </button>
      </div>
    </div>
  </header>
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
</style>
