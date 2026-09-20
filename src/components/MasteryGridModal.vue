<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import { kanjiN5Data } from '../data/kanji';
import MasteryCard from './mastery/MasteryCard.vue';
import MasteryFilterBar from './mastery/MasteryFilterBar.vue';
import MasteryPreviewModal from './mastery/MasteryPreviewModal.vue';
import { toRomaji, toHiragana, toKatakana } from 'wanakana';
import { 
  X, 
  Award, 
  Zap, 
  Sparkles, 
  RotateCcw,
  SearchX,
  Edit3,
  Check,
  CheckSquare,
  AlertTriangle,
  Loader2
} from '@lucide/vue';
import { watch } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'startWeakQuiz']);
const quizStore = useQuizStore();

// Filter States
const activeCategory = ref<'hiragana' | 'katakana' | 'words' | 'kanji'>('hiragana');
const activeSubtype = ref<string>('all');
const activeStatusFilter = ref<'all' | 'new' | 'learning' | 'mastered' | 'crown'>('all');
const searchQuery = ref<string>('');
const filterBarRef = ref<InstanceType<typeof MasteryFilterBar> | null>(null);

// Bulk Edit Mode States
const isEditMode = ref<boolean>(false);
const selectedCharacters = ref<Set<string>>(new Set());
const targetTier = ref<'new' | 'learning' | 'mastered' | 'crown'>('mastered');
const showConfirmModal = ref<boolean>(false);
const isApplying = ref<boolean>(false);

const tierLabelsMap: Record<'new' | 'learning' | 'mastered' | 'crown', string> = {
  new: 'Belum Dipelajari',
  learning: 'Sedang Belajar (Streak 1)',
  mastered: 'Hafal / Mastered (Streak 3)',
  crown: 'Mahkota / Crown (Streak 5)'
};

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
  if (!isEditMode.value) {
    clearSelection();
  }
};

const handleToggleSelect = (character: string) => {
  const next = new Set(selectedCharacters.value);
  if (next.has(character)) {
    next.delete(character);
  } else {
    next.add(character);
  }
  selectedCharacters.value = next;
};

const clearSelection = () => {
  selectedCharacters.value = new Set();
};

const isAllVisibleSelected = computed(() => {
  if (filteredItems.value.length === 0) return false;
  return filteredItems.value.every(item => selectedCharacters.value.has(item.character));
});

const toggleSelectAllVisible = () => {
  const next = new Set(selectedCharacters.value);
  if (isAllVisibleSelected.value) {
    filteredItems.value.forEach(item => {
      next.delete(item.character);
    });
  } else {
    filteredItems.value.forEach(item => {
      next.add(item.character);
    });
  }
  selectedCharacters.value = next;
};

const handleApplyBulkUpdate = async () => {
  if (selectedCharacters.value.size === 0) {
    showConfirmModal.value = false;
    return;
  }
  isApplying.value = true;
  try {
    const chars = Array.from(selectedCharacters.value);
    await quizStore.bulkUpdateMasteryTier(chars, targetTier.value);
  } catch (e) {
    console.error('Error applying bulk mastery update:', e);
  } finally {
    showConfirmModal.value = false;
    clearSelection();
    isEditMode.value = false;
    isApplying.value = false;
  }
};

watch(activeCategory, () => {
  clearSelection();
});

const closeDropdowns = () => {
  filterBarRef.value?.closeDropdowns();
};

const availableLessons = computed(() => {
  const lessons = Array.from(new Set(wordsData.map(w => w.lesson).filter(Boolean))) as string[];
  return lessons.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });
});

const matchesQuery = (item: any, q: string, qHira: string, qKata: string, qRom: string): boolean => {
  if (!q) return true;

  // 1. Character match
  if (item.character) {
    const charLower = item.character.toLowerCase();
    if (charLower.includes(q) || (qHira && charLower.includes(qHira)) || (qKata && charLower.includes(qKata))) {
      return true;
    }
  }

  // 2. Romaji match (supports string and array)
  if (item.romaji) {
    if (typeof item.romaji === 'string') {
      const romLower = item.romaji.toLowerCase();
      if (romLower.includes(q) || (qRom && romLower.includes(qRom))) return true;
    } else if (Array.isArray(item.romaji)) {
      if (item.romaji.some((r: string) => {
        const rLower = r.toLowerCase();
        return rLower.includes(q) || (qRom && rLower.includes(qRom));
      })) {
        return true;
      }
    }
  }

  // 3. Kana match (furigana / reading)
  if (item.kana) {
    const kanaLower = item.kana.toLowerCase();
    if (kanaLower.includes(q) || (qHira && kanaLower.includes(qHira)) || (qKata && kanaLower.includes(qKata))) {
      return true;
    }
  }

  // 4. Meaning match (Indonesian translation)
  if (item.meaning && item.meaning.toLowerCase().includes(q)) {
    return true;
  }

  // 5. Lesson or category_word match
  if (item.lesson && item.lesson.toLowerCase().includes(q)) {
    return true;
  }
  if (item.category_word && item.category_word.toLowerCase().includes(q)) {
    return true;
  }

  // 6. Onyomi & Kunyomi match (for Kanji)
  if (Array.isArray(item.onyomi)) {
    if (item.onyomi.some((o: string) => o.toLowerCase().includes(q) || (qKata && o.includes(qKata)) || (qHira && toHiragana(o).includes(qHira)))) {
      return true;
    }
  }
  if (Array.isArray(item.kunyomi)) {
    if (item.kunyomi.some((k: string) => k.toLowerCase().includes(q) || (qHira && k.includes(qHira)))) {
      return true;
    }
  }
  if (Array.isArray(item.examples)) {
    if (item.examples.some((ex: string) => ex.toLowerCase().includes(q) || (qHira && ex.includes(qHira)))) {
      return true;
    }
  }

  return false;
};

const currentGroupItems = computed(() => {
  let pool: any[] = activeCategory.value === 'hiragana' 
    ? hiraganaData 
    : activeCategory.value === 'katakana' 
    ? katakanaData 
    : activeCategory.value === 'kanji'
    ? kanjiN5Data
    : wordsData;

  if (activeSubtype.value !== 'all') {
    if (activeCategory.value === 'words') {
      pool = pool.filter(w => w.lesson === activeSubtype.value);
    } else if (activeCategory.value === 'kanji') {
      pool = pool.filter(k => k.group === activeSubtype.value);
    } else {
      pool = pool.filter(c => c.type === activeSubtype.value);
    }
  }

  return pool;
});

const allCategoryItems = computed(() => {
  return activeCategory.value === 'hiragana' 
    ? hiraganaData 
    : activeCategory.value === 'katakana' 
    ? katakanaData 
    : activeCategory.value === 'kanji'
    ? kanjiN5Data
    : wordsData;
});

const totalCategoryMatches = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return 0;
  const qHira = toHiragana(query);
  const qKata = toKatakana(query);
  const qRom = toRomaji(query).toLowerCase();
  return allCategoryItems.value.filter(item => matchesQuery(item, query, qHira, qKata, qRom)).length;
});

const filteredItems = computed(() => {
  let pool = currentGroupItems.value;

  if (activeStatusFilter.value !== 'all') {
    pool = pool.filter(item => quizStore.getMasteryTier(item.character) === activeStatusFilter.value);
  }

  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    const qHira = toHiragana(query);
    const qKata = toKatakana(query);
    const qRom = toRomaji(query).toLowerCase();
    pool = pool.filter(item => matchesQuery(item, query, qHira, qKata, qRom));
  }

  return pool;
});

const unmasteredCount = computed(() => {
  return currentGroupItems.value.filter(item => quizStore.getMasteryStreak(item.character) < 3).length;
});

const isAllAttempted = computed(() => {
  const pool = currentGroupItems.value;
  if (pool.length === 0) return false;
  const newCount = pool.filter(item => quizStore.getMasteryTier(item.character) === 'new').length;
  const isAllMastered = pool.every(item => quizStore.getMasteryStreak(item.character) >= 3);
  return newCount === 0 && !isAllMastered;
});

const handleStartWeakQuiz = () => {
  emit('close');
  emit('startWeakQuiz', { type: activeCategory.value });
};

// Preview Modal State & Handlers
const selectedPreviewItem = ref<any | null>(null);
const selectedPreviewIndex = ref<number>(-1);

const openPreview = (item: any, index: number) => {
  selectedPreviewItem.value = item;
  selectedPreviewIndex.value = index;
};

const closePreview = () => {
  selectedPreviewItem.value = null;
  selectedPreviewIndex.value = -1;
};

const prevPreviewItem = () => {
  if (selectedPreviewIndex.value > 0) {
    selectedPreviewIndex.value--;
    selectedPreviewItem.value = filteredItems.value[selectedPreviewIndex.value];
  }
};

const nextPreviewItem = () => {
  if (selectedPreviewIndex.value < filteredItems.value.length - 1) {
    selectedPreviewIndex.value++;
    selectedPreviewItem.value = filteredItems.value[selectedPreviewIndex.value];
  }
};
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      @click="closeDropdowns"
      @click.self="emit('close'); closeDropdowns();"
    >
      <div 
        class="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[850px] border border-gray-100 dark:border-slate-800 animate-scaleUp relative"
        @click="closeDropdowns"
      >
        
        <!-- Modal Header -->
        <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex items-center justify-between shadow-md flex-shrink-0 relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="flex items-center gap-2.5 sm:gap-3 relative z-10">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
              <Award class="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 class="text-base sm:text-xl font-black tracking-tight">Peta Penguasaan Huruf</h2>
              <p class="hidden sm:block text-xs text-indigo-200 mt-0.5 font-medium">
                Pantau tingkat ingatan karakter dan latih huruf yang masih lemah.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 relative z-10">
            <!-- Toggle Edit Mode Button -->
            <button 
              type="button"
              @click="toggleEditMode"
              :class="[
                'px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs',
                isEditMode 
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 font-black shadow-md ring-2 ring-amber-300/60' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              ]"
              :title="isEditMode ? 'Keluar dari Mode Edit' : 'Pilih dan ubah status penguasaan secara massal'"
            >
              <Check v-if="isEditMode" class="w-3.5 h-3.5" />
              <Edit3 v-else class="w-3.5 h-3.5 text-amber-300" />
              <span class="hidden xs:inline">{{ isEditMode ? 'Selesai Edit' : 'Edit Status' }}</span>
              <span class="xs:hidden">{{ isEditMode ? 'Selesai' : 'Edit' }}</span>
            </button>

            <button 
              v-if="unmasteredCount > 0 && !isEditMode"
              @click="handleStartWeakQuiz"
              class="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer animate-pulse-slow"
            >
              <Zap class="w-3.5 h-3.5 fill-white" />
              <span>Latih {{ unmasteredCount }} Lemah</span>
            </button>

            <button 
              @click="emit('close'); closeDropdowns();"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <!-- Filter & Switcher Bar Component -->
        <MasteryFilterBar
          ref="filterBarRef"
          v-model:category="activeCategory"
          v-model:subtype="activeSubtype"
          v-model:statusFilter="activeStatusFilter"
          v-model:searchQuery="searchQuery"
          :available-lessons="availableLessons"
          :is-open="isOpen"
        />

        <!-- Edit Mode Sub-bar for Quick Selection -->
        <div 
          v-if="isEditMode" 
          class="px-3 sm:px-6 py-2 bg-indigo-50/90 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-2 flex-wrap text-xs flex-shrink-0 animate-fadeIn"
        >
          <div class="flex items-center gap-2">
            <span class="font-bold text-indigo-900 dark:text-indigo-200">
              Mode Edit Penguasaan
            </span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 font-extrabold text-[11px]">
              {{ selectedCharacters.size }} dipilih
            </span>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button"
              v-if="filteredItems.length > 0"
              @click="toggleSelectAllVisible"
              class="px-2.5 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-lg text-gray-700 dark:text-slate-200 font-bold transition flex items-center gap-1 cursor-pointer text-xs"
            >
              <CheckSquare class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{{ isAllVisibleSelected ? 'Batal Pilih Semua' : `Pilih Semua yang Tampil (${filteredItems.length})` }}</span>
            </button>

            <button 
              type="button"
              v-if="selectedCharacters.size > 0"
              @click="clearSelection"
              class="px-2.5 py-1 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 font-medium cursor-pointer text-xs"
            >
              Batal Pilih
            </button>
          </div>
        </div>

        <!-- Interactive Grid Area -->
        <div class="p-3 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-slate-950/60 min-h-0 relative">
          <Transition name="tab-fade" mode="out-in">
            <div 
              :key="activeCategory + '_' + activeSubtype + '_' + activeStatusFilter + (searchQuery ? '_' + searchQuery : '')"
              class="w-full"
            >
              <div 
                v-if="filteredItems.length > 0"
                :class="[
                  'grid gap-2 sm:gap-3 pb-16',
                  activeCategory === 'words' 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
                    : activeCategory === 'kanji'
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
                    : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
                ]"
              >
                <MasteryCard 
                  v-for="(item, index) in filteredItems" 
                  :key="activeCategory + '_' + item.character + '_' + (item.lesson || '') + '_' + (item.meaning || '') + '_' + index" 
                  :item="item" 
                  :category="activeCategory" 
                  :is-select-mode="isEditMode"
                  :is-selected="selectedCharacters.has(item.character)"
                  @click="openPreview(item, index)"
                  @toggle-select="handleToggleSelect(item.character)"
                />
              </div>

              <!-- Empty State -->
              <div v-else class="h-full min-h-[220px] text-center flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 py-8">
                <component 
                  :is="searchQuery.trim() ? SearchX : Sparkles" 
                  class="w-10 h-10 text-indigo-300 dark:text-indigo-500 mb-2" 
                  :class="{ 'animate-bounce': !searchQuery.trim() }" 
                />
                <h3 class="text-base font-bold text-gray-700 dark:text-slate-200">
                  {{ searchQuery.trim() ? 'Tidak ada hasil pencarian' : 'Tidak ada karakter ditemui' }}
                </h3>
                <p class="text-xs text-gray-400 dark:text-slate-400 max-w-sm mt-1 px-4">
                  <template v-if="searchQuery.trim()">
                    Tidak ada karakter atau kosakata yang cocok dengan "<span class="font-semibold text-gray-700 dark:text-slate-200">{{ searchQuery }}</span>"<span v-if="activeSubtype !== 'all'"> pada kelompok ini</span>.
                  </template>
                  <template v-else>
                    Tidak ada item yang sesuai dengan filter yang dipilih saat ini.
                  </template>
                </p>

                <div v-if="searchQuery.trim()" class="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <button 
                    v-if="activeSubtype !== 'all' && totalCategoryMatches > 0"
                    @click="activeSubtype = 'all'"
                    class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span>Cari di Semua Kelompok ({{ totalCategoryMatches }} ditemukan)</span>
                  </button>
                  <button 
                    @click="searchQuery = ''"
                    class="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Hapus Pencarian
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Floating Action Bar for Bulk Edit (Inside modal relative container) -->
        <Transition name="slide-up">
          <div 
            v-if="isEditMode && selectedCharacters.size > 0"
            class="absolute bottom-16 inset-x-3 sm:inset-x-6 z-30 pointer-events-none flex justify-center"
          >
            <div class="pointer-events-auto w-full max-w-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md border border-slate-700/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              <!-- Left: Selected Count -->
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  {{ selectedCharacters.size }}
                </span>
                <span class="text-xs sm:text-sm font-bold text-slate-100">
                  Karakter Dipilih
                </span>
              </div>

              <!-- Middle: Target Tier Selector -->
              <div class="flex items-center gap-1.5 bg-slate-800/90 dark:bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-700/60">
                <span class="text-[11px] text-slate-400 font-semibold hidden sm:inline">Tandai:</span>
                <select 
                  v-model="targetTier"
                  class="bg-transparent text-amber-300 text-xs font-bold py-0.5 px-1 rounded-lg border-none focus:ring-1 focus:ring-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="new" class="bg-slate-900 text-slate-200">🔴 Belum (Reset ke 0)</option>
                  <option value="learning" class="bg-slate-900 text-slate-200">🟡 Proses (Streak 1)</option>
                  <option value="mastered" class="bg-slate-900 text-slate-200">🟢 Mastered (Streak 3)</option>
                  <option value="crown" class="bg-slate-900 text-slate-200">👑 Crown (Streak 5)</option>
                </select>
              </div>

              <!-- Right: Buttons -->
              <div class="flex items-center gap-1.5 sm:gap-2 ml-auto">
                <button 
                  type="button" 
                  @click="clearSelection" 
                  class="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  @click="showConfirmModal = true"
                  class="px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check class="w-4 h-4" />
                  <span>Terapkan</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Notice Banner for 0% Belum but incomplete mastery -->
        <div v-if="isAllAttempted" class="mx-4 sm:mx-6 mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2 flex-shrink-0 animate-fadeIn">
          <Sparkles class="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{{ activeCategory === 'words' ? 'Semua kosakata di materi ini sudah dipelajari — lanjut asah yang masih Proses, atau coba bab lain.' : (activeCategory === 'kanji' ? 'Semua kanji di kelompok ini sudah dipelajari — terus tingkatkan hingga Crown!' : 'Semua huruf di kelompok ini sudah dipelajari — lanjut asah yang masih Proses, atau coba kelompok lain.') }}</span>
        </div>

        <!-- Footer -->
        <div class="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-medium flex-shrink-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-500 dark:text-slate-400 font-semibold">
              Menampilkan <strong class="text-gray-900 dark:text-slate-100">{{ filteredItems.length }}</strong> karakter
            </span>
            <button
              v-if="activeSubtype !== 'all' || activeStatusFilter !== 'all' || searchQuery.trim() !== ''"
              @click="activeSubtype = 'all'; activeStatusFilter = 'all'; searchQuery = '';"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer ml-1"
            >
              <RotateCcw class="w-3 h-3" />
              <span>{{ searchQuery.trim() ? (activeSubtype !== 'all' || activeStatusFilter !== 'all' ? 'Reset Semua' : 'Hapus Pencarian') : 'Reset Filter' }}</span>
            </button>
          </div>

          <button 
            @click="emit('close')"
            class="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>

    <!-- Character / Word Interactive Preview Modal Component -->
    <MasteryPreviewModal
      v-if="selectedPreviewItem"
      :item="selectedPreviewItem"
      :current-index="selectedPreviewIndex"
      :total-items="filteredItems.length"
      :category="activeCategory"
      @close="closePreview"
      @prev="prevPreviewItem"
      @next="nextPreviewItem"
    />

    <!-- Confirmation Modal Dialog for Bulk Update -->
    <div 
      v-if="showConfirmModal" 
      class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn"
      @click.self="!isApplying && (showConfirmModal = false)"
    >
      <div 
        class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 p-5 sm:p-6 animate-scaleUp text-gray-800 dark:text-slate-100"
        @click.stop
      >
        <!-- Icon & Title -->
        <div class="flex items-start gap-3.5 mb-4">
          <div 
            :class="[
              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner',
              targetTier === 'new' 
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' 
                : targetTier === 'crown' 
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                : targetTier === 'mastered'
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
            ]"
          >
            <AlertTriangle v-if="targetTier === 'new'" class="w-6 h-6" />
            <Award v-else class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              Ubah Status {{ selectedCharacters.size }} Karakter?
            </h3>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Tindakan ini akan memperbarui status penguasaan secara langsung.
            </p>
          </div>
        </div>

        <!-- Details Card -->
        <div class="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-800 mb-4 text-xs space-y-2">
          <div class="flex justify-between items-center text-gray-600 dark:text-slate-300">
            <span>Target Status:</span>
            <span class="font-extrabold text-indigo-600 dark:text-indigo-300">
              {{ tierLabelsMap[targetTier] }}
            </span>
          </div>

          <!-- Explanatory note based on target tier -->
          <div 
            v-if="targetTier === 'mastered' || targetTier === 'crown'" 
            class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed border border-emerald-200/60 dark:border-emerald-800/40"
          >
            💡 <strong>Pemberitahuan:</strong> Karakter ini akan dianggap sudah dikuasai. Preview/animasi stroke order pertama-kali <strong>tidak akan muncul lagi</strong> saat ditemui di mode game manapun (Kotoba, Menulis, Quiz).
          </div>
          <div 
            v-else-if="targetTier === 'new'" 
            class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-[11px] leading-relaxed border border-rose-200/60 dark:border-rose-800/40"
          >
            ⚠️ <strong>Perhatian:</strong> Streak karakter ini akan di-reset ke 0. Karakter akan kembali dianggap baru dan preview/animasi pertama-kali akan ditampilkan kembali jika diaktifkan di pengaturan quiz.
          </div>
          <div 
            v-else 
            class="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-[11px] leading-relaxed border border-indigo-200/60 dark:border-indigo-800/40"
          >
            ℹ️ Streak karakter ini akan disetel ke 1 (Sedang Belajar).
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-1">
          <button 
            type="button" 
            :disabled="isApplying"
            @click.stop="showConfirmModal = false"
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            type="button" 
            :disabled="isApplying"
            @click.stop="handleApplyBulkUpdate"
            class="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isApplying" class="w-4 h-4 animate-spin" />
            <Check v-else class="w-4 h-4" />
            <span>{{ isApplying ? 'Memproses...' : 'Ya, Terapkan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
