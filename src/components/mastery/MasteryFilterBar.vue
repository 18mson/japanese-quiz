<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuizStore } from '../../stores/quizStore';
import { 
  Sparkles, 
  ChevronDown, 
  Layers, 
  Check, 
  Circle, 
  CheckCircle2, 
  Crown,
  Award,
  Zap
} from '@lucide/vue';

const props = defineProps<{
  category: 'hiragana' | 'katakana' | 'words';
  subtype: string;
  statusFilter: 'all' | 'new' | 'learning' | 'mastered' | 'crown';
  availableLessons: string[];
}>();

const emit = defineEmits<{
  (e: 'update:category', val: 'hiragana' | 'katakana' | 'words'): void;
  (e: 'update:subtype', val: string): void;
  (e: 'update:statusFilter', val: 'all' | 'new' | 'learning' | 'mastered' | 'crown'): void;
}>();

const quizStore = useQuizStore();
const openDropdown = ref<'subtype' | null>(null);

const toggleDropdown = (type: 'subtype') => {
  openDropdown.value = openDropdown.value === type ? null : type;
};

const closeDropdowns = () => {
  openDropdown.value = null;
};

defineExpose({ closeDropdowns });

const activeSubtypeLabel = computed(() => {
  if (props.subtype === 'all') {
    return props.category === 'words' ? 'Semua Pelajaran (Semua Bab)' : 'Semua Kelompok';
  }
  if (props.category !== 'words') {
    if (props.subtype === 'basic') return 'Dasar (Basic)';
    if (props.subtype === 'dakuten') return 'Dakuten / Handakuten';
    if (props.subtype === 'combination') return 'Kombinasi (Yōon)';
  }
  return props.subtype;
});

const statusPills = [
  { 
    key: 'all', 
    label: 'Semua Status', 
    shortLabel: 'Semua',
    icon: Sparkles,
    activeClass: 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100',
    activeIconClass: 'text-white dark:text-slate-900'
  },
  { 
    key: 'new', 
    label: 'Belum Dipelajari (Streak 0)', 
    shortLabel: 'Belum',
    icon: Circle,
    activeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600',
    activeIconClass: 'text-slate-600 dark:text-slate-300'
  },
  { 
    key: 'learning', 
    label: 'Sedang Belajar (Streak 1-2)', 
    shortLabel: 'Proses',
    icon: Zap,
    activeClass: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    activeIconClass: 'text-amber-500 dark:text-amber-400'
  },
  { 
    key: 'mastered', 
    label: 'Sudah Hafal (Streak 3-4)', 
    shortLabel: 'Hafal',
    icon: CheckCircle2,
    activeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    activeIconClass: 'text-emerald-500 dark:text-emerald-400'
  },
  { 
    key: 'crown', 
    label: 'Crown / Mahir (Streak 5+)', 
    shortLabel: 'Crown',
    icon: Crown,
    activeClass: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    activeIconClass: 'text-indigo-600 dark:text-indigo-400'
  }
] as const;
</script>

<template>
  <div class="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-gray-200/80 dark:border-slate-800 flex flex-col gap-3 flex-shrink-0">
    <!-- Category Switcher Tabs (Row 1) -->
    <div class="grid grid-cols-3 bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl border border-gray-200 dark:border-slate-700 w-full sm:w-fit sm:flex sm:items-center">
      <button 
        v-for="cat in ['hiragana', 'katakana', 'words']" 
        :key="cat"
        @click="emit('update:category', cat as any); emit('update:subtype', 'all'); closeDropdowns();"
        :class="[
          'px-2.5 sm:px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-sm font-black capitalize transition cursor-pointer flex items-center justify-center gap-1.5',
          category === cat 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
            : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-700'
        ]"
      >
        <span>{{ cat === 'words' ? 'Kanji & Kotoba' : cat }}</span>
        <span 
          v-if="cat === 'hiragana'" 
          class="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold"
          :class="category === cat ? 'bg-indigo-700 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'"
        >
          {{ quizStore.hiraganaMasteryStats.percentage }}%
        </span>
        <span 
          v-else-if="cat === 'katakana'" 
          class="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold"
          :class="category === cat ? 'bg-indigo-700 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'"
        >
          {{ quizStore.katakanaMasteryStats.percentage }}%
        </span>
        <span 
          v-else 
          class="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold"
          :class="category === cat ? 'bg-indigo-700 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'"
        >
          {{ quizStore.wordsMasteryStats.percentage }}%
        </span>
      </button>
    </div>

    <!-- Dropdown Filters (Row 2) -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-start gap-3 sm:gap-6 w-full relative z-30">
      <!-- Kelompok Filter Dropdown -->
      <div class="flex flex-col gap-1.5 relative w-full sm:w-64 lg:w-72 shrink-0">
        <label class="text-xs sm:text-sm font-bold text-gray-600 dark:text-slate-300 flex items-center gap-1.5 px-0.5">
          <Layers class="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span>Kelompok / Bab</span>
        </label>

        <!-- Trigger Button -->
        <button
          type="button"
          @click.stop="toggleDropdown('subtype')"
          class="w-full bg-gray-50 hover:bg-gray-100/80 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-gray-800 dark:text-slate-100 text-sm font-bold rounded-xl py-2 pl-3.5 pr-3.5 transition cursor-pointer flex items-center justify-between text-left shadow-xs select-none h-10"
        >
          <span class="truncate">{{ activeSubtypeLabel }}</span>
          <ChevronDown class="w-4 h-4 text-gray-400 dark:text-slate-400 transition-transform duration-200 shrink-0 ml-2" :class="{ 'rotate-180': openDropdown === 'subtype' }" />
        </button>

        <!-- Custom Dropdown Menu -->
        <div
          v-if="openDropdown === 'subtype'"
          class="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-1.5 z-50 max-h-60 overflow-y-auto animate-fadeIn select-none"
        >
          <button
            type="button"
            @click="emit('update:subtype', 'all'); closeDropdowns();"
            class="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between cursor-pointer"
            :class="subtype === 'all' 
              ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-extrabold' 
              : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'"
          >
            <span class="truncate">{{ category === 'words' ? 'Semua Pelajaran (Semua Bab)' : 'Semua Kelompok' }}</span>
            <Check v-if="subtype === 'all'" class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
          </button>

          <template v-if="category !== 'words'">
            <button
              v-for="sub in [
                { key: 'basic', label: 'Dasar (Basic)' },
                { key: 'dakuten', label: 'Dakuten / Handakuten' },
                { key: 'combination', label: 'Kombinasi (Yōon)' }
              ]"
              :key="sub.key"
              type="button"
              @click="emit('update:subtype', sub.key); closeDropdowns();"
              class="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between cursor-pointer"
              :class="subtype === sub.key 
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-extrabold' 
                : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'"
            >
              <span class="truncate">{{ sub.label }}</span>
              <Check v-if="subtype === sub.key" class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
            </button>
          </template>

          <template v-else>
            <button
              v-for="les in availableLessons"
              :key="les"
              type="button"
              @click="emit('update:subtype', les); closeDropdowns();"
              class="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between cursor-pointer"
              :class="subtype === les 
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-extrabold' 
                : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'"
            >
              <span class="truncate">{{ les }}</span>
              <Check v-if="subtype === les" class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
            </button>
          </template>
        </div>
      </div>

      <!-- Status Filter Horizontal Icon List -->
      <div class="flex flex-col items-start gap-1.5 min-w-0">
        <label class="text-xs sm:text-sm font-bold text-gray-600 dark:text-slate-300 flex items-center gap-1.5 px-0.5">
          <Award class="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span>Status Penguasaan</span>
        </label>

        <div class="flex items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            v-for="st in statusPills"
            :key="st.key"
            type="button"
            @click="emit('update:statusFilter', st.key)"
            :title="st.label"
            class="h-10 px-2.5 sm:px-3 rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out cursor-pointer select-none border shrink-0"
            :class="statusFilter === st.key 
              ? ['shadow-xs', st.activeClass] 
              : 'bg-transparent border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-gray-100/50 dark:hover:bg-slate-800/50'"
          >
            <component 
              :is="st.icon" 
              class="w-4 h-4 shrink-0 transition-all duration-300 ease-in-out"
              :class="statusFilter === st.key ? [st.activeIconClass, 'scale-110'] : ''" 
            />
            <span 
              class="text-xs sm:text-sm font-extrabold whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out inline-block"
              :style="{
                maxWidth: statusFilter === st.key ? '80px' : '0px',
                opacity: statusFilter === st.key ? 1 : 0,
                marginLeft: statusFilter === st.key ? '6px' : '0px'
              }"
            >
              {{ st.shortLabel }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
