<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import MasteryCard from './mastery/MasteryCard.vue';
import { 
  X, 
  Award, 
  Zap, 
  Sparkles
} from '@lucide/vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'startWeakQuiz']);
const quizStore = useQuizStore();

const activeCategory = ref<'hiragana' | 'katakana' | 'words'>('hiragana');
const activeSubtype = ref<string>('all');
const activeStatusFilter = ref<'all' | 'new' | 'learning' | 'mastered' | 'crown'>('all');

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

const handleStartWeakQuiz = () => {
  emit('close');
  emit('startWeakQuiz', { type: activeCategory.value });
};
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      @click.self="emit('close')"
    >
      <div class="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 animate-scaleUp relative">
        
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
            <!-- Weak Items Practice Quick Button -->
            <button 
              v-if="unmasteredCount > 0"
              @click="handleStartWeakQuiz"
              class="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer animate-pulse-slow"
            >
              <Zap class="w-3.5 h-3.5 fill-white" />
              <span>Latih {{ unmasteredCount }} Lemah</span>
            </button>

            <button 
              @click="emit('close')"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <!-- Filter & Navigation Bar -->
        <div class="p-3 sm:p-4 bg-white border-b border-gray-200/80 flex flex-col gap-2.5 flex-shrink-0">
          <!-- Category Switcher Tabs (Row 1) -->
          <div class="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200 w-full justify-center md:w-fit md:justify-start">
            <button 
              v-for="cat in ['hiragana', 'katakana', 'words']" 
              :key="cat"
              @click="activeCategory = cat as any; activeSubtype = 'all';"
              :class="[
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black capitalize transition cursor-pointer flex items-center gap-1.5',
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              ]"
            >
              <span>{{ cat === 'words' ? 'Kata' : cat }}</span>
              <span 
                v-if="cat === 'hiragana'" 
                class="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full"
                :class="activeCategory === cat ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ quizStore.hiraganaMasteryStats.percentage }}%
              </span>
              <span 
                v-else-if="cat === 'katakana'" 
                class="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full"
                :class="activeCategory === cat ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ quizStore.katakanaMasteryStats.percentage }}%
              </span>
              <span 
                v-else 
                class="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full"
                :class="activeCategory === cat ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ quizStore.wordsMasteryStats.percentage }}%
              </span>
            </button>
          </div>

          <!-- Subtype Filter Row (Row 2) -->
          <div class="flex items-center gap-2 text-xs min-w-0">
            <span class="text-xs font-bold text-gray-400 flex-shrink-0">Kelompok:</span>
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar flex-1 min-w-0">
              <button 
                @click="activeSubtype = 'all'"
                :class="[
                  'px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0',
                  activeSubtype === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                Semua
              </button>

              <template v-if="activeCategory !== 'words'">
                <button 
                  v-for="sub in ['basic', 'dakuten', 'combination']" 
                  :key="sub"
                  @click="activeSubtype = sub"
                  :class="[
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer capitalize flex-shrink-0',
                    activeSubtype === sub ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ sub }}
                </button>
              </template>
              <template v-else>
                <button 
                  v-for="les in ['Pelajaran 1', 'Pelajaran 2']" 
                  :key="les"
                  @click="activeSubtype = les"
                  :class="[
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0',
                    activeSubtype === les ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ les }}
                </button>
              </template>
            </div>
          </div>

          <!-- Status Filter Row (Row 3) -->
          <div class="flex items-center gap-2 text-xs min-w-0">
            <span class="text-xs font-bold text-gray-400 flex-shrink-0">Status:</span>
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar flex-1 min-w-0">
              <button 
                v-for="st in [
                  { key: 'all', label: 'Semua Status', style: 'bg-gray-800 text-white font-bold', inactive: 'bg-gray-100 text-gray-600' },
                  { key: 'new', label: 'Belum (0)', style: 'bg-slate-700 text-white font-bold', inactive: 'bg-slate-100 text-slate-600' },
                  { key: 'learning', label: 'Proses (1-2)', style: 'bg-amber-600 text-white font-bold', inactive: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { key: 'mastered', label: 'Hafal (3-4)', style: 'bg-emerald-600 text-white font-bold', inactive: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
                  { key: 'crown', label: 'Crown (5+)', style: 'bg-indigo-600 text-white font-bold', inactive: 'bg-indigo-50 text-indigo-700 border border-indigo-200' }
                ]"
                :key="st.key"
                @click="activeStatusFilter = st.key as any"
                :class="[
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0',
                  activeStatusFilter === st.key ? st.style : st.inactive
                ]"
              >
                {{ st.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Interactive Grid Area -->
        <div class="p-3 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50">
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
              v-for="item in filteredItems" 
              :key="item.character" 
              :item="item" 
              :category="activeCategory" 
            />
          </div>

          <!-- Empty State -->
          <div v-else class="py-12 text-center flex flex-col items-center justify-center text-gray-500">
            <Sparkles class="w-10 h-10 text-indigo-300 mb-2 animate-bounce" />
            <h3 class="text-base font-bold text-gray-700">Tidak ada karakter ditemui</h3>
            <p class="text-xs text-gray-400 max-w-xs mt-1">
              Tidak ada item yang sesuai dengan filter yang dipilih saat ini.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium flex-shrink-0">
          <span class="text-xs text-gray-500 font-semibold">
            Menampilkan <strong class="text-gray-900">{{ filteredItems.length }}</strong> karakter
          </span>

          <button 
            @click="emit('close')"
            class="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
          >
            Tutup
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
</style>
