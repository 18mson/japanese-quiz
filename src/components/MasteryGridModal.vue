<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import MasteryCard from './mastery/MasteryCard.vue';
import MasteryFilterBar from './mastery/MasteryFilterBar.vue';
import MasteryPreviewModal from './mastery/MasteryPreviewModal.vue';
import { 
  X, 
  Award, 
  Zap, 
  Sparkles, 
  RotateCcw 
} from '@lucide/vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'startWeakQuiz']);
const quizStore = useQuizStore();

// Filter States
const activeCategory = ref<'hiragana' | 'katakana' | 'words'>('hiragana');
const activeSubtype = ref<string>('all');
const activeStatusFilter = ref<'all' | 'new' | 'learning' | 'mastered' | 'crown'>('all');
const filterBarRef = ref<InstanceType<typeof MasteryFilterBar> | null>(null);

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

const filteredItems = computed(() => {
  let pool: any[] = activeCategory.value === 'hiragana' ? hiraganaData : activeCategory.value === 'katakana' ? katakanaData : wordsData;

  if (activeSubtype.value !== 'all') {
    pool = activeCategory.value === 'words' ? pool.filter(w => w.lesson === activeSubtype.value) : pool.filter(c => c.type === activeSubtype.value);
  }

  if (activeStatusFilter.value !== 'all') {
    pool = pool.filter(item => quizStore.getMasteryTier(item.character) === activeStatusFilter.value);
  }

  return pool;
});

const unmasteredCount = computed(() => {
  const pool: any[] = activeCategory.value === 'hiragana' ? hiraganaData : activeCategory.value === 'katakana' ? katakanaData : wordsData;
  return pool.filter(item => quizStore.getMasteryStreak(item.character) < 3).length;
});

const isAllAttempted = computed(() => {
  const pool: any[] = activeCategory.value === 'hiragana' ? hiraganaData : activeCategory.value === 'katakana' ? katakanaData : wordsData;
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
            <button 
              v-if="unmasteredCount > 0"
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
          :available-lessons="availableLessons"
        />

        <!-- Interactive Grid Area -->
        <div class="p-3 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-slate-950/60 min-h-0">
          <div 
            v-if="filteredItems.length > 0"
            :class="[
              'grid gap-2 sm:gap-3',
              activeCategory === 'words' 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
                : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
            ]"
          >
            <MasteryCard 
              v-for="(item, index) in filteredItems" 
              :key="activeCategory + '_' + item.character + '_' + (item.lesson || '') + '_' + (item.meaning || '') + '_' + index" 
              :item="item" 
              :category="activeCategory" 
              @click="openPreview(item, index)"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="h-full min-h-[220px] text-center flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 py-8">
            <Sparkles class="w-10 h-10 text-indigo-300 dark:text-indigo-500 mb-2 animate-bounce" />
            <h3 class="text-base font-bold text-gray-700 dark:text-slate-200">Tidak ada karakter ditemui</h3>
            <p class="text-xs text-gray-400 dark:text-slate-400 max-w-xs mt-1">
              Tidak ada item yang sesuai dengan filter yang dipilih saat ini.
            </p>
          </div>
        </div>

        <!-- Notice Banner for 0% Belum but incomplete mastery -->
        <div v-if="isAllAttempted" class="mx-4 sm:mx-6 mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2 flex-shrink-0 animate-fadeIn">
          <Sparkles class="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Semua huruf di kelompok ini sudah dipelajari — lanjut asah yang masih Proses, atau coba kelompok lain.</span>
        </div>

        <!-- Footer -->
        <div class="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-medium flex-shrink-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-500 dark:text-slate-400 font-semibold">
              Menampilkan <strong class="text-gray-900 dark:text-slate-100">{{ filteredItems.length }}</strong> karakter
            </span>
            <button
              v-if="activeSubtype !== 'all' || activeStatusFilter !== 'all'"
              @click="activeSubtype = 'all'; activeStatusFilter = 'all';"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer ml-1"
            >
              <RotateCcw class="w-3 h-3" />
              <span>Reset Filter</span>
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
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
