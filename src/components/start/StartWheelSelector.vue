<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { QuizModeDef } from './modesConfig';
import { getModeDescription } from './modesConfig';

const props = defineProps<{
  modes: QuizModeDef[];
  activeModeIndex: number;
  prevActiveModeIndex: number;
  scrollDirection: 'down' | 'up';
  characterType: string;
  selectedHitunganTab: string;
  isKeyboardNav: boolean;
  focusedSection: string;
}>();

const emit = defineEmits<{
  (e: 'selectMode', index: number): void;
  (e: 'selectSubType', key: string): void;
  (e: 'interact'): void;
}>();

const activeMode = computed(() => props.modes[props.activeModeIndex]);

// Responsive screen detection
const isMobile = ref(false);
const updateResponsive = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640;
  }
};

onMounted(() => {
  updateResponsive();
  window.addEventListener('resize', updateResponsive);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive);
});

// Mouse wheel gesture handling
let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
function handleWheel(event: WheelEvent) {
  if (wheelTimeout) return;

  if (event.deltaY > 20) {
    emit('selectMode', props.activeModeIndex + 1);
  } else if (event.deltaY < -20) {
    emit('selectMode', props.activeModeIndex - 1);
  }

  wheelTimeout = setTimeout(() => {
    wheelTimeout = null;
  }, 180);
}

// Touch swipe gesture handling
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
        emit('selectMode', props.activeModeIndex + 1);
      } else {
        emit('selectMode', props.activeModeIndex - 1);
      }
      touchStartY = touchEndY;
    }
  }
}

function handleTouchEnd() {}

// Position cards along an arc trajectory hugging the red semi-circle
function getCardStyle(index: number) {
  const diff = index - props.activeModeIndex;
  const absDiff = Math.abs(diff);
  const isActive = index === props.activeModeIndex;

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
</script>

<template>
  <div 
    @click="emit('interact')"
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
              v-for="(mode, idx) in modes"
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
            v-for="(mode, index) in modes"
            :key="mode.id"
            @click="emit('interact'); emit('selectMode', index);"
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
                {{ getModeDescription(mode, characterType, selectedHitunganTab) }}
              </p>

              <!-- Sub-types buttons (Horizontal list under desc) -->
              <div v-if="mode.subTypes && mode.subTypes.length > 0" class="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-gray-100 dark:border-slate-700/60 flex-wrap">
                <button
                  v-for="sub in mode.subTypes"
                  :key="sub.key"
                  type="button"
                  @click.stop="emit('interact'); emit('selectSubType', sub.key);"
                  :class="[
                    'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                    characterType === sub.key
                      ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700/50'
                  ]"
                >
                  <span>{{ sub.label }}</span>
                  <span v-if="sub.beta" class="text-[8px] sm:text-[9px] font-black px-1 py-px rounded bg-amber-400 text-amber-950 uppercase flex-shrink-0">Beta</span>
                  <span v-if="sub.tag" class="text-[8px] sm:text-[9px] font-extrabold px-1 rounded bg-amber-400 text-amber-950 uppercase flex-shrink-0">{{ sub.tag }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Info Slot inside mode box (Panels) -->
      <div class="w-full pt-3.5 mt-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3 relative z-20 min-h-[58px] justify-center">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
