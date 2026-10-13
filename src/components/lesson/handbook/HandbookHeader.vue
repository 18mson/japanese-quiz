<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Sun, 
  Moon, 
  Monitor 
} from '@lucide/vue';
import { useSettingsStore } from '../../../stores/settingsStore';

defineProps<{
  currentLessonNumber: number;
  isChapterDropdownOpen: boolean;
  searchQuery: string;
  isMobileSearchOpen: boolean;
}>();

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
  <header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 shadow-xs flex-shrink-0">
    <!-- Left: Back Button & Breadcrumb -->
    <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
      <button
        type="button"
        @click="emit('exit')"
        class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-gray-200/90 dark:border-slate-700/80 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 shrink-0"
        title="Kembali ke Beranda"
      >
        <ArrowLeft class="w-4 h-4 text-torii" />
        <span class="hidden sm:inline font-extrabold">Kembali</span>
      </button>

      <div class="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
        <BookOpen class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>Buku Materi</span>
        <span class="text-slate-300 dark:text-slate-600">/</span>
        <span class="text-indigo-700 dark:text-indigo-300">Minna no Nihongo</span>
      </div>
    </div>

    <!-- Center: Chapter Selector Stepper & Trigger (Persis di tengah) -->
    <div 
      :class="[
        'flex items-center gap-1 sm:gap-2 shrink-0 z-10 transition-all duration-150',
        isMobileSearchOpen 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2'
      ]"
    >
      <button
        type="button"
        @click="emit('prevLesson')"
        :disabled="currentLessonNumber <= 1"
        class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
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
          'px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border font-black text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition cursor-pointer shadow-2xs active:scale-95',
          isChapterDropdownOpen
            ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500 shadow-md shadow-indigo-600/30'
            : 'bg-indigo-50/90 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-750 border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-200'
        ]"
      >
        <span :class="['font-jp font-bold', isChapterDropdownOpen ? 'text-white' : 'text-torii']">第{{ currentLessonNumber }}課</span>
        <span class="hidden sm:inline" :class="isChapterDropdownOpen ? 'text-white' : 'text-slate-800 dark:text-slate-100'">· Bab {{ currentLessonNumber }}</span>
        <span :class="['text-[10px] transition-transform duration-200', isChapterDropdownOpen ? 'text-white rotate-180' : 'text-indigo-500 dark:text-indigo-400']">▼</span>
      </button>

      <button
        type="button"
        @click="emit('nextLesson')"
        :disabled="currentLessonNumber >= 25"
        class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
        title="Bab Berikutnya"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Right: Search Input Bar & Theme Switcher -->
    <div class="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto z-10">
      <!-- Mobile Search Overlay (Melebar dan fokus aktif saat diklik) -->
      <Transition name="expand-search">
        <div
          v-if="isMobileSearchOpen"
          class="sm:hidden absolute inset-x-2 top-2 bottom-2 z-20 bg-white dark:bg-slate-900 flex items-center gap-2 px-2.5 rounded-xl border border-indigo-400 dark:border-indigo-500 shadow-lg"
        >
          <Search class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref="searchInputRef"
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Cari materi bab..."
            class="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
            @keydown.esc="emit('toggleMobileSearch')"
          />
          <button
            type="button"
            @click="emit('toggleMobileSearch')"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shrink-0 active:scale-95"
            title="Tutup Pencarian"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </Transition>

      <!-- Mobile Search Button (Hanya tombol saat normal) -->
      <button
        type="button"
        @click="emit('toggleMobileSearch')"
        class="sm:hidden px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 border border-gray-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-90 shrink-0"
        :class="{ 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800': searchQuery }"
        title="Cari Materi"
      >
        <Search class="w-3.5 h-3.5" />
      </button>

      <!-- Desktop Search Bar (Persisten) -->
      <div class="hidden sm:block relative sm:w-44 md:w-56 shrink-0">
        <input
          :value="searchQuery"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Cari materi..."
          class="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl px-2.5 pl-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden transition shadow-inner"
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

      <!-- Mobile Single Theme Toggle (Terganti bergantian saat di-click) -->
      <button
        type="button"
        @click="cycleTheme"
        class="sm:hidden px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 border border-gray-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-90 shrink-0"
        :title="`Tema: ${settingsStore.isDarkMode ? 'Dark' : 'Light'} (Klik untuk berganti)`"
      >
        <Moon v-if="settingsStore.isDarkMode" class="w-3.5 h-3.5 text-indigo-400" />
        <Sun v-else class="w-3.5 h-3.5 text-amber-500" />
      </button>

      <!-- Desktop Segmented Theme Switcher (Auto / Dark / Light) -->
      <div class="hidden sm:flex items-center p-0.5 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200/80 dark:border-slate-700/80 shadow-2xs shrink-0">
        <button
          id="theme-auto-btn"
          type="button"
          @click="settingsStore.setThemeMode('auto')"
          :class="[
            'px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer select-none',
            settingsStore.themeMode === 'auto'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-torii-light shadow-2xs font-extrabold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
          ]"
          title="Ikuti Sistem / Auto"
        >
          <Monitor class="w-3.5 h-3.5 shrink-0" />
          <span class="hidden md:inline">Auto</span>
        </button>
        <button
          id="theme-dark-btn"
          type="button"
          @click="settingsStore.setThemeMode('dark')"
          :class="[
            'px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer select-none',
            settingsStore.themeMode === 'dark'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-torii-light shadow-2xs font-extrabold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
          ]"
          title="Mode Gelap / Dark"
        >
          <Moon class="w-3.5 h-3.5 shrink-0" />
          <span class="hidden md:inline">Dark</span>
        </button>
        <button
          id="theme-light-btn"
          type="button"
          @click="settingsStore.setThemeMode('light')"
          :class="[
            'px-1.5 sm:px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer select-none',
            settingsStore.themeMode === 'light'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-torii-light shadow-2xs font-extrabold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
          ]"
          title="Mode Terang / Light"
        >
          <Sun class="w-3.5 h-3.5 shrink-0" />
          <span class="hidden md:inline">Light</span>
        </button>
      </div>
    </div>
  </header>
</template>
