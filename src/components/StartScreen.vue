<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Zap, Target, Swords, Users, Keyboard, BookOpen, Layers } from '@lucide/vue';

const quizStore = useQuizStore();
const targetDurationMinutes = ref<number>(1);
const characterTypes = ref('hiragana');
const selectedLevel = ref<'basic' | 'n5' | 'battleground'>('basic');

const isMobile = ref(false);

const updateResponsive = () => {
  isMobile.value = window.innerWidth < 640;
};

onMounted(() => {
  updateResponsive();
  window.addEventListener('resize', updateResponsive);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive);
});

// Modes definition for the Disk Wheel Selection
interface QuizModeDef {
  id: string;
  title: string;
  levelTag: string;
  level: 'basic' | 'n5' | 'battleground';
  defaultType: string;
  desc: string;
  badge?: string;
  subTypes?: Array<{ key: string; label: string; tag?: string }>;
  icon: any;
}

const modesList: QuizModeDef[] = [
  {
    id: 'multiple_choice',
    title: 'Multiple Choice',
    levelTag: 'Basic',
    level: 'basic',
    defaultType: 'hiragana',
    desc: 'Latihan pilihan ganda huruf Kana dasar secara cepat & interaktif.',
    subTypes: [
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'katakana', label: 'Katakana' },
    ],
    icon: Layers,
  },
  {
    id: 'keyboard_typing',
    title: 'Keyboard Typing',
    levelTag: 'Kana & Words',
    level: 'n5',
    defaultType: 'hiragana',
    desc: 'Ketik huruf Kana & kosakata Jepang sehari-hari dengan keyboard presisi.',
    subTypes: [
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'katakana', label: 'Katakana' },
      { key: 'words', label: 'Everyday Word', tag: 'new' },
    ],
    icon: Keyboard,
  },
  {
    id: 'sentence_typing',
    title: 'Sentence Typing',
    levelTag: 'Kalimat N5',
    level: 'n5',
    defaultType: 'sentences',
    desc: 'Latihan mengetik kalimat Jepang lengkap secara real-time dengan romaji.',
    subTypes: [
      { key: 'sentences', label: 'Kalimat N5', tag: 'new' },
    ],
    icon: BookOpen,
  },
  {
    id: 'battleground',
    title: 'Typing Battleground',
    levelTag: 'Multi',
    level: 'battleground',
    defaultType: '',
    desc: 'Battle Royale Mengetik (2–8 Pemain). Adu cepat & ketepatan mengetik secara realtime.',
    subTypes: [],
    icon: Swords,
  },
];

const activeModeIndex = ref(0);

function selectMode(index: number) {
  if (index < 0 || index >= modesList.length) return;
  activeModeIndex.value = index;
  const m = modesList[index];
  selectedLevel.value = m.level;
  if (m.defaultType) {
    characterTypes.value = m.defaultType;
  }
}

function selectSubType(type: string) {
  characterTypes.value = type;
}

// Position cards along an arc trajectory hugging the red semi-circle
function getCardStyle(index: number) {
  const diff = index - activeModeIndex.value;
  const absDiff = Math.abs(diff);
  const isActive = diff === 0;

  // Responsive vertical spacing for mobile vs desktop
  const firstStep = isMobile.value ? 95 : 125;
  const secondStep = isMobile.value ? 45 : 53;

  let translateY = 0;
  if (diff < 0) {
    translateY = -firstStep + (diff + 1) * secondStep;
  } else if (diff > 0) {
    translateY = firstStep + (diff - 1) * secondStep;
  }

  // Curve horizontally along semi-circle - non-active cards indented further left
  const baseShift = isMobile.value ? 10 : 55;
  const stepShift = isMobile.value ? 40 : 65;
  const translateX = isActive ? baseShift : (absDiff === 1 ? baseShift - stepShift : baseShift - (stepShift * 1.8));

  const scale = isActive ? 1.0 : Math.max(0.68, 0.88 - (absDiff - 1) * 0.1);
  const opacity = isActive ? 1.0 : absDiff === 1 ? 0.88 : absDiff === 2 ? 0.5 : 0;
  const zIndex = 30 - absDiff * 5;
  const pointerEvents: 'none' | 'auto' = absDiff > 2 ? 'none' : 'auto';

  return {
    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
    opacity,
    zIndex,
    pointerEvents,
  };
}

const getDurationDesc = (minutes: number) => {
  if (characterTypes.value === 'sentences') {
    if (minutes === 1) return '⚡ Kilat (4 kalimat)';
    if (minutes === 3) return '🔥 Fokus (10 kalimat)';
    if (minutes === 5) return '🏆 Maraton (16 kalimat)';
  } else if (characterTypes.value === 'words') {
    if (minutes === 1) return '⚡ Kilat (8 kata)';
    if (minutes === 3) return '🔥 Fokus (24 kata)';
    if (minutes === 5) return '🏆 Maraton (40 kata)';
  } else {
    if (minutes === 1) return '⚡ Kilat (16 soal)';
    if (minutes === 3) return '🔥 Fokus (48 soal)';
    if (minutes === 5) return '🏆 Maraton (78 soal)';
  }
  return '';
};

const emit = defineEmits(['start', 'openMasteryGrid', 'openBattleground']);

const handleStart = async () => {
  if (selectedLevel.value === 'battleground') {
    emit('openBattleground');
  } else {
    await quizStore.startQuiz(targetDurationMinutes.value, characterTypes.value, selectedLevel.value);
    emit('start');
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6 flex flex-col items-center animate-fadeIn h-full overflow-y-auto w-full">
    <!-- Header Title -->
    <h1 class="text-3xl md:text-5xl bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-600 bg-clip-text text-transparent mb-2 font-extrabold tracking-tight flex-shrink-0 text-center">
      Nihongo Master
    </h1>
    <p class="text-sm md:text-base text-gray-600 mb-5 max-w-2xl font-medium leading-relaxed flex-shrink-0 text-center">
      Master Hiragana, Katakana, N5 Vocabulary, and Sentence Typing through adaptive practice & Realtime Multiplayer Battleground!
    </p>

    <!-- Progress Header (1 Line) -->
    <div 
      @click="emit('openMasteryGrid')"
      class="w-full max-w-3xl mb-6 bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-4 shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4 flex-shrink-0"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <Target class="w-5 h-5" />
        </div>
        <div class="truncate">
          <div class="text-xs text-gray-500 font-medium">Peta penguasaan huruf</div>
          <div class="text-sm md:text-base font-bold text-gray-900 truncate">
            {{ quizStore.overallMasteryStats.mastered }} / {{ quizStore.overallMasteryStats.total }} Dikuasai
            <span class="text-indigo-600 font-extrabold ml-1.5">({{ quizStore.overallMasteryStats.percentage }}%)</span>
          </div>
        </div>
      </div>
      <button 
        type="button"
        class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
      >
        <span>Lihat grid</span>
      </button>
    </div>

    <!-- Step 1: Disk Wheel Mode Selection -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center justify-between">
        <span class="flex items-center gap-2">
          <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
          Pilih Mode Quiz
        </span>
        <span class="text-xs text-gray-400 font-medium">
          Klik mode untuk memilih
        </span>
      </h2>

      <!-- MAIN CONTAINER: LIGHT CLEAN THEME MATCHING REFERENCE SKETCH -->
      <div class="relative w-full rounded-3xl bg-white border border-gray-200 shadow-sm p-2.5 sm:p-6 md:p-8 overflow-hidden min-h-[460px] sm:min-h-[500px] flex items-center justify-center">
        
        <!-- Left Red Semi-Circle (Setengah Lingkaran Protruding from Container Left Edge) -->
        <div class="absolute -left-14 xs:-left-18 sm:-left-36 md:-left-40 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div class="w-[130px] h-[130px] xs:w-[160px] xs:h-[160px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px] rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-rose-600 flex items-center justify-end pr-6 sm:pr-12 md:pr-16 shadow-lg shadow-rose-500/20 border-2 sm:border-4 border-white">
            <div class="text-white font-black text-[10px] xs:text-xs sm:text-xl md:text-2xl leading-tight text-center select-none tracking-tight">
              Pilih<br/>Mode
            </div>
          </div>
        </div>

        <!-- Mode Cards Orbiting Arc Track -->
        <div class="w-full pl-10 xs:pl-14 sm:pl-32 md:pl-38 pr-1 sm:pr-6 relative h-[380px] sm:h-[420px] flex items-center justify-center">
          <div 
            v-for="(mode, index) in modesList"
            :key="mode.id"
            @click="selectMode(index)"
            :style="getCardStyle(index)"
            :class="[
              'absolute left-0 right-0 w-full max-w-[270px] xs:max-w-[290px] sm:max-w-md mx-auto transition-all duration-500 ease-out rounded-2xl cursor-pointer text-left border-2 overflow-hidden',
              index === activeModeIndex
                ? mode.id === 'battleground'
                  ? 'bg-rose-50/70 border-rose-600 text-gray-900 shadow-xl shadow-rose-500/10 p-3 sm:p-5'
                  : 'bg-white border-gray-900 text-gray-900 shadow-xl p-3 sm:p-5'
                : 'bg-white border-gray-800/90 text-gray-800 p-2.5 sm:p-3 hover:border-gray-900 hover:bg-gray-50'
            ]"
          >
            <!-- Card Header (Always visible & smoothly transitions) -->
            <div class="flex items-center justify-between transition-all duration-500">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <component 
                  :is="mode.icon" 
                  :class="[
                    'transition-all duration-500 flex-shrink-0',
                    index === activeModeIndex
                      ? (mode.id === 'battleground' ? 'w-4 h-4 sm:w-5 sm:h-5 text-rose-600' : 'w-4 h-4 sm:w-5 sm:h-5 text-indigo-600')
                      : 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600'
                  ]" 
                />
                <h3 
                  :class="[
                    'font-extrabold tracking-tight transition-all duration-500 text-gray-900 truncate',
                    index === activeModeIndex ? 'text-base sm:text-2xl font-black' : 'text-xs sm:text-base font-bold'
                  ]"
                >
                  {{ mode.title }}
                </h3>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <span v-if="mode.badge" class="text-[8px] sm:text-[10px] font-extrabold bg-rose-600 text-white px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider">
                  {{ mode.badge }}
                </span>
                <span :class="['text-[10px] sm:text-xs font-bold transition-all duration-500', index === activeModeIndex ? 'text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded-md' : 'text-gray-400 font-medium']">
                  {{ index === activeModeIndex ? mode.levelTag : `(${mode.levelTag})` }}
                </span>
              </div>
            </div>

            <!-- Expandable Content Wrapper (Smoothly animates height, opacity & position on shrink/expand) -->
            <div 
              class="transition-all duration-500 ease-out overflow-hidden"
              :style="{
                maxHeight: index === activeModeIndex ? '200px' : '0px',
                opacity: index === activeModeIndex ? '1' : '0',
                marginTop: index === activeModeIndex ? '8px' : '0px',
                transform: index === activeModeIndex ? 'translateY(0)' : 'translateY(-8px)',
              }"
            >
              <!-- Description -->
              <p class="text-[11px] sm:text-sm text-gray-600 mb-2.5 sm:mb-3 font-medium leading-relaxed">
                {{ mode.desc }}
              </p>

              <!-- Sub-types buttons -->
              <div v-if="mode.subTypes && mode.subTypes.length > 0" class="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-gray-100 flex-wrap">
                <button
                  v-for="sub in mode.subTypes"
                  :key="sub.key"
                  type="button"
                  @click.stop="selectSubType(sub.key)"
                  :class="[
                    'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                    characterTypes === sub.key
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <span>{{ sub.label }}</span>
                  <span v-if="sub.tag" class="text-[8px] sm:text-[9px] font-extrabold px-1 rounded bg-amber-400 text-amber-950 uppercase">{{ sub.tag }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Step 2: Select Target Duration or Battleground Info -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
        {{ selectedLevel === 'battleground' ? 'Informasi Mode Battle' : 'Pilih Durasi Sesi' }}
      </h2>

      <!-- Battleground Mode Info Banner -->
      <div v-if="selectedLevel === 'battleground'" class="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <Users class="w-5 h-5" />
          </div>
          <div>
            <div class="text-sm font-bold text-gray-900">Battle Royale Realtime</div>
            <div class="text-xs text-gray-600">Hingga 8 pemain per room • Penalti 1s Cooldown jika typo • Eliminasi bertahap (Target Match ~5 Menit)</div>
          </div>
        </div>
      </div>

      <!-- Normal Duration Options -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button 
          v-for="min in [1, 3, 5]" 
          :key="min"
          type="button"
          :class="[
            'p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center',
            targetDurationMinutes === min 
              ? 'border-2 border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-sm' 
              : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300'
          ]"
          @click="targetDurationMinutes = min"
        >
          <span class="text-base font-extrabold" :class="targetDurationMinutes === min ? 'text-indigo-700' : 'text-gray-900'">{{ min }} Menit</span>
          <span class="text-xs font-medium mt-0.5" :class="targetDurationMinutes === min ? 'text-indigo-600' : 'text-gray-500'">{{ getDurationDesc(min) }}</span>
        </button>
      </div>
    </div>
    
    <!-- Full-Width Start Quiz / Start Battle Button -->
    <div class="w-full max-w-3xl mb-6 flex-shrink-0">
      <button 
        type="button"
        :class="[
          'w-full py-3.5 text-white rounded-2xl text-base font-bold cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed',
          selectedLevel === 'battleground'
            ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-rose-500/20'
            : 'bg-indigo-600 hover:bg-indigo-700'
        ]"
        @click="handleStart"
        :disabled="quizStore.isLoading"
      >
        <span v-if="quizStore.isLoading" class="flex items-center gap-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Questions...
        </span>
        <template v-else-if="selectedLevel === 'battleground'">
          <span>Masuk Arena Battleground</span>
          <Swords class="w-5 h-5 text-white" />
        </template>
        <template v-else>
          <span>Start Quiz ({{ targetDurationMinutes }} Menit)</span>
          <Zap class="w-5 h-5 text-amber-300 fill-amber-300" />
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
