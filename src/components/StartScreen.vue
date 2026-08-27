<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { useBattlegroundStore } from '../stores/battlegroundStore';
import { Zap, Target, Swords, Users, Keyboard, BookOpen, Layers, Trophy } from '@lucide/vue';
import { playRouletteTickSound } from '../utils/battleSoundManager';
import DailyGoalProgressBar from './goals/DailyGoalProgressBar.vue';

const quizStore = useQuizStore();
const battlegroundStore = useBattlegroundStore();
const targetDurationMinutes = ref<number>(1);
const characterTypes = ref('hiragana');
const selectedLevel = ref<'basic' | 'n5' | 'battleground'>('basic');
const selectedQuizBlitzCategory = ref<'hiragana' | 'katakana' | 'mix' | 'kotoba_kanji'>('hiragana');

const isMobile = ref(false);

const updateResponsive = () => {
  isMobile.value = window.innerWidth < 640;
};

// ── Keyboard Section Focus State ─────────────────────────────────
const focusedSection = ref<'header' | 'mode' | 'duration'>('mode');
const focusedHeaderTarget = ref<'grid' | 'leaderboard'>('grid');
const isKeyboardNav = ref(false);

const durationList = [1, 3, 5];

const deactivateKeyboardNav = () => {
  isKeyboardNav.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  // If user is typing in an input element or textarea, don't hijack keys
  const target = event.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return;
  }

  // Activate keyboard navigation highlight only on keyboard navigation keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
    isKeyboardNav.value = true;
  }

  // Handle Tab / Shift+Tab for cycle switching sections
  if (event.key === 'Tab') {
    event.preventDefault();
    if (event.shiftKey) {
      if (focusedSection.value === 'duration') focusedSection.value = 'mode';
      else if (focusedSection.value === 'mode') focusedSection.value = 'header';
      else if (focusedSection.value === 'header') focusedSection.value = 'duration';
    } else {
      if (focusedSection.value === 'header') focusedSection.value = 'mode';
      else if (focusedSection.value === 'mode') focusedSection.value = 'duration';
      else if (focusedSection.value === 'duration') focusedSection.value = 'header';
    }
    return;
  }

  // ── SECTION 1: HEADER (Grid / Peringkat) ──────────────────────
  if (focusedSection.value === 'header') {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusedHeaderTarget.value = focusedHeaderTarget.value === 'grid' ? 'leaderboard' : 'grid';
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusedSection.value = 'mode';
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (focusedHeaderTarget.value === 'grid') {
        emit('openMasteryGrid');
      } else {
        emit('openLeaderboard');
      }
    }
  }

  // ── SECTION 2: MODE BOX (Disk Wheel + Sub-menu) ──────────────
  else if (focusedSection.value === 'mode') {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (activeModeIndex.value < modesList.length - 1) {
        selectMode(activeModeIndex.value + 1);
      } else {
        focusedSection.value = 'duration';
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (activeModeIndex.value > 0) {
        selectMode(activeModeIndex.value - 1);
      } else {
        focusedSection.value = 'header';
      }
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const subTypes = activeMode.value.subTypes;
      if (subTypes && subTypes.length > 0) {
        event.preventDefault();
        const currentIdx = subTypes.findIndex(s => s.key === characterTypes.value);
        let nextIdx = 0;
        if (event.key === 'ArrowRight') {
          nextIdx = (currentIdx + 1) % subTypes.length;
        } else {
          nextIdx = (currentIdx - 1 + subTypes.length) % subTypes.length;
        }
        selectSubType(subTypes[nextIdx].key);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      focusedSection.value = 'duration';
    }
  }

  // ── SECTION 3: DURATION & START ──────────────────────────────
  else if (focusedSection.value === 'duration') {
    if (event.key === 'ArrowRight') {
      if (selectedLevel.value !== 'battleground') {
        event.preventDefault();
        const currentIdx = durationList.indexOf(targetDurationMinutes.value);
        const nextIdx = (currentIdx + 1) % durationList.length;
        targetDurationMinutes.value = durationList[nextIdx];
      }
    } else if (event.key === 'ArrowLeft') {
      if (selectedLevel.value !== 'battleground') {
        event.preventDefault();
        const currentIdx = durationList.indexOf(targetDurationMinutes.value);
        const prevIdx = (currentIdx - 1 + durationList.length) % durationList.length;
        targetDurationMinutes.value = durationList[prevIdx];
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusedSection.value = 'mode';
    } else if (event.key === 'Enter') {
      event.preventDefault();
      handleStart();
    }
  }
};

onMounted(() => {
  updateResponsive();
  window.addEventListener('resize', updateResponsive);
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('pointerdown', deactivateKeyboardNav);
  window.addEventListener('touchstart', deactivateKeyboardNav);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive);
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('pointerdown', deactivateKeyboardNav);
  window.removeEventListener('touchstart', deactivateKeyboardNav);
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
  discGradient: string;
  discShadow: string;
  discPulse: string;
}

const modesList: QuizModeDef[] = [
  {
    id: 'multiple_choice',
    title: 'Multiple Choice',
    levelTag: 'Basic',
    level: 'basic',
    defaultType: 'hiragana',
    desc: 'Latihan pilihan ganda huruf Kana (Hiragana, Katakana, Mix) secara cepat & interaktif.',
    subTypes: [
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'katakana', label: 'Katakana' },
      { key: 'mix', label: 'Mix' },
    ],
    icon: Layers,
    discGradient: 'from-indigo-500 via-indigo-600 to-violet-600',
    discShadow: 'shadow-indigo-500/25',
    discPulse: 'bg-indigo-400',
  },
  {
    id: 'keyboard_typing',
    title: 'Keyboard Typing',
    levelTag: 'Kana Typing',
    level: 'n5',
    defaultType: 'hiragana',
    desc: 'Ketik huruf Kana (Hiragana, Katakana, Mix) dengan keyboard presisi.',
    subTypes: [
      { key: 'hiragana', label: 'Hiragana' },
      { key: 'katakana', label: 'Katakana' },
      { key: 'mix', label: 'Mix' },
    ],
    icon: Keyboard,
    discGradient: 'from-blue-500 via-indigo-600 to-indigo-700',
    discShadow: 'shadow-blue-500/25',
    discPulse: 'bg-blue-400',
  },
  {
    id: 'sentence_typing',
    title: 'Kotoba & Bunshou',
    levelTag: 'N5 Intermediate',
    level: 'n5',
    defaultType: 'words',
    desc: 'Latihan mengetik kosakata (kotoba) berhuruf Kanji & latihan susunan kalimat (bunshou) N5.',
    subTypes: [
      { key: 'words', label: 'Kotoba (言葉)' },
      { key: 'sentences', label: 'Bunshou (文章)' },
    ],
    icon: BookOpen,
    discGradient: 'from-violet-500 via-purple-600 to-indigo-600',
    discShadow: 'shadow-violet-500/25',
    discPulse: 'bg-violet-400',
  },
  {
    id: 'battleground',
    title: 'Online Multiplayer',
    levelTag: 'Online',
    level: 'battleground',
    defaultType: 'battleground',
    desc: 'Bermain online multiplayer realtime (2–8 Pemain). Pilih mode Battleground atau Quiz Blitz.',
    subTypes: [
      { key: 'quiz_blitz', label: '🔥 Quiz Blitz' },
      { key: 'battleground', label: '⚔️ Battleground' },
    ],
    icon: Swords,
    discGradient: 'from-red-500 via-rose-500 to-amber-600',
    discShadow: 'shadow-rose-500/25',
    discPulse: 'bg-rose-500',
  },
];

const activeModeIndex = ref(0);
const prevActiveModeIndex = ref(0);
const scrollDirection = ref<'down' | 'up'>('down');

const activeMode = computed(() => modesList[activeModeIndex.value]);

function selectMode(index: number) {
  if (index < 0 || index >= modesList.length) return;
  if (index === activeModeIndex.value) return;

  prevActiveModeIndex.value = activeModeIndex.value;

  if (index > activeModeIndex.value) {
    scrollDirection.value = 'up';
  } else if (index < activeModeIndex.value) {
    scrollDirection.value = 'down';
  }
  activeModeIndex.value = index;
  selectedLevel.value = modesList[index].level;
  if (modesList[index].defaultType) {
    characterTypes.value = modesList[index].defaultType;
  }
  playRouletteTickSound();
}

function selectSubType(type: string) {
  characterTypes.value = type;
}

let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
function handleWheel(event: WheelEvent) {
  if (wheelTimeout) return;

  if (event.deltaY > 20) {
    selectMode(activeModeIndex.value + 1);
  } else if (event.deltaY < -20) {
    selectMode(activeModeIndex.value - 1);
  }

  wheelTimeout = setTimeout(() => {
    wheelTimeout = null;
  }, 180);
}

let touchStartY = 0;
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    touchStartY = e.touches[0].clientY;
  }
}
function handleTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        selectMode(activeModeIndex.value + 1);
      } else {
        selectMode(activeModeIndex.value - 1);
      }
      touchStartY = touchEndY;
    }
  }
}
function handleTouchEnd() {}

// Position cards along an arc trajectory hugging the red semi-circle
function getCardStyle(index: number) {
  const diff = index - activeModeIndex.value;
  const absDiff = Math.abs(diff);
  const isActive = diff === 0;

  // Responsive vertical spacing for mobile vs desktop (compact desktop size)
  const firstStep = isMobile.value ? 95 : 102;
  const secondStep = isMobile.value ? 45 : 46;

  let translateY = 0;
  if (diff < 0) {
    translateY = -firstStep + (diff + 1) * secondStep;
  } else if (diff > 0) {
    translateY = firstStep + (diff - 1) * secondStep;
  }

  // Active card shifted right; cards below active (+1 & +2) shifted progressively further left
  let translateX = 0;
  if (isActive) {
    translateX = isMobile.value ? 35 : 75;
  } else if (diff === -1) {
    translateX = isMobile.value ? -25 : -10;
  } else if (diff <= -2) {
    translateX = isMobile.value ? -65 : -85;
  } else if (diff === 1) {
    translateX = isMobile.value ? -25 : -10;
  } else {
    translateX = isMobile.value ? -75 : -85;
  }

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

const getShortDurationDesc = (minutes: number) => {
  if (characterTypes.value === 'sentences') {
    if (minutes === 1) return 'Kilat · 4 kalimat';
    if (minutes === 3) return 'Fokus · 10 kalimat';
    if (minutes === 5) return 'Maraton · 16 kalimat';
  } else if (characterTypes.value === 'words') {
    if (minutes === 1) return 'Kilat · 8 kanji';
    if (minutes === 3) return 'Fokus · 24 kanji';
    if (minutes === 5) return 'Maraton · 40 kanji';
  } else {
    if (minutes === 1) return 'Kilat · 16 soal';
    if (minutes === 3) return 'Fokus · 48 soal';
    if (minutes === 5) return 'Maraton · 78 soal';
  }
  return '';
};

const emit = defineEmits(['start', 'openMasteryGrid', 'openBattleground', 'openLeaderboard', 'openAbout']);

const handleStart = async () => {
  if (selectedLevel.value === 'battleground') {
    if (characterTypes.value === 'quiz_blitz') {
      battlegroundStore.gameMode = 'quiz_blitz';
      battlegroundStore.quizCategory = selectedQuizBlitzCategory.value;
    } else {
      battlegroundStore.gameMode = 'battleground';
    }
    emit('openBattleground');
  } else {
    await quizStore.startQuiz(targetDurationMinutes.value, characterTypes.value, selectedLevel.value);
    emit('start');
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-3.5 sm:p-6 pb-36 sm:pb-28 flex flex-col items-center animate-fadeIn h-full overflow-y-auto w-full select-none">
    
    <!-- SECTION 1: HEADER BAR (Grid & Leaderboard Buttons) -->
    <div 
      @click="deactivateKeyboardNav"
      :class="[
        'w-full max-w-3xl mb-4 sm:mb-6 bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 transition-all duration-200 flex items-center justify-between gap-2.5 sm:gap-4 flex-shrink-0 cursor-pointer',
        isKeyboardNav && focusedSection === 'header'
          ? 'border-indigo-400 dark:border-indigo-500/70 shadow-md ring-2 ring-indigo-400/40 border'
          : 'border border-gray-200 dark:border-slate-800 shadow-sm'
      ]"
    >
      <!-- Mastery Grid Stats Display -->
      <div 
        @click.stop="deactivateKeyboardNav(); emit('openMasteryGrid');"
        class="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer flex-1 hover:opacity-90 transition-opacity"
      >
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Target class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="truncate">
          <div class="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium truncate">Peta penguasaan huruf</div>
          <div class="text-xs sm:text-base font-bold text-gray-900 dark:text-slate-100 truncate">
            {{ quizStore.overallMasteryStats.mastered }} / {{ quizStore.overallMasteryStats.total }}
            <span class="text-indigo-600 dark:text-indigo-400 font-extrabold ml-1 sm:ml-1.5">({{ quizStore.overallMasteryStats.percentage }}%)</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons: Daily Target, Peringkat & Grid -->
      <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <DailyGoalProgressBar class="hidden xs:flex" />

        <button 
          type="button"
          @click.stop="deactivateKeyboardNav(); emit('openLeaderboard');"
          :class="[
            'px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs',
            isKeyboardNav && focusedSection === 'header' && focusedHeaderTarget === 'leaderboard'
              ? 'ring-2 ring-amber-400/80 dark:ring-amber-500/80 bg-amber-100/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-400 scale-[1.02]'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100'
          ]"
          title="Lihat Papan Peringkat"
        >
          <Trophy class="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span class="hidden sm:inline">Peringkat</span>
        </button>

        <button 
          type="button"
          @click.stop="deactivateKeyboardNav(); emit('openMasteryGrid');"
          :class="[
            'px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border',
            isKeyboardNav && focusedSection === 'header' && focusedHeaderTarget === 'grid'
              ? 'ring-2 ring-indigo-400/80 dark:ring-indigo-500/80 bg-indigo-100 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-100 border-indigo-400 scale-[1.02]'
              : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/80'
          ]"
        >
          <span>Grid</span>
        </button>
      </div>
    </div>

    <!-- SECTION 2: DISK WHEEL MODE SELECTION BOX -->
    <div 
      @click="deactivateKeyboardNav"
      class="w-full max-w-3xl mb-6 flex-shrink-0"
    >
      <div 
        @wheel.prevent="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend="handleTouchEnd"
        :class="[
          'relative w-full rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 p-3.5 sm:p-5 overflow-hidden min-h-[440px] sm:min-h-[460px] flex flex-col justify-between select-none touch-none overscroll-contain cursor-pointer',
          isKeyboardNav && focusedSection === 'mode'
            ? 'border-indigo-400/80 dark:border-indigo-500/70 shadow-md ring-2 ring-indigo-400/40'
            : 'border-gray-200 dark:border-slate-800 shadow-sm'
        ]"
      >
        <!-- Top Right Inside Badge: "Pilih Mode" -->
        <div class="absolute top-3.5 right-4 sm:top-4 sm:right-5 z-20 flex items-center gap-2 pointer-events-none">
          <div class="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs sm:text-sm font-black tracking-tight shadow-sm flex items-center gap-1.5 border border-slate-800 dark:border-slate-700">
            <span>Pilih Mode</span>
            <span :class="['w-2 h-2 rounded-full animate-pulse transition-colors duration-500', activeMode.discPulse]"></span>
          </div>
        </div>

        <!-- Top Area: Semi-Circle Disk + Mode Orbit Carousel -->
        <div class="relative w-full flex-shrink-0 flex items-center justify-center h-[310px] sm:h-[340px]">
          <!-- Left Semi-Circle Disk -->
          <div class="absolute -left-20 xs:-left-20 sm:-left-28 md:-left-32 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div class="w-[130px] h-[130px] xs:w-[160px] xs:h-[160px] sm:w-[230px] sm:h-[230px] md:w-[260px] md:h-[260px] rounded-full border-2 sm:border-4 border-white dark:border-slate-800 overflow-hidden shadow-lg relative">
              <div
                v-for="(mode, idx) in modesList"
                :key="'bg-' + mode.id"
                :class="[
                  'absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ease-out',
                  mode.discGradient
                ]"
                :style="{ 
                  opacity: idx === activeModeIndex ? 1 : (idx === prevActiveModeIndex ? 1 : 0),
                  zIndex: idx === activeModeIndex ? 2 : (idx === prevActiveModeIndex ? 1 : 0)
                }"
              ></div>

              <div class="relative z-10 w-full h-full flex items-center justify-end pr-8 sm:pr-10 md:pr-14">
                <Transition :name="scrollDirection === 'down' ? 'disc-slide-down' : 'disc-slide-up'" mode="out-in">
                  <component 
                    :is="activeMode.icon" 
                    :key="activeMode.id"
                    class="w-6 h-6 xs:w-8 xs:h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 text-white drop-shadow-md select-none" 
                  />
                </Transition>
              </div>
            </div>
          </div>

          <!-- Mode Cards Orbiting Arc Track -->
          <div class="w-full pl-8 xs:pl-12 sm:pl-20 md:pl-24 pr-1 sm:pr-3 relative h-full flex items-center justify-center">
            <div 
              v-for="(mode, index) in modesList"
              :key="mode.id"
              @click="deactivateKeyboardNav(); selectMode(index);"
              :style="getCardStyle(index)"
              :class="[
                'absolute left-0 right-0 w-full max-w-[300px] xs:max-w-[350px] sm:max-w-lg mx-auto transition-all duration-500 ease-out cursor-pointer text-left overflow-hidden',
                index === activeModeIndex
                  ? mode.id === 'battleground'
                    ? 'bg-rose-50/90 dark:bg-slate-800/90 border-2 border-rose-500 text-gray-900 dark:text-slate-100 shadow-xl shadow-rose-500/15 p-3.5 sm:p-5 rounded-3xl ring-4 ring-rose-500/20'
                    : 'bg-indigo-50/70 dark:bg-slate-800/90 border-2 border-indigo-600 dark:border-indigo-500 text-gray-900 dark:text-slate-100 shadow-xl shadow-indigo-500/15 p-3.5 sm:p-5 rounded-3xl ring-4 ring-indigo-500/20'
                  : 'bg-gray-50/90 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/60 text-gray-400 dark:text-slate-400 p-2.5 sm:p-3 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 rounded-2xl'
              ]"
            >
              <!-- Card Header (Title & optional Badge) -->
              <div class="flex items-center justify-between transition-all duration-500">
                <h3 
                  :class="[
                    'tracking-tight transition-all duration-500 truncate flex items-center gap-1.5',
                    index === activeModeIndex 
                      ? mode.id === 'battleground' ? 'text-base sm:text-2xl font-black text-rose-950 dark:text-rose-200' : 'text-base sm:text-2xl font-black text-indigo-950 dark:text-indigo-200'
                      : 'text-xs sm:text-base font-bold text-gray-500 dark:text-slate-400'
                  ]"
                >
                  <span>{{ mode.title }}</span>
                </h3>
                <span v-if="mode.badge" class="text-[8px] sm:text-[10px] font-extrabold bg-rose-600 text-white px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider flex-shrink-0">
                  {{ mode.badge }}
                </span>
              </div>

              <!-- Expandable Content Wrapper -->
              <div 
                class="transition-all duration-500 ease-out overflow-hidden"
                :style="{
                  maxHeight: index === activeModeIndex ? '200px' : '0px',
                  opacity: index === activeModeIndex ? '1' : '0',
                  marginTop: index === activeModeIndex ? '4px' : '0px',
                  transform: index === activeModeIndex ? 'translateY(0)' : 'translateY(-8px)',
                }"
              >
                <!-- Description -->
                <p class="text-xs text-gray-600 dark:text-slate-300 mb-1 sm:mb-1 font-medium leading-relaxed">
                  {{ mode.desc }}
                </p>

                <!-- Sub-types buttons (Horizontal list under desc) -->
                <div v-if="mode.subTypes && mode.subTypes.length > 0" class="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-gray-100 dark:border-slate-700/60 flex-wrap">
                  <button
                    v-for="sub in mode.subTypes"
                    :key="sub.key"
                    type="button"
                    @click.stop="deactivateKeyboardNav(); selectSubType(sub.key);"
                    :class="[
                      'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                      characterTypes === sub.key
                        ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700/50'
                    ]"
                  >
                    <span>{{ sub.label }}</span>
                    <span v-if="sub.tag" class="text-[8px] sm:text-[9px] font-extrabold px-1 rounded bg-amber-400 text-amber-950 uppercase flex-shrink-0">{{ sub.tag }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Info inside mode box -->
        <div class="w-full pt-3.5 mt-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3 relative z-20 min-h-[58px] justify-center">
          <Transition name="fade-slide-up" mode="out-in">
            <!-- Quiz Blitz Info & Category Selector Banner -->
            <div v-if="selectedLevel === 'battleground' && characterTypes === 'quiz_blitz'" key="quiz-blitz-banner" class="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-rose-950/60 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2 w-full">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-sm text-sm">
                    🔥
                  </div>
                  <div>
                    <div class="text-xs sm:text-sm font-black text-gray-900 dark:text-slate-100">Kategori Soal Quiz Blitz</div>
                    <div class="text-[11px] text-gray-600 dark:text-slate-300 font-medium">10s/soal • Skor kecepatan adu refleks (Max 200 pts) • 5 Menit</div>
                  </div>
                </div>
              </div>

              <!-- Inline Quick Category Selector -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                <button
                  type="button"
                  @click="selectedQuizBlitzCategory = 'hiragana'"
                  :class="[
                    'px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border',
                    selectedQuizBlitzCategory === 'hiragana'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                  ]"
                >
                  <span class="font-jp">あ</span> Hiragana
                </button>
                <button
                  type="button"
                  @click="selectedQuizBlitzCategory = 'katakana'"
                  :class="[
                    'px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border',
                    selectedQuizBlitzCategory === 'katakana'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                  ]"
                >
                  <span class="font-jp">ア</span> Katakana
                </button>
                <button
                  type="button"
                  @click="selectedQuizBlitzCategory = 'mix'"
                  :class="[
                    'px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border',
                    selectedQuizBlitzCategory === 'mix'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                  ]"
                >
                  <span class="font-jp">あ/ア</span> Mix Kana
                </button>
                <button
                  type="button"
                  @click="selectedQuizBlitzCategory = 'kotoba_kanji'"
                  :class="[
                    'px-2 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border',
                    selectedQuizBlitzCategory === 'kotoba_kanji'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                  ]"
                >
                  📖 Kotoba & Kanji
                </button>
              </div>
            </div>

            <!-- Battleground Info Banner -->
            <div v-else-if="selectedLevel === 'battleground'" key="battle-banner" class="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/60 dark:via-orange-950/40 dark:to-amber-950/60 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 w-full">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                  <Users class="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div class="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100">Aturan Battleground (Typing)</div>
                  <div class="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium leading-tight">
                    2–8 Pemain • Eliminasi bertahap • Adu kecepatan mengetik romaji
                  </div>
                </div>
              </div>
            </div>

            <div v-else key="mode-info" class="text-xs text-gray-500 dark:text-slate-400 font-medium text-center">
              Pilihan Sub-menu: {{ activeMode.subTypes?.map(s => s.label).join(', ') }}
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- SECTION 3: DURATION & STICKY BOTTOM ACTION BAR -->
    <div 
      @click="deactivateKeyboardNav"
      :class="[
        'fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-200 p-3 sm:p-4 shadow-lg flex flex-col items-center justify-center cursor-pointer',
        isKeyboardNav && focusedSection === 'duration'
          ? 'border-t-2 border-t-indigo-400 dark:border-t-indigo-500/70 shadow-md'
          : 'border-t border-gray-200/80 dark:border-slate-800 shadow-lg'
      ]"
    >
      <!-- Duration Pills Selector (Inside bottom sticky bar) -->
      <div v-if="selectedLevel !== 'battleground'" class="w-full max-w-3xl mb-3">
        <div class="flex items-center gap-1.5 sm:gap-2.5 w-full">
          <button
            v-for="min in [1, 3, 5]"
            :key="min"
            type="button"
            @click.stop="deactivateKeyboardNav(); targetDurationMinutes = min;"
            :class="[
              'flex-1 min-w-0 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer',
              targetDurationMinutes === min
                ? isKeyboardNav && focusedSection === 'duration'
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/90 font-black scale-[1.02]'
                  : 'bg-indigo-600 text-white shadow-md font-black'
                : 'bg-gray-100/90 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-gray-200/80 dark:hover:bg-slate-700 border border-gray-200/60 dark:border-slate-700/60 font-bold'
            ]"
          >
            <span class="text-xs sm:text-sm tracking-tight font-extrabold">
              {{ min }}'
            </span>
            <span 
              :class="[
                'text-[12px] sm:text-sm truncate max-w-full font-medium mt-0.5',
                targetDurationMinutes === min ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-400 opacity-80'
              ]"
            >
              {{ getShortDurationDesc(min) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Start Button CTA -->
      <div class="w-full max-w-3xl">
        <button 
          type="button"
          :class="[
            'w-full py-3.5 sm:py-4 text-white rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden',
            selectedLevel === 'battleground'
              ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-rose-500/25'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25',
            isKeyboardNav && focusedSection === 'duration' ? 'ring-2 ring-indigo-400/60 shadow-lg' : ''
          ]"
          @click="deactivateKeyboardNav(); handleStart();"
          :disabled="quizStore.isLoading"
        >
          <Transition name="btn-content-fade" mode="out-in">
            <div v-if="quizStore.isLoading" key="loading" class="flex items-center justify-center gap-2 w-full">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Questions...
            </div>
            <div v-else-if="selectedLevel === 'battleground'" key="battleground" class="flex items-center justify-center gap-2 w-full">
              <span>Masuk Arena Battleground</span>
              <Swords class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div v-else key="normal" class="flex items-center justify-center gap-2 w-full">
              <span>Start Quiz ({{ targetDurationMinutes }} Menit)</span>
              <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
            </div>
          </Transition>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Disc Slide Icon Transition - Fast & Snappy (0.18s) */
.disc-slide-down-enter-active,
.disc-slide-down-leave-active,
.disc-slide-up-enter-active,
.disc-slide-up-leave-active {
  transition: all 0.18s cubic-bezier(0.2, 1.2, 0.4, 1);
}

.disc-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-28px) translateX(8px) scale(0.6) rotate(-20deg);
}

.disc-slide-down-leave-to {
  opacity: 0;
  transform: translateY(28px) translateX(-8px) scale(0.6) rotate(20deg);
}

/* Disc Slide Icon Transition - Selecting card above active (from bottom up) */
.disc-slide-up-enter-from {
  opacity: 0;
  transform: translateY(28px) translateX(-8px) scale(0.6) rotate(20deg);
}

.disc-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-28px) translateX(8px) scale(0.6) rotate(-20deg);
}
.overscroll-contain {
  overscroll-behavior-y: contain;
}

/* Button Content Smooth Vertical Transition */
.btn-content-fade-enter-active,
.btn-content-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-content-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.btn-content-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

/* Card Bottom Area Component Transition */
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.fade-slide-up-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
